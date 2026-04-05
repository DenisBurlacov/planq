import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { StatCard } from '@components/ui/StatCard';
import { adminApi } from '@api/admin';

export function AdminStatsPage() {
  const { t } = useTranslation('admin');

  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 86400000);
  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(today.toISOString().split('T')[0]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders-stats', dateFrom, dateTo],
    queryFn: () => adminApi.listOrders({ limit: 100, dateFrom, dateTo }),
  });

  const stats = useMemo(() => {
    const items = orders?.items ?? [];
    const completed = items.filter(o => o.status === 'DELIVERED' || o.status === 'SHIPPED');
    const totalRevenue = completed.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = items.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Revenue by day (last 7 days)
    const revenueByDay: { date: string; day: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dayOrders = items.filter(o => o.createdAt.startsWith(dateStr));
      const amount = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      revenueByDay.push({
        date: dateStr,
        day: d.toLocaleDateString('en', { weekday: 'short' }),
        amount,
      });
    }
    const maxRevenue = Math.max(...revenueByDay.map(d => d.amount), 1);

    // Top products
    const productRevenue: Record<string, { name: string; revenue: number }> = {};
    items.forEach(order => {
      order.items.forEach(item => {
        const key = item.productId;
        if (!productRevenue[key]) productRevenue[key] = { name: item.product.name, revenue: 0 };
        productRevenue[key].revenue += item.priceAtOrder * item.quantity;
      });
    });
    const topProducts = Object.values(productRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    const maxProductRevenue = Math.max(...topProducts.map(p => p.revenue), 1);

    // Orders by status
    const statusCounts: Record<string, number> = {};
    items.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });
    const statusColors: Record<string, string> = {
      PENDING: '#f59e0b',
      PROCESSING: '#3b82f6',
      SHIPPED: '#8b5cf6',
      DELIVERED: '#10b981',
      CANCELLED: '#ef4444',
    };

    let cumAngle = 0;
    const statusSegments = Object.entries(statusCounts).map(([status, count]) => {
      const pct = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
      const start = cumAngle;
      cumAngle += (pct / 100) * 360;
      return { status, count, pct, start, end: cumAngle, color: statusColors[status] || '#6b7280' };
    });

    const conicGradient =
      statusSegments.length > 0
        ? statusSegments.map(s => `${s.color} ${s.start}deg ${s.end}deg`).join(', ')
        : 'var(--border) 0deg 360deg';

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      revenueByDay,
      maxRevenue,
      topProducts,
      maxProductRevenue,
      statusSegments,
      conicGradient,
    };
  }, [orders, today]);

  const inputCls =
    'rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-accent';

  return (
    <div data-testid="admin-stats-page">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1
          data-testid="admin-stats-title"
          className="text-xl font-bold text-[var(--text-primary)]"
        >
          {t('stats.title')}
        </h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--text-secondary)]">{t('stats.dateFrom')}</label>
          <input
            data-testid="admin-stats-date-from"
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className={inputCls}
          />
          <label className="text-sm text-[var(--text-secondary)]">{t('stats.dateTo')}</label>
          <input
            data-testid="admin-stats-date-to"
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          data-testid="admin-stats-revenue-card"
          label={t('stats.totalRevenue')}
          value={`€${stats.totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="h-5 w-5" />}
          loading={isLoading}
        />
        <StatCard
          data-testid="admin-stats-orders-card"
          label={t('stats.totalOrders')}
          value={stats.totalOrders}
          icon={<ShoppingCart className="h-5 w-5" />}
          loading={isLoading}
        />
        <StatCard
          data-testid="admin-stats-avg-order-card"
          label={t('stats.avgOrderValue')}
          value={`€${stats.avgOrderValue.toFixed(2)}`}
          icon={<TrendingUp className="h-5 w-5" />}
          loading={isLoading}
        />
        <StatCard
          data-testid="admin-stats-conversion-card"
          label={t('stats.conversionRate')}
          value="3.2%"
          icon={<Users className="h-5 w-5" />}
          loading={isLoading}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart — Revenue by Day */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
            {t('stats.revenueByDay')}
          </h3>
          <div data-testid="admin-stats-revenue-chart" className="flex items-end gap-2 h-48">
            {stats.revenueByDay.map((d, i) => {
              const heightPct = stats.maxRevenue > 0 ? (d.amount / stats.maxRevenue) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    data-testid={`admin-stats-revenue-bar-${i}`}
                    className="w-full bg-accent rounded-t-md transition-all duration-300 hover:bg-accent-hover relative group"
                    style={{ height: `${Math.max(heightPct, 2)}%` }}
                  >
                    <span className="pointer-events-none absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {d.date}: €{d.amount.toFixed(0)}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--text-secondary)]">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Donut Chart — Orders by Status */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
            {t('stats.ordersByStatus')}
          </h3>
          <div data-testid="admin-stats-status-chart" className="flex flex-col items-center">
            <div
              className="relative h-48 w-48 rounded-full mx-auto"
              style={{ background: `conic-gradient(${stats.conicGradient})` }}
            >
              <div className="absolute inset-[20%] rounded-full bg-[var(--bg-card)]" />
            </div>
            <div
              data-testid="admin-stats-status-legend"
              className="flex flex-wrap justify-center gap-3 mt-4"
            >
              {stats.statusSegments.map(s => (
                <div key={s.status} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-[var(--text-secondary)]">
                    {s.status} ({s.count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Horizontal Bar Chart — Top Products */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
            {t('stats.topProducts')}
          </h3>
          <div data-testid="admin-stats-top-products">
            {stats.topProducts.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">{t('stats.noData')}</p>
            ) : (
              stats.topProducts.map((p, i) => {
                const widthPct = (p.revenue / stats.maxProductRevenue) * 100;
                return (
                  <div
                    key={i}
                    data-testid={`admin-stats-top-product-${i}`}
                    className="flex items-center gap-3 mb-3"
                  >
                    <span className="w-40 text-sm text-[var(--text-primary)] truncate shrink-0">
                      {p.name}
                    </span>
                    <div className="flex-1 h-6 bg-accent/20 rounded-md relative">
                      <div
                        className="h-full bg-accent rounded-md"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                    <span className="text-xs text-[var(--text-secondary)] ml-2 shrink-0">
                      €{p.revenue.toFixed(0)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
