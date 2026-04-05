import { apiFetch } from './client';
import type { Product, Category, PaginatedResponse, Review } from '@appTypes/api';

export interface ProductsQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  inStock?: boolean;
  sort?: 'newest' | 'priceAsc' | 'priceDesc' | 'rating';
  material?: string[];
  color?: string[];
  style?: string[];
  rating?: number;
}

export const productsApi = {
  list: (query: ProductsQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '') {
        if (Array.isArray(v) && v.length > 0) {
          params.set(k, v.join(','));
        } else if (!Array.isArray(v)) {
          params.set(k, String(v));
        }
      }
    });
    return apiFetch<PaginatedResponse<Product>>(`/api/v1/products?${params}`);
  },

  getById: (id: string) => apiFetch<Product>(`/api/v1/products/${id}`),

  getStock: (id: string) => apiFetch<{ stock: number }>(`/api/v1/products/${id}/stock`),

  getCategories: () => apiFetch<Category[]>('/api/v1/categories'),

  getReviews: (productId: string, page = 1, rating?: number) => {
    const params = new URLSearchParams({ page: String(page) });
    if (rating) params.set('rating', String(rating));
    return apiFetch<PaginatedResponse<Review>>(`/api/v1/reviews/product/${productId}?${params}`);
  },

  createReview: (productId: string, rating: number, comment?: string, images?: string[]) =>
    apiFetch<Review>(`/api/v1/reviews/product/${productId}`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment, images }),
    }),

  deleteReview: (reviewId: string) =>
    apiFetch<undefined>(`/api/v1/reviews/${reviewId}`, { method: 'DELETE' }),

  notifyInStock: (productId: string, email: string) =>
    apiFetch<{ id: string }>(`/api/v1/products/${productId}/notify`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
};
