import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (value: number) => void;
  color?: 'yellow' | 'green';
  'data-testid'?: string;
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const colorClasses = {
  yellow: { filled: 'fill-yellow-400 text-yellow-400', empty: 'fill-none text-[var(--border)]' },
  green: { filled: 'fill-green-500 text-green-500', empty: 'fill-none text-[var(--border)]' },
};

export function StarRating({
  value,
  max = 5,
  size = 'sm',
  interactive = false,
  onChange,
  color = 'yellow',
  'data-testid': testId,
}: StarRatingProps) {
  const handleClick = (star: number) => {
    if (!interactive || !onChange) return;
    const isFilled = star <= value;
    const newValue = isFilled ? (star - 1 > 0 ? star - 1 : 0) : star;
    onChange(newValue);
  };

  return (
    <div className="flex items-center gap-0.5" data-testid={testId}>
      {Array.from({ length: max }, (_, i) => {
        const star = i + 1;
        const isFilled = star <= Math.round(value);
        const cls = isFilled ? colorClasses[color].filled : colorClasses[color].empty;

        if (interactive) {
          return (
            <button
              key={star}
              type="button"
              data-testid={testId ? `${testId}-${star}` : undefined}
              onClick={() => handleClick(star)}
              className={`p-0.5 transition-colors ${!isFilled ? 'hover:text-amber-300' : ''}`}
            >
              <Star className={`${sizeClasses[size]} ${cls}`} />
            </button>
          );
        }

        return <Star key={star} className={`${sizeClasses[size]} ${cls}`} />;
      })}
    </div>
  );
}
