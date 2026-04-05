import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, LayoutGrid, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { Button } from '@components/ui/Button';

const STORAGE_KEY = 'planq-onboarding-done';

interface Step {
  titleKey: string;
  descKey: string;
  icon: typeof Search;
  targetTestId: string;
}

const STEPS: Step[] = [
  {
    titleKey: 'onboarding.step1Title',
    descKey: 'onboarding.step1Desc',
    icon: Search,
    targetTestId: 'data-onboarding-search',
  },
  {
    titleKey: 'onboarding.step2Title',
    descKey: 'onboarding.step2Desc',
    icon: LayoutGrid,
    targetTestId: 'data-onboarding-categories',
  },
  {
    titleKey: 'onboarding.step3Title',
    descKey: 'onboarding.step3Desc',
    icon: ShoppingBag,
    targetTestId: 'data-onboarding-product',
  },
  {
    titleKey: 'onboarding.step4Title',
    descKey: 'onboarding.step4Desc',
    icon: ShoppingCart,
    targetTestId: 'data-onboarding-cart',
  },
  {
    titleKey: 'onboarding.step5Title',
    descKey: 'onboarding.step5Desc',
    icon: User,
    targetTestId: 'data-onboarding-profile',
  },
];

export function OnboardingTour() {
  const { t } = useTranslation('common');
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) {
        setVisible(true);
      }
    } catch {
      // storage unavailable
    }
  }, []);

  const updateSpotlight = useCallback(() => {
    const targetId = STEPS[step]?.targetTestId;
    if (!targetId) return;
    const el = document.querySelector(`[${targetId}]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      setSpotlightRect(rect);
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setSpotlightRect(null);
    }
  }, [step]);

  useEffect(() => {
    if (!visible) return;
    // Small delay to let DOM settle
    const timer = setTimeout(updateSpotlight, 200);
    return () => clearTimeout(timer);
  }, [visible, step, updateSpotlight]);

  const handleSkip = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      handleSkip();
    }
  }, [step, handleSkip]);

  const handlePrev = useCallback(() => {
    if (step > 0) {
      setStep(s => s - 1);
    }
  }, [step]);

  if (!visible) return null;

  const currentStep = STEPS[step];
  const StepIcon = currentStep.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div data-testid="onboarding-tour" className="fixed inset-0 z-[9999]">
      {/* Overlay */}
      <div
        data-testid="onboarding-overlay"
        className="absolute inset-0 bg-black/60 transition-opacity"
        onClick={handleSkip}
      />

      {/* Spotlight highlight */}
      {spotlightRect && (
        <div
          data-testid="onboarding-spotlight"
          className="absolute rounded-lg ring-4 ring-[var(--accent)] ring-offset-2 pointer-events-none z-[10000]"
          style={{
            top: spotlightRect.top - 4,
            left: spotlightRect.left - 4,
            width: spotlightRect.width + 8,
            height: spotlightRect.height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        data-testid="onboarding-tooltip"
        className="absolute z-[10001] w-80 max-w-[90vw] rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-2xl p-6"
        style={{
          top: spotlightRect
            ? Math.min(spotlightRect.bottom + 16, window.innerHeight - 240)
            : '50%',
          left: spotlightRect
            ? Math.max(
                16,
                Math.min(
                  spotlightRect.left + spotlightRect.width / 2 - 160,
                  window.innerWidth - 336
                )
              )
            : '50%',
          transform: spotlightRect ? undefined : 'translate(-50%, -50%)',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-sidebar)]">
            <StepIcon className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            {t(currentStep.titleKey)}
          </h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-4">{t(currentStep.descKey)}</p>

        {/* Step indicator dots */}
        <div
          data-testid="onboarding-step-dots"
          className="flex items-center justify-center gap-1.5 mb-4"
        >
          {STEPS.map((_, i) => (
            <div
              key={i}
              data-testid={`onboarding-dot-${i}`}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === step ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-2">
          <button
            data-testid="onboarding-skip"
            onClick={handleSkip}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {t('onboarding.skip')}
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button
                data-testid="onboarding-prev"
                variant="secondary"
                size="sm"
                onClick={handlePrev}
              >
                {t('onboarding.previous')}
              </Button>
            )}
            <Button data-testid="onboarding-next" size="sm" onClick={handleNext}>
              {isLast ? t('onboarding.finish') : t('onboarding.next')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
