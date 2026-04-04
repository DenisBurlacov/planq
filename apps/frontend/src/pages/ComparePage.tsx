import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight, Plus, Star, X } from 'lucide-react';
import { BackButton } from '@components/ui/BackButton';
import { Button } from '@components/ui/Button';
import { Skeleton } from '@components/ui/Skeleton';
import { useCompareStore } from '@store/compare.store';
import { useCartStore } from '@store/cart.store';
import { useAuthStore } from '@store/auth.store';
import { productsApi } from '@api/products';
import { cartApi } from '@api/cart';
import { useToast } from '@components/ui/Toast';
import { ApiException } from '@api/client';
import type { Product } from '@appTypes/api';

const SPEC_KEYS = [
  { key: 'name', labelKey: 'Name' },
  { key: 'price', labelKey: 'Price' },
  { key: 'rating', labelKey: 'Rating' },
  { key: 'category', labelKey: 'Category' },
  { key: 'stock', labelKey: 'Stock' },
];

export function ComparePage() {
  const { t } = useTranslation('catalog');
  const { productIds, removeProduct, clearAll } = useCompareStore();
  const { increment } = useCartStore();
  const { accessToken } = useAuthStore();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery({
    queryKey: ['compare-products', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return [];
      const results = await Promise.all(productIds.map(id => productsApi.getById(id)));
      return results;
    },
    enabled: productIds.length > 0,
  });

  const handleAddToCart = async (product: Product) => {
    if (!accessToken) return;
    try {
      await cartApi.add(product.id, 1);
      increment(1);
      toast('success', `${product.name} added to cart`);
    } catch (err) {
      toast('error', err instanceof ApiException ? err.message : 'Failed to add to cart');
    }
  };

  const getSpecValue = (product: Product, key: string): string => {
    switch (key) {
      case 'name':
        return product.name;
      case 'price':
        return product.salePrice !== null
          ? `€${product.salePrice.toFixed(2)} (was €${product.price.toFixed(2)})`
          : `€${product.price.toFixed(2)}`;
      case 'rating':
        return `${product.rating.toFixed(1)} / 5 (${product.reviewCount})`;
      case 'category':
        return product.category?.name ?? '—';
      case 'stock':
        return product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock';
      default:
        return '—';
    }
  };

  const getBestValue = (key: string): string | null => {
    if (!products || products.length < 2) return null;
    if (key === 'price') {
      const prices = products.map(p => p.salePrice ?? p.price);
      const min = Math.min(...prices);
      const idx = prices.indexOf(min);
      return products[idx]?.id ?? null;
    }
    if (key === 'rating') {
      const ratings = products.map(p => p.rating);
      const max = Math.max(...ratings);
      const idx = ratings.indexOf(max);
      return products[idx]?.id ?? null;
    }
    return null;
  };

  // Empty state
  if (productIds.length === 0) {
    return (
      <div data-testid="compare-page">
        <BackButton fallbackTo="/catalog" className="mb-4" />
        <div
          data-testid="compare-empty"
          className="flex flex-col items-center justify-center py-24 gap-4"
        >
          <ArrowLeftRight className="h-12 w-12 text-[var(--text-secondary)]" />
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {t('compare.empty', { defaultValue: 'No products to compare' })}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {t('compare.emptyHint', {
              defaultValue: 'Add products from the catalog to compare them side by side',
            })}
          </p>
          <Link to="/catalog">
            <Button>{t('title')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="compare-page">
      {/* Header */}
      <div
        data-testid="compare-header"
        className="flex items-center justify-between mb-6 flex-wrap gap-3"
      >
        <div className="flex items-center gap-3">
          <BackButton fallbackTo="/catalog" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {t('compare.title', { defaultValue: 'Compare Products' })}
          </h1>
          <span data-testid="compare-count" className="text-sm text-[var(--text-secondary)]">
            ({productIds.length} / 4)
          </span>
        </div>
        <Button data-testid="compare-clear-all" variant="ghost" size="sm" onClick={clearAll}>
          {t('compare.clearAll', { defaultValue: 'Clear All' })}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      ) : (
        <div
          data-testid="compare-table"
          className="rounded-xl border border-[var(--border)] overflow-x-auto"
        >
          <table className="w-full" aria-label="Product comparison table">
            <thead>
              <tr>
                <th className="sticky left-0 bg-[var(--bg-card)] min-w-[120px] p-3 text-left text-sm font-medium text-[var(--text-secondary)] border-b border-[var(--border)]" />
                {products?.map((product, i) => (
                  <th
                    key={product.id}
                    data-testid={`compare-product-${i}`}
                    className="min-w-[200px] w-[25%] p-3 text-center border-b border-[var(--border)] align-top"
                  >
                    <div className="relative">
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="absolute -top-1 -right-1 p-0.5 rounded-full bg-[var(--bg-sidebar)] hover:bg-red-100 dark:hover:bg-red-900/20"
                        aria-label="Remove"
                      >
                        <X className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                      </button>
                      <Link to={`/catalog/${product.id}`}>
                        <div className="h-32 rounded-lg overflow-hidden bg-[var(--bg-sidebar)] mb-2">
                          {product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[var(--text-secondary)] text-xs">
                              No image
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)] hover:text-accent line-clamp-2">
                          {product.name}
                        </span>
                      </Link>
                    </div>
                  </th>
                ))}
                {productIds.length < 4 && (
                  <th
                    data-testid="compare-add-slot"
                    className="min-w-[200px] w-[25%] p-3 text-center border-b border-[var(--border)]"
                  >
                    <Link
                      to="/catalog"
                      className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-[var(--border)] text-[var(--text-secondary)] hover:border-accent hover:text-accent transition-colors"
                    >
                      <Plus className="h-8 w-8 mb-1" />
                      <span className="text-sm">
                        {t('compare.addProduct', { defaultValue: 'Add a product' })}
                      </span>
                    </Link>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {SPEC_KEYS.map((spec, rowIdx) => {
                const bestId = getBestValue(spec.key);
                return (
                  <tr
                    key={spec.key}
                    data-testid={`compare-row-${spec.key}`}
                    className={rowIdx % 2 === 1 ? 'bg-[var(--table-stripe)]' : ''}
                  >
                    <td className="sticky left-0 bg-[var(--bg-card)] min-w-[120px] px-4 py-3 font-medium text-sm text-[var(--text-secondary)] border-r border-[var(--border)]">
                      {spec.labelKey}
                    </td>
                    {products?.map(product => {
                      const val = getSpecValue(product, spec.key);
                      const isBest = bestId === product.id;
                      return (
                        <td
                          key={product.id}
                          className={`px-4 py-3 text-sm text-center ${isBest ? 'text-green-600 font-semibold' : 'text-[var(--text-primary)]'}`}
                        >
                          {spec.key === 'rating' ? (
                            <div className="flex items-center justify-center gap-1">
                              <Star
                                className={`h-3.5 w-3.5 ${isBest ? 'fill-green-500 text-green-500' : 'fill-yellow-400 text-yellow-400'}`}
                              />
                              {val}
                            </div>
                          ) : (
                            val
                          )}
                        </td>
                      );
                    })}
                    {productIds.length < 4 && <td />}
                  </tr>
                );
              })}
              {/* Action row */}
              <tr className="border-t border-[var(--border)]">
                <td className="sticky left-0 bg-[var(--bg-card)] min-w-[120px] px-4 py-3 border-r border-[var(--border)]" />
                {products?.map((product, i) => (
                  <td key={product.id} className="px-4 py-3 text-center">
                    <div className="flex flex-col gap-2">
                      <Button
                        data-testid={`compare-add-to-cart-${i}`}
                        size="sm"
                        disabled={product.stock === 0}
                        onClick={() => handleAddToCart(product)}
                      >
                        {t('product.addToCart')}
                      </Button>
                      <Button
                        data-testid={`compare-remove-${i}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProduct(product.id)}
                      >
                        {t('compare.remove', { defaultValue: 'Remove' })}
                      </Button>
                    </div>
                  </td>
                ))}
                {productIds.length < 4 && <td />}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
