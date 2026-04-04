import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, ShoppingCart, Star, ImageOff, Eye, ArrowLeftRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { AddToCartModal } from '@components/ui/AddToCartModal';
import { useCompareStore } from '@store/compare.store';
import type { Product } from '@appTypes/api';

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  onAddToCart?: (product: Product, quantity: number) => Promise<void>;
  onToggleWishlist?: (productId: string) => void;
  onQuickView?: (product: Product) => void;
  onAddToCompare?: (product: Product) => void;
}

export function ProductCard({
  product,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
}: ProductCardProps) {
  const { t } = useTranslation('catalog');
  const navigate = useNavigate();
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistPending, setWishlistPending] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { addProduct, removeProduct, hasProduct, productIds } = useCompareStore();

  const handleAddToCart = () => {
    if (!onAddToCart) return;
    setModalOpen(true);
  };

  const handleModalConfirm = async (quantity: number) => {
    if (!onAddToCart) return;
    setAddingToCart(true);
    await onAddToCart(product, quantity);
    setAddingToCart(false);
    setModalOpen(false);
  };

  const handleWishlist = async () => {
    if (!onToggleWishlist) return;
    setWishlistPending(true);
    await Promise.resolve(onToggleWishlist(product.id));
    setWishlistPending(false);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasProduct(product.id)) {
      removeProduct(product.id);
    } else if (productIds.length < 4) {
      addProduct(product.id);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onQuickView) {
      onQuickView(product);
    } else {
      navigate(`/catalog/${product.id}`, { state: { from: location } });
    }
  };

  const hasImage = product.images.length > 0 && !imgError;
  const price = product.salePrice ?? product.price;
  const isOnSale = product.salePrice !== null;
  const isOutOfStock = product.stock === 0;
  const isInCompare = hasProduct(product.id);
  const discountPercent =
    isOnSale && product.salePrice !== null
      ? Math.round((1 - product.salePrice / product.price) * 100)
      : 0;

  return (
    <>
      <AddToCartModal
        product={product}
        open={modalOpen}
        loading={addingToCart}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalOpen(false)}
      />
      <div
        data-testid="product-card"
        className="group relative rounded-xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        aria-label={isOutOfStock ? `${product.name} — ${t('product.outOfStock')}` : product.name}
      >
        {/* Image */}
        <Link to={`/catalog/${product.id}`}>
          <div className="relative h-48 bg-[var(--bg-sidebar)] overflow-hidden">
            {hasImage ? (
              <img
                src={product.images[0]}
                alt={product.name}
                loading="lazy"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageOff className="h-12 w-12 text-[var(--text-secondary)]" />
              </div>
            )}
            {isOnSale && (
              <div className="absolute top-2 left-2">
                <Badge variant="sale">{t('common:sale', { ns: 'common' })}</Badge>
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-sm font-medium">{t('product.outOfStock')}</span>
              </div>
            )}

            {/* Compare button — hidden on mobile */}
            <div className="hidden md:block absolute top-2 left-2 mt-7">
              <button
                data-testid="compare-button"
                onClick={handleCompare}
                className={`p-1.5 rounded-full bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 ${
                  isInCompare ? 'opacity-100' : ''
                }`}
                aria-label={isInCompare ? 'Remove from compare' : 'Add to compare'}
              >
                <ArrowLeftRight
                  className={`h-4 w-4 ${isInCompare ? 'text-accent' : 'text-[var(--text-secondary)]'}`}
                />
              </button>
            </div>

            {/* Hover overlay with info */}
            <div
              data-testid="product-card-overlay"
              className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3"
            >
              <div className="hidden md:flex flex-wrap gap-1 mb-2">
                {product.category && (
                  <span
                    data-testid="product-card-material"
                    className="text-xs text-white bg-white/20 rounded px-2 py-0.5"
                  >
                    {product.category.name}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center">
                <button
                  data-testid="quick-view-button"
                  onClick={handleQuickView}
                  className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-white transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {t('product.quickView')}
                </button>
              </div>
            </div>
          </div>
        </Link>

        {/* Wishlist button */}
        {onToggleWishlist && (
          <div className="absolute top-2 right-2 group/wish">
            <button
              data-testid="wishlist-button"
              onClick={handleWishlist}
              disabled={wishlistPending}
              className="p-1.5 rounded-full bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/70 transition-colors"
              aria-label={
                isWishlisted ? t('product.removeFromWishlist') : t('product.addToWishlist')
              }
            >
              <Heart
                className={`h-4 w-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-[var(--text-secondary)]'}`}
              />
            </button>
            <div className="pointer-events-none absolute right-0 top-full mt-1 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover/wish:opacity-100 transition-opacity z-10">
              {isWishlisted ? t('product.removeFromWishlist') : t('product.addToWishlist')}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <Link to={`/catalog/${product.id}`}>
            <h3 className="text-sm font-medium text-[var(--text-primary)] line-clamp-2 hover:text-accent transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="mt-1 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-[var(--text-secondary)]">
              {product.rating.toFixed(1)} ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-base font-bold text-[var(--text-primary)]">
              €{price.toFixed(2)}
            </span>
            {isOnSale && (
              <span className="text-sm text-[var(--text-secondary)] line-through">
                €{product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Enhanced sale display */}
          {isOnSale && (
            <div className="mt-1 flex items-center gap-2">
              <span
                data-testid="product-card-discount-percent"
                className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 rounded px-1.5 py-0.5"
              >
                -{discountPercent}%
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                Save €{(product.price - price).toFixed(2)}
              </span>
            </div>
          )}

          {/* Add to cart */}
          <Button
            data-testid="add-to-cart-button"
            size="sm"
            className="mt-3 w-full"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            {t('product.addToCart')}
          </Button>
        </div>
      </div>
    </>
  );
}
