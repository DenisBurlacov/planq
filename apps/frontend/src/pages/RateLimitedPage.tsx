import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import { Button } from '@components/ui/Button';

export function RateLimitedPage() {
  const { t } = useTranslation('common');
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <div
      data-testid="rate-limited-page"
      className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center px-4"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
        <Clock data-testid="rate-limited-icon" className="h-10 w-10 text-yellow-500" />
      </div>
      <p
        data-testid="rate-limited-code"
        className="text-8xl font-black text-yellow-500/20 select-none"
      >
        429
      </p>
      <h1
        data-testid="rate-limited-title"
        className="text-2xl font-bold text-[var(--text-primary)]"
      >
        {t('errorPages.rateLimited')}
      </h1>
      <p data-testid="rate-limited-message" className="text-[var(--text-secondary)] max-w-sm">
        {t('errorPages.rateLimitedMessage')}
      </p>
      {countdown > 0 && (
        <p
          data-testid="rate-limited-countdown"
          className="text-lg font-mono font-bold text-[var(--text-primary)]"
        >
          {t('errorPages.retryIn', { seconds: countdown })}
        </p>
      )}
      <div className="flex gap-3 mt-2">
        <Link to="/" data-testid="rate-limited-home-link">
          <Button>{t('errorPages.goHome')}</Button>
        </Link>
        {countdown === 0 && (
          <Button
            data-testid="rate-limited-retry"
            variant="secondary"
            onClick={() => window.history.back()}
          >
            {t('actions.retry')}
          </Button>
        )}
      </div>
    </div>
  );
}
