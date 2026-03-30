import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '@components/features/ProductCard';
import { ProductCardSkeleton } from '@components/ui/Skeleton';
import { Button } from '@components/ui/Button';
import { productsApi, type ProductsQuery } from '@api/products';
import { cartApi } from '@api/cart';
import { wishlistApi } from '@api/wishlist';
import { useCartStore } from '@store/cart.store';
import { useAuthStore } from '@store/auth.store';
import { useToast } from '@components/ui/Toast';
import { ApiException } from '@api/client';
import type { Product } from '@appTypes/api';

export function CatalogPage() {
  const { t } = useTranslation('catalog');
  const { accessToken } = useAuthStore();
  const { increment } = useCartStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState<ProductsQuery>({ page: 1, limit: 12 });
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [priceError, setPriceError] = useState('');

  const { data: wishlist } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistApi.get,
    enabled: !!accessToken,
  });

  useEffect(() => {
    if (wishlist) {
      setWishlistedIds(new Set(wishlist.map(w => w.productId)));
    }
  }, [wishlist]);

  const { data, isLoading } = useQuery({
    queryKey: ['products', query],
    queryFn: () => productsApi.list(query),
    placeholderData: prev => prev,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.getCategories,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(q => ({ ...q, search, page: 1 }));
  };

  const handleAddToCart = async (product: Product) => {
    if (!accessToken) {
      navigate('/login', { state: { from: location } });
      return;
    }
    try {
      await cartApi.add(product.id);
      increment();
      toast('success', `${product.name} added to cart`);
    } catch (err) {
      toast('error', err instanceof ApiException ? err.message : 'Failed to add to cart');
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!accessToken) {
      navigate('/login', { state: { from: location } });
      return;
    }
    const isWishlisted = wishlistedIds.has(productId);
    // Optimistic update
    setWishlistedIds(prev => {
      const next = new Set(prev);
      if (isWishlisted) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
    try {
      if (isWishlisted) {
        await wishlistApi.remove(productId);
      } else {
        await wishlistApi.add(productId);
      }
    } catch {
      // Rollback
      setWishlistedIds(prev => {
        const next = new Set(prev);
        if (isWishlisted) {
          next.add(productId);
        } else {
          next.delete(productId);
        }
        return next;
      });
      toast('error', 'Failed to update wishlist');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t('filters.title')}
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('search')}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <Button type="submit" variant="secondary">
          {t('common:actions.submit', { ns: 'common' })}
        </Button>
      </form>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
              {t('filters.category')}
            </label>
            <div data-testid="category-filter" className="mt-1 space-y-1 max-h-36 overflow-y-auto">
              {categories?.map(cat => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 text-sm cursor-pointer py-0.5"
                >
                  <input
                    type="checkbox"
                    data-testid={`category-checkbox-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                    checked={query.categoryId === cat.id}
                    onChange={() =>
                      setQuery(q => ({
                        ...q,
                        categoryId: q.categoryId === cat.id ? undefined : cat.id,
                        page: 1,
                      }))
                    }
                    className="rounded"
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 items-end col-span-1">
            <div className="flex-1">
              <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                {t('filters.minPrice')}
              </label>
              <input
                type="number"
                placeholder="0"
                min="0"
                className={`mt-1 w-full rounded-lg border bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none ${priceError ? 'border-red-500' : 'border-[var(--border)]'}`}
                onChange={e => {
                  const min = e.target.value ? Number(e.target.value) : undefined;
                  const max = query.maxPrice;
                  if (min !== undefined && max !== undefined && min > max) {
                    setPriceError(t('filters.priceError'));
                    return;
                  }
                  setPriceError('');
                  setQuery(q => ({ ...q, minPrice: min, page: 1 }));
                }}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                {t('filters.maxPrice')}
              </label>
              <input
                type="number"
                placeholder="∞"
                min="0"
                className={`mt-1 w-full rounded-lg border bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none ${priceError ? 'border-red-500' : 'border-[var(--border)]'}`}
                onChange={e => {
                  const max = e.target.value ? Number(e.target.value) : undefined;
                  const min = query.minPrice;
                  if (min !== undefined && max !== undefined && min > max) {
                    setPriceError(t('filters.priceError'));
                    return;
                  }
                  setPriceError('');
                  setQuery(q => ({ ...q, maxPrice: max, page: 1 }));
                }}
              />
            </div>
            {priceError && <p className="col-span-2 text-xs text-red-500 mt-1">{priceError}</p>}
          </div>

          <div className="flex flex-col gap-2 justify-end">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="rounded"
                onChange={e =>
                  setQuery(q => ({ ...q, onSale: e.target.checked || undefined, page: 1 }))
                }
              />
              {t('filters.onSale')}
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="rounded"
                onChange={e =>
                  setQuery(q => ({ ...q, inStock: e.target.checked || undefined, page: 1 }))
                }
              />
              {t('filters.inStock')}
            </label>
          </div>

          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery({ page: 1, limit: 12, sort: 'newest' });
                setSearch('');
                setPriceError('');
              }}
            >
              {t('filters.clear')}
            </Button>
          </div>
        </div>
      )}

      {/* Sort */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-[var(--text-secondary)]">
          {data ? `${data.total} products` : ''}
        </span>
        <select
          value={query.sort ?? 'newest'}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5 text-sm focus:outline-none"
          onChange={e =>
            setQuery(q => ({
              ...q,
              sort: e.target.value as ProductsQuery['sort'],
              page: 1,
            }))
          }
        >
          <option value="newest">{t('sort.newest')}</option>
          <option value="priceAsc">{t('sort.priceAsc')}</option>
          <option value="priceDesc">{t('sort.priceDesc')}</option>
          <option value="rating">{t('sort.rating')}</option>
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : !data?.items.length ? (
        <div className="py-24 text-center text-[var(--text-secondary)]">{t('empty')}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.items.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlistedIds.has(product.id)}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={(query.page ?? 1) <= 1}
                onClick={() => setQuery(q => ({ ...q, page: (q.page ?? 1) - 1 }))}
              >
                ←
              </Button>
              <span className="text-sm text-[var(--text-secondary)]">
                {query.page ?? 1} / {data.pages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={(query.page ?? 1) >= data.pages}
                onClick={() => setQuery(q => ({ ...q, page: (q.page ?? 1) + 1 }))}
              >
                →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
