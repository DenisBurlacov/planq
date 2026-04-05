import { useTranslation } from 'react-i18next';

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  'data-testid'?: string;
}

export function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  'data-testid': testId,
}: DateRangeFilterProps) {
  const { t } = useTranslation('common');

  const hasError = dateFrom && dateTo && dateFrom > dateTo;

  const inputCls = `rounded-lg border bg-[var(--bg-card)] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${
    hasError ? 'border-red-500' : 'border-[var(--border)]'
  }`;

  return (
    <div data-testid={testId} className="flex items-end gap-2 flex-wrap">
      <div>
        <label className="text-xs text-[var(--text-secondary)] block mb-1">
          {t('dateRange.from')}
        </label>
        <input
          data-testid={testId ? `${testId}-from` : 'date-from'}
          type="date"
          value={dateFrom}
          max={dateTo || undefined}
          onChange={e => onDateFromChange(e.target.value)}
          className={inputCls}
        />
      </div>
      <div>
        <label className="text-xs text-[var(--text-secondary)] block mb-1">
          {t('dateRange.to')}
        </label>
        <input
          data-testid={testId ? `${testId}-to` : 'date-to'}
          type="date"
          value={dateTo}
          min={dateFrom || undefined}
          onChange={e => onDateToChange(e.target.value)}
          className={inputCls}
        />
      </div>
      {hasError && (
        <p
          data-testid={testId ? `${testId}-error` : 'date-error'}
          className="text-xs text-red-500 self-center"
        >
          {t('dateRange.error')}
        </p>
      )}
    </div>
  );
}
