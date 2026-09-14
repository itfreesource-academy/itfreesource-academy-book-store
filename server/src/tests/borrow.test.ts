import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../data/store.js';

describe('Book Borrowing & Return Engine Unit Tests', () => {
  beforeEach(() => {
    store.resetToSeedData();
  });

  describe('Borrow Book Creation', () => {
    it('should borrow a book with standard 10-day duration and flat $2.00 fee', () => {
      const book = store.getAllBooks()[0];
      const initialStock = book.stock;

      const record = store.borrowBook(
        'usr_001',
        'admin',
        book.id,
        'America/New_York',
        'USD'
      );

      expect('error' in record).toBe(false);
      if (!('error' in record)) {
        expect(record.standardFee).toBe(2.00);
        expect(record.status).toBe('active');
        expect(record.bookId).toBe(book.id);
        expect(record.bookTitle).toBe(book.title);

        // Verify stock deducted by 1
        const updatedBook = store.getBookById(book.id);
        expect(updatedBook?.stock).toBe(initialStock - 1);

        // Verify due date is exactly 10 days after borrow date
        const borrowTime = new Date(record.borrowDate).getTime();
        const dueTime = new Date(record.dueDate).getTime();
        const diffDays = Math.round((dueTime - borrowTime) / (1000 * 60 * 60 * 24));
        expect(diffDays).toBe(10);
      }
    });

    it('should reject borrowing when book stock is 0', () => {
      const book = store.getAllBooks()[0];
      // Force stock to 0
      book.stock = 0;

      const result = store.borrowBook(
        'usr_001',
        'admin',
        book.id,
        'America/New_York',
        'USD'
      );

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('out of stock');
      }
    });

    it('should assign specified regional timezone and currency', () => {
      const book = store.getAllBooks()[1];
      const record = store.borrowBook(
        'usr_002',
        'store_manager',
        book.id,
        'Asia/Dubai',
        'AED'
      );

      expect('error' in record).toBe(false);
      if (!('error' in record)) {
        expect(record.timezone).toBe('Asia/Dubai');
        expect(record.currency).toBe('AED');
      }
    });
  });

  describe('Fee Calculation Engine (On-Time, Overdue, Lost)', () => {
    it('should charge flat $2.00 fee with $0.00 penalty for on-time return (5 days)', () => {
      const book = store.getAllBooks()[0];
      const borrow = store.borrowBook('usr_001', 'admin', book.id);
      expect('error' in borrow).toBe(false);

      if (!('error' in borrow)) {
        const borrowDate = new Date(borrow.borrowDate);
        const returnDate = new Date(borrowDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();

        const calculation = store.calculateBorrowFee(borrow, returnDate, false);
        expect(calculation.standardFee).toBe(2.00);
        expect(calculation.lateFee).toBe(0.00);
        expect(calculation.totalFee).toBe(2.00);
        expect(calculation.overdueDays).toBe(0);
        expect(calculation.status).toBe('returned');
      }
    });

    it('should charge flat $2.00 fee with $0.00 penalty exactly on due date (10 days)', () => {
      const book = store.getAllBooks()[0];
      const borrow = store.borrowBook('usr_001', 'admin', book.id);

      if (!('error' in borrow)) {
        const calculation = store.calculateBorrowFee(borrow, borrow.dueDate, false);
        expect(calculation.standardFee).toBe(2.00);
        expect(calculation.lateFee).toBe(0.00);
        expect(calculation.totalFee).toBe(2.00);
        expect(calculation.overdueDays).toBe(0);
      }
    });

    it('should accrue exactly $0.10/day penalty for overdue returns (5 days late -> $0.50 penalty)', () => {
      const book = store.getAllBooks()[0];
      const borrow = store.borrowBook('usr_001', 'admin', book.id);

      if (!('error' in borrow)) {
        const dueDate = new Date(borrow.dueDate);
        // Return 5 days after due date (15 days after borrow)
        const lateReturnDate = new Date(dueDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();

        const calculation = store.calculateBorrowFee(borrow, lateReturnDate, false);
        expect(calculation.overdueDays).toBe(5);
        expect(calculation.lateFee).toBe(0.50); // 5 * $0.10
        expect(calculation.totalFee).toBe(2.50); // $2.00 base + $0.50 penalty
      }
    });

    it('should accrue $1.50 penalty for 15 days overdue return', () => {
      const book = store.getAllBooks()[0];
      const borrow = store.borrowBook('usr_001', 'admin', book.id);

      if (!('error' in borrow)) {
        const dueDate = new Date(borrow.dueDate);
        const lateReturnDate = new Date(dueDate.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString();

        const calculation = store.calculateBorrowFee(borrow, lateReturnDate, false);
        expect(calculation.overdueDays).toBe(15);
        expect(calculation.lateFee).toBe(1.50); // 15 * $0.10
        expect(calculation.totalFee).toBe(3.50); // $2.00 base + $1.50
      }
    });

    it('should charge 2x book retail price replacement fee when declared lost', () => {
      const book = store.getAllBooks()[0]; // e.g. price $49.99
      const borrow = store.borrowBook('usr_001', 'admin', book.id);

      if (!('error' in borrow)) {
        const calculation = store.calculateBorrowFee(borrow, undefined, true);
        const expectedLostFee = parseFloat((book.price * 2).toFixed(2));
        const expectedTotal = parseFloat((2.00 + expectedLostFee).toFixed(2));

        expect(calculation.status).toBe('lost');
        expect(calculation.lostFee).toBe(expectedLostFee);
        expect(calculation.totalFee).toBe(expectedTotal);
      }
    });
  });

  describe('Return and Lost Processing', () => {
    it('should restore stock when book is returned normally', () => {
      const book = store.getAllBooks()[0];
      const stockBefore = book.stock;

      const borrow = store.borrowBook('usr_001', 'admin', book.id);
      expect('error' in borrow).toBe(false);

      if (!('error' in borrow)) {
        expect(store.getBookById(book.id)?.stock).toBe(stockBefore - 1);

        const returned = store.returnBook(borrow.id);
        expect('error' in returned).toBe(false);
        if (!('error' in returned)) {
          expect(returned.status).toBe('returned');
          // Stock should be restored
          expect(store.getBookById(book.id)?.stock).toBe(stockBefore);
        }
      }
    });

    it('should not restore stock when book is declared lost', () => {
      const book = store.getAllBooks()[0];
      const stockBefore = book.stock;

      const borrow = store.borrowBook('usr_001', 'admin', book.id);
      if (!('error' in borrow)) {
        const lost = store.returnBook(borrow.id, undefined, true);
        expect('error' in lost).toBe(false);
        if (!('error' in lost)) {
          expect(lost.status).toBe('lost');
          // Stock must NOT be restored since book is lost
          expect(store.getBookById(book.id)?.stock).toBe(stockBefore - 1);
        }
      }
    });
  });
});
