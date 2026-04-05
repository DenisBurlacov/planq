export interface BlogArticle {
  slug: string;
  titleKey: string;
  excerptKey: string;
  contentKey: string;
  image: string;
  category: 'trends' | 'guides' | 'inspiration' | 'sustainability';
  categoryKey: string;
  date: string;
  readMinutes: number;
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'scandinavian-design-trends-2026',
    titleKey: 'pages:blog.articles.scandinavian-design-trends-2026.title',
    excerptKey: 'pages:blog.articles.scandinavian-design-trends-2026.excerpt',
    contentKey: 'pages:blog.articles.scandinavian-design-trends-2026.content',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=450&fit=crop&q=80',
    category: 'trends',
    categoryKey: 'pages:blog.filterTrends',
    date: '2026-03-15',
    readMinutes: 6,
  },
  {
    slug: 'small-space-furniture-guide',
    titleKey: 'pages:blog.articles.small-space-furniture-guide.title',
    excerptKey: 'pages:blog.articles.small-space-furniture-guide.excerpt',
    contentKey: 'pages:blog.articles.small-space-furniture-guide.content',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=450&fit=crop&q=80',
    category: 'guides',
    categoryKey: 'pages:blog.filterGuides',
    date: '2026-03-10',
    readMinutes: 8,
  },
  {
    slug: 'living-room-color-palettes',
    titleKey: 'pages:blog.articles.living-room-color-palettes.title',
    excerptKey: 'pages:blog.articles.living-room-color-palettes.excerpt',
    contentKey: 'pages:blog.articles.living-room-color-palettes.content',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=450&fit=crop&q=80',
    category: 'inspiration',
    categoryKey: 'pages:blog.filterInspiration',
    date: '2026-03-05',
    readMinutes: 5,
  },
  {
    slug: 'sustainable-materials-furniture',
    titleKey: 'pages:blog.articles.sustainable-materials-furniture.title',
    excerptKey: 'pages:blog.articles.sustainable-materials-furniture.excerpt',
    contentKey: 'pages:blog.articles.sustainable-materials-furniture.content',
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=450&fit=crop&q=80',
    category: 'sustainability',
    categoryKey: 'pages:blog.filterSustainability',
    date: '2026-02-28',
    readMinutes: 7,
  },
  {
    slug: 'home-office-setup-guide',
    titleKey: 'pages:blog.articles.home-office-setup-guide.title',
    excerptKey: 'pages:blog.articles.home-office-setup-guide.excerpt',
    contentKey: 'pages:blog.articles.home-office-setup-guide.content',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&h=450&fit=crop&q=80',
    category: 'guides',
    categoryKey: 'pages:blog.filterGuides',
    date: '2026-02-20',
    readMinutes: 9,
  },
  {
    slug: 'bedroom-makeover-inspiration',
    titleKey: 'pages:blog.articles.bedroom-makeover-inspiration.title',
    excerptKey: 'pages:blog.articles.bedroom-makeover-inspiration.excerpt',
    contentKey: 'pages:blog.articles.bedroom-makeover-inspiration.content',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=450&fit=crop&q=80',
    category: 'inspiration',
    categoryKey: 'pages:blog.filterInspiration',
    date: '2026-02-15',
    readMinutes: 6,
  },
];
