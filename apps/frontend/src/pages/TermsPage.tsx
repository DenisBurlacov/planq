import { useTranslation } from 'react-i18next';
import { StaticPageLayout } from '@components/layout/StaticPageLayout';

export function TermsPage() {
  const { t } = useTranslation('pages');

  const sections = Array.from({ length: 9 }, (_, i) => ({
    heading: t(`terms.sections.${i}.heading`),
    content: t(`terms.sections.${i}.content`),
  }));

  return (
    <div data-testid="terms-page">
      <StaticPageLayout titleKey="terms.title" lastUpdated="2026-03-01">
        {sections.map((section, i) => (
          <div key={i}>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-3 first:mt-0">
              {section.heading}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}
      </StaticPageLayout>
    </div>
  );
}
