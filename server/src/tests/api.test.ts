import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { store } from '../data/store.js';

describe('HTTP API Endpoints Integration Tests (Supertest)', () => {
  let adminToken: string;
  let standardToken: string;

  beforeEach(async () => {
    store.resetToSeedData();

    // Login as admin
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'Admin@Pass123' });
    adminToken = adminRes.body.token;

    // Login as standard customer
    const userRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'standard_customer', password: 'User@Pass123' });
    standardToken = userRes.body.token;
  });

  describe('Swagger & System Routes', () => {
    it('GET /api/swagger.json returns OpenAPI 3.0.0 documentation', async () => {
      const res = await request(app).get('/api/swagger.json');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toMatch(/^3\.0\./);
      expect(res.body.info.title).toContain('ITFreeSource Academy');
    });

    it('GET /api/swagger/ serves interactive Swagger UI HTML', async () => {
      const res = await request(app).get('/api/swagger/');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
      expect(res.text).toContain('swagger-ui');
    });

    it('GET /api/swagger.html redirects with 301 to canonical /api/swagger', async () => {
      const res = await request(app).get('/api/swagger.html');
      expect(res.status).toBe(301);
      expect(res.headers.location).toBe('/api/swagger');
    });

    it('GET /api/docs redirects with 301 to unified /api/swagger', async () => {
      const res = await request(app).get('/api/docs');
      expect(res.status).toBe(301);
      expect(res.headers.location).toBe('/api/swagger');
    });

    it('GET /api/v1/system/health returns healthy system status', async () => {
      const res = await request(app).get('/api/v1/system/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('HEALTHY');
    });

    it('POST /api/v1/system/reset resets in-memory data', async () => {
      const res = await request(app).post('/api/v1/system/reset');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Authentication & User Management APIs', () => {
    it('POST /api/v1/auth/login fails with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'admin', password: 'WrongPassword' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/auth/me returns authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.user.username).toBe('admin');
      expect(res.body.permissions).toContain('users:manage');
    });

    it('PUT /api/v1/auth/users/:id allows Admin to edit user details', async () => {
      const usersRes = await request(app).get('/api/v1/auth/users');
      const targetUser = usersRes.body.users.find((u: any) => u.username === 'standard_customer');

      const res = await request(app)
        .put(`/api/v1/auth/users/${targetUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Updated Name Through Supertest',
          role: 'vip_customer',
          timezone: 'Asia/Dubai',
          currency: 'AED'
        });

      expect(res.status).toBe(200);
      expect(res.body.user.fullName).toBe('Updated Name Through Supertest');
      expect(res.body.user.role).toBe('vip_customer');
      expect(res.body.user.currency).toBe('AED');
    });

    it('PUT /api/v1/auth/users/:id rejects non-admin users with 403 Forbidden', async () => {
      const usersRes = await request(app).get('/api/v1/auth/users');
      const targetUser = usersRes.body.users[0];

      const res = await request(app)
        .put(`/api/v1/auth/users/${targetUser.id}`)
        .set('Authorization', `Bearer ${standardToken}`)
        .send({ role: 'admin' });

      expect(res.status).toBe(403);
    });
  });

  describe('Books Catalog APIs', () => {
    it('GET /api/v1/books returns paginated book catalog', async () => {
      const res = await request(app).get('/api/v1/books');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.books)).toBe(true);
      expect(res.body.books.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/v1/books/:id returns individual book details', async () => {
      const booksRes = await request(app).get('/api/v1/books');
      const bookId = booksRes.body.books[0].id;

      const res = await request(app).get(`/api/v1/books/${bookId}`);
      expect(res.status).toBe(200);
      expect(res.body.book.id).toBe(bookId);
    });
  });

  describe('Book Borrowing & Fee APIs', () => {
    it('POST /api/v1/borrow creates loan with flat $2.00 fee and 10 days duration', async () => {
      const booksRes = await request(app).get('/api/v1/books');
      const bookId = booksRes.body.books[0].id;

      const res = await request(app)
        .post('/api/v1/borrow')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          bookId,
          currency: 'USD',
          timezone: 'America/New_York'
        });

      expect(res.status).toBe(201);
      const record = res.body.record || res.body.data;
      expect(record.standardFee).toBe(2.00);
      expect(record.status).toBe('active');
    });

    it('GET /api/v1/borrow/:id/preview-fee calculates overdue penalty accurately ($0.10/day)', async () => {
      const booksRes = await request(app).get('/api/v1/books');
      const bookId = booksRes.body.books[0].id;

      const borrowRes = await request(app)
        .post('/api/v1/borrow')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ bookId });

      const recordId = (borrowRes.body.record || borrowRes.body.data).id;
      const dueDate = new Date((borrowRes.body.record || borrowRes.body.data).dueDate);
      const overdueReturnDate = new Date(dueDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const res = await request(app)
        .get(`/api/v1/borrow/${recordId}/preview-fee?returnDate=${overdueReturnDate}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const summary = res.body.feeSummary || res.body.calculation;
      expect(summary.daysLate).toBe(5);
      expect(summary.penaltyFee).toBe(0.50);
      expect(summary.totalFee).toBe(2.50);
    });

    it('POST /api/v1/borrow/:id/lost charges 2x book retail price penalty', async () => {
      const booksRes = await request(app).get('/api/v1/books');
      const book = booksRes.body.books[0];

      const borrowRes = await request(app)
        .post('/api/v1/borrow')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ bookId: book.id });

      const recordId = (borrowRes.body.record || borrowRes.body.data).id;

      const res = await request(app)
        .post(`/api/v1/borrow/${recordId}/lost`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const record = res.body.record || res.body.data;
      expect(record.status).toBe('lost');
      const expectedLostFee = parseFloat((book.price * 2).toFixed(2));
      expect(record.lostFee).toBe(expectedLostFee);
    });
  });
});
