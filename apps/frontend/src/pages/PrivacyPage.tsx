import { useTranslation } from 'react-i18next';
import { StaticPageLayout } from '@components/layout/StaticPageLayout';

export function PrivacyPage() {
  const { t } = useTranslation('pages');

  const sections = Array.from({ length: 8 }, (_, i) => ({
    heading: t(`privacy.sections.${i}.heading`),
    content: t(`privacy.sections.${i}.content`),
  }));

  return (
    <div data-testid="privacy-page">
      <StaticPageLayout titleKey="privacy.title" lastUpdated="2026-03-01">
        {sections.map((section, i) => (
          <div key={i}>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-3 first:mt-0">
              {section.heading}
            </h2>
            <div
              className="text-sm text-[var(--text-secondary)] leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_p]:mb-3 [&_strong]:text-[var(--text-primary)] [&_a]:text-accent [&_a]:hover:underline"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </div>
        ))}
      </StaticPageLayout>
    </div>
  );
}
