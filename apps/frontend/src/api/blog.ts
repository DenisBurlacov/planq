import { apiFetch } from './client';

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: string;
  authorName: string;
  publishedAt: string;
}

export interface BlogListResponse {
  items: BlogArticle[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const blogApi = {
  list: (category?: string, page = 1) => {
    const params = new URLSearchParams({ page: String(page) });
    if (category && category !== 'all') params.set('category', category);
    return apiFetch<BlogListResponse>(`/api/v1/blog?${params}`);
  },

  getBySlug: (slug: string) => apiFetch<BlogArticle>(`/api/v1/blog/${slug}`),
};
