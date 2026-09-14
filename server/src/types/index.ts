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
  | 'reviews:read'
  | 'reviews:moderate'
  | 'reviews:create'
  | 'users:manage'
  | 'audit:read'
  | 'system:reset'
  | 'discount:vip';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'catalog:read', 'catalog:create', 'catalog:update', 'catalog:delete', 'catalog:edit_price',
    'inventory:read', 'inventory:update',
    'orders:read_all', 'orders:read_own', 'orders:update_status', 'orders:cancel', 'orders:refund',
    'reviews:read', 'reviews:moderate', 'reviews:create',
    'users:manage', 'audit:read', 'system:reset', 'discount:vip'
  ],
  store_manager: [
    'catalog:read', 'catalog:create', 'catalog:update', 'catalog:edit_price',
    'inventory:read', 'inventory:update',
    'orders:read_all', 'orders:update_status', 'orders:cancel',
    'reviews:read', 'reviews:moderate', 'reviews:create'
  ],
  inventory_clerk: [
    'catalog:read',
    'inventory:read', 'inventory:update'
  ],
  content_editor: [
    'catalog:read', 'catalog:create', 'catalog:update',
    'reviews:read'
  ],
  order_fulfillment: [
    'catalog:read',
    'orders:read_all', 'orders:update_status'
  ],
  support_agent: [
    'catalog:read',
    'orders:read_all', 'orders:cancel', 'orders:refund',
    'reviews:read'
  ],
  book_reviewer: [
    'catalog:read',
    'reviews:read', 'reviews:moderate', 'reviews:create'
  ],
  auditor: [
    'catalog:read',
    'orders:read_all',
    'inventory:read',
    'reviews:read',
    'audit:read'
  ],
  vip_customer: [
    'catalog:read',
    'orders:read_own', 'orders:cancel',
    'reviews:read', 'reviews:create',
    'discount:vip'
  ],
  standard_customer: [
    'catalog:read',
    'orders:read_own', 'orders:cancel',
    'reviews:read', 'reviews:create'
  ]
};

export interface User {
  id: string;
  username: string;
  password: string; // Plaintext or hashed for easy sandbox demo
  email: string;
  fullName: string;
  role: UserRole;
  avatar: string;
  status: 'active' | 'suspended';
  createdAt: string;
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
  publicationDate: string; // YYYY-MM-DD
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

export interface OrderItem {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
  coverImage: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

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
