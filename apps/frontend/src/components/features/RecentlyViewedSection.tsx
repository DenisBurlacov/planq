import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { productsApi } from '@api/products';
import { StarRating } from '@components/ui/StarRating';
import { ProductImage } from '@components/ui/ProductImage';
import { formatPrice } from '@utils/pricing';
import type { Product } from '@appTypes/api';

const STORAGE_KEY = 'planq_recently_viewed';
const MAX_ITEMS = 12;

export function addToRecentlyViewed(productId: string) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[];
    const filtered = stored.filter(id => id !== productId);
    filtered.unshift(productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
  } catch {
    /* ignore */
  }
}

interface RecentlyViewedSectionProps {
  currentProductId: string;
}

export function RecentlyViewedSection({ currentProductId }: RecentlyViewedSectionProps) {
  const { t } = useTranslation('catalog');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[];
        const ids = stored.filter(id => id !== currentProductId).slice(0, 8);
        if (ids.length < 2) return;

        const results = await Promise.all(ids.map(id => productsApi.getById(id).catch(() => null)));
        setProducts(results.filter((p): p is Product => p !== null));
      } catch {
        /* ignore */
      }
    };
    loadProducts();
  }, [currentProductId]);

  if (products.length < 2) return null;

  return (
    <section data-testid="recently-viewed-section" className="mt-12">
      <h2
        data-testid="recently-viewed-title"
        className="text-xl font-bold text-[var(--text-primary)] mb-6"
      >
        {t('product.recentlyViewed')}
      </h2>
      <div
        data-testid="recently-viewed-carousel"
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2"
      >
        {products.map(product => {
          const price = product.salePrice ?? product.price;
          return (
            <Link
              key={product.id}
              to={`/catalog/${product.id}`}
              data-testid={`recently-viewed-card-${product.id}`}
              className="snap-start shrink-0 w-[70vw] sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
            >
              <div className="aspect-video overflow-hidden bg-[var(--bg-sidebar)]">
                <ProductImage
                  src={product.images.length > 0 ? product.images[0] : undefined}
                  alt={product.name}
                  className="aspect-video object-cover w-full"
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-[var(--text-primary)] line-clamp-1">
                  {product.name}
                </h3>
                <div className="mt-1">
                  <StarRating value={product.rating} size="xs" />
                </div>
                <p className="text-sm font-bold text-[var(--text-primary)] mt-1">
                  {formatPrice(price)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
