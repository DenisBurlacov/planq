import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, ImageOff, Eye, ArrowLeftRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { AddToCartModal } from '@components/ui/AddToCartModal';
import { useProductName, useProductDescription } from '@hooks/useProductLocale';
import type { Product } from '@appTypes/api';

interface ProductCardListProps {
  product: Product;
  isWishlisted?: boolean;
  onAddToCart?: (product: Product, quantity: number) => Promise<void>;
  onToggleWishlist?: (productId: string) => void;
  onQuickView?: (product: Product) => void;
  onAddToCompare?: (product: Product) => void;
}

export function ProductCardList({
  product,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  onAddToCompare,
}: ProductCardListProps) {
  const { t } = useTranslation('catalog');
  const [modalOpen, setModalOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [imgError, setImgError] = useState(false);
  const localizedName = useProductName(product);
  const localizedDescription = useProductDescription(product);

  const hasImage = product.images.length > 0 && !imgError;
  const price = product.salePrice ?? product.price;
  const isOnSale = product.salePrice !== null;
  const isOutOfStock = product.stock === 0;
  const discountPercent =
    isOnSale && product.salePrice !== null
      ? Math.round((1 - product.salePrice / product.price) * 100)
      : 0;

  const handleModalConfirm = async (quantity: number) => {
    if (!onAddToCart) return;
    setAddingToCart(true);
    await onAddToCart(product, quantity);
    setAddingToCart(false);
    setModalOpen(false);
  };

  return (
    <>
      <AddToCartModal
        product={product}
        open={modalOpen}
        loading={addingToCart}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalOpen(false)}
      />
      <Link
        to={`/catalog/${product.id}`}
        data-testid="product-card-list"
        className="flex flex-col sm:flex-row rounded-xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden hover:shadow-lg transition-all block"
      >
        {/* Image */}
        <div className="shrink-0 w-full sm:w-48 h-40 sm:h-36 relative">
          {hasImage ? (
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover bg-[var(--bg-sidebar)]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--bg-sidebar)]">
              <ImageOff className="h-10 w-10 text-[var(--text-secondary)]" />
            </div>
          )}
          {isOnSale && (
            <div className="absolute top-2 left-2">
              <Badge variant="sale">{t('common:sale', { ns: 'common' })}</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-medium text-[var(--text-primary)] line-clamp-2">
              {localizedName}
            </h3>
            <div className="mt-1 flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-[var(--text-secondary)]">
                {product.rating.toFixed(1)} ({product.reviewCount})
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1">
              {localizedDescription}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Button
              size="sm"
              disabled={isOutOfStock}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                if (onAddToCart) setModalOpen(true);
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              {t('product.addToCart')}
            </Button>
            {onToggleWishlist && (
              <button
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleWishlist(product.id);
                }}
                className="p-1.5 rounded-full hover:bg-[var(--bg-sidebar)]"
                aria-label={
                  isWishlisted ? t('product.removeFromWishlist') : t('product.addToWishlist')
                }
              >
                <Heart
                  className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-[var(--text-secondary)]'}`}
                />
              </button>
            )}
            {onAddToCompare && (
              <button
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddToCompare(product);
                }}
                className="p-1.5 rounded-full hover:bg-[var(--bg-sidebar)]"
                aria-label="Add to compare"
              >
                <ArrowLeftRight className="h-4 w-4 text-[var(--text-secondary)]" />
              </button>
            )}
            {onQuickView && (
              <button
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickView(product);
                }}
                className="p-1.5 rounded-full hover:bg-[var(--bg-sidebar)]"
                aria-label={t('product.quickView')}
              >
                <Eye className="h-4 w-4 text-[var(--text-secondary)]" />
              </button>
            )}
          </div>
        </div>

        {/* Right price column */}
        <div className="hidden sm:flex shrink-0 p-4 text-right flex-col justify-between">
          <div>
            <span className="text-base font-bold text-[var(--text-primary)]">
              €{price.toFixed(2)}
            </span>
            {isOnSale && (
              <>
                <p className="text-sm text-[var(--text-secondary)] line-through">
                  €{product.price.toFixed(2)}
                </p>
                <p className="text-xs font-semibold text-red-500">-{discountPercent}%</p>
              </>
            )}
          </div>
        </div>
      </Link>
    </>
  );
}
