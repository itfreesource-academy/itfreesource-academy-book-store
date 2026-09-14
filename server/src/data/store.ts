import { User, Book, Category, Author, Order, Review, AuditLog, OrderStatus, BorrowRecord, BorrowStatus, Currency, Timezone } from '../types/index.js';
import {
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_AUTHORS,
  INITIAL_BOOKS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_AUDIT_LOGS,
  INITIAL_BORROWS
} from './seedData.js';
import { v4 as uuidv4 } from 'uuid';

class InMemoryStore {
  private users: User[] = [];
  private categories: Category[] = [];
  private authors: Author[] = [];
  private books: Book[] = [];
  private orders: Order[] = [];
  private reviews: Review[] = [];
  private auditLogs: AuditLog[] = [];
  private borrows: BorrowRecord[] = [];

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.categories = JSON.parse(JSON.stringify(INITIAL_CATEGORIES));
    this.authors = JSON.parse(JSON.stringify(INITIAL_AUTHORS));
    this.books = JSON.parse(JSON.stringify(INITIAL_BOOKS));
    this.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
    this.reviews = JSON.parse(JSON.stringify(INITIAL_REVIEWS));
    this.auditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
    this.borrows = JSON.parse(JSON.stringify(INITIAL_BORROWS));

    this.addAuditLog({
      id: `aud_${uuidv4().substring(0, 8)}`,
      timestamp: new Date().toISOString(),
      userId: 'sys_000',
      username: 'SYSTEM',
      role: 'admin',
      action: 'DATA_RESET',
      entity: 'Database',
      entityId: 'all',
      details: 'In-memory test database was reset back to original seed data with borrowing records.',
      ipAddress: '127.0.0.1'
    });
  }

  public resetToSeedData(): void {
    this.reset();
  }

  // Users
  public getUsers(): User[] {
    return this.users.map(({ password, ...rest }) => rest as User);
  }

  public getUserByUsername(username: string): User | undefined {
    return this.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  public updateUserStatus(id: string, status: 'active' | 'suspended'): User | null {
    const user = this.users.find(u => u.id === id);
    if (!user) return null;
    user.status = status;
    return user;
  }

  public updateUserDetails(id: string, updates: Partial<User>): User | null {
    const user = this.users.find(u => u.id === id);
    if (!user) return null;
    if (updates.fullName !== undefined) user.fullName = updates.fullName;
    if (updates.email !== undefined) user.email = updates.email;
    if (updates.role !== undefined) user.role = updates.role;
    if (updates.status !== undefined) user.status = updates.status;
    if (updates.currency !== undefined) user.currency = updates.currency;
    if (updates.timezone !== undefined) user.timezone = updates.timezone;
    return user;
  }

  public getAllBooks(): Book[] {
    return [...this.books];
  }

  // Books
  public getBooks(filters?: {
    search?: string;
    categoryId?: string;
    authorId?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'rating_desc' | 'title_asc' | 'newest';
    page?: number;
    limit?: number;
    isFeatured?: boolean;
    isVipExclusive?: boolean;
  }): { books: Book[]; total: number; page: number; totalPages: number } {
    let result = [...this.books];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        b =>
          b.title.toLowerCase().includes(q) ||
          b.authorName.toLowerCase().includes(q) ||
          b.isbn.includes(q) ||
          b.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filters?.categoryId && filters.categoryId !== 'all') {
      result = result.filter(b => b.categoryId === filters.categoryId);
    }

    if (filters?.authorId && filters.authorId !== 'all') {
      result = result.filter(b => b.authorId === filters.authorId);
    }

    if (filters?.minPrice !== undefined) {
      result = result.filter(b => b.price >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined) {
      result = result.filter(b => b.price <= filters.maxPrice!);
    }

    if (filters?.minRating !== undefined) {
      result = result.filter(b => b.rating >= filters.minRating!);
    }

    if (filters?.isFeatured !== undefined) {
      result = result.filter(b => b.isFeatured === filters.isFeatured);
    }

    if (filters?.isVipExclusive !== undefined) {
      result = result.filter(b => b.isVipExclusive === filters.isVipExclusive);
    }

    // Sorting
    switch (filters?.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating_desc':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'title_asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime());
        break;
    }

    const total = result.length;
    const page = Math.max(1, filters?.page || 1);
    const limit = Math.max(1, filters?.limit || 12);
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = result.slice((page - 1) * limit, page * limit);

    return { books: paginated, total, page, totalPages };
  }

  public getBookById(id: string): Book | undefined {
    return this.books.find(b => b.id === id);
  }

  public createBook(bookData: Omit<Book, 'id' | 'rating' | 'reviewCount'>): Book {
    const newBook: Book = {
      ...bookData,
      id: `book_${uuidv4().substring(0, 8)}`,
      rating: 5.0,
      reviewCount: 0
    };
    this.books.unshift(newBook);
    return newBook;
  }

  public updateBook(id: string, updates: Partial<Book>): Book | null {
    const idx = this.books.findIndex(b => b.id === id);
    if (idx === -1) return null;
    this.books[idx] = { ...this.books[idx], ...updates };
    return this.books[idx];
  }

  public deleteBook(id: string): boolean {
    const idx = this.books.findIndex(b => b.id === id);
    if (idx === -1) return false;
    this.books.splice(idx, 1);
    return true;
  }

  // Categories
  public getCategories(): Category[] {
    return this.categories;
  }

  public createCategory(name: string, description: string): Category {
    const newCat: Category = {
      id: `cat_${uuidv4().substring(0, 6)}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description,
      bookCount: 0
    };
    this.categories.push(newCat);
    return newCat;
  }

  // Authors
  public getAuthors(): Author[] {
    return this.authors;
  }

  public createAuthor(name: string, bio: string, photo: string, nationality: string): Author {
    const newAuthor: Author = {
      id: `aut_${uuidv4().substring(0, 6)}`,
      name,
      bio,
      photo,
      nationality
    };
    this.authors.push(newAuthor);
    return newAuthor;
  }

  // Orders
  public getOrders(userId?: string, canReadAll?: boolean): Order[] {
    if (canReadAll) {
      return [...this.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    if (userId) {
      return this.orders
        .filter(o => o.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [];
  }

  public getOrderById(id: string): Order | undefined {
    return this.orders.find(o => o.id === id);
  }

  public createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order {
    const seq = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      ...orderData,
      id: `ord_${uuidv4().substring(0, 8)}`,
      orderNumber: `ORD-${new Date().getFullYear()}-${seq}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.orders.unshift(newOrder);

    // Reduce stock
    for (const item of orderData.items) {
      const book = this.getBookById(item.bookId);
      if (book) {
        book.stock = Math.max(0, book.stock - item.quantity);
      }
    }

    return newOrder;
  }

  public updateOrderStatus(id: string, status: OrderStatus, trackingNumber?: string): Order | null {
    const order = this.orders.find(o => o.id === id);
    if (!order) return null;
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    order.updatedAt = new Date().toISOString();
    return order;
  }

  // Reviews
  public getReviews(bookId?: string, statusFilter?: 'all' | 'approved' | 'pending' | 'rejected'): Review[] {
    let result = [...this.reviews];
    if (bookId) {
      result = result.filter(r => r.bookId === bookId);
    }
    if (statusFilter && statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createReview(reviewData: Omit<Review, 'id' | 'status' | 'createdAt'>, autoApprove = false): Review {
    const newReview: Review = {
      ...reviewData,
      id: `rev_${uuidv4().substring(0, 8)}`,
      status: autoApprove ? 'approved' : 'pending',
      createdAt: new Date().toISOString()
    };
    this.reviews.unshift(newReview);

    // Update book rating
    const bookReviews = this.reviews.filter(r => r.bookId === reviewData.bookId && r.status === 'approved');
    if (bookReviews.length > 0) {
      const avg = bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length;
      const book = this.getBookById(reviewData.bookId);
      if (book) {
        book.rating = parseFloat(avg.toFixed(1));
        book.reviewCount = bookReviews.length;
      }
    }

    return newReview;
  }

  public updateReviewStatus(id: string, status: 'approved' | 'rejected'): Review | null {
    const rev = this.reviews.find(r => r.id === id);
    if (!rev) return null;
    rev.status = status;
    return rev;
  }

  // Inventory
  public getInventory(): {
    books: { id: string; title: string; isbn: string; stock: number; price: number; categoryName: string }[];
    totalStock: number;
    lowStockCount: number;
  } {
    const list = this.books.map(b => ({
      id: b.id,
      title: b.title,
      isbn: b.isbn,
      stock: b.stock,
      price: b.price,
      categoryName: b.categoryName
    }));
    const totalStock = list.reduce((sum, b) => sum + b.stock, 0);
    const lowStockCount = list.filter(b => b.stock < 15).length;
    return { books: list, totalStock, lowStockCount };
  }

  public updateStock(id: string, newStock: number): Book | null {
    const book = this.getBookById(id);
    if (!book) return null;
    book.stock = Math.max(0, newStock);
    return book;
  }

  // Borrowing Subsystem
  public getBorrowRecords(userId?: string, canReadAll?: boolean): BorrowRecord[] {
    let records = [...this.borrows];
    if (!canReadAll && userId) {
      records = records.filter(b => b.userId === userId);
    }
    // Update active overdue statuses based on current time
    const now = Date.now();
    for (const r of records) {
      if (r.status === 'active' && new Date(r.dueDate).getTime() < now) {
        r.status = 'overdue';
        const overdueDays = Math.ceil((now - new Date(r.dueDate).getTime()) / (86400000));
        r.lateFee = parseFloat((overdueDays * 0.10).toFixed(2));
        r.totalFee = parseFloat((r.standardFee + r.lateFee).toFixed(2));
      }
    }
    return records.sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime());
  }

  public getBorrowRecordById(id: string): BorrowRecord | undefined {
    return this.borrows.find(b => b.id === id);
  }

  public calculateBorrowFee(borrow: BorrowRecord, returnDateIso?: string, isLost?: boolean, isVip?: boolean): {
    standardFee: number;
    lateFee: number;
    lostFee: number;
    totalFee: number;
    daysKept: number;
    overdueDays: number;
    status: BorrowStatus;
  } {
    const borrowTime = new Date(borrow.borrowDate).getTime();
    const dueTime = new Date(borrow.dueDate).getTime();
    const returnTime = returnDateIso ? new Date(returnDateIso).getTime() : Date.now();

    const diffMs = returnTime - borrowTime;
    const daysKept = Math.max(1, Math.ceil(diffMs / 86400000));
    const overdueMs = returnTime - dueTime;
    const overdueDays = overdueMs > 0 ? Math.ceil(overdueMs / 86400000) : 0;

    const standardFee = 2.00;
    const baseDailyLateRate = 0.10;

    let lateFee = 0;
    let lostFee = 0;
    let status: BorrowStatus = 'returned';

    if (isLost) {
      status = 'lost';
      lostFee = parseFloat((2.0 * borrow.bookPrice).toFixed(2));
    } else {
      if (overdueDays > 0) {
        lateFee = parseFloat((overdueDays * baseDailyLateRate).toFixed(2));
      }
    }

    const totalFee = parseFloat((standardFee + lateFee + lostFee).toFixed(2));

    return {
      standardFee,
      lateFee,
      lostFee,
      totalFee,
      daysKept,
      overdueDays,
      status
    };
  }

  public borrowBook(
    userId: string,
    username: string,
    bookId: string,
    timezone: Timezone = 'America/New_York',
    currency: Currency = 'USD',
    isVip = false
  ): BorrowRecord | { error: string } {
    const book = this.getBookById(bookId);
    if (!book) return { error: 'Book not found' };
    if (book.stock <= 0) return { error: 'Book is currently out of stock for borrowing' };

    // Deduct 1 unit from stock
    book.stock -= 1;

    const now = new Date();
    const due = new Date(now.getTime() + 10 * 86400000); // 10 days standard period
    const standardFee = 2.00;

    const record: BorrowRecord = {
      id: `brw_${uuidv4().substring(0, 8)}`,
      userId,
      username,
      bookId: book.id,
      bookTitle: book.title,
      bookCover: book.coverImage,
      bookPrice: book.price,
      borrowDate: now.toISOString(),
      dueDate: due.toISOString(),
      returnDate: null,
      status: 'active',
      standardFee,
      lateFee: 0,
      lostFee: 0,
      totalFee: standardFee,
      currency,
      timezone,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    this.borrows.unshift(record);
    return record;
  }

  public returnBook(
    borrowId: string,
    returnDateIso?: string,
    isLost = false,
    isVip = false
  ): BorrowRecord | { error: string } {
    const record = this.borrows.find(b => b.id === borrowId);
    if (!record) return { error: 'Borrow record not found' };
    if (['returned', 'lost'].includes(record.status)) {
      return { error: `Book loan is already finalized as '${record.status}'.` };
    }

    const returnTimeIso = returnDateIso || new Date().toISOString();
    const feeCalculation = this.calculateBorrowFee(record, returnTimeIso, isLost, isVip);

    record.returnDate = returnTimeIso;
    record.status = feeCalculation.status;
    record.standardFee = feeCalculation.standardFee;
    record.lateFee = feeCalculation.lateFee;
    record.lostFee = feeCalculation.lostFee;
    record.totalFee = feeCalculation.totalFee;
    record.updatedAt = new Date().toISOString();

    // If returned and not lost, return stock unit to catalog
    if (!isLost) {
      const book = this.getBookById(record.bookId);
      if (book) book.stock += 1;
    }

    return record;
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addAuditLog(entry: AuditLog): void {
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
  }
}

export const store = new InMemoryStore();
