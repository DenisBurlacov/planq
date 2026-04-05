import { formatPrice, calculateDiscountPercent } from '@utils/pricing';

interface PriceDisplayProps {
  price: number;
  salePrice?: number | null;
  size?: 'sm' | 'md' | 'lg';
  showDiscount?: boolean;
  showSave?: boolean;
  'data-testid'?: string;
}

const sizeStyles = {
  sm: {
    current: 'text-sm font-bold text-[var(--text-primary)]',
    original: 'text-xs text-[var(--text-secondary)] line-through',
    badge: 'text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 rounded px-1.5 py-0.5',
    save: 'text-xs text-[var(--text-secondary)]',
  },
  md: {
    current: 'text-base font-bold text-[var(--text-primary)]',
    original: 'text-sm text-[var(--text-secondary)] line-through',
    badge: 'text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 rounded px-1.5 py-0.5',
    save: 'text-xs text-[var(--text-secondary)]',
  },
  lg: {
    current: 'text-3xl font-bold text-[var(--text-primary)]',
    original: 'text-lg text-[var(--text-secondary)] line-through',
    badge: 'text-sm font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 rounded px-1.5 py-0.5',
    save: 'text-sm font-medium text-red-500',
  },
};

export function PriceDisplay({
  price,
  salePrice,
  size = 'md',
  showDiscount = false,
  showSave = false,
  'data-testid': testId,
}: PriceDisplayProps) {
  const isOnSale = salePrice !== null && salePrice !== undefined;
  const displayPrice = isOnSale ? salePrice : price;
  const styles = sizeStyles[size];

  return (
    <div data-testid={testId}>
      <div className="flex items-baseline gap-2">
        <span className={styles.current}>{formatPrice(displayPrice)}</span>
        {isOnSale && <span className={styles.original}>{formatPrice(price)}</span>}
      </div>
      {isOnSale && (showDiscount || showSave) && (
        <div className="mt-1 flex items-center gap-2">
          {showDiscount && (
            <span
              data-testid={testId ? `${testId}-discount-percent` : undefined}
              className={styles.badge}
            >
              -{calculateDiscountPercent(price, salePrice)}%
            </span>
          )}
          {showSave && <span className={styles.save}>Save {formatPrice(price - salePrice)}</span>}
        </div>
      )}
    </div>
  );
}
