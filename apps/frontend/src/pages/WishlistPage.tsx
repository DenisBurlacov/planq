import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@components/features/ProductCard';
import { ProductCardSkeleton } from '@components/ui/Skeleton';
import { Modal } from '@components/ui/Modal';
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
  const [pendingRemoveProduct, setPendingRemoveProduct] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['wishlist'], queryFn: wishlistApi.get });

  const handleAddToCart = async (product: Product) => {
    try {
      await cartApi.add(product.id);
      increment();
      toast('success', t('product.addedToCartName', { name: product.name }));
    } catch (err) {
      toast('error', err instanceof ApiException ? err.message : t('product.failedAddToCart'));
    }
  };

  const handleRemoveRequest = (productId: string) => {
    const item = data?.find(w => w.productId === productId || w.product.id === productId);
    if (item) {
      setPendingRemoveProduct(item.product);
    }
  };

  const handleRemoveConfirm = async () => {
    if (!pendingRemoveProduct) return;
    try {
      await wishlistApi.remove(pendingRemoveProduct.id);
      await qc.invalidateQueries({ queryKey: ['wishlist'] });
      toast('success', t('wishlist.removed'));
    } catch {
      toast('error', t('wishlist.failedRemove'));
    } finally {
      setPendingRemoveProduct(null);
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
          {t('wishlist.title')}
        </h1>
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
        <h2 className="text-xl font-bold text-[var(--text-primary)]">{t('wishlist.empty')}</h2>
        <Link to="/catalog" className="text-accent hover:underline text-sm">
          {t('product.addToWishlist')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
        {t('wishlist.title')} ({data.length})
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
            onToggleWishlist={handleRemoveRequest}
          />
        ))}
      </div>

      {/* Remove Confirmation Modal */}
      <Modal
        open={!!pendingRemoveProduct}
        title={t('wishlist.removeTitle', { defaultValue: 'Remove from Wishlist' })}
        onConfirm={handleRemoveConfirm}
        onCancel={() => setPendingRemoveProduct(null)}
        confirmLabel={t('wishlist.removeConfirm', { defaultValue: 'Remove' })}
        cancelLabel={t('wishlist.removeCancel', { defaultValue: 'Cancel' })}
        danger
      >
        <div data-testid="wishlist-remove-modal">
          {pendingRemoveProduct && (
            <>
              {pendingRemoveProduct.images.length > 0 && (
                <img
                  src={pendingRemoveProduct.images[0]}
                  alt={pendingRemoveProduct.name}
                  className="w-16 h-16 rounded-lg object-cover mx-auto mb-3"
                />
              )}
              <p className="font-medium text-[var(--text-primary)] text-center">
                {pendingRemoveProduct.name}
              </p>
              <p className="text-sm text-[var(--text-secondary)] text-center mt-2">
                {t('wishlist.removeMessage', {
                  defaultValue: 'Are you sure you want to remove this item from your wishlist?',
                })}
              </p>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
