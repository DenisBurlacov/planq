import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BLOG_ARTICLES, type BlogArticle } from '@constants/blogArticles';

type CategoryFilter = 'all' | BlogArticle['category'];

export function BlogPage() {
  const { t } = useTranslation('pages');
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const filters: { key: CategoryFilter; label: string; testId: string }[] = [
    { key: 'all', label: t('blog.filterAll'), testId: 'blog-filter-all' },
    { key: 'trends', label: t('blog.filterTrends'), testId: 'blog-filter-trends' },
    { key: 'guides', label: t('blog.filterGuides'), testId: 'blog-filter-guides' },
    { key: 'inspiration', label: t('blog.filterInspiration'), testId: 'blog-filter-inspiration' },
    {
      key: 'sustainability',
      label: t('blog.filterSustainability'),
      testId: 'blog-filter-sustainability',
    },
  ];

  const articles =
    filter === 'all' ? BLOG_ARTICLES : BLOG_ARTICLES.filter(a => a.category === filter);

  return (
    <div data-testid="blog-page">
      <h1 data-testid="blog-title" className="text-2xl font-bold text-[var(--text-primary)] mb-2">
        {t('blog.title')}
      </h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6">{t('blog.subtitle')}</p>

      {/* Filter pills */}
      <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
        {filters.map(f => (
          <button
            key={f.key}
            data-testid={f.testId}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-accent text-white'
                : 'bg-[var(--bg-sidebar)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      {articles.length === 0 ? (
        <p className="text-center text-[var(--text-secondary)] py-12">{t('blog.noArticles')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <Link
              key={article.slug}
              to={`/blog/${article.slug}`}
              data-testid={`blog-card-${article.slug}`}
              className="group rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
            >
              <img
                data-testid={`blog-card-image-${article.slug}`}
                src={article.image}
                alt=""
                className="aspect-video object-cover w-full"
              />
              <div className="p-4">
                <span className="text-xs font-medium uppercase tracking-wide text-accent bg-accent/10 px-2 py-0.5 rounded">
                  {t(article.categoryKey.replace('pages:', ''))}
                </span>
                <h3
                  data-testid={`blog-card-title-${article.slug}`}
                  className="text-lg font-semibold text-[var(--text-primary)] line-clamp-2 group-hover:text-accent transition-colors mt-2"
                >
                  {t(article.titleKey.replace('pages:', ''))}
                </h3>
                <p
                  data-testid={`blog-card-excerpt-${article.slug}`}
                  className="text-sm text-[var(--text-secondary)] line-clamp-2 mt-1"
                >
                  {t(article.excerptKey.replace('pages:', ''))}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {new Date(article.date).toLocaleDateString()} &middot;{' '}
                    {t('blog.minRead', { minutes: article.readMinutes })}
                  </span>
                  <span
                    data-testid={`blog-card-readmore-${article.slug}`}
                    className="text-sm text-accent font-medium"
                  >
                    {t('blog.readMore')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
