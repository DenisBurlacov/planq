import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, ArrowLeftRight, X } from 'lucide-react';
import { ProductCard } from '@components/features/ProductCard';
import { ProductCardList } from '@components/features/ProductCardList';
import { QuickViewModal } from '@components/features/QuickViewModal';
import { MobileFilterModal } from '@components/features/MobileFilterModal';
import { ProductCardSkeleton } from '@components/ui/Skeleton';
import { Breadcrumb } from '@components/ui/Breadcrumb';
import { Button } from '@components/ui/Button';
import { ViewToggle, type ViewMode } from '@components/ui/ViewToggle';
import { CategoryBar } from '@components/features/CategoryBar';
import { useDebounce } from '@hooks/useDebounce';
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
  const debouncedQuery = useDebounce(query, 300);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [priceError, setPriceError] = useState('');
  const [localMinPrice, setLocalMinPrice] = useState<string>('');
  const [localMaxPrice, setLocalMaxPrice] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      return (localStorage.getItem('planq-view-mode') as ViewMode) ?? 'grid';
    } catch {
      return 'grid';
    }
  });
  const [loadMoreItems, setLoadMoreItems] = useState<Product[]>([]);
  const [loadMorePage, setLoadMorePage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
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
    queryKey: ['products', debouncedQuery],
    queryFn: () => productsApi.list(debouncedQuery),
    placeholderData: prev => prev,
  });

  // Reset load more state when query changes
  useEffect(() => {
    setLoadMoreItems([]);
    setLoadMorePage(1);
  }, [
    query.categoryId,
    query.search,
    query.minPrice,
    query.maxPrice,
    query.onSale,
    query.inStock,
    query.sort,
    query.material,
    query.color,
    query.style,
  ]);

  // Accumulate items in load-more mode
  useEffect(() => {
    if (viewMode === 'loadMore' && data?.items) {
      if (loadMorePage === 1) {
        setLoadMoreItems(data.items);
      }
    }
  }, [viewMode, data?.items, loadMorePage]);

  const handleLoadMore = async () => {
    if (!data || loadingMore) return;
    const nextPage = loadMorePage + 1;
    setLoadingMore(true);
    try {
      const result = await productsApi.list({ ...query, page: nextPage });
      setLoadMoreItems(prev => [...prev, ...result.items]);
      setLoadMorePage(nextPage);
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  };

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(q => ({ ...q, search, page: 1 }));
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
  const qc = useQueryClient();

  // Pull-to-refresh state (mobile only)
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const pullStartY = useRef(0);
  const isPulling = useRef(false);

  const handlePullStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      pullStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const handlePullMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPulling.current || refreshing) return;
      const delta = e.touches[0].clientY - pullStartY.current;
      if (delta > 0 && window.scrollY === 0) {
        setPullDistance(Math.min(delta * 0.4, 80));
      }
    },
    [refreshing]
  );

  const handlePullEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;
    if (pullDistance > 50) {
      setRefreshing(true);
      await qc.invalidateQueries({ queryKey: ['products'] });
      setRefreshing(false);
    }
    setPullDistance(0);
  }, [pullDistance, qc]);

  return (
    <div onTouchStart={handlePullStart} onTouchMove={handlePullMove} onTouchEnd={handlePullEnd}>
      {/* Pull-to-refresh indicator (mobile) */}
      {(pullDistance > 0 || refreshing) && (
        <div
          data-testid="pull-to-refresh-indicator"
          className="flex items-center justify-center py-2 md:hidden"
          style={{ height: pullDistance || (refreshing ? 40 : 0) }}
        >
          {refreshing ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
          ) : (
            <p className="text-xs text-[var(--text-secondary)]">
              {pullDistance > 50
                ? t('common:pullToRefresh.release')
                : t('common:pullToRefresh.pulling')}
            </p>
          )}
        </div>
      )}
      <Breadcrumb items={breadcrumbItems} />
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
        {activeCategoryName ?? t('title')}
      </h1>

      {/* Category Bar */}
      <CategoryBar
        categories={categories ?? []}
        activeCategoryId={query.categoryId}
        onCategoryChange={handleCategoryChange}
      />

      {/* Search + Filters toggle */}
      <form
        onSubmit={handleSearch}
        data-testid="catalog-search-form"
        className="mb-6 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('search')}
            aria-label={t('search')}
            data-testid="catalog-search-input"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {search.length > 0 && (
            <button
              type="button"
              data-testid="search-clear-button"
              aria-label={t('common:actions.clear')}
              onClick={() => {
                setSearch('');
                if (query.search) {
                  setQuery(q => ({ ...q, search: undefined, page: 1 }));
                }
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" variant="secondary">
          {t('common:actions.submit', { ns: 'common' })}
        </Button>
        <button
          type="button"
          data-testid="catalog-filter-toggle"
          onClick={handleFilterToggle}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-accent/40 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">{t('filters.title')}</span>
        </button>
      </form>

      {/* Desktop Filters */}
      {showFilters && (
        <div
          data-testid="catalog-filter-panel"
          className="hidden md:block mb-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3"
        >
          {/* Header: Filters + Clear */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {t('filters.title')}
            </span>
            <Button
              data-testid="catalog-clear-filters"
              variant="secondary"
              size="sm"
              onClick={() => {
                setQuery({ page: 1, limit: 12, sort: 'newest' });
                setSearch('');
                setPriceError('');
                setLocalMinPrice('');
                setLocalMaxPrice('');
              }}
            >
              {t('filters.clear')}
            </Button>
          </div>

          {/* Row 1: Material + Style (same pill style, side by side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {/* Material pills */}
            <div>
              <label className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wide block mb-1">
                {t('filters.material')}
              </label>
              <div className="flex flex-wrap gap-1">
                {(['wood', 'metal', 'fabric', 'glass', 'leather', 'plastic'] as const).map(mat => {
                  const isActive = query.material?.includes(mat);
                  return (
                    <button
                      key={mat}
                      type="button"
                      data-testid={`filter-material-${mat}`}
                      onClick={() =>
                        setQuery(q => ({
                          ...q,
                          material: isActive
                            ? (q.material ?? []).filter(m => m !== mat)
                            : [...(q.material ?? []), mat],
                          page: 1,
                        }))
                      }
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-accent text-white'
                          : 'bg-[var(--bg-sidebar)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-accent/40'
                      }`}
                    >
                      {t(`filters.materialOptions.${mat}`)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Style pills */}
            <div>
              <label className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wide block mb-1">
                {t('filters.style')}
              </label>
              <div className="flex flex-wrap gap-1">
                {(['scandinavian', 'modern', 'industrial', 'minimalist', 'classic'] as const).map(
                  sty => {
                    const isActive = query.style?.includes(sty);
                    return (
                      <button
                        key={sty}
                        type="button"
                        data-testid={`filter-style-${sty}`}
                        onClick={() =>
                          setQuery(q => ({
                            ...q,
                            style: isActive
                              ? (q.style ?? []).filter(s => s !== sty)
                              : [...(q.style ?? []), sty],
                            page: 1,
                          }))
                        }
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-accent text-white'
                            : 'bg-[var(--bg-sidebar)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-accent/40'
                        }`}
                      >
                        {t(`filters.styleOptions.${sty}`)}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Price + Color + On Sale + In Stock */}
          <div className="flex flex-wrap items-end gap-4">
            {/* Price range */}
            <div>
              <label className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wide block mb-1">
                {t('filters.price')}
              </label>
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)] pointer-events-none">
                    {t('common:currency')}
                  </span>
                  <input
                    id="filter-min-price"
                    data-testid="filter-min-price"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={localMinPrice}
                    className={`w-[90px] rounded-md border bg-[var(--bg-card)] pl-6 pr-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${priceError ? 'border-red-500' : 'border-[var(--border)]'}`}
                    onChange={e => {
                      const raw = e.target.value;
                      setLocalMinPrice(raw);
                      const min = raw ? Number(raw) : undefined;
                      const max = query.maxPrice;
                      if (min !== undefined && max !== undefined && min > max) {
                        setPriceError(t('filters.priceError'));
                      } else {
                        setPriceError('');
                      }
                      setQuery(q => ({ ...q, minPrice: min, page: 1 }));
                    }}
                  />
                </div>
                <span className="text-xs text-[var(--text-secondary)]">&ndash;</span>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)] pointer-events-none">
                    {t('common:currency')}
                  </span>
                  <input
                    id="filter-max-price"
                    data-testid="filter-max-price"
                    type="number"
                    placeholder="∞"
                    min="0"
                    value={localMaxPrice}
                    className={`w-[90px] rounded-md border bg-[var(--bg-card)] pl-6 pr-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${priceError ? 'border-red-500' : 'border-[var(--border)]'}`}
                    onChange={e => {
                      const raw = e.target.value;
                      setLocalMaxPrice(raw);
                      const max = raw ? Number(raw) : undefined;
                      const min = query.minPrice;
                      if (min !== undefined && max !== undefined && min > max) {
                        setPriceError(t('filters.priceError'));
                      } else {
                        setPriceError('');
                      }
                      setQuery(q => ({ ...q, maxPrice: max, page: 1 }));
                    }}
                  />
                </div>
              </div>
              {priceError && <p className="text-xs text-red-500 mt-1">{priceError}</p>}
            </div>

            {/* Color swatches */}
            <div>
              <label className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wide block mb-1">
                {t('filters.color')}
              </label>
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    { key: 'natural', hex: '#d4a574' },
                    { key: 'white', hex: '#f5f5f5' },
                    { key: 'black', hex: '#222222' },
                    { key: 'walnut', hex: '#5c4033' },
                    { key: 'gray', hex: '#9ca3af' },
                    { key: 'blue', hex: '#3b82f6' },
                  ] as const
                ).map(({ key, hex }) => {
                  const isActive = query.color?.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      data-testid={`filter-color-${key}`}
                      onClick={() =>
                        setQuery(q => ({
                          ...q,
                          color: isActive
                            ? (q.color ?? []).filter(c => c !== key)
                            : [...(q.color ?? []), key],
                          page: 1,
                        }))
                      }
                      className={`h-6 w-6 rounded-full border-2 transition-all ${
                        isActive
                          ? 'border-accent ring-2 ring-accent/30'
                          : 'border-[var(--border)] hover:border-accent/50'
                      }`}
                      style={{ backgroundColor: hex }}
                      aria-label={t(`filters.colorOptions.${key}`)}
                      title={t(`filters.colorOptions.${key}`)}
                    />
                  );
                })}
              </div>
            </div>

            {/* On Sale checkbox */}
            <label className="flex items-center gap-1.5 text-sm cursor-pointer text-[var(--text-primary)] pb-0.5">
              <input
                type="checkbox"
                data-testid="filter-on-sale"
                className="rounded"
                checked={!!query.onSale}
                onChange={e =>
                  setQuery(q => ({ ...q, onSale: e.target.checked || undefined, page: 1 }))
                }
              />
              {t('filters.onSale')}
            </label>

            {/* In Stock checkbox */}
            <label className="flex items-center gap-1.5 text-sm cursor-pointer text-[var(--text-primary)] pb-0.5">
              <input
                type="checkbox"
                data-testid="filter-in-stock"
                className="rounded"
                checked={!!query.inStock}
                onChange={e =>
                  setQuery(q => ({ ...q, inStock: e.target.checked || undefined, page: 1 }))
                }
              />
              {t('filters.inStock')}
            </label>
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

      {/* View Toggle + Sort */}
      <div className="mb-4 flex items-center justify-between">
        <ViewToggle value={viewMode} onChange={setViewMode} />
        <select
          value={query.sort ?? 'newest'}
          aria-label={t('sort.label')}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5 text-sm focus:outline-none h-9"
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

      {/* Products */}
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
          {(() => {
            const displayItems =
              viewMode === 'loadMore'
                ? loadMoreItems.length > 0
                  ? loadMoreItems
                  : data.items
                : data.items;

            return viewMode === 'list' ? (
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
            ) : (
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
            );
          })()}

          {/* Load More button */}
          {viewMode === 'loadMore' && data.pages > 1 && loadMorePage < data.pages && (
            <div className="mt-8 flex items-center justify-center">
              <Button
                data-testid="catalog-load-more"
                variant="secondary"
                onClick={handleLoadMore}
                loading={loadingMore}
              >
                {t('common:catalog.loadMore', { ns: 'common' })}
              </Button>
            </div>
          )}

          {/* Pagination (grid/list modes only) */}
          {viewMode !== 'loadMore' && data.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={(query.page ?? 1) <= 1}
                onClick={() => setQuery(q => ({ ...q, page: (q.page ?? 1) - 1 }))}
              >
                &larr;
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
                &rarr;
              </Button>
            </div>
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
