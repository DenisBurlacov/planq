import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { Accordion } from '@components/ui/Accordion';
import { FAQ_SECTIONS } from '@constants/faqData';

export function FaqPage() {
  const { t } = useTranslation('pages');
  const [search, setSearch] = useState('');

  const filteredSections = useMemo(() => {
    if (!search.trim()) return FAQ_SECTIONS;
    const q = search.toLowerCase();
    return FAQ_SECTIONS.map(section => ({
      ...section,
      items: section.items.filter(item =>
        t(item.questionKey.replace('pages:', '')).toLowerCase().includes(q)
      ),
    })).filter(section => section.items.length > 0);
  }, [search, t]);

  const hasResults = filteredSections.some(s => s.items.length > 0);

  return (
    <div data-testid="faq-page" className="max-w-3xl mx-auto">
      <h1 data-testid="faq-title" className="text-2xl font-bold text-[var(--text-primary)] mb-2">
        {t('faq.title')}
      </h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6">{t('faq.subtitle')}</p>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
        <input
          data-testid="faq-search"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('faq.searchPlaceholder')}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* FAQ sections */}
      {!hasResults ? (
        <p className="text-center text-[var(--text-secondary)] py-8">{t('faq.noResults')}</p>
      ) : (
        filteredSections.map((section, sIdx) => {
          if (section.items.length === 0) return null;
          const accordionItems = section.items.map(item => ({
            title: t(item.questionKey.replace('pages:', '')),
            content: <p className="leading-relaxed">{t(item.answerKey.replace('pages:', ''))}</p>,
          }));
          return (
            <div key={sIdx} data-testid={`faq-section-${sIdx}`} className="mb-6">
              <h2
                data-testid={`faq-section-title-${sIdx}`}
                className="text-lg font-semibold text-[var(--text-primary)] mb-3 mt-8 first:mt-0"
              >
                {t(section.titleKey.replace('pages:', ''))}
              </h2>
              <Accordion items={accordionItems} defaultOpen={-1} />
            </div>
          );
        })
      )}

      {/* CTA block */}
      <div
        data-testid="faq-cta"
        className="rounded-xl bg-[var(--bg-sidebar)] border border-[var(--border)] p-8 text-center mt-12"
      >
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          {t('faq.stillHaveQuestions')}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          {t('faq.stillHaveQuestionsDesc')}
        </p>
        <Link
          data-testid="faq-cta-link"
          to="/contact"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
        >
          {t('faq.contactUs')}
        </Link>
      </div>
    </div>
  );
}
