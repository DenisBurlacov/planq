import { useState, useRef, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productsApi } from '@api/products';
import type { Product } from '@appTypes/api';

interface SearchAutocompleteProps {
  onSearch: (term: string) => void;
  'data-testid'?: string;
}

export function SearchAutocomplete({ onSearch, 'data-testid': testId }: SearchAutocompleteProps) {
  const { t } = useTranslation('catalog');
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const data = await productsApi.list({ search: term, limit: 5, page: 1 });
      setSuggestions(data.items);
      setOpen(data.items.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    onSearch(query);
  };

  const handleSelect = (product: Product) => {
    setOpen(false);
    setQuery('');
    navigate(`/catalog/${product.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i < suggestions.length - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i > 0 ? i - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative" data-testid={testId ?? 'search-autocomplete'}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
          <input
            data-testid="search-autocomplete-input"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder={t('autocomplete.placeholder')}
            aria-label={t('autocomplete.placeholder')}
            aria-expanded={open}
            aria-haspopup="listbox"
            autoComplete="off"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </form>
      {open && (
        <div
          data-testid="search-autocomplete-dropdown"
          role="listbox"
          className="absolute z-50 top-full mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-lg overflow-hidden"
        >
          {loading && (
            <div className="px-4 py-3 text-sm text-[var(--text-secondary)]">
              {t('autocomplete.loading')}
            </div>
          )}
          {!loading && suggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-[var(--text-secondary)]">
              {t('autocomplete.noResults')}
            </div>
          )}
          {suggestions.map((product, i) => (
            <button
              key={product.id}
              data-testid={`suggestion-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onClick={() => handleSelect(product)}
              className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors ${
                i === activeIndex ? 'bg-accent/10' : 'hover:bg-[var(--bg-sidebar)]'
              }`}
            >
              <div className="h-10 w-10 shrink-0 rounded-lg bg-[var(--bg-sidebar)] overflow-hidden">
                {product.images[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {product.name}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {'\u20AC'}
                  {(product.salePrice ?? product.price).toFixed(2)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
