import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  'data-testid'?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  'data-testid': testId,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filtered = search
    ? options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Focus search input when opening
  useEffect(() => {
    if (open) {
      searchInputRef.current?.focus();
      setActiveIndex(-1);
      setSearch('');
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i < filtered.length - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i > 0 ? i - 1 : filtered.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      onChange(filtered[activeIndex]);
      setOpen(false);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      data-testid={testId ?? 'searchable-select'}
      onKeyDown={handleKeyDown}
    >
      <button
        data-testid="searchable-select-trigger"
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={value ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}>
          {value || placeholder || ''}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-[var(--text-secondary)] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          data-testid="searchable-select-dropdown"
          role="listbox"
          className="absolute z-50 top-full mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-lg overflow-hidden"
        >
          <div className="p-2 border-b border-[var(--border)]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)]" />
              <input
                ref={searchInputRef}
                data-testid="searchable-select-search"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setActiveIndex(-1);
                }}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-sidebar)] pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-[var(--text-secondary)]">-</div>
            ) : (
              filtered.map((option, i) => (
                <button
                  key={option}
                  data-testid={`select-option-${i}`}
                  role="option"
                  aria-selected={option === value}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                    option === value
                      ? 'bg-accent/10 text-accent font-medium'
                      : i === activeIndex
                        ? 'bg-[var(--bg-sidebar)]'
                        : 'hover:bg-[var(--bg-sidebar)] text-[var(--text-primary)]'
                  }`}
                >
                  {option}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
