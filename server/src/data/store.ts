import { User, Book, Category, Author, Order, Review, AuditLog, OrderStatus } from '../types/index.js';
import {
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_AUTHORS,
  INITIAL_BOOKS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_AUDIT_LOGS
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

    this.addAuditLog({
      id: `aud_${uuidv4().substring(0, 8)}`,
      timestamp: new Date().toISOString(),
      userId: 'sys_000',
      username: 'SYSTEM',
      role: 'admin',
      action: 'DATA_RESET',
      entity: 'Database',
      entityId: 'all',
      details: 'In-memory test database was reset back to original seed data.',
      ipAddress: '127.0.0.1'
    });
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
