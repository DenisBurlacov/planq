import { useTranslation } from 'react-i18next';

interface StockUrgencyBadgeProps {
  stock: number;
  showAll?: boolean;
}

export function StockUrgencyBadge({ stock, showAll = false }: StockUrgencyBadgeProps) {
  const { t } = useTranslation('catalog');

  if (stock <= 0) {
    return (
      <span
        data-testid="stock-urgency"
        className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      >
        {t('product.outOfStock')}
      </span>
    );
  }

  if (stock <= 2) {
    return (
      <span
        data-testid="stock-urgency"
        className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse"
      >
        {t('product.almostGone')}
      </span>
    );
  }

  if (stock <= 5) {
    return (
      <span
        data-testid="stock-urgency"
        className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
      >
        {t('product.onlyXLeft', { count: stock })}
      </span>
    );
  }

  if (showAll) {
    return (
      <span
        data-testid="stock-urgency"
        className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      >
        {t('product.inStock', { defaultValue: 'In Stock' })}
      </span>
    );
  }

  return null;
}
