import { useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON, ALL_CATEGORY_ICON } from '@constants/categoryIcons';
import type { Category } from '@appTypes/api';

interface CategoryBarProps {
  categories: Category[];
  activeCategoryId: string | undefined;
  onCategoryChange: (categoryId: string | undefined) => void;
}

export function CategoryBar({ categories, activeCategoryId, onCategoryChange }: CategoryBarProps) {
  const { t } = useTranslation('catalog');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

    const container = containerRef.current;
    if (!container) return;

    const pills = Array.from(container.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const currentIndex = pills.findIndex(pill => pill === document.activeElement);
    if (currentIndex === -1) return;

    e.preventDefault();
    let nextIndex: number;
    if (e.key === 'ArrowRight') {
      nextIndex = currentIndex + 1 >= pills.length ? 0 : currentIndex + 1;
    } else {
      nextIndex = currentIndex - 1 < 0 ? pills.length - 1 : currentIndex - 1;
    }
    pills[nextIndex].focus();
  }, []);

  // Loading state
  if (!categories) {
    return (
      <div data-testid="category-bar" className="mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              data-testid="category-pill-skeleton"
              className="shrink-0 rounded-full w-24 h-9 bg-[var(--bg-sidebar)] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (categories.length === 0) {
    return null;
  }

  const isAllActive = activeCategoryId === undefined;
  const AllIcon = ALL_CATEGORY_ICON;

  const pillBase =
    'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium border transition-colors cursor-pointer shrink-0';
  const pillInactive =
    'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-accent/40 hover:text-[var(--text-primary)] hover:bg-accent/5';
  const pillActive = 'bg-accent text-white border-accent font-semibold hover:bg-accent';

  return (
    <div data-testid="category-bar" className="mb-4">
      <div
        ref={containerRef}
        role="tablist"
        aria-label="Category filter"
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        onKeyDown={handleKeyDown}
      >
        {/* "All" pill */}
        <button
          role="tab"
          aria-selected={isAllActive}
          tabIndex={isAllActive ? 0 : -1}
          data-testid="category-pill-all"
          className={`${pillBase} ${isAllActive ? pillActive : pillInactive}`}
          onClick={() => {
            if (!isAllActive) onCategoryChange(undefined);
          }}
        >
          <AllIcon className="h-4 w-4" />
          {t('allCategories')}
        </button>

        {/* Category pills */}
        {categories.map(cat => {
          const isActive = activeCategoryId === cat.id;
          const Icon = CATEGORY_ICONS[cat.slug] ?? DEFAULT_CATEGORY_ICON;
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              data-testid={`category-pill-${cat.slug}`}
              className={`${pillBase} ${isActive ? pillActive : pillInactive}`}
              onClick={() => {
                if (!isActive) onCategoryChange(cat.id);
              }}
            >
              <Icon className="h-4 w-4" />
              {t(`categories.${cat.slug}`, { defaultValue: cat.name })}
            </button>
          );
        })}
      </div>
    </div>
  );
}
