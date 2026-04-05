import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface CountdownTimerProps {
  endDate: string | Date;
  onExpire?: () => void;
  'data-testid'?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(endDate: Date): TimeLeft | null {
  const diff = endDate.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function CountdownTimer({ endDate, onExpire, 'data-testid': testId }: CountdownTimerProps) {
  const { t } = useTranslation('catalog');
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calcTimeLeft(end));
  const [expired, setExpired] = useState(false);

  const handleExpire = useCallback(() => {
    setExpired(true);
    onExpire?.();
  }, [onExpire]);

  useEffect(() => {
    if (expired) return;
    const id = setInterval(() => {
      const tl = calcTimeLeft(end);
      if (!tl) {
        clearInterval(id);
        handleExpire();
      } else {
        setTimeLeft(tl);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [end, expired, handleExpire]);

  if (expired || !timeLeft) {
    return (
      <div data-testid={testId ?? 'countdown-timer'} className="text-sm font-medium text-red-500">
        {t('countdown.expired')}
      </div>
    );
  }

  const boxes: { key: string; value: number; label: string; testId: string }[] = [
    { key: 'd', value: timeLeft.days, label: t('countdown.days'), testId: 'countdown-days' },
    { key: 'h', value: timeLeft.hours, label: t('countdown.hours'), testId: 'countdown-hours' },
    {
      key: 'm',
      value: timeLeft.minutes,
      label: t('countdown.minutes'),
      testId: 'countdown-minutes',
    },
    {
      key: 's',
      value: timeLeft.seconds,
      label: t('countdown.seconds'),
      testId: 'countdown-seconds',
    },
  ];

  return (
    <div data-testid={testId ?? 'countdown-timer'} className="flex gap-2">
      {boxes.map(box => (
        <div
          key={box.key}
          data-testid={box.testId}
          className="flex flex-col items-center rounded-lg bg-[var(--bg-sidebar)] border border-[var(--border)] px-2.5 py-1.5 min-w-[48px]"
        >
          <span className="text-lg font-bold text-[var(--text-primary)] tabular-nums">
            {String(box.value).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">
            {box.label}
          </span>
        </div>
      ))}
    </div>
  );
}
