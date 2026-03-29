import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, ImageOff } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import type { Product } from '@appTypes/api';

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
}

export function ProductCard({
  product,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
}: ProductCardProps) {
  const { t } = useTranslation('catalog');
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistPending, setWishlistPending] = useState(false);

  const handleAddToCart = async () => {
    if (!onAddToCart) return;
    setAddingToCart(true);
    await Promise.resolve(onAddToCart(product));
    setAddingToCart(false);
  };

  const handleWishlist = async () => {
    if (!onToggleWishlist) return;
    setWishlistPending(true);
    await Promise.resolve(onToggleWishlist(product.id));
    setWishlistPending(false);
  };

  const hasImage = product.images.length > 0;
  const price = product.salePrice ?? product.price;
  const isOnSale = product.salePrice !== null;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="group relative rounded-xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden transition-shadow hover:shadow-lg">
      {/* Image */}
      <Link to={`/catalog/${product.id}`}>
        <div className="relative h-48 bg-[var(--bg-sidebar)] overflow-hidden">
          {hasImage ? (
            <img
              src={product.images[0]}
              alt={product.name}
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
              <span className="text-white text-sm font-medium">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      {/* Wishlist button */}
      {onToggleWishlist && (
        <button
          onClick={handleWishlist}
          disabled={wishlistPending}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/70 transition-colors"
          aria-label={isWishlisted ? t('product.removeFromWishlist') : t('product.addToWishlist')}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-[var(--text-secondary)]'}`}
          />
        </button>
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

        {/* Add to cart */}
        <Button
          size="sm"
          className="mt-3 w-full"
          disabled={isOutOfStock}
          loading={addingToCart}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
          {t('product.addToCart')}
        </Button>
      </div>
    </div>
  );
}
