// ─── Enums ───────────────────────────────────────────────────────────────────

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CARD = 'CARD',
  WALLET = 'WALLET',
}

export enum TransactionType {
  TOPUP = 'TOPUP',
  PURCHASE = 'PURCHASE',
  REFUND = 'REFUND',
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: Role;
  walletBalance: number;
  isBlocked: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Subset returned by auth endpoints & /me */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  walletBalance: number;
  role: Role;
}

/** Subset returned by admin user list */
export interface AdminUserItem {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: Role;
  isBlocked: boolean;
  walletBalance: number;
  createdAt: string;
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  stock: number;
  categoryId: string;
  images: string[];
  rating: number;
  reviewCount: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface Cart {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product?: Product;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: Pick<User, 'id' | 'name' | 'email'>;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtOrder: number;
  product?: Product;
}

// ─── Review ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, 'id' | 'name' | 'avatar'>;
}

// ─── Wishlist ────────────────────────────────────────────────────────────────

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product?: Product;
}

// ─── PromoCode ───────────────────────────────────────────────────────────────

export interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  validFrom: string;
  validUntil: string;
  minOrderAmount: number | null;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Transaction ─────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  description: string | null;
  orderId: string | null;
  createdAt: string;
}

// ─── API Response Types ──────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  requestId?: string;
}

// ─── Auth Types ──────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  user: UserProfile;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface ForgotPasswordResponse {
  message: string;
  token?: string; // only in dev/test env
}

export interface ResetPasswordResponse {
  message: string;
}

// ─── Admin Types ─────────────────────────────────────────────────────────────

export interface AdminStats {
  totalOrders: number;
  revenueToday: number;
  pendingOrders: number;
  activeUsers: number;
}

export interface CreateProductInput {
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number | null;
  stock?: number;
  categoryId: string;
  images?: string[];
}

export interface UpdateProductInput {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  salePrice?: number | null;
  stock?: number;
  categoryId?: string;
  images?: string[];
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
}

/** Valid order status transitions map */
export type OrderStatusTransitions = Record<OrderStatus, OrderStatus[]>;
