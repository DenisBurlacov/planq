import { apiFetch } from './client';
import type { Order, PaginatedResponse } from '@appTypes/api';

export interface CheckoutInput {
  shippingAddress: string;
  paymentMethod: 'CARD' | 'WALLET';
  promoCode?: string;
  cardNumber?: string;
}

export const ordersApi = {
  list: (params?: { page?: number; dateFrom?: string; dateTo?: string }) => {
    const p = new URLSearchParams();
    if (params?.page) p.set('page', String(params.page));
    if (params?.dateFrom) p.set('dateFrom', params.dateFrom);
    if (params?.dateTo) p.set('dateTo', params.dateTo);
    const qs = p.toString();
    return apiFetch<PaginatedResponse<Order>>(`/api/v1/orders${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => apiFetch<Order>(`/api/v1/orders/${id}`),

  checkout: (input: CheckoutInput) =>
    apiFetch<Order>('/api/v1/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  cancel: (id: string, reason: string) =>
    apiFetch<Order>(`/api/v1/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};
