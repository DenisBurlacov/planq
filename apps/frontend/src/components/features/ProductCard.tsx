import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye, ArrowLeftRight } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { AddToCartModal } from '@components/ui/AddToCartModal';
import { StockUrgencyBadge } from '@components/ui/StockUrgencyBadge';
import { ProductImage } from '@components/ui/ProductImage';
import { PriceDisplay } from '@components/ui/PriceDisplay';
import { useCompareStore } from '@store/compare.store';
import { useProductName } from '@hooks/useProductLocale';
import type { Product } from '@appTypes/api';

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  onAddToCart?: (product: Product, quantity: number) => Promise<void>;
  onToggleWishlist?: (productId: string) => void;
  onQuickView?: (product: Product) => void;
  'data-onboarding-product'?: boolean;
}

export function ProductCard({
  product,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  'data-onboarding-product': onboardingProduct,
}: ProductCardProps) {
  const { t } = useTranslation('catalog');
  const navigate = useNavigate();
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistPending, setWishlistPending] = useState(false);
  const { addProduct, removeProduct, hasProduct, productIds } = useCompareStore();
  const localizedName = useProductName(product);

  // Swipe state for mobile
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLAnchorElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const delta = e.touches[0].clientX - touchStartX.current;
    touchDeltaX.current = delta;
    const clamped = Math.max(-80, Math.min(80, delta));
    setSwipeOffset(clamped);
    if (Math.abs(delta) > 20) {
      setSwipeDirection(delta < 0 ? 'left' : 'right');
    } else {
      setSwipeDirection(null);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const delta = touchDeltaX.current;
    if (delta < -60 && onToggleWishlist) {
      // Swipe left -> wishlist
      onToggleWishlist(product.id);
    } else if (delta > 60 && onAddToCart) {
      // Swipe right -> add to cart
      setModalOpen(true);
    }
    setSwipeOffset(0);
    setSwipeDirection(null);
  }, [onToggleWishlist, onAddToCart, product.id]);

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

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const hasImage = product.images.length > 0;
  const isOnSale = product.salePrice !== null;
  const isOutOfStock = product.stock === 0;
  const isInCompare = hasProduct(product.id);

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
        ref={cardRef}
        to={`/catalog/${product.id}`}
        data-testid="product-card"
        {...(onboardingProduct ? { 'data-onboarding-product': true } : {})}
        className="group relative rounded-xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block"
        aria-label={isOutOfStock ? `${localizedName} — ${t('product.outOfStock')}` : localizedName}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: swipeOffset ? `translateX(${swipeOffset}px)` : undefined }}
      >
        {/* Swipe indicators (mobile) */}
        {swipeDirection === 'left' && (
          <div
            data-testid="swipe-indicator-wishlist"
            className="absolute inset-y-0 right-0 w-16 z-30 flex items-center justify-center bg-red-500/80 rounded-r-xl md:hidden"
          >
            <Heart className="h-6 w-6 text-white" />
          </div>
        )}
        {swipeDirection === 'right' && (
          <div
            data-testid="swipe-indicator-cart"
            className="absolute inset-y-0 left-0 w-16 z-30 flex items-center justify-center bg-green-500/80 rounded-l-xl md:hidden"
          >
            <ShoppingCart className="h-6 w-6 text-white" />
          </div>
        )}
        {/* Image */}
        <div className="relative h-48 bg-[var(--bg-sidebar)] overflow-hidden">
          <ProductImage
            src={hasImage ? product.images[0] : undefined}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
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
          <h3 className="text-sm font-medium text-[var(--text-primary)] line-clamp-2">
            {localizedName}
          </h3>

          {/* Rating */}
          <div className="mt-1 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-[var(--text-secondary)]">
              {product.rating.toFixed(1)} ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="mt-2">
            <PriceDisplay
              price={product.price}
              salePrice={product.salePrice}
              size="md"
              showDiscount
              showSave
              data-testid="product-card"
            />
          </div>

          {/* Stock urgency */}
          {!isOutOfStock && product.stock <= 5 && (
            <div className="mt-1">
              <StockUrgencyBadge stock={product.stock} />
            </div>
          )}

          {/* Add to cart */}
          <Button
            data-testid="add-to-cart-button"
            size="sm"
            className="mt-3 w-full"
            disabled={isOutOfStock}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            {t('product.addToCart')}
          </Button>
        </div>
      </Link>
    </>
  );
}
