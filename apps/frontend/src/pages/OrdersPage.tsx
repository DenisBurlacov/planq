import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Package } from 'lucide-react';
import { Badge } from '@components/ui/Badge';
import { Skeleton } from '@components/ui/Skeleton';
import { EmptyState } from '@components/ui/EmptyState';
import { ordersApi } from '@api/orders';
import type { OrderStatus } from '@appTypes/api';

const statusVariant: Record<OrderStatus, 'success' | 'info' | 'warning' | 'default' | 'error'> = {
  DELIVERED: 'success',
  PROCESSING: 'info',
  SHIPPED: 'warning',
  PENDING: 'default',
  CANCELLED: 'error',
};

export function OrdersPage() {
  const { t } = useTranslation('common');
  const { t: tp } = useTranslation('profile');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['orders', dateFrom, dateTo],
    queryFn: () => ordersApi.list({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
        {t('ordersPage.title')}
      </h1>

      {/* Date Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--text-secondary)]">{tp('orders.dateFrom')}</label>
          <input
            data-testid="orders-date-from"
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--text-secondary)]">{tp('orders.dateTo')}</label>
          <input
            data-testid="orders-date-to"
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {!data?.items.length ? (
        <EmptyState
          icon={Package}
          title={t('ordersPage.empty')}
          description={t('ordersPage.emptyDesc')}
          ctaLabel={t('ordersPage.browseCatalog')}
          ctaTo="/catalog"
          data-testid="empty-state"
        />
      ) : (
        <div data-testid="orders-list" className="space-y-4">
          {data.items.map(order => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block"
              data-testid="order-item"
            >
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 hover:border-accent transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-[var(--text-secondary)] font-mono">
                      {order.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariant[order.status]}>
                      {t(`status.${order.status}`)}
                    </Badge>
                    <span className="font-bold text-[var(--text-primary)]">
                      {'\u20AC'}
                      {order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {order.items.slice(0, 3).map(item => (
                    <div
                      key={item.id}
                      className="h-12 w-12 rounded-lg bg-[var(--bg-sidebar)] overflow-hidden"
                    >
                      {item.product.images[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="h-12 w-12 rounded-lg bg-[var(--bg-sidebar)] flex items-center justify-center text-xs text-[var(--text-secondary)]">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
