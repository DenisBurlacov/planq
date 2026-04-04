import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Badge } from '@components/ui/Badge';
import { Skeleton } from '@components/ui/Skeleton';
import { CopyButton } from '@components/ui/CopyButton';
import { ordersApi } from '@api/orders';
import { useAuthStore } from '@store/auth.store';
import { useWebSocket } from '@ws/useWebSocket';
import type { WsMessage, OrderStatusPayload, OrderStatus } from '@appTypes/api';

const statusVariant: Record<OrderStatus, 'success' | 'info' | 'warning' | 'default' | 'error'> = {
  DELIVERED: 'success',
  PROCESSING: 'info',
  SHIPPED: 'warning',
  PENDING: 'default',
  CANCELLED: 'error',
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('common');
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id ?? ''),
    enabled: !!id,
  });

  useWebSocket({
    token: accessToken,
    enabled: !!id,
    onMessage: (msg: WsMessage) => {
      if (msg.event === 'order.status.updated') {
        const payload = msg.payload as OrderStatusPayload;
        if (payload.orderId === id) {
          void qc.invalidateQueries({ queryKey: ['order', id] });
        }
      }
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  if (!order) return null;

  return (
    <div data-testid="order-detail">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {t('orderDetail.title')}
          </h1>
          <div className="flex items-center gap-1 mt-1">
            <p className="text-sm font-mono text-[var(--text-secondary)]">{order.id}</p>
            <CopyButton text={order.id} data-testid="copy-order-id" />
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <Badge data-testid="order-status" variant={statusVariant[order.status]}>
          {t(`status.${order.status}`)}
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="font-semibold text-[var(--text-primary)] mb-3">
            {t('orderDetail.items')}
          </h2>
          <div className="space-y-3">
            {order.items.map(item => (
              <div
                key={item.id}
                className="flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
              >
                <div className="h-16 w-16 shrink-0 rounded-lg bg-[var(--bg-sidebar)] overflow-hidden">
                  {item.product.images[0] && (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-1 justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {t('orderDetail.qty')}: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium text-[var(--text-primary)]">
                    €{(item.priceAtOrder * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 space-y-3">
            <h2 className="font-semibold text-[var(--text-primary)]">{t('orderDetail.summary')}</h2>
            <div className="text-sm text-[var(--text-secondary)] space-y-1">
              <div className="flex justify-between">
                <span>{t('orderDetail.payment')}</span>
                <span>{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('orderDetail.address')}</span>
                <span className="text-right max-w-32 truncate">{order.shippingAddress}</span>
              </div>
            </div>
            <div className="border-t border-[var(--border)] pt-2 flex justify-between font-bold text-[var(--text-primary)]">
              <span>{t('orderDetail.total')}</span>
              <span>€{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
