type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'sale' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  'data-testid'?: string;
}

const styles: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  sale: 'bg-accent text-white',
  default: 'bg-[var(--bg-sidebar)] text-[var(--text-secondary)]',
};

export function Badge({ variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      data-testid={props['data-testid']}
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
