import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={[
          'w-full rounded-lg border bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent',
          error ? 'border-red-500' : 'border-[var(--border)]',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';
