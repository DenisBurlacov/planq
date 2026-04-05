import type { LucideIcon } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaTo?: string;
  'data-testid'?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaTo,
  'data-testid': testId,
}: EmptyStateProps) {
  return (
    <div
      data-testid={testId ?? 'empty-state'}
      className="flex flex-col items-center justify-center py-24 gap-4"
    >
      <div className="flex items-center justify-center w-24 h-24 rounded-full bg-[var(--bg-sidebar)]">
        <Icon className="h-12 w-12 text-[var(--text-secondary)] opacity-60" strokeWidth={1.2} />
      </div>
      <h2 className="text-xl font-bold text-[var(--text-primary)] text-center">{title}</h2>
      {description && (
        <p className="text-sm text-[var(--text-secondary)] text-center max-w-sm">{description}</p>
      )}
      {ctaLabel && ctaTo && (
        <Link to={ctaTo}>
          <Button data-testid="empty-state-cta">{ctaLabel}</Button>
        </Link>
      )}
    </div>
  );
}
