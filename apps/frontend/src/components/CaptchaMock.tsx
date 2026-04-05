import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';

interface CaptchaMockProps {
  onVerified: (token: string) => void;
}

const GRID_COLORS = [
  'bg-red-400',
  'bg-blue-400',
  'bg-green-400',
  'bg-yellow-400',
  'bg-purple-400',
  'bg-pink-400',
  'bg-orange-400',
  'bg-teal-400',
  'bg-indigo-400',
];

export function CaptchaMock({ onVerified }: CaptchaMockProps) {
  const { t } = useTranslation('profile');
  const [state, setState] = useState<'idle' | 'challenge' | 'verifying' | 'success'>('idle');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const handleCheckboxClick = useCallback(() => {
    if (state === 'success') return;
    setState('challenge');
    setSelected(new Set());
  }, [state]);

  const handleImageClick = useCallback((index: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const handleVerify = useCallback(() => {
    if (selected.size === 0) return;
    setState('verifying');
    setTimeout(() => {
      setState('success');
      onVerified('mock-captcha-token-' + Date.now());
    }, 1000);
  }, [selected, onVerified]);

  if (state === 'success') {
    return (
      <div
        data-testid="captcha-success"
        className="flex items-center gap-3 rounded-lg border border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700 p-3"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-green-500">
          <Check className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm text-green-700 dark:text-green-300 font-medium">
          {t('captcha.verified', { defaultValue: 'Verified' })}
        </span>
      </div>
    );
  }

  if (state === 'challenge' || state === 'verifying') {
    return (
      <div
        data-testid="captcha-challenge"
        className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden"
      >
        <div className="bg-blue-600 text-white px-4 py-2">
          <p className="text-sm font-medium">
            {t('captcha.selectTrafficLights', { defaultValue: 'Select all traffic lights' })}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-1 p-2">
          {GRID_COLORS.map((color, i) => (
            <button
              key={i}
              type="button"
              data-testid={`captcha-image-${i}`}
              onClick={() => handleImageClick(i)}
              className={`aspect-square rounded transition-all ${color} ${
                selected.has(i)
                  ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[var(--bg-card)] opacity-80'
                  : 'hover:opacity-80'
              }`}
              disabled={state === 'verifying'}
            />
          ))}
        </div>
        <div className="px-2 pb-2">
          <button
            type="button"
            data-testid="captcha-verify"
            onClick={handleVerify}
            disabled={selected.size === 0 || state === 'verifying'}
            className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {state === 'verifying'
              ? t('captcha.verifying', { defaultValue: 'Verifying...' })
              : t('captcha.verify', { defaultValue: 'Verify' })}
          </button>
        </div>
      </div>
    );
  }

  // idle state — checkbox
  return (
    <div
      data-testid="captcha-checkbox"
      onClick={handleCheckboxClick}
      className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3 hover:bg-[var(--bg-sidebar)] transition-colors"
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCheckboxClick();
        }
      }}
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-sm border-2 border-[var(--border)] bg-[var(--bg-card)]" />
      <span className="text-sm text-[var(--text-primary)]">
        {t('captcha.notARobot', { defaultValue: "I'm not a robot" })}
      </span>
      <div className="ml-auto flex flex-col items-center">
        <svg className="h-8 w-8 text-[var(--text-secondary)]" viewBox="0 0 64 64">
          <path
            d="M32 2C15.4 2 2 15.4 2 32s13.4 30 30 30 30-13.4 30-30S48.6 2 32 2z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <text x="32" y="38" textAnchor="middle" fontSize="14" fill="currentColor">
            rC
          </text>
        </svg>
        <span className="text-[7px] text-[var(--text-secondary)]">reCAPTCHA</span>
      </div>
    </div>
  );
}
