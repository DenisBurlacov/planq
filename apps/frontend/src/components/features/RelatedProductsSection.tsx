import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { productsApi } from '@api/products';
import { ImageOff } from 'lucide-react';
import { StarRating } from '@components/ui/StarRating';

interface RelatedProductsSectionProps {
  categoryId: string;
  currentProductId: string;
}

export function RelatedProductsSection({
  categoryId,
  currentProductId,
}: RelatedProductsSectionProps) {
  const { t } = useTranslation('catalog');

  const { data } = useQuery({
    queryKey: ['related-products', categoryId, currentProductId],
    queryFn: () => productsApi.list({ categoryId, limit: 8 }),
    enabled: !!categoryId,
  });

  const products = (data?.items ?? []).filter(p => p.id !== currentProductId);

  if (products.length < 2) return null;

  return (
    <section data-testid="related-products-section" className="mt-12">
      <h2
        data-testid="related-products-title"
        className="text-xl font-bold text-[var(--text-primary)] mb-6"
      >
        {t('product.youMayAlsoLike')}
      </h2>
      <div
        data-testid="related-products-carousel"
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2"
      >
        {products.map(product => {
          const price = product.salePrice ?? product.price;
          return (
            <Link
              key={product.id}
              to={`/catalog/${product.id}`}
              className="snap-start shrink-0 w-[70vw] sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
            >
              {product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="aspect-video object-cover w-full"
                />
              ) : (
                <div className="aspect-video bg-[var(--bg-sidebar)] flex items-center justify-center">
                  <ImageOff className="h-8 w-8 text-[var(--text-secondary)]" />
                </div>
              )}
              <div className="p-3">
                <h3 className="text-sm font-medium text-[var(--text-primary)] line-clamp-1">
                  {product.name}
                </h3>
                <div className="mt-1">
                  <StarRating value={product.rating} size="xs" />
                </div>
                <p className="text-sm font-bold text-[var(--text-primary)] mt-1">
                  €{price.toFixed(2)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
