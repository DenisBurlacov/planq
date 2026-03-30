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
}

export const productsApi = {
  list: (query: ProductsQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v));
    });
    return apiFetch<PaginatedResponse<Product>>(`/api/v1/products?${params}`);
  },

  getById: (id: string) => apiFetch<Product>(`/api/v1/products/${id}`),

  getStock: (id: string) => apiFetch<{ stock: number }>(`/api/v1/products/${id}/stock`),

  getCategories: () => apiFetch<Category[]>('/api/v1/categories'),

  getReviews: (productId: string, page = 1) =>
    apiFetch<PaginatedResponse<Review>>(`/api/v1/reviews/product/${productId}?page=${page}`),

  createReview: (productId: string, rating: number, comment?: string) =>
    apiFetch<Review>(`/api/v1/reviews/product/${productId}`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    }),

  deleteReview: (reviewId: string) =>
    apiFetch<undefined>(`/api/v1/reviews/${reviewId}`, { method: 'DELETE' }),
};
