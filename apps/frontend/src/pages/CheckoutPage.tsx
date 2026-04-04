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
import { CreditCard, Wallet, Check } from 'lucide-react';

const schema = z.object({
  shippingAddress: z.string().min(5),
  paymentMethod: z.enum(['CARD', 'WALLET']),
  cardNumber: z.string().optional(),
  termsAccepted: z.literal(true),
});
type FormData = z.infer<typeof schema>;

function StepIndicator({ currentStep }: { currentStep: number }) {
  const { t } = useTranslation('checkout');
  const steps = [
    { label: t('steps.address'), number: 1 },
    { label: t('steps.payment'), number: 2 },
    { label: t('steps.confirm', { defaultValue: 'Review' }), number: 3 },
  ];

  return (
    <div
      data-testid="checkout-step-indicator"
      className="flex items-center justify-center gap-0 mb-8"
    >
      {steps.map((step, i) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              data-testid={`checkout-step-${step.number}`}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step.number < currentStep
                  ? 'bg-accent text-white'
                  : step.number === currentStep
                    ? 'bg-accent text-white'
                    : 'bg-[var(--border)] text-[var(--text-secondary)]'
              }`}
            >
              {step.number < currentStep ? <Check className="h-4 w-4" /> : step.number}
            </div>
            <span className="text-xs mt-1 text-[var(--text-secondary)]">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-12 sm:w-20 h-0.5 mx-1 ${
                step.number < currentStep ? 'bg-accent' : 'bg-[var(--border)]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

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
    defaultValues: { paymentMethod: 'CARD', termsAccepted: undefined as unknown as true },
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
      toast('error', err instanceof ApiException ? err.message : t('failed.title'));
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Breadcrumb
        items={[
          { label: t('common:nav.home', { ns: 'common' }), to: '/' },
          { label: t('cart.title'), to: '/cart' },
          { label: t('checkoutTitle') },
        ]}
      />
      <h1
        data-testid="checkout-title"
        className="text-2xl font-bold text-[var(--text-primary)] mb-6"
      >
        {t('checkoutTitle')}
      </h1>

      <StepIndicator currentStep={1} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Address */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">
            <span className="text-accent font-bold mr-2">1</span>
            {t('address.title')}
          </h2>
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
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">
            <span className="text-accent font-bold mr-2">2</span>
            {t('payment.title')}
          </h2>

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
          <h2 className="font-semibold text-[var(--text-primary)] mb-2">
            <span className="text-accent font-bold mr-2">3</span>
            {t('cart.summary')}
          </h2>
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

        {/* Terms & Conditions */}
        <div className="flex items-start gap-3 py-4">
          <input
            type="checkbox"
            data-testid="checkout-terms-checkbox"
            {...register('termsAccepted')}
            className={`w-5 h-5 rounded border mt-0.5 shrink-0 accent-accent ${
              errors.termsAccepted ? 'border-red-500' : 'border-[var(--border)]'
            }`}
          />
          <div>
            <label className="text-sm text-[var(--text-secondary)]">
              {t('terms.label', { defaultValue: 'I agree to the' })}{' '}
              <a href="#" className="text-accent hover:underline">
                {t('common:termsLink', { ns: 'common' })}
              </a>{' '}
              {t('terms.and', { defaultValue: 'and' })}{' '}
              <a href="#" className="text-accent hover:underline">
                {t('common:privacyLink', { ns: 'common' })}
              </a>
            </label>
            {errors.termsAccepted && (
              <p data-testid="checkout-terms-error" className="text-xs text-red-500 mt-1">
                {t('terms.required', { defaultValue: 'You must accept the terms to continue' })}
              </p>
            )}
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
