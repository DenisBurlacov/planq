import { useTranslation } from 'react-i18next';
import { Breadcrumb } from '@components/ui/Breadcrumb';

interface StaticPageLayoutProps {
  titleKey: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function StaticPageLayout({ titleKey, lastUpdated, children }: StaticPageLayoutProps) {
  const { t } = useTranslation('pages');
  const tc = useTranslation('common').t;

  const title = t(titleKey);

  const breadcrumbItems = [{ label: tc('nav.home'), to: '/' }, { label: title }];

  return (
    <div data-testid="static-page" className="max-w-3xl mx-auto">
      <Breadcrumb items={breadcrumbItems} />
      <h1
        data-testid="static-page-title"
        className="text-2xl font-bold text-[var(--text-primary)] mb-2"
      >
        {title}
      </h1>
      <p data-testid="static-page-updated" className="text-sm text-[var(--text-secondary)] mb-8">
        {t('static.lastUpdated', { date: lastUpdated })}
      </p>
      <div data-testid="static-page-content" className="space-y-8">
        {children}
      </div>
    </div>
  );
}
