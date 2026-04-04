import { useState, useEffect, useRef, useId } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Star, ArrowRight, Minus, Plus } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import type { Product } from '@appTypes/api';

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => Promise<void>;
}

export function QuickViewModal({ product, open, onClose, onAddToCart }: QuickViewModalProps) {
  const { t } = useTranslation('catalog');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setQuantity(1);
      const panel = panelRef.current;
      if (panel) {
        const first = panel.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        first?.focus();
      }
    }
    return () => {
      if (!open) previousFocusRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Focus trap
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  if (!open || !product) return null;

  const price = product.salePrice ?? product.price;
  const isOnSale = product.salePrice !== null;
  const isOutOfStock = product.stock === 0;
  const discountPercent =
    isOnSale && product.salePrice !== null
      ? Math.round((1 - product.salePrice / product.price) * 100)
      : 0;

  const handleAddToCart = async () => {
    setAdding(true);
    await onAddToCart(product, quantity);
    setAdding(false);
  };

  return (
    <div
      data-testid="quick-view-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={panelRef}
        className="w-full max-w-2xl mx-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Image */}
          <div
            data-testid="quick-view-image"
            className="rounded-xl h-48 sm:h-full overflow-hidden bg-[var(--bg-sidebar)]"
          >
            {product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[var(--text-secondary)]">
                No image
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h2
              id={titleId}
              data-testid="quick-view-name"
              className="text-lg font-bold text-[var(--text-primary)]"
            >
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-[var(--border)]'}`}
                />
              ))}
              <span className="text-xs text-[var(--text-secondary)] ml-1">
                ({product.rating.toFixed(1)}) - {product.reviewCount}{' '}
                {t('product.reviews', { count: product.reviewCount })}
              </span>
            </div>

            {/* Price */}
            <div data-testid="quick-view-price" className="flex items-baseline gap-2 mt-3">
              <span className="text-xl font-bold text-[var(--text-primary)]">
                €{price.toFixed(2)}
              </span>
              {isOnSale && (
                <>
                  <span className="text-sm text-[var(--text-secondary)] line-through">
                    €{product.price.toFixed(2)}
                  </span>
                  <Badge variant="sale">-{discountPercent}%</Badge>
                </>
              )}
            </div>

            {/* Description */}
            <p
              data-testid="quick-view-description"
              className="text-sm text-[var(--text-secondary)] line-clamp-3 mt-3"
            >
              {product.description}
            </p>

            {/* Specs summary */}
            <div data-testid="quick-view-specs" className="flex flex-wrap gap-2 mt-3">
              {product.category && (
                <span className="text-xs bg-[var(--bg-sidebar)] rounded-full px-3 py-1">
                  {product.category.name}
                </span>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-3 mt-4">
              <button
                data-testid="quick-view-qty-minus"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-[var(--border)] hover:bg-[var(--bg-sidebar)]"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                data-testid="quick-view-qty-input"
                type="number"
                value={quantity}
                onChange={e => {
                  const v = parseInt(e.target.value);
                  if (!isNaN(v) && v >= 1) setQuantity(v);
                }}
                className="w-12 h-9 text-center rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-sm"
                min="1"
              />
              <button
                data-testid="quick-view-qty-plus"
                onClick={() => setQuantity(q => q + 1)}
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-[var(--border)] hover:bg-[var(--bg-sidebar)]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Add to Cart */}
            <Button
              data-testid="quick-view-add-to-cart"
              className="mt-3 w-full"
              onClick={handleAddToCart}
              loading={adding}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? t('product.outOfStock') : t('product.addToCart')}
            </Button>

            {/* View full details */}
            <Link
              data-testid="quick-view-full-link"
              to={`/catalog/${product.id}`}
              onClick={onClose}
              className="inline-flex items-center gap-1 text-sm text-accent hover:underline mt-3"
            >
              {t('product.viewFullDetails', { defaultValue: 'View Full Details' })}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
