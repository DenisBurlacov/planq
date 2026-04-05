import { useTranslation } from 'react-i18next';
import { StaticPageLayout } from '@components/layout/StaticPageLayout';

export function ReturnsPage() {
  const { t } = useTranslation('pages');

  const sections = Array.from({ length: 7 }, (_, i) => ({
    heading: t(`returns.sections.${i}.heading`),
    content: t(`returns.sections.${i}.content`),
  }));

  return (
    <div data-testid="returns-page">
      <StaticPageLayout titleKey="returns.title" lastUpdated="2026-03-01">
        {sections.map((section, i) => (
          <div key={i}>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-3 first:mt-0">
              {section.heading}
            </h2>
            <div
              className="text-sm text-[var(--text-secondary)] leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_strong]:text-[var(--text-primary)]"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </div>
        ))}
      </StaticPageLayout>
    </div>
  );
}
