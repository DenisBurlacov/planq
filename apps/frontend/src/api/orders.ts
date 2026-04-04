import { apiFetch } from './client';
import type { Order, PaginatedResponse } from '@appTypes/api';

export interface CheckoutInput {
  shippingAddress: string;
  paymentMethod: 'CARD' | 'WALLET';
  promoCode?: string;
  cardNumber?: string;
}

export interface OrdersQuery {
  page?: number;
  dateFrom?: string;
  dateTo?: string;
}

export const ordersApi = {
  list: (query: OrdersQuery = {}) => {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.dateFrom) params.set('dateFrom', query.dateFrom);
    if (query.dateTo) params.set('dateTo', query.dateTo);
    return apiFetch<PaginatedResponse<Order>>(`/api/v1/orders?${params}`);
  },

  getById: (id: string) => apiFetch<Order>(`/api/v1/orders/${id}`),

  checkout: (input: CheckoutInput) =>
    apiFetch<Order>('/api/v1/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};
