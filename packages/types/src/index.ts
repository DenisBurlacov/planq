// ─── Enums ───────────────────────────────────────────────────────────────────

export enum Role {
  USER = 'USER',
  MANAGER = 'MANAGER',
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

// ─── Delivery ───────────────────────────────────────────────────────────────

export enum DeliveryMethod {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
  NEXT_DAY = 'NEXT_DAY',
}

// ─── Product Variant ────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  color?: string | null;
  size?: string | null;
  stock: number;
  priceAdjustment: number;
  image?: string | null;
}

// ─── Address ────────────────────────────────────────────────────────────────

export interface Address {
  id: string;
  userId: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Notification ───────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ─── Audit Log ──────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
  user?: { name: string };
}

// ─── Saved Card ─────────────────────────────────────────────────────────────

export interface SavedCard {
  id: string;
  userId: string;
  last4: string;
  brand: string;
  cardholderName: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: string;
}

// ─── Webhook ────────────────────────────────────────────────────────────────

export interface WebhookSubscription {
  id: string;
  userId: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  subscriptionId: string;
  event: string;
  payload: Record<string, unknown>;
  status: string;
  createdAt: string;
}

// ─── Blog ───────────────────────────────────────────────────────────────────

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: string;
  authorName: string;
  publishedAt: string;
}

// ─── WebSocket ──────────────────────────────────────────────────────────────

export interface WsMessage<T = unknown> {
  event: 'payment.result' | 'order.status.updated' | 'cart.updated' | 'notification.new';
  payload: T;
}

export interface PaymentResultPayload {
  status: 'success' | 'failed' | 'declined' | 'timeout';
  orderId: string;
  reason?: string;
}

export interface OrderStatusPayload {
  orderId: string;
  status: OrderStatus;
}

// ─── Notification Preferences ───────────────────────────────────────────────

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  newsletter: boolean;
  orderUpdates: boolean;
  promotions: boolean;
}
