import { LayoutGrid, List, ChevronsDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type ViewMode = 'grid' | 'list' | 'loadMore';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  const { t } = useTranslation('catalog');

  return (
    <div
      data-testid="view-toggle"
      className="inline-flex rounded-lg border border-[var(--border)] overflow-hidden"
    >
      <button
        data-testid="view-toggle-grid"
        aria-label={t('viewToggle.grid', { defaultValue: 'Grid view' })}
        aria-pressed={value === 'grid'}
        onClick={() => onChange('grid')}
        className={`p-2 transition-colors ${
          value === 'grid'
            ? 'bg-accent text-white'
            : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        data-testid="view-toggle-list"
        aria-label={t('viewToggle.list', { defaultValue: 'List view' })}
        aria-pressed={value === 'list'}
        onClick={() => onChange('list')}
        className={`p-2 transition-colors ${
          value === 'list'
            ? 'bg-accent text-white'
            : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
      >
        <List className="h-4 w-4" />
      </button>
      <button
        data-testid="view-toggle-load-more"
        aria-label={t('viewToggle.loadMore', { defaultValue: 'Load More' })}
        aria-pressed={value === 'loadMore'}
        onClick={() => onChange('loadMore')}
        className={`p-2 transition-colors ${
          value === 'loadMore'
            ? 'bg-accent text-white'
            : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
      >
        <ChevronsDown className="h-4 w-4" />
      </button>
    </div>
  );
}
