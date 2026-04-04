import type { ReactNode } from 'react';
import { Skeleton } from './Skeleton';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: ReactNode;
  loading?: boolean;
  'data-testid'?: string;
}

export function StatCard({ label, value, change, icon, loading, ...props }: StatCardProps) {
  const testId = props['data-testid'];

  if (loading) {
    return (
      <div
        data-testid={testId}
        className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-5"
      >
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="mt-3 h-4 w-24" />
        <Skeleton className="mt-2 h-7 w-20" />
      </div>
    );
  }

  return (
    <div
      data-testid={testId}
      className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-5"
    >
      {icon && (
        <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
        {change !== undefined && change !== 0 && (
          <span
            data-testid="stat-change"
            className={change > 0 ? 'text-sm text-stat-positive' : 'text-sm text-stat-negative'}
          >
            {change > 0 ? '▲' : '▼'} {change > 0 ? '+' : ''}
            {change.toFixed(1)}%
          </span>
        )}
      </div>
      <div data-testid="stat-value" className="text-2xl font-bold text-[var(--text-primary)]">
        {value}
      </div>
    </div>
  );
}
