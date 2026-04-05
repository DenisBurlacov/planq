import { useTranslation } from 'react-i18next';
import { StaticPageLayout } from '@components/layout/StaticPageLayout';

export function ShippingPage() {
  const { t } = useTranslation('pages');

  const sections = Array.from({ length: 7 }, (_, i) => ({
    heading: t(`shipping.sections.${i}.heading`),
    content: t(`shipping.sections.${i}.content`),
  }));

  const rows = Array.from({ length: 4 }, (_, i) => ({
    destination: t(`shipping.table.rows.${i}.destination`),
    standard: t(`shipping.table.rows.${i}.standard`),
    express: t(`shipping.table.rows.${i}.express`),
    free: t(`shipping.table.rows.${i}.free`),
  }));

  return (
    <div data-testid="shipping-page">
      <StaticPageLayout titleKey="shipping.title" lastUpdated="2026-03-01">
        {sections.map((section, i) => (
          <div key={i}>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-3 first:mt-0">
              {section.heading}
            </h2>
            <div
              className="text-sm text-[var(--text-secondary)] leading-relaxed [&_strong]:text-[var(--text-primary)]"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
            {i === 1 && (
              <div className="overflow-x-auto mt-4">
                <table
                  data-testid="shipping-rates-table"
                  className="w-full rounded-xl border border-[var(--border)] overflow-hidden"
                >
                  <thead>
                    <tr className="bg-[var(--bg-sidebar)]">
                      <th className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] px-4 py-3 text-left">
                        {t('shipping.table.destination')}
                      </th>
                      <th className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] px-4 py-3 text-left">
                        {t('shipping.table.standard')}
                      </th>
                      <th className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] px-4 py-3 text-left">
                        {t('shipping.table.express')}
                      </th>
                      <th className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] px-4 py-3 text-left">
                        {t('shipping.table.freeThreshold')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr
                        key={idx}
                        data-testid={`shipping-rates-row-${idx}`}
                        className={idx % 2 === 1 ? 'bg-[var(--bg-sidebar)]/50' : ''}
                      >
                        <td className="text-sm text-[var(--text-secondary)] px-4 py-3">
                          {row.destination}
                        </td>
                        <td className="text-sm text-[var(--text-secondary)] px-4 py-3">
                          {row.standard}
                        </td>
                        <td className="text-sm text-[var(--text-secondary)] px-4 py-3">
                          {row.express}
                        </td>
                        <td className="text-sm text-[var(--text-secondary)] px-4 py-3">
                          {row.free}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </StaticPageLayout>
    </div>
  );
}
