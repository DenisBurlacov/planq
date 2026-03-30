import { Minus, Plus, ShoppingCart, X, ImageOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from './Button';
import type { Product } from '@appTypes/api';

interface AddToCartModalProps {
  product: Product;
  open: boolean;
  loading?: boolean;
  onConfirm: (quantity: number) => void;
  onCancel: () => void;
}

export function AddToCartModal({
  product,
  open,
  loading = false,
  onConfirm,
  onCancel,
}: AddToCartModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!open) return null;

  const unitPrice = product.salePrice ?? product.price;
  const isOnSale = product.salePrice !== null;
  const total = unitPrice * quantity;
  const maxQty = Math.min(product.stock, 99);

  const dec = () => setQuantity(q => Math.max(1, q - 1));
  const inc = () => setQuantity(q => Math.min(maxQty, q + 1));

  const handleConfirm = () => {
    onConfirm(quantity);
    setQuantity(1);
  };

  const handleCancel = () => {
    setQuantity(1);
    onCancel();
  };

  return (
    <div
      data-testid="add-to-cart-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleCancel}
    >
      <div
        data-testid="add-to-cart-modal"
        className="relative w-full max-w-sm rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          data-testid="add-to-cart-modal-close"
          onClick={handleCancel}
          className="absolute top-3 right-3 z-10 p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Image */}
        <div className="h-44 bg-[var(--bg-sidebar)] overflow-hidden">
          {product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageOff className="h-12 w-12 text-[var(--text-secondary)]" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3
            data-testid="add-to-cart-modal-name"
            className="text-base font-semibold text-[var(--text-primary)] mb-1 pr-6 line-clamp-2"
          >
            {product.name}
          </h3>

          {/* Unit price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-sm text-[var(--text-secondary)]">
              €{unitPrice.toFixed(2)} / шт.
            </span>
            {isOnSale && (
              <span className="text-xs text-[var(--text-secondary)] line-through">
                €{product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Quantity selector */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm font-medium text-[var(--text-primary)]">Quantity</span>
            <div className="flex items-center gap-2">
              <button
                data-testid="modal-quantity-minus"
                onClick={dec}
                disabled={quantity <= 1}
                className="h-8 w-8 rounded-lg border border-[var(--border)] bg-[var(--bg-sidebar)] flex items-center justify-center text-[var(--text-primary)] disabled:opacity-40 hover:bg-[var(--border)] transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span
                data-testid="modal-quantity-value"
                className="w-8 text-center text-base font-semibold text-[var(--text-primary)]"
              >
                {quantity}
              </span>
              <button
                data-testid="modal-quantity-plus"
                onClick={inc}
                disabled={quantity >= maxQty}
                className="h-8 w-8 rounded-lg border border-[var(--border)] bg-[var(--bg-sidebar)] flex items-center justify-center text-[var(--text-primary)] disabled:opacity-40 hover:bg-[var(--border)] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-3 border-t border-[var(--border)] mb-4">
            <span className="text-sm text-[var(--text-secondary)]">Total</span>
            <span
              data-testid="modal-total-price"
              className="text-xl font-bold text-[var(--text-primary)]"
            >
              €{total.toFixed(2)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              data-testid="modal-cancel-button"
              variant="secondary"
              className="flex-1"
              onClick={handleCancel}
            >
              No, thanks
            </Button>
            <Button
              data-testid="modal-confirm-add"
              className="flex-1"
              loading={loading}
              onClick={handleConfirm}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
