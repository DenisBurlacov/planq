import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '@constants/categoryIcons';
import type { Category } from '@appTypes/api';
import { useEffect, useRef, useCallback } from 'react';

interface MegaMenuProps {
  categories: Category[];
  open: boolean;
  onClose: () => void;
}

export function MegaMenu({ categories, open, onClose }: MegaMenuProps) {
  const { t } = useTranslation('catalog');
  const menuRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = itemsRef.current.filter(Boolean) as HTMLElement[];
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight': {
          e.preventDefault();
          const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          items[next]?.focus();
          break;
        }
        case 'ArrowUp':
        case 'ArrowLeft': {
          e.preventDefault();
          const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          items[prev]?.focus();
          break;
        }
        case 'Escape':
          onClose();
          break;
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handler);
    }, 0);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousedown', handler);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      data-testid="mega-menu"
      role="menu"
      className="absolute left-0 right-0 top-full border-b border-[var(--border)] bg-[var(--bg-card)] shadow-lg z-50"
      onKeyDown={handleKeyDown}
    >
      <div className="grid grid-cols-5 gap-3 p-6 max-w-7xl mx-auto">
        {categories.map((cat, i) => {
          const Icon = CATEGORY_ICONS[cat.slug] ?? DEFAULT_CATEGORY_ICON;
          return (
            <Link
              key={cat.id}
              ref={el => {
                itemsRef.current[i] = el;
              }}
              role="menuitem"
              data-testid={`mega-menu-item-${cat.slug}`}
              to={`/catalog?categoryId=${cat.id}`}
              onClick={onClose}
              className="flex flex-col items-center gap-2 rounded-lg p-3 text-center hover:bg-[var(--bg-sidebar)] transition-colors"
            >
              <Icon className="h-6 w-6 text-accent" />
              <span className="text-sm text-[var(--text-primary)]">
                {t(`categories.${cat.slug}`, { defaultValue: cat.name })}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="px-6 pb-4 max-w-7xl mx-auto flex justify-end">
        <Link
          data-testid="mega-menu-view-all"
          to="/catalog"
          onClick={onClose}
          className="text-sm text-accent hover:underline"
        >
          {t('home.allCategories', { defaultValue: 'View all categories' })} →
        </Link>
      </div>
    </div>
  );
}
