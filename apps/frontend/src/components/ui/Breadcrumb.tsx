import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav data-testid="breadcrumb" aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-[var(--text-secondary)]">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1" data-testid={`breadcrumb-item-${i}`}>
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="hover:text-[var(--text-primary)] transition-colors truncate max-w-[160px]"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`truncate max-w-[200px] ${isLast ? 'text-[var(--text-primary)] font-medium' : ''}`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
