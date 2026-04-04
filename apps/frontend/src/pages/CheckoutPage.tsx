import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@components/ui/Button';
import { Breadcrumb } from '@components/ui/Breadcrumb';
import { Stepper } from '@components/ui/Stepper';
import { SearchableSelect } from '@components/ui/SearchableSelect';
import { cartApi } from '@api/cart';
import { ordersApi } from '@api/orders';
import { profileApi } from '@api/profile';
import { addressesApi, type Address } from '@api/addresses';
import { useToast } from '@components/ui/Toast';
import { ApiException } from '@api/client';
import { CreditCard, Wallet, Pencil } from 'lucide-react';

const COUNTRIES = [
  'Sweden',
  'Germany',
  'France',
  'United Kingdom',
  'Netherlands',
  'Spain',
  'Italy',
  'Norway',
  'Denmark',
  'Finland',
  'Poland',
  'United States',
  'Canada',
  'Australia',
  'Japan',
  'South Korea',
  'Brazil',
  'Mexico',
  'India',
  'China',
  'Switzerland',
  'Austria',
  'Belgium',
  'Czech Republic',
  'Portugal',
  'Ireland',
  'Greece',
  'Hungary',
  'Romania',
  'Bulgaria',
  'Croatia',
  'Slovakia',
  'Slovenia',
  'Lithuania',
  'Latvia',
  'Estonia',
  'Luxembourg',
  'Malta',
  'Cyprus',
  'Iceland',
  'New Zealand',
  'Singapore',
  'Thailand',
  'Turkey',
  'Ukraine',
  'Argentina',
  'Chile',
  'Colombia',
  'Peru',
  'South Africa',
  'Egypt',
  'Nigeria',
  'Kenya',
];

