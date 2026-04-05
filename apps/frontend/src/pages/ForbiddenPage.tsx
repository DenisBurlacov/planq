import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { Button } from '@components/ui/Button';

export function ForbiddenPage() {
  const { t } = useTranslation('common');

  return (
    <div
      data-testid="forbidden-page"
      className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center px-4"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
        <Lock data-testid="forbidden-icon" className="h-10 w-10 text-red-500" />
      </div>
      <p data-testid="forbidden-code" className="text-8xl font-black text-red-500/20 select-none">
        403
      </p>
      <h1 data-testid="forbidden-title" className="text-2xl font-bold text-[var(--text-primary)]">
        {t('errorPages.forbidden')}
      </h1>
      <p data-testid="forbidden-message" className="text-[var(--text-secondary)] max-w-sm">
        {t('errorPages.forbiddenMessage')}
      </p>
      <div className="flex gap-3 mt-2">
        <Link to="/" data-testid="forbidden-home-link">
          <Button>{t('errorPages.goHome')}</Button>
        </Link>
        <Button
          data-testid="forbidden-back-button"
          variant="secondary"
          onClick={() => window.history.back()}
        >
          {t('errorPages.goBack')}
        </Button>
      </div>
    </div>
  );
}
