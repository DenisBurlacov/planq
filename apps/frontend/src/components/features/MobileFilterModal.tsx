import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@components/ui/Button';
import type { Category } from '@appTypes/api';
import type { ProductsQuery } from '@api/products';

interface MobileFilterModalProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  query: ProductsQuery;
  onApply: (query: ProductsQuery) => void;
  resultCount?: number;
}

export function MobileFilterModal({
  open,
  onClose,
  categories,
  query,
  onApply,
  resultCount,
}: MobileFilterModalProps) {
  const { t } = useTranslation('catalog');
  const [localQuery, setLocalQuery] = useState<ProductsQuery>(query);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setLocalQuery(query);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, query]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleClear = () => {
    setLocalQuery({ page: 1, limit: 12 });
  };

  const handleApply = () => {
    onApply({ ...localQuery, page: 1 });
    onClose();
  };

  return (
    <div
      data-testid="mobile-filter-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Filters"
      ref={panelRef}
      className="fixed inset-0 z-50 bg-[var(--bg-page)] flex flex-col"
    >
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-card)]">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">{t('filters.title')}</h2>
        <button data-testid="mobile-filter-close" onClick={onClose}>
          <X className="h-5 w-5 text-[var(--text-secondary)]" />
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto flex-1 px-4 py-4 space-y-6">
        {/* Category */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-3 block">
            {t('filters.category')}
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="category"
                data-testid="mobile-filter-category-all"
                checked={!localQuery.categoryId}
                onChange={() => setLocalQuery(q => ({ ...q, categoryId: undefined }))}
              />
              {t('filters.allCategories')}
            </label>
            {categories.map(cat => (
              <label key={cat.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  data-testid={`mobile-filter-category-${cat.slug}`}
                  checked={localQuery.categoryId === cat.id}
                  onChange={() => setLocalQuery(q => ({ ...q, categoryId: cat.id }))}
                />
                {t(`categories.${cat.slug}`, { defaultValue: cat.name })}
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-3 block">
            {t('filters.price')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              data-testid="mobile-filter-min-price"
              type="number"
              placeholder={t('filters.minPrice')}
              min="0"
              value={localQuery.minPrice ?? ''}
              onChange={e =>
                setLocalQuery(q => ({
                  ...q,
                  minPrice: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              data-testid="mobile-filter-max-price"
              type="number"
              placeholder={t('filters.maxPrice')}
              min="0"
              value={localQuery.maxPrice ?? ''}
              onChange={e =>
                setLocalQuery(q => ({
                  ...q,
                  maxPrice: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-3 block">
            {t('filters.title')}
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                data-testid="mobile-filter-on-sale"
                checked={!!localQuery.onSale}
                onChange={e =>
                  setLocalQuery(q => ({ ...q, onSale: e.target.checked || undefined }))
                }
                className="rounded"
              />
              {t('filters.onSale')}
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                data-testid="mobile-filter-in-stock"
                checked={!!localQuery.inStock}
                onChange={e =>
                  setLocalQuery(q => ({ ...q, inStock: e.target.checked || undefined }))
                }
                className="rounded"
              />
              {t('filters.inStock')}
            </label>
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-3 block">
            {t('sort.label')}
          </label>
          <div className="space-y-2">
            {(['newest', 'priceAsc', 'priceDesc', 'rating'] as const).map(sortVal => (
              <label key={sortVal} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="sort"
                  data-testid={`mobile-filter-sort-${sortVal}`}
                  checked={localQuery.sort === sortVal}
                  onChange={() => setLocalQuery(q => ({ ...q, sort: sortVal }))}
                />
                {t(`sort.${sortVal}`)}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 flex gap-3 px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-card)]">
        <Button
          data-testid="mobile-filter-clear"
          variant="ghost"
          className="flex-1"
          onClick={handleClear}
        >
          {t('filters.clear')}
        </Button>
        <Button
          data-testid="mobile-filter-apply"
          variant="primary"
          className="flex-1"
          onClick={handleApply}
        >
          {resultCount !== undefined
            ? `${t('filters.title')} (${resultCount})`
            : t('filters.title')}
        </Button>
      </div>
    </div>
  );
}
