import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Breadcrumb } from '@components/ui/Breadcrumb';
import { DataTable, type Column } from '@components/ui/DataTable';
import { adminApi, type AuditLogQuery } from '@api/admin';
import type { AuditLogEntry } from '@appTypes/api';

export function AdminAuditPage() {
  const { t } = useTranslation('admin');

  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const query: AuditLogQuery = {
    page,
    limit: 20,
    action: actionFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit', query],
    queryFn: () => adminApi.getAuditLog(query),
  });

  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'timestamp',
      header: t('audit.timestamp'),
      render: row => (
        <span className="text-xs font-mono text-[var(--text-secondary)]">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'user',
      header: t('audit.user'),
      render: row => (
        <span className="text-sm font-medium">{row.user?.name ?? row.userName ?? '\u2014'}</span>
      ),
    },
    {
      key: 'action',
      header: t('audit.action'),
      render: row => (
        <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-[var(--bg-sidebar)]">
          {row.action}
        </span>
      ),
    },
    {
      key: 'resource',
      header: t('audit.resource'),
      render: row => <span className="text-sm">{row.resource}</span>,
    },
    {
      key: 'details',
      header: t('audit.details'),
      render: row => (
        <span className="text-xs text-[var(--text-secondary)] truncate max-w-48 block">
          {row.details ?? '-'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[{ label: t('sidebar.dashboard'), to: '/admin' }, { label: t('audit.title') }]}
      />
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">{t('audit.title')}</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          data-testid="audit-filter-action"
          value={actionFilter}
          onChange={e => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label={t('audit.filterAction')}
        >
          <option value="">{t('audit.allActions')}</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="RESTORE">RESTORE</option>
          <option value="BLOCK">BLOCK</option>
          <option value="UNBLOCK">UNBLOCK</option>
        </select>
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--text-secondary)]">{t('audit.dateFrom')}</label>
          <input
            data-testid="audit-filter-date-from"
            type="date"
            value={dateFrom}
            onChange={e => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--text-secondary)]">{t('audit.dateTo')}</label>
          <input
            data-testid="audit-filter-date-to"
            type="date"
            value={dateTo}
            onChange={e => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <DataTable
        data-testid="audit-table"
        columns={columns}
        data={data?.items ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={20}
        totalPages={data?.pages ?? 1}
        loading={isLoading}
        onPageChange={setPage}
        rowKey={row => row.id}
      />
    </div>
  );
}
