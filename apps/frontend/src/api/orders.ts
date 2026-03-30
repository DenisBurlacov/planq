import { apiFetch } from './client';
import type { Order, PaginatedResponse } from '@appTypes/api';

export interface CheckoutInput {
  shippingAddress: string;
  paymentMethod: 'CARD' | 'WALLET';
  promoCode?: string;
  cardNumber?: string;
}

export const ordersApi = {
  list: (page = 1) => apiFetch<PaginatedResponse<Order>>(`/api/v1/orders?page=${page}`),

  getById: (id: string) => apiFetch<Order>(`/api/v1/orders/${id}`),

  checkout: (input: CheckoutInput) =>
    apiFetch<Order>('/api/v1/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};
