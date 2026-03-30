import { apiFetch } from './client';
import type { Cart } from '@appTypes/api';

export const cartApi = {
  get: () => apiFetch<Cart>('/api/v1/cart'),

  add: (productId: string, quantity = 1) =>
    apiFetch<Cart>('/api/v1/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),

  update: (productId: string, quantity: number) =>
    apiFetch<Cart>(`/api/v1/cart/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),

  remove: (productId: string) => apiFetch<Cart>(`/api/v1/cart/${productId}`, { method: 'DELETE' }),

  clear: () => apiFetch<undefined>('/api/v1/cart', { method: 'DELETE' }),
};
