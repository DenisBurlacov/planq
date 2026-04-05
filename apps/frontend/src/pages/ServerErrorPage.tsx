import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@components/ui/Button';

export function ServerErrorPage() {
  const { t } = useTranslation('common');

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-8xl font-black text-red-500/20">500</p>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        {t('errorPages.serverError')}
      </h1>
      <p className="text-[var(--text-secondary)]">{t('errorPages.serverErrorMessage')}</p>
      <Link to="/">
        <Button>{t('errorPages.goHome')}</Button>
      </Link>
    </div>
  );
}
