import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Download, ChevronDown } from 'lucide-react';
import { Breadcrumb } from '@components/ui/Breadcrumb';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';
import { DataTable, type Column } from '@components/ui/DataTable';
import { useToast } from '@components/ui/Toast';
import { adminApi } from '@api/admin';
import type { Order, OrderStatus } from '@appTypes/api';

const statusVariant: Record<OrderStatus, 'warning' | 'info' | 'success' | 'error'> = {
  PENDING: 'warning',
  PROCESSING: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export function AdminOrdersPage() {
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exportOpen, setExportOpen] = useState(false);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkNewStatus, setBulkNewStatus] = useState<OrderStatus>('PROCESSING');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', page, statusFilter, search, dateFrom, dateTo],
    queryFn: () =>
      adminApi.listOrders({
        page,
        limit: 20,
        status: statusFilter || undefined,
        search: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast('success', t('orders.status'));
    },
    onError: () => toast('error', t('orders.status')),
  });

  const bulkStatusMut = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: OrderStatus }) =>
      adminApi.bulkUpdateOrderStatus(ids, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast('success', t('orders.bulkStatus'));
      setSelectedIds(new Set());
      setBulkStatusOpen(false);
    },
    onError: () => toast('error', t('orders.bulkStatus')),
  });

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      await adminApi.exportOrders(format, {
        status: statusFilter || undefined,
        search: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setExportOpen(false);
    } catch {
      toast('error', t('orders.export'));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!data) return;
    if (selectedIds.size === data.items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.items.map(o => o.id)));
    }
  };

  const columns: Column<Order>[] = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          data-testid="select-all-orders"
          checked={data ? selectedIds.size === data.items.length && data.items.length > 0 : false}
          onChange={toggleSelectAll}
          className="rounded"
        />
      ) as unknown as string,
      width: 'w-8',
      render: row => (
        <input
          type="checkbox"
          data-testid={`select-order-${row.id}`}
          checked={selectedIds.has(row.id)}
          onChange={() => toggleSelect(row.id)}
          className="rounded"
        />
      ),
    },
    {
      key: 'id',
      header: t('orders.orderId'),
      render: row => <span className="font-mono text-xs">#{row.id.slice(0, 8)}</span>,
    },
    {
      key: 'customer',
      header: t('orders.customer'),
      render: row => row.shippingAddress.split(',')[0] || '\u2014',
    },
    {
      key: 'items',
      header: t('orders.items'),
      render: row => row.items.length,
    },
    {
      key: 'total',
      header: t('orders.total'),
      sortable: true,
      render: row => `\u20AC${row.totalAmount.toFixed(2)}`,
    },
    {
      key: 'status',
      header: t('orders.status'),
      render: row => {
        const transitions = validTransitions[row.status];
        if (transitions.length === 0) {
          return (
            <Badge variant={statusVariant[row.status]} data-testid={`order-badge-${row.id}`}>
              {tc(`status.${row.status}`)}
            </Badge>
          );
        }
        return (
          <select
            data-testid={`order-status-select-${row.id}`}
            value={row.status}
            onChange={e =>
              updateStatusMut.mutate({ id: row.id, status: e.target.value as OrderStatus })
            }
            className="rounded border border-[var(--border)] bg-[var(--bg-card)] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value={row.status}>{tc(`status.${row.status}`)}</option>
            {transitions.map(s => (
              <option key={s} value={s}>
                {tc(`status.${s}`)}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      key: 'date',
      header: t('orders.date'),
      sortable: true,
      render: row => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[{ label: t('sidebar.dashboard'), to: '/admin' }, { label: t('orders.title') }]}
      />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('orders.title')}</h1>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button
              data-testid="bulk-status-button"
              variant="secondary"
              size="sm"
              onClick={() => setBulkStatusOpen(true)}
            >
              {t('orders.bulkStatus')} ({selectedIds.size})
            </Button>
          )}
          <div className="relative">
            <Button
              data-testid="export-button"
              variant="secondary"
              size="sm"
              onClick={() => setExportOpen(!exportOpen)}
            >
              <Download className="h-4 w-4" /> {t('orders.export')}{' '}
              <ChevronDown className="h-3 w-3" />
            </Button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-lg z-50">
                <button
                  data-testid="export-csv"
                  onClick={() => handleExport('csv')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-sidebar)] rounded-t-xl"
                >
                  {t('orders.exportCsv')}
                </button>
                <button
                  data-testid="export-pdf"
                  onClick={() => handleExport('pdf')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-sidebar)] rounded-b-xl"
                >
                  {t('orders.exportPdf')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          data-testid="order-filter-status"
          value={statusFilter}
          onChange={e => {
            setStatusFilter(e.target.value as OrderStatus | '');
            setPage(1);
          }}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label={t('orders.filterStatus')}
        >
          <option value="">{t('orders.allStatuses')}</option>
          {(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map(
            s => (
              <option key={s} value={s}>
                {tc(`status.${s}`)}
              </option>
            )
          )}
        </select>
        <input
          data-testid="order-filter-search"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder={t('orders.search')}
          className="flex-1 min-w-48 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label={t('orders.search')}
        />
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--text-secondary)]">{t('orders.dateFrom')}</label>
          <input
            data-testid="order-filter-date-from"
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
          <label className="text-xs text-[var(--text-secondary)]">{t('orders.dateTo')}</label>
          <input
            data-testid="order-filter-date-to"
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
        data-testid="orders-table"
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

      {/* Bulk Status Update Modal */}
      <Modal
        open={bulkStatusOpen}
        title={t('orders.bulkStatus')}
        confirmLabel={tc('actions.save')}
        cancelLabel={tc('actions.cancel')}
        onConfirm={() =>
          bulkStatusMut.mutate({ ids: Array.from(selectedIds), status: bulkNewStatus })
        }
        onCancel={() => setBulkStatusOpen(false)}
      >
        <p className="mb-4">
          {t('orders.bulkStatusConfirm', {
            count: selectedIds.size,
            status: tc(`status.${bulkNewStatus}`),
          })}
        </p>
        <select
          data-testid="bulk-status-select"
          value={bulkNewStatus}
          onChange={e => setBulkNewStatus(e.target.value as OrderStatus)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map(
            s => (
              <option key={s} value={s}>
                {tc(`status.${s}`)}
              </option>
            )
          )}
        </select>
      </Modal>
    </div>
  );
}
