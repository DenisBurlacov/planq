import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, ArrowLeftRight } from 'lucide-react';
import { ProductCard } from '@components/features/ProductCard';
import { ProductCardList } from '@components/features/ProductCardList';
import { QuickViewModal } from '@components/features/QuickViewModal';
import { MobileFilterModal } from '@components/features/MobileFilterModal';
import { ProductCardSkeleton } from '@components/ui/Skeleton';
import { Breadcrumb } from '@components/ui/Breadcrumb';
import { Button } from '@components/ui/Button';
import { ViewToggle } from '@components/ui/ViewToggle';
import { CategoryBar } from '@components/features/CategoryBar';
import { SearchAutocomplete } from '@components/ui/SearchAutocomplete';
import { RangeSlider } from '@components/ui/RangeSlider';
import { InfiniteScroll } from '@components/ui/InfiniteScroll';
import { productsApi, type ProductsQuery } from '@api/products';
import { cartApi } from '@api/cart';
import { wishlistApi } from '@api/wishlist';
import { useCartStore } from '@store/cart.store';
import { useAuthStore } from '@store/auth.store';
import { useCompareStore } from '@store/compare.store';
import { useToast } from '@components/ui/Toast';
import { ApiException } from '@api/client';
import type { Product } from '@appTypes/api';

