import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { Breadcrumb } from '@components/ui/Breadcrumb';
import { cartApi } from '@api/cart';
import { ordersApi } from '@api/orders';
import { profileApi } from '@api/profile';
import { useToast } from '@components/ui/Toast';
import { ApiException } from '@api/client';
import { CreditCard, Wallet } from 'lucide-react';

const schema = z.object({
  shippingAddress: z.string().min(5, 'Address must be at least 5 characters'),
  paymentMethod: z.enum(['CARD', 'WALLET']),
  cardNumber: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function CheckoutPage() {
  const { t } = useTranslation('checkout');
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { promoCode, promoDiscount } =
    (location.state as { promoCode?: string; promoDiscount?: number }) ?? {};

  const { data: cart } = useQuery({ queryKey: ['cart'], queryFn: cartApi.get });
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: profileApi.get });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: 'CARD' },
  });

  const paymentMethod = watch('paymentMethod');
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const subtotal = round2(
    cart?.items.reduce((sum, item) => {
      const price = item.product.salePrice ?? item.product.price;
      return sum + price * item.quantity;
    }, 0) ?? 0
  );
  const discountAmount = promoDiscount ? round2(subtotal * (promoDiscount / 100)) : 0;
  const total = round2(subtotal - discountAmount);

  const onSubmit = async (data: FormData) => {
    try {
      const order = await ordersApi.checkout({
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        promoCode,
        cardNumber:
          data.paymentMethod === 'CARD' ? (data.cardNumber ?? '').replace(/\s/g, '') : undefined,
      });
      navigate('/checkout/processing', { state: { orderId: order.id }, replace: true });
    } catch (err) {
      toast('error', err instanceof ApiException ? err.message : 'Checkout failed');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Breadcrumb
        items={[{ label: 'Home', to: '/' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]}
      />
      <h1
        data-testid="checkout-title"
        className="text-2xl font-bold text-[var(--text-primary)] mb-6"
      >
        Checkout
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Address */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">{t('address.title')}</h2>
          <Input
            id="address"
            data-testid="checkout-address"
            label={t('address.title')}
            placeholder={t('address.placeholder')}
            error={errors.shippingAddress?.message}
            {...register('shippingAddress')}
          />
        </div>

        {/* Payment */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">{t('payment.title')}</h2>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <label
              data-testid="payment-card"
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${paymentMethod === 'CARD' ? 'border-accent bg-accent/5' : 'border-[var(--border)]'}`}
            >
              <input type="radio" value="CARD" {...register('paymentMethod')} className="sr-only" />
              <CreditCard className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">{t('payment.card')}</span>
            </label>

            <label
              data-testid="payment-wallet"
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${paymentMethod === 'WALLET' ? 'border-accent bg-accent/5' : 'border-[var(--border)]'}`}
            >
              <input
                type="radio"
                value="WALLET"
                {...register('paymentMethod')}
                className="sr-only"
              />
              <Wallet className="h-5 w-5 text-accent" />
              <div>
                <span className="text-sm font-medium">{t('payment.wallet')}</span>
                {profile && (
                  <p className="text-xs text-[var(--text-secondary)]">
                    {t('payment.walletBalance', { amount: `€${profile.walletBalance.toFixed(2)}` })}
                  </p>
                )}
              </div>
            </label>
          </div>

          {paymentMethod === 'CARD' && (
            <div className="space-y-3">
              <Input
                id="cardNumber"
                data-testid="checkout-card-number"
                label={t('payment.cardNumber')}
                placeholder={t('payment.cardNumberPlaceholder')}
                {...register('cardNumber')}
              />

              {import.meta.env.VITE_SHOW_TEST_CREDENTIALS === 'true' && (
                <div className="rounded-lg bg-[var(--bg-sidebar)] p-3 text-xs text-[var(--text-secondary)] space-y-1">
                  <p className="font-medium text-[var(--text-primary)]">{t('payment.testCards')}</p>
                  <p>✓ {t('payment.cardSuccess')}</p>
                  <p>✗ {t('payment.cardDeclined')}</p>
                  <p>✗ {t('payment.cardInsufficient')}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-2">
          {promoDiscount && (
            <>
              <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                <span>{t('cart.subtotal')}</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>
                  {t('cart.discount')} ({promoDiscount}%)
                </span>
                <span>-€{discountAmount.toFixed(2)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between font-bold text-[var(--text-primary)]">
            <span>{t('cart.total')}</span>
            <span>€{total.toFixed(2)}</span>
          </div>
        </div>

        <Button
          data-testid="place-order-button"
          type="submit"
          loading={isSubmitting}
          className="w-full"
          size="lg"
        >
          {t('placeOrder')}
        </Button>
      </form>
    </div>
  );
}
