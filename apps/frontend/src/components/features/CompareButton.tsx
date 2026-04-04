import { ArrowLeftRight } from 'lucide-react';
import { useCompareStore } from '@store/compare.store';
import type { Product } from '@appTypes/api';

interface CompareButtonProps {
  product: Product;
  className?: string;
}

export function CompareButton({ product, className = '' }: CompareButtonProps) {
  const { addProduct, removeProduct, hasProduct, productIds } = useCompareStore();
  const isInCompare = hasProduct(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCompare) {
      removeProduct(product.id);
    } else {
      if (productIds.length >= 4) return;
      addProduct(product.id);
    }
  };

  return (
    <button
      data-testid="compare-button"
      onClick={handleClick}
      aria-label={isInCompare ? 'Remove from compare' : 'Add to compare'}
      className={`p-1.5 rounded-full bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/70 transition-colors ${className}`}
    >
      <ArrowLeftRight
        className={`h-4 w-4 transition-colors ${
          isInCompare ? 'text-accent' : 'text-[var(--text-secondary)]'
        }`}
      />
    </button>
  );
}