export function CatalogPage() {
  const { t } = useTranslation('catalog');
  const { accessToken } = useAuthStore();
  const { increment } = useCartStore();
  const compareStore = useCompareStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Read initial filters from URL query params
  const searchParams = new URLSearchParams(location.search);
  const initialQuery: ProductsQuery = {
    page: 1,
    limit: 12,
    categoryId: searchParams.get('categoryId') ?? undefined,
    onSale: searchParams.get('onSale') === 'true' || undefined,
    sort: (searchParams.get('sort') as ProductsQuery['sort']) ?? undefined,
  };

  const [query, setQuery] = useState<ProductsQuery>(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [priceError, setPriceError] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [scrollMode, setScrollMode] = useState<'pagination' | 'infinite'>('pagination');
  const [infiniteItems, setInfiniteItems] = useState<Product[]>([]);
  const [infinitePage, setInfinitePage] = useState(1);
  const [infiniteHasMore, setInfiniteHasMore] = useState(true);
  const [infiniteLoading, setInfiniteLoading] = useState(false);
  const infiniteQueryRef = useRef(query);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    try {
      return (localStorage.getItem('planq-view-mode') as 'grid' | 'list') ?? 'grid';
    } catch {
      return 'grid';
    }
  });
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const { data: wishlist } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistApi.get,
    enabled: !!accessToken,
  });

  // Sync filters from URL when navigating from category tiles
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catId = params.get('categoryId') ?? undefined;
    const onSale = params.get('onSale') === 'true' || undefined;
    const sort = (params.get('sort') as ProductsQuery['sort']) ?? undefined;
    setQuery(q => ({ ...q, categoryId: catId, onSale, sort: sort ?? q.sort, page: 1 }));
  }, [location.search]);

  useEffect(() => {
    if (wishlist) {
      setWishlistedIds(new Set(wishlist.map(w => w.productId)));
    }
  }, [wishlist]);

  // Persist view mode
  useEffect(() => {
    try {
      localStorage.setItem('planq-view-mode', viewMode);
    } catch {
      // ignore
    }
  }, [viewMode]);

  const { data, isLoading } = useQuery({
    queryKey: ['products', query],
    queryFn: () => productsApi.list(query),
    placeholderData: prev => prev,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.getCategories,
  });

  // Derive active category name (translated)
  const activeCategory = categories?.find(c => c.id === query.categoryId);
  const activeCategoryName = activeCategory
    ? t(`categories.${activeCategory.slug}`, { defaultValue: activeCategory.name })
    : undefined;

  // Build breadcrumb items
  const breadcrumbItems = [
    { label: t('common:nav.home'), to: '/' },
    { label: t('title'), to: activeCategoryName ? '/catalog' : undefined },
    ...(activeCategoryName ? [{ label: activeCategoryName }] : []),
  ];

  const handleSearch = (term: string) => {
    setQuery(q => ({ ...q, search: term, page: 1 }));
  };

  const handleAddToCart = async (product: Product, quantity = 1) => {
    if (!accessToken) {
      navigate('/login', { state: { from: location } });
      return;
    }
    try {
      await cartApi.add(product.id, quantity);
      increment(quantity);
      toast('success', t('product.addedToCartName', { name: product.name }));
    } catch (err) {
      toast('error', err instanceof ApiException ? err.message : t('product.failedAddToCart'));
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
      toast('error', t('product.failedUpdateWishlist'));
    }
  };

  const handleCategoryChange = (categoryId: string | undefined) => {
    setQuery(q => ({ ...q, categoryId, page: 1 }));
    // Sync URL
    const params = new URLSearchParams(location.search);
    if (categoryId) {
      params.set('categoryId', categoryId);
    } else {
      params.delete('categoryId');
    }
    navigate(`/catalog?${params.toString()}`, { replace: true });
  };

  // Infinite scroll: accumulate items when data changes
  useEffect(() => {
    if (scrollMode !== 'infinite' || !data) return;
    if (infinitePage === 1) {
      setInfiniteItems(data.items);
    } else {
      setInfiniteItems(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newItems = data.items.filter(p => !existingIds.has(p.id));
        return [...prev, ...newItems];
      });
    }
    setInfiniteHasMore(data.page < data.pages);
    setInfiniteLoading(false);
  }, [data, scrollMode, infinitePage]);

  // Reset infinite scroll when query filters change (not page)
  useEffect(() => {
    infiniteQueryRef.current = query;
    if (scrollMode === 'infinite') {
      setInfiniteItems([]);
      setInfinitePage(1);
      setInfiniteHasMore(true);
    }
  }, [
    query.categoryId,
    query.search,
    query.sort,
    query.minPrice,
    query.maxPrice,
    query.onSale,
    query.inStock,
    scrollMode,
  ]);

  const handleLoadMore = useCallback(() => {
    if (infiniteLoading || !infiniteHasMore) return;
    setInfiniteLoading(true);
    const nextPage = infinitePage + 1;
    setInfinitePage(nextPage);
    setQuery(q => ({ ...q, page: nextPage }));
  }, [infiniteLoading, infiniteHasMore, infinitePage]);

  const handleFilterToggle = () => {
    // On mobile, open modal; on desktop, toggle inline
    if (window.innerWidth < 768) {
      setMobileFilterOpen(true);
    } else {
      setShowFilters(!showFilters);
    }
  };

  const handleMobileFilterApply = (newQuery: ProductsQuery) => {
    setQuery(newQuery);
  };

  const compareCount = compareStore.productIds.length;

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {activeCategoryName ?? t('title')}
        </h1>
        <button
          data-testid="catalog-filter-toggle"
          onClick={handleFilterToggle}
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t('filters.title')}
        </button>
      </div>

      {/* Category Bar */}
      <CategoryBar
        categories={categories ?? []}
        activeCategoryId={query.categoryId}
        onCategoryChange={handleCategoryChange}
      />

      {/* Search */}
      <div className="mb-6">
        <SearchAutocomplete onSearch={handleSearch} data-testid="catalog-search" />
      </div>

      {/* Desktop Filters */}
      {showFilters && (
        <div
          data-testid="catalog-filter-panel"
          className="hidden md:grid mb-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="col-span-1">
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
              {t('rangeSlider.priceRange')}
            </label>
            <div className="mt-2">
              <RangeSlider
                min={0}
                max={10000}
                step={10}
                value={priceRange}
                onChange={([min, max]) => {
                  setPriceRange([min, max]);
                  setPriceError('');
                  setQuery(q => ({
                    ...q,
                    minPrice: min > 0 ? min : undefined,
                    maxPrice: max < 10000 ? max : undefined,
                    page: 1,
                  }));
                }}
                formatLabel={v => `\u20AC${v}`}
                data-testid="catalog-price-range"
              />
            </div>
            {priceError && <p className="text-xs text-red-500 mt-1">{priceError}</p>}
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
                setPriceError('');
                setPriceRange([0, 10000]);
              }}
            >
              {t('filters.clear')}
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Filter Modal */}
      <MobileFilterModal
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        categories={categories ?? []}
        query={query}
        onApply={handleMobileFilterApply}
        resultCount={data?.total}
      />

      {/* Sort + View Toggle */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-[var(--text-secondary)]">
          {data ? t('common:items', { count: data.total }) : ''}
        </span>
        <div className="flex items-center gap-3">
          <label
            data-testid="scroll-mode-toggle"
            className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer"
          >
            <input
              type="checkbox"
              checked={scrollMode === 'infinite'}
              onChange={e => {
                setScrollMode(e.target.checked ? 'infinite' : 'pagination');
                setInfiniteItems([]);
                setInfinitePage(1);
                setInfiniteHasMore(true);
              }}
              className="rounded"
            />
            {t('infiniteScroll.toggle')}
          </label>
          <ViewToggle value={viewMode} onChange={setViewMode} />
          <select
            value={query.sort ?? 'newest'}
            aria-label={t('sort.label')}
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
      </div>

      {/* Products */}
      {isLoading && infinitePage <= 1 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : !data?.items.length && infiniteItems.length === 0 ? (
        <div className="py-24 text-center text-[var(--text-secondary)]">{t('empty')}</div>
      ) : (
        <>
          {(() => {
            const displayItems = scrollMode === 'infinite' ? infiniteItems : (data?.items ?? []);
            return viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayItems.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWishlisted={wishlistedIds.has(product.id)}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {displayItems.map(product => (
                  <ProductCardList
                    key={product.id}
                    product={product}
                    isWishlisted={wishlistedIds.has(product.id)}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    onQuickView={setQuickViewProduct}
                    onAddToCompare={p => compareStore.addProduct(p.id)}
                  />
                ))}
              </div>
            );
          })()}

          {/* Pagination / Infinite Scroll */}
          {scrollMode === 'infinite' ? (
            <InfiniteScroll
              onLoadMore={handleLoadMore}
              hasMore={infiniteHasMore}
              loading={infiniteLoading}
              endElement={
                <p className="text-sm text-[var(--text-secondary)]">
                  {t('infiniteScroll.endOfResults')}
                </p>
              }
            />
          ) : (
            data &&
            data.pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={(query.page ?? 1) <= 1}
                  onClick={() => setQuery(q => ({ ...q, page: (q.page ?? 1) - 1 }))}
                >
                  {'\u2190'}
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
                  {'\u2192'}
                </Button>
              </div>
            )
          )}
        </>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        open={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Compare Floating Bar */}
      {compareCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-card)] border-t border-[var(--border)] shadow-lg px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {t('compare.productsToCompare', { count: compareCount })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => compareStore.clearAll()}>
                {t('compare.clearAll', { defaultValue: 'Clear All' })}
              </Button>
              <Link to="/compare">
                <Button size="sm">{t('compare.title', { defaultValue: 'Compare' })}</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
