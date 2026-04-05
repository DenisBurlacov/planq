import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ProductCardSkeleton } from '@components/ui/Skeleton';

/* ── Delayed Subscribe Button ──────────────────────────────────────────── */
function DelayedButton() {
  const { t } = useTranslation('catalog');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const delay = 1000 + Math.random() * 4000; // 1-5s
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div data-testid="flaky-delayed-button-wrapper" className="min-h-[48px]">
      {visible ? (
        <button
          data-testid="flaky-delayed-button"
          onClick={() => {
            /* no-op */
          }}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
        >
          {t('home.flakyZone.subscribe', { ns: 'catalog' })}
        </button>
      ) : (
        <div
          data-testid="flaky-delayed-button-placeholder"
          className="h-10 w-32 rounded-lg bg-[var(--bg-sidebar)] animate-pulse"
        />
      )}
    </div>
  );
}

/* ── Intermittent Banner ──────────────────────────────────────────────── */
function IntermittentBanner() {
  const { t } = useTranslation('catalog');
  // 70% chance to show
  const [show] = useState(() => Math.random() < 0.7);

  return (
    <div data-testid="flaky-intermittent-banner-wrapper" className="min-h-[56px]">
      {show ? (
        <div
          data-testid="flaky-intermittent-banner"
          className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-[var(--text-primary)]"
        >
          {t('home.flakyZone.bannerText', { ns: 'catalog' })}
        </div>
      ) : (
        <div
          data-testid="flaky-intermittent-banner-hidden"
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-sidebar)] px-4 py-3 text-sm text-[var(--text-secondary)] italic"
        >
          {t('home.flakyZone.bannerHidden', { ns: 'catalog' })}
        </div>
      )}
    </div>
  );
}

/* ── Slow-Loading Section ─────────────────────────────────────────────── */
function SlowLoadingSection() {
  const { t } = useTranslation('catalog');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const delay = 2000 + Math.random() * 2000; // 2-4s
    const timer = setTimeout(() => setLoaded(true), delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div data-testid="flaky-slow-section">
      <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">
        {t('home.flakyZone.recommendations', { ns: 'catalog' })}
      </h4>
      {loaded ? (
        <div
          data-testid="flaky-slow-section-loaded"
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
          {['Alpha', 'Beta', 'Gamma'].map(name => (
            <div
              key={name}
              data-testid={`flaky-slow-product-${name.toLowerCase()}`}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 text-center"
            >
              <div className="h-16 w-full rounded-lg bg-[var(--bg-sidebar)] mb-2" />
              <p className="text-sm font-medium text-[var(--text-primary)]">{name} Chair</p>
              <p className="text-xs text-[var(--text-secondary)]">€149.00</p>
            </div>
          ))}
        </div>
      ) : (
        <div
          data-testid="flaky-slow-section-loading"
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Disappearing Tooltip ─────────────────────────────────────────────── */
function DisappearingTooltip() {
  const { t } = useTranslation('catalog');
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHover = () => {
    setTooltipVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setTooltipVisible(false), 500);
  };

  return (
    <div data-testid="flaky-tooltip-wrapper" className="relative inline-block">
      <button
        data-testid="flaky-tooltip-trigger"
        onMouseEnter={handleHover}
        className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors"
      >
        {t('home.flakyZone.hoverMe', { ns: 'catalog' })}
      </button>
      {tooltipVisible && (
        <div
          data-testid="flaky-tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-card)] text-xs whitespace-nowrap shadow-lg"
        >
          {t('home.flakyZone.tooltipText', { ns: 'catalog' })}
        </div>
      )}
    </div>
  );
}

/* ── Main QA Training Zone ────────────────────────────────────────────── */
export function FlakyElements() {
  const { t } = useTranslation('catalog');

  return (
    <section data-testid="flaky-zone" className="space-y-6">
      <div>
        <h2
          data-testid="flaky-zone-title"
          className="text-xl font-bold text-[var(--text-primary)] mb-1"
        >
          {t('home.flakyZone.title', { ns: 'catalog' })}
        </h2>
        <p
          data-testid="flaky-zone-description"
          className="text-sm text-[var(--text-secondary)] mb-6"
        >
          {t('home.flakyZone.description', { ns: 'catalog' })}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Delayed Button */}
        <div
          data-testid="flaky-delayed-section"
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
        >
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
            {t('home.flakyZone.delayedButtonTitle', { ns: 'catalog' })}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mb-3">
            {t('home.flakyZone.delayedButtonDesc', { ns: 'catalog' })}
          </p>
          <DelayedButton />
        </div>

        {/* Intermittent Banner */}
        <div
          data-testid="flaky-intermittent-section"
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
        >
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
            {t('home.flakyZone.intermittentBannerTitle', { ns: 'catalog' })}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mb-3">
            {t('home.flakyZone.intermittentBannerDesc', { ns: 'catalog' })}
          </p>
          <IntermittentBanner />
        </div>

        {/* Disappearing Tooltip */}
        <div
          data-testid="flaky-tooltip-section"
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
        >
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
            {t('home.flakyZone.disappearingTooltipTitle', { ns: 'catalog' })}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mb-3">
            {t('home.flakyZone.disappearingTooltipDesc', { ns: 'catalog' })}
          </p>
          <DisappearingTooltip />
        </div>
      </div>

      {/* Slow Loading Section */}
      <div
        data-testid="flaky-slow-wrapper"
        className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
      >
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
          {t('home.flakyZone.slowLoadingTitle', { ns: 'catalog' })}
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mb-3">
          {t('home.flakyZone.slowLoadingDesc', { ns: 'catalog' })}
        </p>
        <SlowLoadingSection />
      </div>
    </section>
  );
}
