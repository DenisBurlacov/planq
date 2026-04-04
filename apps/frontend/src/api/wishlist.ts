import { apiFetch } from './client';
import type { Product } from '@appTypes/api';

export const wishlistApi = {
  get: async () => {
    const res = await apiFetch<{
      items: { productId: string; product: Product }[];
      total: number;
      page: number;
      limit: number;
      pages: number;
    }>('/api/v1/wishlist');
    return res.items;
  },

  add: (productId: string) =>
    apiFetch<undefined>('/api/v1/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),

  remove: (productId: string) =>
    apiFetch<undefined>(`/api/v1/wishlist/${productId}`, { method: 'DELETE' }),
};