export function CheckoutPage() {
  const { t } = useTranslation('checkout');
  const { t: tc } = useTranslation('common');
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { promoCode, promoDiscount } =
    (location.state as { promoCode?: string; promoDiscount?: number }) ?? {};

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Shipping
  const [addressMode, setAddressMode] = useState<'saved' | 'new'>('new');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    zip: '',
    country: 'Sweden',
  });

  // Step 2: Payment
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'WALLET'>('CARD');
  const [cardNumber, setCardNumber] = useState('');

  // Step 3: Terms
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { data: cart } = useQuery({ queryKey: ['cart'], queryFn: cartApi.get });
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: profileApi.get });
  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      try {
        return await addressesApi.list();
      } catch {
        return [] as Address[];
      }
    },
  });

  const steps = [
    { label: t('steps.address'), number: 1 },
    { label: t('steps.payment'), number: 2 },
    { label: t('steps.confirm'), number: 3 },
  ];

  const round2 = (n: number) => Math.round(n * 100) / 100;
  const subtotal = round2(
    cart?.items.reduce((sum, item) => {
      const price = item.product.salePrice ?? item.product.price;
      return sum + price * item.quantity;
    }, 0) ?? 0
  );
  const discountAmount = promoDiscount ? round2(subtotal * (promoDiscount / 100)) : 0;
  const total = round2(subtotal - discountAmount);

  const getShippingAddress = (): string => {
    if (addressMode === 'saved' && selectedAddressId) {
      const addr = addresses?.find(a => a.id === selectedAddressId);
      if (addr) return `${addr.street}, ${addr.zip} ${addr.city}, ${addr.country}`;
    }
    return `${newAddress.street}, ${newAddress.zip} ${newAddress.city}, ${newAddress.country}`;
  };

  const canProceedStep1 = () => {
    if (addressMode === 'saved') return !!selectedAddressId;
    return (
      newAddress.street.length >= 3 && newAddress.city.length >= 2 && newAddress.zip.length >= 3
    );
  };

  const canProceedStep2 = () => {
    if (paymentMethod === 'WALLET') return true;
    return cardNumber.replace(/\s/g, '').length >= 12;
  };

  const handlePlaceOrder = async () => {
    if (!termsAccepted) return;
    setSubmitting(true);
    try {
      const order = await ordersApi.checkout({
        shippingAddress: getShippingAddress(),
        paymentMethod,
        promoCode,
        cardNumber: paymentMethod === 'CARD' ? cardNumber.replace(/\s/g, '') : undefined,
      });
      navigate('/checkout/processing', { state: { orderId: order.id }, replace: true });
    } catch (err) {
      toast('error', err instanceof ApiException ? err.message : t('failed.title'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Breadcrumb
        items={[
          { label: tc('nav.home'), to: '/' },
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

      <Stepper steps={steps} currentStep={step} data-testid="checkout-step-indicator" />

      {/* Step 1: Shipping */}
      {step === 1 && (
        <div data-testid="checkout-step-shipping" className="space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">{t('address.title')}</h2>

            {addresses && addresses.length > 0 && (
              <div className="flex gap-3 mb-4">
                <button
                  data-testid="address-mode-saved"
                  onClick={() => setAddressMode('saved')}
                  className={`flex-1 rounded-lg border p-3 text-sm text-center transition-colors ${
                    addressMode === 'saved'
                      ? 'border-accent bg-accent/5 font-medium'
                      : 'border-[var(--border)]'
                  }`}
                >
                  {t('address.useSaved')}
                </button>
                <button
                  data-testid="address-mode-new"
                  onClick={() => setAddressMode('new')}
                  className={`flex-1 rounded-lg border p-3 text-sm text-center transition-colors ${
                    addressMode === 'new'
                      ? 'border-accent bg-accent/5 font-medium'
                      : 'border-[var(--border)]'
                  }`}
                >
                  {t('address.newAddress')}
                </button>
              </div>
            )}

            {addressMode === 'saved' && addresses && addresses.length > 0 ? (
              <div className="space-y-2">
                {addresses.map(addr => (
                  <label
                    key={addr.id}
                    data-testid={`saved-address-${addr.id}`}
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      selectedAddressId === addr.id
                        ? 'border-accent bg-accent/5'
                        : 'border-[var(--border)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="savedAddress"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1 accent-accent"
                    />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{addr.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {addr.street}, {addr.zip} {addr.city}, {addr.country}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    {t('address.placeholder')}
                  </label>
                  <input
                    data-testid="checkout-street"
                    value={newAddress.street}
                    onChange={e => setNewAddress(a => ({ ...a, street: e.target.value }))}
                    placeholder={t('address.placeholder')}
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    data-testid="checkout-city"
                    value={newAddress.city}
                    onChange={e => setNewAddress(a => ({ ...a, city: e.target.value }))}
                    placeholder="City"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <input
                    data-testid="checkout-zip"
                    value={newAddress.zip}
                    onChange={e => setNewAddress(a => ({ ...a, zip: e.target.value }))}
                    placeholder="ZIP"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    {t('address.country')}
                  </label>
                  <SearchableSelect
                    options={COUNTRIES}
                    value={newAddress.country}
                    onChange={country => setNewAddress(a => ({ ...a, country }))}
                    searchPlaceholder={t('address.searchCountry')}
                    data-testid="checkout-country-select"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              data-testid="checkout-next-step"
              disabled={!canProceedStep1()}
              onClick={() => setStep(2)}
            >
              {t('stepper.next')}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <div data-testid="checkout-step-payment" className="space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">{t('payment.title')}</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <label
                data-testid="payment-card"
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  paymentMethod === 'CARD' ? 'border-accent bg-accent/5' : 'border-[var(--border)]'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="CARD"
                  checked={paymentMethod === 'CARD'}
                  onChange={() => setPaymentMethod('CARD')}
                  className="sr-only"
                />
                <CreditCard className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">{t('payment.card')}</span>
              </label>
              <label
                data-testid="payment-wallet"
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  paymentMethod === 'WALLET'
                    ? 'border-accent bg-accent/5'
                    : 'border-[var(--border)]'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="WALLET"
                  checked={paymentMethod === 'WALLET'}
                  onChange={() => setPaymentMethod('WALLET')}
                  className="sr-only"
                />
                <Wallet className="h-5 w-5 text-accent" />
                <div>
                  <span className="text-sm font-medium">{t('payment.wallet')}</span>
                  {profile && (
                    <p className="text-xs text-[var(--text-secondary)]">
                      {t('payment.walletBalance', {
                        amount: `\u20AC${profile.walletBalance.toFixed(2)}`,
                      })}
                    </p>
                  )}
                </div>
              </label>
            </div>

            {paymentMethod === 'CARD' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    {t('payment.cardNumber')}
                  </label>
                  <input
                    data-testid="checkout-card-number"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    placeholder={t('payment.cardNumberPlaceholder')}
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                {import.meta.env.VITE_SHOW_TEST_CREDENTIALS === 'true' && (
                  <div
                    data-testid="test-cards-hint"
                    className="rounded-lg bg-[var(--bg-sidebar)] p-3 text-xs text-[var(--text-secondary)] space-y-1"
                  >
                    <p className="font-medium text-[var(--text-primary)]">{t('testCards.title')}</p>
                    <p>{t('testCards.success')}</p>
                    <p>{t('testCards.declined')}</p>
                    <p>{t('testCards.timeout')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-between">
            <Button data-testid="checkout-prev-step" variant="secondary" onClick={() => setStep(1)}>
              {t('stepper.back')}
            </Button>
            <Button
              data-testid="checkout-next-step"
              disabled={!canProceedStep2()}
              onClick={() => setStep(3)}
            >
              {t('stepper.next')}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div data-testid="checkout-step-review" className="space-y-4">
          {/* Shipping Summary */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-[var(--text-primary)]">
                {t('review.shippingAddress')}
              </h2>
              <button
                data-testid="edit-shipping"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover"
              >
                <Pencil className="h-3 w-3" /> {t('review.editShipping')}
              </button>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{getShippingAddress()}</p>
          </div>

          {/* Payment Summary */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-[var(--text-primary)]">
                {t('review.paymentMethod')}
              </h2>
              <button
                data-testid="edit-payment"
                onClick={() => setStep(2)}
                className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover"
              >
                <Pencil className="h-3 w-3" /> {t('review.editPayment')}
              </button>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              {paymentMethod === 'CARD'
                ? `${t('payment.card')} ****${cardNumber.replace(/\s/g, '').slice(-4)}`
                : t('payment.wallet')}
            </p>
          </div>

          {/* Order Items */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <h2 className="font-semibold text-[var(--text-primary)] mb-3">
              {t('review.orderItems')}
            </h2>
            <div className="space-y-2">
              {cart?.items.map(item => {
                const price = item.product.salePrice ?? item.product.price;
                return (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-[var(--bg-sidebar)] overflow-hidden">
                        {item.product.images[0] && (
                          <img
                            src={item.product.images[0]}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <span className="text-[var(--text-primary)] truncate max-w-48">
                        {item.product.name} x{item.quantity}
                      </span>
                    </div>
                    <span className="font-medium text-[var(--text-primary)]">
                      {'\u20AC'}
                      {(price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-2">
            <h2 className="font-semibold text-[var(--text-primary)] mb-2">{t('cart.summary')}</h2>
            {promoDiscount && (
              <>
                <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                  <span>{t('cart.subtotal')}</span>
                  <span>
                    {'\u20AC'}
                    {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>
                    {t('cart.discount')} ({promoDiscount}%)
                  </span>
                  <span>
                    -{'\u20AC'}
                    {discountAmount.toFixed(2)}
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between font-bold text-[var(--text-primary)]">
              <span>{t('cart.total')}</span>
              <span>
                {'\u20AC'}
                {total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3 py-4">
            <input
              type="checkbox"
              data-testid="checkout-terms-checkbox"
              checked={termsAccepted}
              onChange={e => setTermsAccepted(e.target.checked)}
              className="w-5 h-5 rounded border mt-0.5 shrink-0 accent-accent border-[var(--border)]"
            />
            <label className="text-sm text-[var(--text-secondary)]">
              {t('terms.label')}{' '}
              <a href="#" className="text-accent hover:underline">
                {tc('termsLink')}
              </a>{' '}
              {t('terms.and')}{' '}
              <a href="#" className="text-accent hover:underline">
                {tc('privacyLink')}
              </a>
            </label>
          </div>

          <div className="flex justify-between">
            <Button data-testid="checkout-prev-step" variant="secondary" onClick={() => setStep(2)}>
              {t('stepper.back')}
            </Button>
            <Button
              data-testid="place-order-button"
              loading={submitting}
              disabled={!termsAccepted}
              onClick={handlePlaceOrder}
            >
              {t('placeOrder')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
