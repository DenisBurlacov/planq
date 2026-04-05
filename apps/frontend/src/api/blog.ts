import { BLOG_ARTICLES, type BlogArticle } from '@constants/blogArticles';

export const blogApi = {
  list: async (category?: string): Promise<BlogArticle[]> => {
    if (category && category !== 'all') {
      return BLOG_ARTICLES.filter(a => a.category === category);
    }
    return BLOG_ARTICLES;
  },

  getBySlug: async (slug: string): Promise<BlogArticle | undefined> => {
    return BLOG_ARTICLES.find(a => a.slug === slug);
  },
};
