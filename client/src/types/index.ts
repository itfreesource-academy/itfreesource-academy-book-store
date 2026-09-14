export type Currency = 'USD' | 'AED' | 'INR' | 'JPY' | 'AUD';
export type Timezone = 'America/New_York' | 'Asia/Dubai' | 'Asia/Kolkata' | 'Asia/Tokyo' | 'Australia/Sydney';

export type UserRole =
  | 'admin'
  | 'store_manager'
  | 'inventory_clerk'
  | 'content_editor'
  | 'order_fulfillment'
  | 'support_agent'
  | 'book_reviewer'
  | 'auditor'
  | 'vip_customer'
  | 'standard_customer';

export type Permission =
  | 'catalog:read'
  | 'catalog:create'
  | 'catalog:update'
  | 'catalog:delete'
  | 'catalog:edit_price'
  | 'inventory:read'
  | 'inventory:update'
  | 'orders:read_all'
  | 'orders:read_own'
  | 'orders:update_status'
  | 'orders:cancel'
  | 'orders:refund'
  | 'borrow:read'
  | 'borrow:create'
  | 'borrow:return'
  | 'reviews:read'
  | 'reviews:moderate'
  | 'reviews:create'
  | 'users:manage'
  | 'audit:read'
  | 'system:reset'
  | 'discount:vip';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatar: string;
  status: 'active' | 'suspended';
  timezone?: Timezone;
  currency?: Currency;
  createdAt: string;
}

export type BorrowStatus = 'active' | 'returned' | 'lost';

export interface BorrowRecord {
  id: string;
  userId: string;
  username: string;
  bookId: string;
  bookTitle: string;
  coverImage?: string;
  borrowDate: string;
  dueDate: string;
  returnedDate?: string;
  status: BorrowStatus;
  standardFee: number;
  penaltyFee: number;
  lostFee: number;
  totalFee: number;
  currency: Currency;
  timezone: Timezone;
  isOverdue?: boolean;
  daysLate?: number;
}

export interface Book {
  id: string;
  title: string;
  isbn: string;
  authorId: string;
  authorName: string;
  categoryId: string;
  categoryName: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  pages: number;
  publicationDate: string;
  coverImage: string;
  description: string;
  tags: string[];
  isFeatured: boolean;
  isVipExclusive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  bookCount: number;
}

export interface Author {
  id: string;
  name: string;
  bio: string;
  photo: string;
  nationality: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderItem {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
  coverImage: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  username: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  deliveryDate: string;
  paymentMethod: string;
  status: OrderStatus;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  role: UserRole;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  ipAddress: string;
}

export interface PersonaInfo {
  username: string;
  role: UserRole;
  label: string;
  description: string;
  badgeColor: string;
}
