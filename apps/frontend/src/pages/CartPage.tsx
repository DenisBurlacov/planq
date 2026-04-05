import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';
import { Skeleton } from '@components/ui/Skeleton';
import { DragList } from '@components/ui/DragList';
import { CopyButton } from '@components/ui/CopyButton';
import { EmptyState } from '@components/ui/EmptyState';
import { cartApi } from '@api/cart';
import { promotionsApi } from '@api/promotions';
import { useCartStore } from '@store/cart.store';
import { useToast } from '@components/ui/Toast';
import { ApiException } from '@api/client';
import { useConfirmModal } from '@hooks/useConfirmModal';
import { formatPrice } from '@utils/pricing';
import { useEffect } from 'react';
import type { CartItem } from '@appTypes/api';

export function CartPage() {
  const { t } = useTranslation('checkout');
  const { setItemCount } = useCartStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState<number | null>(null);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const removeConfirm = useConfirmModal<string>();
  const [orderedItems, setOrderedItems] = useState<CartItem[]>([]);

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.get,
  });

  useEffect(() => {
    if (cart) {
      const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      setItemCount(count);
      setOrderedItems(cart.items);
    }
  }, [cart, setItemCount]);

  const round2 = (n: number) => Math.round(n * 100) / 100;

  const subtotal = round2(
    cart?.items.reduce((sum, item) => {
      const price = item.product.salePrice ?? item.product.price;
      return sum + price * item.quantity;
    }, 0) ?? 0
  );

  const discountAmount = promoDiscount ? round2(subtotal * (promoDiscount / 100)) : 0;
  const total = round2(subtotal - discountAmount);

  const handleUpdateQuantity = async (productId: string, newQty: number) => {
    if (newQty < 1) return;
    setUpdatingItem(productId);
    try {
      await cartApi.update(productId, newQty);
      await qc.invalidateQueries({ queryKey: ['cart'] });
    } catch {
      toast('error', t('cart.failedUpdate'));
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemove = async (productId: string) => {
    setUpdatingItem(productId);
    try {
      await cartApi.remove(productId);
      await qc.invalidateQueries({ queryKey: ['cart'] });
      toast('success', t('cart.itemRemoved'));
    } catch {
      toast('error', t('cart.failedRemove'));
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setApplyingPromo(true);
    try {
      const result = await promotionsApi.validate(promoCode, subtotal);
      setPromoDiscount(result.discountPercent);
      toast('success', t('cart.promoApplied', { percent: result.discountPercent }));
    } catch (err) {
      toast('error', err instanceof ApiException ? err.message : t('cart.invalidPromo'));
    } finally {
      setApplyingPromo(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title={t('cart.empty')}
        description={t('cart.emptyDesc')}
        ctaLabel={t('cart.browseCatalog')}
        ctaTo="/catalog"
        data-testid="cart-empty"
      />
    );
  }

  return (
    <div>
      <h1 data-testid="cart-title" className="text-2xl font-bold text-[var(--text-primary)] mb-6">
        {t('cart.title')}
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2">
          <DragList
            items={orderedItems}
            keyExtractor={item => item.id}
            onReorder={setOrderedItems}
            data-testid="cart-drag-list"
            renderItem={item => {
              const price = item.product.salePrice ?? item.product.price;
              return (
                <div
                  data-testid="cart-item"
                  className="flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
                >
                  <div className="h-20 w-20 shrink-0 rounded-lg bg-[var(--bg-sidebar)] overflow-hidden">
                    {item.product.images[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between">
                      <Link
                        to={`/catalog/${item.product.id}`}
                        className="text-sm font-medium text-[var(--text-primary)] hover:text-accent line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        data-testid="cart-item-remove"
                        onClick={() => removeConfirm.open(item.productId)}
                        disabled={updatingItem === item.productId}
                        className="ml-2 text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          data-testid="cart-item-decrease"
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updatingItem === item.productId}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] hover:bg-[var(--bg-sidebar)] disabled:opacity-50"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span
                          data-testid="cart-item-quantity"
                          className="text-sm font-medium w-6 text-center"
                        >
                          {item.quantity}
                        </span>
                        <button
                          data-testid="cart-item-increase"
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          disabled={updatingItem === item.productId}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] hover:bg-[var(--bg-sidebar)] disabled:opacity-50"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-bold text-[var(--text-primary)]">
                        {formatPrice(price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </div>

        {/* Summary */}
        <div
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 h-fit"
          data-testid="cart-summary"
        >
          <h2 className="font-bold text-[var(--text-primary)] mb-4">{t('cart.summary')}</h2>

          {/* Promo */}
          <div className="flex gap-2 mb-4">
            <input
              data-testid="promo-input"
              value={promoCode}
              onChange={e => setPromoCode(e.target.value)}
              placeholder={t('cart.promoPlaceholder')}
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-sidebar)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <Button
              data-testid="promo-apply"
              size="sm"
              variant="secondary"
              loading={applyingPromo}
              onClick={handleApplyPromo}
            >
              {t('cart.applyPromo')}
            </Button>
          </div>
          {promoCode && (
            <div className="mb-4">
              <CopyButton
                text={promoCode}
                label={t('common:copy.copyPromo', { ns: 'common' })}
                data-testid="copy-promo"
              />
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>{t('cart.subtotal')}</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            {promoDiscount && (
              <div className="flex justify-between text-green-600">
                <span>
                  {t('cart.discount')} ({promoDiscount}%)
                </span>
                <span>-€{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-[var(--border)] pt-2 flex justify-between font-bold text-base text-[var(--text-primary)]">
              <span>{t('cart.total')}</span>
              <span>€{total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            data-testid="checkout-button"
            className="mt-4 w-full"
            onClick={() =>
              navigate('/checkout', {
                state: {
                  promoCode: promoDiscount ? promoCode : undefined,
                  promoDiscount: promoDiscount ?? undefined,
                },
              })
            }
          >
            {t('cart.checkout')}
          </Button>
        </div>
      </div>

      <Modal
        open={removeConfirm.isOpen}
        title={t('cart.removeConfirmTitle')}
        confirmLabel={t('cart.removeConfirmYes')}
        cancelLabel={t('cart.removeConfirmNo')}
        onConfirm={() => {
          if (removeConfirm.target) {
            handleRemove(removeConfirm.target);
            removeConfirm.close();
          }
        }}
        onCancel={removeConfirm.close}
        danger
      >
        {t('cart.removeConfirmBody')}
      </Modal>
    </div>
  );
}
