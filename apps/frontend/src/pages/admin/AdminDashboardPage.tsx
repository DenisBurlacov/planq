import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, DollarSign, Clock, Users } from 'lucide-react';
import { StatCard } from '@components/ui/StatCard';
import { DataTable, type Column } from '@components/ui/DataTable';
import { Breadcrumb } from '@components/ui/Breadcrumb';
import { Badge } from '@components/ui/Badge';
import { adminApi } from '@api/admin';
import type { Order, OrderStatus } from '@appTypes/api';

const statusVariant: Record<OrderStatus, 'warning' | 'info' | 'success' | 'error'> = {
  PENDING: 'warning',
  PROCESSING: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

export function AdminDashboardPage() {
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.getStats,
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin', 'orders', 'recent'],
    queryFn: () => adminApi.listOrders({ page: 1, limit: 10 }),
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
      key: 'total',
      header: t('orders.total'),
      render: row => `€${row.totalAmount.toFixed(2)}`,
    },
    {
      key: 'status',
      header: t('orders.status'),
      render: row => (
        <Badge variant={statusVariant[row.status]} data-testid={`order-badge-${row.id}`}>
          {tc(`status.${row.status}`)}
        </Badge>
      ),
    },
    {
      key: 'date',
      header: t('orders.date'),
      render: row => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: t('sidebar.dashboard') }]} />
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">{t('dashboard.title')}</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatCard
          data-testid="stat-card-total-orders"
          label={t('dashboard.totalOrders')}
          value={stats?.totalOrders.toLocaleString() ?? '—'}
          change={stats?.totalOrdersChange}
          icon={<ShoppingCart className="h-5 w-5" />}
          loading={statsLoading}
        />
        <StatCard
          data-testid="stat-card-revenue-today"
          label={t('dashboard.revenueToday')}
          value={stats ? `€${stats.revenueToday.toLocaleString()}` : '—'}
          change={stats?.revenueTodayChange}
          icon={<DollarSign className="h-5 w-5" />}
          loading={statsLoading}
        />
        <StatCard
          data-testid="stat-card-pending-orders"
          label={t('dashboard.pendingOrders')}
          value={stats?.pendingOrders.toLocaleString() ?? '—'}
          change={stats?.pendingOrdersChange}
          icon={<Clock className="h-5 w-5" />}
          loading={statsLoading}
        />
        <StatCard
          data-testid="stat-card-active-users"
          label={t('dashboard.activeUsers')}
          value={stats?.activeUsers.toLocaleString() ?? '—'}
          change={stats?.activeUsersChange}
          icon={<Users className="h-5 w-5" />}
          loading={statsLoading}
        />
      </div>

      {/* Recent Orders */}
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        {t('dashboard.recentOrders')}
      </h2>
      <DataTable
        data-testid="recent-orders-table"
        columns={columns}
        data={recentOrders?.items ?? []}
        total={recentOrders?.total ?? 0}
        page={1}
        pageSize={10}
        totalPages={1}
        loading={ordersLoading}
        onPageChange={() => {}}
        rowKey={row => row.id}
      />
    </div>
  );
}
