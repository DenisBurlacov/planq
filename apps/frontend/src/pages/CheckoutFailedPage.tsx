import { Link, useLocation } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@components/ui/Button';

export function CheckoutFailedPage() {
  const { t } = useTranslation('checkout');
  const location = useLocation();
  const reason = (location.state as { reason?: string })?.reason;

  return (
    <div
      data-testid="failed-page"
      className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center px-4"
    >
      <XCircle className="h-20 w-20 text-red-500" />
      <div>
        <h1 data-testid="failed-title" className="text-2xl font-bold text-[var(--text-primary)]">
          {t('failed.title')}
        </h1>
        <p className="mt-2 text-[var(--text-secondary)]">{t('failed.subtitle')}</p>
        {reason && <p className="mt-1 text-sm text-red-500">{t('failed.reason', { reason })}</p>}
      </div>
      <div className="flex gap-3">
        <Link to="/cart">
          <Button data-testid="try-again-button">{t('failed.tryAgain')}</Button>
        </Link>
        <Link to="/catalog">
          <Button variant="secondary">{t('success.continueShopping')}</Button>
        </Link>
      </div>
    </div>
  );
}
