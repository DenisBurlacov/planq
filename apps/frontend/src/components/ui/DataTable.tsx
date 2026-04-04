import type { ReactNode } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { Skeleton } from './Skeleton';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  loading?: boolean;
  emptyMessage?: string;
  onPageChange: (page: number) => void;
  onSort?: (key: string, dir: 'asc' | 'desc') => void;
  rowKey: (row: T) => string;
  'data-testid'?: string;
}

export function DataTable<T>({
  columns,
  data,
  total,
  page,
  pageSize,
  totalPages,
  sortKey,
  sortDir,
  loading,
  emptyMessage,
  onPageChange,
  onSort,
  rowKey,
  ...props
}: DataTableProps<T>) {
  const { t } = useTranslation('admin');
  const testId = props['data-testid'];
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const handleSort = (key: string) => {
    if (!onSort) return;
    if (sortKey === key) {
      onSort(key, sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  };

  return (
    <div data-testid={testId} className="rounded-xl border border-[var(--border)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-table-header">
              {columns.map(col => (
                <th
                  key={col.key}
                  data-testid={`table-header-${col.key}`}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${
                    sortKey === col.key
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)]'
                  } ${col.width ?? ''}`}
                >
                  {col.sortable ? (
                    <button
                      data-testid={`table-sort-${col.key}`}
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-[var(--text-primary)]"
                    >
                      {col.header}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 opacity-30" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-[var(--border)]">
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center text-[var(--text-secondary)] py-12"
                >
                  {emptyMessage ?? t('table.empty')}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={rowKey(row)}
                  data-testid={`table-row-${rowKey(row)}`}
                  className={`border-t border-[var(--border)] hover:bg-table-row-hover transition-colors ${
                    i % 2 === 1 ? 'bg-table-stripe' : ''
                  }`}
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-sm text-[var(--text-primary)]">
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && !loading && (
        <div className="px-4 py-3 border-t border-[var(--border)] flex items-center justify-between">
          <span className="text-sm text-[var(--text-secondary)]">
            {t('table.showing', { from, to, total })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              data-testid="table-page-prev"
            >
              ←
            </Button>
            <span
              data-testid="table-page-indicator"
              className="text-sm text-[var(--text-secondary)]"
            >
              {page} / {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              data-testid="table-page-next"
            >
              →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
