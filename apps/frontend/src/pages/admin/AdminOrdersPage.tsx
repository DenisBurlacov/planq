import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Breadcrumb } from '@components/ui/Breadcrumb';
import { Badge } from '@components/ui/Badge';
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

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', page, statusFilter, search],
    queryFn: () =>
      adminApi.listOrders({
        page,
        limit: 20,
        status: statusFilter || undefined,
        search: search || undefined,
      }),
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast('success', 'Order status updated');
    },
    onError: () => toast('error', 'Failed to update status'),
  });

  const columns: Column<Order>[] = [
    {
      key: 'id',
      header: t('orders.orderId'),
      render: row => <span className="font-mono text-xs">#{row.id.slice(0, 8)}</span>,
    },
    {
      key: 'customer',
      header: t('orders.customer'),
      render: row => row.shippingAddress.split(',')[0] || '—',
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
      render: row => `€${row.totalAmount.toFixed(2)}`,
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
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">{t('orders.title')}</h1>

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
    </div>
  );
}
