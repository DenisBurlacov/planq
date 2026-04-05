import { apiFetch } from './client';
import { useAuthStore } from '@store/auth.store';
import type {
  Product,
  Order,
  AdminUser,
  AdminStats,
  PaginatedResponse,
  OrderStatus,
  AuditLogEntry,
} from '@appTypes/api';

export interface AdminProductInput {
  name: string;
  slug: string;
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
  includeDeleted?: boolean;
}

export interface AdminOrdersQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AuditLogQuery {
  page?: number;
  limit?: number;
  action?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

function buildParams(query: object): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== '' && v !== false) params.set(k, String(v));
  }
  return params.toString();
}

export const adminApi = {
  // Stats
  getStats: () => apiFetch<AdminStats>('/api/v1/admin/stats'),

  // Products
  listProducts: (query: AdminProductsQuery = {}) =>
    apiFetch<PaginatedResponse<Product>>(`/api/v1/admin/products?${buildParams(query)}`),

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

  bulkDeleteProducts: (ids: string[]) =>
    apiFetch<undefined>('/api/v1/admin/products/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    }),

  restoreProduct: (id: string) =>
    apiFetch<Product>(`/api/v1/admin/products/${id}/restore`, { method: 'PUT' }),

  // Orders
  listOrders: (query: AdminOrdersQuery = {}) =>
    apiFetch<PaginatedResponse<Order>>(`/api/v1/admin/orders?${buildParams(query)}`),

  updateOrderStatus: (id: string, status: OrderStatus) =>
    apiFetch<Order>(`/api/v1/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  bulkUpdateOrderStatus: (ids: string[], status: OrderStatus) =>
    apiFetch<undefined>('/api/v1/admin/orders/bulk/status', {
      method: 'PUT',
      body: JSON.stringify({ ids, status }),
    }),

  exportOrders: async (format: 'csv' | 'pdf', query: AdminOrdersQuery = {}) => {
    const { accessToken } = useAuthStore.getState();
    const BASE_URL = import.meta.env.VITE_API_URL as string;
    const params = buildParams({ ...query, format });
    const res = await fetch(`${BASE_URL}/api/v1/admin/orders/export?${params}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Users
  listUsers: (query: AdminUsersQuery = {}) =>
    apiFetch<PaginatedResponse<AdminUser>>(`/api/v1/admin/users?${buildParams(query)}`),

  toggleBlockUser: (id: string, blocked: boolean) =>
    apiFetch<AdminUser>(`/api/v1/admin/users/${id}/block`, {
      method: 'PUT',
      body: JSON.stringify({ blocked }),
    }),

  // Audit Log
  getAuditLog: (query: AuditLogQuery = {}) =>
    apiFetch<PaginatedResponse<AuditLogEntry>>(`/api/v1/admin/audit?${buildParams(query)}`),

  // Settings
  getSettings: () =>
    apiFetch<Array<{ key: string; value: string; updatedAt: string }>>('/api/v1/admin/settings'),

  updateSettings: (settings: Array<{ key: string; value: string }>) =>
    apiFetch<Array<{ key: string; value: string; updatedAt: string }>>('/api/v1/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    }),

  // Scheduler
  restartScheduler: () =>
    apiFetch<{ started: boolean; enabled: boolean; interval: number; max: number; type: string }>(
      '/api/v1/admin/scheduler/restart',
      { method: 'POST' }
    ),
};
