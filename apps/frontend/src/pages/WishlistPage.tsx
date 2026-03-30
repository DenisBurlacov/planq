import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@components/features/ProductCard';
import { ProductCardSkeleton } from '@components/ui/Skeleton';
import { wishlistApi } from '@api/wishlist';
import { cartApi } from '@api/cart';
import { useCartStore } from '@store/cart.store';
import { useToast } from '@components/ui/Toast';
import { ApiException } from '@api/client';
import type { Product } from '@appTypes/api';

export function WishlistPage() {
  const { t } = useTranslation('catalog');
  const { increment } = useCartStore();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['wishlist'], queryFn: wishlistApi.get });

  const handleAddToCart = async (product: Product) => {
    try {
      await cartApi.add(product.id);
      increment();
      toast('success', `${product.name} added to cart`);
    } catch (err) {
      toast('error', err instanceof ApiException ? err.message : 'Failed');
    }
  };

  const handleRemove = async (productId: string) => {
    // Optimistic: invalidate after
    try {
      await wishlistApi.remove(productId);
      await qc.invalidateQueries({ queryKey: ['wishlist'] });
      toast('success', 'Removed from wishlist');
    } catch {
      toast('error', 'Failed to remove');
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Wishlist</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div
        data-testid="empty-state"
        className="flex flex-col items-center justify-center py-24 gap-4"
      >
        <Heart className="h-16 w-16 text-[var(--text-secondary)]" />
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Wishlist is empty</h2>
        <Link to="/catalog" className="text-accent hover:underline text-sm">
          {t('product.addToWishlist')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
        Wishlist ({data.length})
      </h1>
      <div
        data-testid="wishlist-grid"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {data.map(({ product }) => (
          <ProductCard
            key={product.id}
            product={product}
            isWishlisted
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleRemove}
          />
        ))}
      </div>
    </div>
  );
}
