import { Link, Navigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Breadcrumb } from '@components/ui/Breadcrumb';
import { Skeleton } from '@components/ui/Skeleton';
import { blogApi } from '@api/blog';

export function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation('pages');
  const tc = useTranslation('common').t;

  const { data: article, isLoading } = useQuery({
    queryKey: ['blog-article', slug],
    queryFn: () => blogApi.getBySlug(slug ?? ''),
    enabled: !!slug,
  });

  const { data: allArticles } = useQuery({
    queryKey: ['blog', 'all'],
    queryFn: () => blogApi.list(),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-6 w-96" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  const related = (allArticles?.items ?? [])
    .filter(a => a.category === article.category && a.slug !== article.slug)
    .slice(0, 3);

  const breadcrumbItems = [
    { label: tc('nav.home'), to: '/' },
    { label: t('blog.title'), to: '/blog' },
    { label: article.title },
  ];

  return (
    <div data-testid="blog-article-page" className="max-w-3xl mx-auto">
      <Breadcrumb items={breadcrumbItems} />

      {article.coverImage && (
        <img
          data-testid="blog-article-hero"
          src={article.coverImage}
          alt=""
          className="w-full max-h-96 object-cover rounded-xl mb-6"
        />
      )}

      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-medium uppercase tracking-wide text-accent bg-accent/10 px-2 py-0.5 rounded">
          {article.category}
        </span>
        <span className="text-xs text-[var(--text-secondary)]">
          {new Date(article.publishedAt).toLocaleDateString()} &middot; {article.authorName}
        </span>
      </div>

      <h1
        data-testid="blog-article-title"
        className="text-2xl font-bold text-[var(--text-primary)] mb-6"
      >
        {article.title}
      </h1>

      <div
        data-testid="blog-article-body"
        className="text-sm text-[var(--text-secondary)] leading-relaxed mb-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[var(--text-primary)] [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[var(--text-primary)] [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_ol]:mb-3 [&_strong]:text-[var(--text-primary)] [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:italic"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      <Link
        data-testid="blog-article-back"
        to="/blog"
        className="text-sm text-accent hover:underline"
      >
        &larr; {t('blog.backToBlog')}
      </Link>

      {related.length > 0 && (
        <div data-testid="blog-article-related" className="mt-12">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
            {t('blog.relatedArticles')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map(r => (
              <Link
                key={r.slug}
                to={`/blog/${r.slug}`}
                data-testid={`blog-article-related-card-${r.slug}`}
                className="group rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
              >
                {r.coverImage && (
                  <img src={r.coverImage} alt="" className="aspect-video object-cover w-full" />
                )}
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2 group-hover:text-accent transition-colors">
                    {r.title}
                  </h3>
                  <span className="text-xs text-[var(--text-secondary)] mt-1">{r.authorName}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
