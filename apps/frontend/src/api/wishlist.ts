import { apiFetch } from './client';
import type { Product } from '@appTypes/api';

export const wishlistApi = {
  get: () => apiFetch<{ productId: string; product: Product }[]>('/api/v1/wishlist'),

  add: (productId: string) =>
    apiFetch<undefined>('/api/v1/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),

  remove: (productId: string) =>
    apiFetch<undefined>(`/api/v1/wishlist/${productId}`, { method: 'DELETE' }),
};
