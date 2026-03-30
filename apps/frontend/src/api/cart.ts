import { apiFetch } from './client';
import type { Cart } from '@appTypes/api';

export const cartApi = {
  get: () => apiFetch<Cart>('/api/v1/cart'),

  add: (productId: string, quantity = 1) =>
    apiFetch<Cart>('/api/v1/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),

  update: (itemId: string, quantity: number) =>
    apiFetch<Cart>(`/api/v1/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),

  remove: (itemId: string) => apiFetch<Cart>(`/api/v1/cart/items/${itemId}`, { method: 'DELETE' }),

  clear: () => apiFetch<undefined>('/api/v1/cart', { method: 'DELETE' }),
};
