import { useTranslation } from 'react-i18next';

interface StockUrgencyBadgeProps {
  stock: number;
}

export function StockUrgencyBadge({ stock }: StockUrgencyBadgeProps) {
  const { t } = useTranslation('catalog');

  if (stock <= 0 || stock > 5) return null;

  const isAlmostGone = stock <= 2;

  return (
    <span
      data-testid="stock-urgency"
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${
        isAlmostGone
          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
          : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      }`}
    >
      {isAlmostGone ? t('product.almostGone') : t('product.onlyXLeft', { count: stock })}
    </span>
  );
}
