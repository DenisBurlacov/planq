import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@components/ui/Button';

export function CheckoutSuccessPage() {
  const { t } = useTranslation('checkout');
  const [params] = useSearchParams();
  const orderId = params.get('orderId');

  return (
    <div
      data-testid="success-page"
      className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center px-4"
    >
      <CheckCircle className="h-20 w-20 text-green-500" />
      <div>
        <h1 data-testid="success-title" className="text-2xl font-bold text-[var(--text-primary)]">
          {t('success.title')}
        </h1>
        <p className="mt-2 text-[var(--text-secondary)]">{t('success.subtitle')}</p>
        {orderId && (
          <p className="mt-1 text-sm font-mono text-[var(--text-secondary)]">
            {t('success.orderId', { id: orderId.slice(0, 8) })}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        {orderId && (
          <Link to={`/orders/${orderId}`}>
            <Button data-testid="view-order-button">{t('success.viewOrder')}</Button>
          </Link>
        )}
        <Link to="/catalog">
          <Button variant="secondary">{t('success.continueShopping')}</Button>
        </Link>
      </div>
    </div>
  );
}
