import { apiFetch } from './client';
import type {
  Product,
  Order,
  AdminUser,
  AdminStats,
  PaginatedResponse,
  OrderStatus,
} from '@appTypes/api';

export interface AdminProductInput {
  name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  categoryId: string;
  images: string[];
}

export interface AdminProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AdminOrdersQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export const adminApi = {
  // Stats
  getStats: () => apiFetch<AdminStats>('/api/v1/admin/stats'),

  // Products
  listProducts: (query: AdminProductsQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v));
    });
    return apiFetch<PaginatedResponse<Product>>(`/api/v1/admin/products?${params}`);
  },

  createProduct: (input: AdminProductInput) =>
    apiFetch<Product>('/api/v1/admin/products', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateProduct: (id: string, input: Partial<AdminProductInput>) =>
    apiFetch<Product>(`/api/v1/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  deleteProduct: (id: string) =>
    apiFetch<undefined>(`/api/v1/admin/products/${id}`, { method: 'DELETE' }),

  // Orders
  listOrders: (query: AdminOrdersQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v));
    });
    return apiFetch<PaginatedResponse<Order>>(`/api/v1/admin/orders?${params}`);
  },

  updateOrderStatus: (id: string, status: OrderStatus) =>
    apiFetch<Order>(`/api/v1/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Users
  listUsers: (query: AdminUsersQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v));
    });
    return apiFetch<PaginatedResponse<AdminUser>>(`/api/v1/admin/users?${params}`);
  },

  toggleBlockUser: (id: string, blocked: boolean) =>
    apiFetch<AdminUser>(`/api/v1/admin/users/${id}/block`, {
      method: 'PUT',
      body: JSON.stringify({ blocked }),
    }),
};
