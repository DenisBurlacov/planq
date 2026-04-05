export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  requestId?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export type UserRole = 'USER' | 'MANAGER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  walletBalance: number;
  isBlocked: boolean;
  role: UserRole;
  emailVerified?: boolean;
  provider?: string | null;
  providerId?: string | null;
}

export interface AdminStats {
  totalOrders: number;
  totalOrdersChange: number;
  revenueToday: number;
  revenueTodayChange: number;
  pendingOrders: number;
  pendingOrdersChange: number;
  activeUsers: number;
  activeUsersChange: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: UserRole;
  isBlocked: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  color?: string;
  size?: string;
  stock: number;
  priceAdjustment: number;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  saleEndsAt?: string | null;
  stock: number;
  categoryId: string;
  category?: Category;
  images: string[];
  rating: number;
  reviewCount: number;
  ratingBreakdown?: Record<number, number>;
  variants?: ProductVariant[];
  specs?: {
    material?: string;
    color?: string;
    style?: string;
  };
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  items: CartItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  priceAtOrder: number;
  product: Product;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'CARD' | 'WALLET';

export type DeliveryMethod = 'STANDARD' | 'EXPRESS' | 'NEXT_DAY';

export interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  deliveryMethod?: DeliveryMethod;
  deliveryCost?: number;
  createdAt: string;
  items: OrderItem[];
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  images?: string[];
  createdAt: string;
  user: { id: string; name: string; avatar: string | null };
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  validFrom: string;
  validUntil: string;
  minOrderAmount: number | null;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'TOPUP' | 'PURCHASE' | 'REFUND';
  description: string | null;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
  user?: { name: string };
  userName?: string;
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface AdminStats {
  totalOrders: number;
  revenueToday: number;
  pendingOrders: number;
  activeUsers: number;
}

export interface WsMessage<T = unknown> {
  event: 'payment.result' | 'order.status.updated' | 'cart.updated' | 'notification.new';
  payload: T;
}

export interface PaymentResultPayload {
  status: 'success' | 'failed';
  orderId: string;
  reason?: string;
}

export interface OrderStatusPayload {
  orderId: string;
  status: OrderStatus;
}
