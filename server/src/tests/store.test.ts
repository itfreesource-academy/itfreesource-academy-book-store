import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../data/store.js';

describe('Data Store, Catalog, Orders & System Reset Unit Tests', () => {
  beforeEach(() => {
    store.resetToSeedData();
  });

  describe('Books Catalog & Inventory', () => {
    it('should initialize with seed books and allow filtering', () => {
      const books = store.getAllBooks();
      expect(books.length).toBeGreaterThanOrEqual(12);

      const firstBook = books[0];
      const found = store.getBookById(firstBook.id);
      expect(found).toBeDefined();
      expect(found?.title).toBe(firstBook.title);
    });

    it('should update book stock level', () => {
      const book = store.getAllBooks()[0];
      const updated = store.updateStock(book.id, 50);

      expect(updated?.stock).toBe(50);
      expect(store.getBookById(book.id)?.stock).toBe(50);
    });

    it('should create a new book successfully', () => {
      const newBook = store.createBook({
        title: 'Mastering Automated Testing with Playwright',
        isbn: '978-1-999999-99-9',
        authorId: 'aut_001',
        authorName: 'Martin Fowler',
        categoryId: 'cat_001',
        categoryName: 'Software Engineering',
        price: 39.99,
        stock: 20,
        pages: 350,
        publicationDate: '2026-03-01',
        coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
        description: 'Comprehensive guide to building resilient end-to-end automation test suites.',
        tags: ['testing', 'automation', 'playwright', 'typescript'],
        isFeatured: true,
        isVipExclusive: false
      });

      expect(newBook.id).toBeDefined();
      expect(newBook.title).toBe('Mastering Automated Testing with Playwright');
      expect(store.getBookById(newBook.id)).toBeDefined();
    });
  });

  describe('Orders & VIP Discount Processing', () => {
    it('should create and retrieve customer orders', () => {
      const order = store.createOrder({
        userId: 'usr_010',
        username: 'standard_customer',
        items: [
          {
            bookId: 'bk_001',
            title: 'Learning JavaScript Design Patterns',
            price: 49.99,
            quantity: 1,
            coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'
          }
        ],
        subtotal: 49.99,
        discount: 0,
        tax: 4.00,
        total: 53.99,
        shippingAddress: {
          fullName: 'Regular Customer',
          street: '123 Test Way',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States'
        },
        deliveryDate: '2026-09-20',
        paymentMethod: 'credit_card',
        status: 'pending'
      });

      expect(order.id).toBeDefined();
      expect(order.orderNumber).toBeDefined();
      expect(order.status).toBe('pending');

      const userOrders = store.getOrders('usr_010', false);
      expect(userOrders.some(o => o.id === order.id)).toBe(true);
    });

    it('should update order status through valid fulfillment pipeline', () => {
      const orders = store.getOrders(undefined, true);
      const testOrder = orders[0];

      const updatedToShipped = store.updateOrderStatus(testOrder.id, 'shipped', 'TRK-987654321');
      expect(updatedToShipped?.status).toBe('shipped');
      expect(updatedToShipped?.trackingNumber).toBe('TRK-987654321');

      const updatedToDelivered = store.updateOrderStatus(testOrder.id, 'delivered');
      expect(updatedToDelivered?.status).toBe('delivered');
    });
  });

  describe('Review Moderation & Audit Logs', () => {
    it('should allow creating a review in pending status and moderating it', () => {
      const review = store.createReview({
        bookId: 'bk_001',
        userId: 'usr_010',
        username: 'standard_customer',
        rating: 5,
        title: 'Outstanding Reference',
        comment: 'A must-read for any software test engineer or developer.'
      });

      expect(review.status).toBe('pending');

      const approved = store.updateReviewStatus(review.id, 'approved');
      expect(approved?.status).toBe('approved');
    });

    it('should record immutable audit logs for system operations', () => {
      const initialLogsCount = store.getAuditLogs().length;

      store.addAuditLog({
        id: 'aud_test_123',
        timestamp: new Date().toISOString(),
        userId: 'usr_001',
        username: 'admin',
        role: 'admin',
        action: 'UNIT_TEST_ACTION',
        entity: 'System',
        entityId: 'sys_001',
        details: 'Unit testing audit log generation.',
        ipAddress: '127.0.0.1'
      });

      const logs = store.getAuditLogs();
      expect(logs.length).toBe(initialLogsCount + 1);
      expect(logs[0].action).toBe('UNIT_TEST_ACTION');
    });
  });

  describe('System Database Reset', () => {
    it('should wipe mutated state and restore all seed entities to clean state', () => {
      // Mutate book stock
      const book = store.getAllBooks()[0];
      const initialStock = book.stock;
      store.updateStock(book.id, 9999);
      expect(store.getBookById(book.id)?.stock).toBe(9999);

      // Perform reset
      store.resetToSeedData();

      // Verify restored back to initial seed data
      const resetBook = store.getBookById(book.id);
      expect(resetBook?.stock).toBe(initialStock);
      expect(store.getUsers().length).toBe(11);
      expect(store.getAllBooks().length).toBeGreaterThanOrEqual(12);
    });
  });
});
