import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Leaf, Heart, Sparkles } from 'lucide-react';
import { Button } from '@components/ui/Button';

const VALUES = [
  { icon: Leaf, titleKey: 'values.sustainability.title', textKey: 'values.sustainability.text' },
  { icon: Heart, titleKey: 'values.quality.title', textKey: 'values.quality.text' },
  { icon: Sparkles, titleKey: 'values.design.title', textKey: 'values.design.text' },
];

const MILESTONES = [
  { year: '2019', labelKey: 'timeline.founded' },
  { year: '2020', labelKey: 'timeline.firstStore' },
  { year: '2022', labelKey: 'timeline.onlineLaunch' },
  { year: '2024', labelKey: 'timeline.milestone10k' },
  { year: '2026', labelKey: 'timeline.expansion' },
];

const TEAM = [
  { name: 'Anna Lindberg', role: 'CEO & Founder' },
  { name: 'Max Fischer', role: 'CTO' },
  { name: 'Sofia Johansson', role: 'Head of Design' },
  { name: 'Denis Petrov', role: 'Operations' },
];

export function AboutPage() {
  const { t } = useTranslation('about');

  return (
    <div>
      {/* Hero */}
      <section
        data-testid="about-hero"
        className="py-20 sm:py-28 text-center bg-accent/5 rounded-2xl mb-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4"
      >
        <h1
          data-testid="about-hero-title"
          className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)]"
        >
          {t('hero.title')}
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mt-4">
          {t('hero.subtitle')}
        </p>
        <Link to="/catalog" data-testid="about-hero-cta" className="mt-6 inline-block">
          <Button size="lg">{t('hero.cta')}</Button>
        </Link>
      </section>

      {/* Mission / Values */}
      <section data-testid="about-values" className="py-16">
        <h2 className="text-2xl font-bold text-center text-[var(--text-primary)] mb-10">
          {t('values.title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {VALUES.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                data-testid={`about-value-card-${i}`}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center"
              >
                <Icon className="h-10 w-10 text-accent mx-auto mb-4" />
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                  {t(item.titleKey)}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t(item.textKey)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Timeline */}
      <section
        data-testid="about-timeline"
        className="py-16 bg-[var(--bg-sidebar)] rounded-2xl -mx-4 sm:-mx-6 lg:-mx-8 px-4"
      >
        <h2 className="text-2xl font-bold text-center text-[var(--text-primary)] mb-12">
          {t('timeline.title')}
        </h2>

        {/* Desktop timeline */}
        <div className="hidden sm:flex justify-between items-start max-w-4xl mx-auto relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-[var(--timeline-line)]" />
          {MILESTONES.map((m, i) => (
            <div
              key={i}
              data-testid={`about-milestone-${i}`}
              className="flex flex-col items-center text-center w-1/5 relative"
            >
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold z-10">
                {i + 1}
              </div>
              <span className="text-sm font-bold text-[var(--text-primary)] mt-3">{m.year}</span>
              <span className="text-xs text-[var(--text-secondary)] mt-1">{t(m.labelKey)}</span>
            </div>
          ))}
        </div>

        {/* Mobile timeline */}
        <div className="sm:hidden border-l-2 border-accent ml-4 pl-6">
          {MILESTONES.map((m, i) => (
            <div key={i} data-testid={`about-milestone-${i}`} className="relative pb-8">
              <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-accent" />
              <span className="text-sm font-bold text-[var(--text-primary)]">{m.year}</span>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{t(m.labelKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section data-testid="about-team" className="py-16">
        <h2 className="text-2xl font-bold text-center text-[var(--text-primary)] mb-10">
          {t('team.title')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {TEAM.map((member, i) => (
            <div key={i} data-testid={`about-team-member-${i}`} className="text-center">
              <div className="w-24 h-24 rounded-full bg-accent/10 mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl font-bold text-accent">{member.name[0]}</span>
              </div>
              <p className="font-medium text-[var(--text-primary)] text-sm">{member.name}</p>
              <p className="text-xs text-[var(--text-secondary)]">{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
