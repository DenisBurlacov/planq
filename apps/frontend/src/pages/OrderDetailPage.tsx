import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Skeleton } from '@components/ui/Skeleton';
import { Modal } from '@components/ui/Modal';
import { OrderTrackingTimeline } from '@components/features/OrderTrackingTimeline';
import { ordersApi } from '@api/orders';
import { useAuthStore } from '@store/auth.store';
import { useToast } from '@components/ui/Toast';
import { useWebSocket } from '@ws/useWebSocket';
import { ApiException } from '@api/client';
import type { WsMessage, OrderStatusPayload, OrderStatus } from '@appTypes/api';

const statusVariant: Record<OrderStatus, 'success' | 'info' | 'warning' | 'default' | 'error'> = {
  DELIVERED: 'success',
  PROCESSING: 'info',
  SHIPPED: 'warning',
  PENDING: 'default',
  CANCELLED: 'error',
};

const CANCEL_REASONS = ['changed_mind', 'found_cheaper', 'duplicate', 'other'] as const;

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('common');
  const { accessToken } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState<string>(CANCEL_REASONS[0]);
  const [cancelling, setCancelling] = useState(false);

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

  const canCancel = order && (order.status === 'PENDING' || order.status === 'PROCESSING');
  const isWalletPayment = order?.paymentMethod === 'WALLET';

  const handleCancel = async () => {
    if (!id) return;
    setCancelling(true);
    try {
      await ordersApi.cancel(id, cancelReason);
      await qc.invalidateQueries({ queryKey: ['order', id] });
      toast('success', t('orderCancel.cancelled'));
      setCancelModalOpen(false);
    } catch (err) {
      toast('error', err instanceof ApiException ? err.message : t('orderCancel.failed'));
    } finally {
      setCancelling(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Order</h1>
          <p className="text-sm font-mono text-[var(--text-secondary)] mt-1">{order.id}</p>
          <p className="text-sm text-[var(--text-secondary)]">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge data-testid="order-status" variant={statusVariant[order.status]}>
            {t(`status.${order.status}`)}
          </Badge>
          {canCancel && (
            <Button
              data-testid="cancel-order-button"
              variant="danger"
              size="sm"
              onClick={() => setCancelModalOpen(true)}
            >
              {t('orderCancel.cancelOrder')}
            </Button>
          )}
        </div>
      </div>

      {/* Order Tracking Timeline */}
      <OrderTrackingTimeline status={order.status} createdAt={order.createdAt} />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="font-semibold text-[var(--text-primary)] mb-3">Items</h2>
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
                    <p className="text-xs text-[var(--text-secondary)]">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-[var(--text-primary)]">
                    &euro;{(item.priceAtOrder * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 space-y-3">
            <h2 className="font-semibold text-[var(--text-primary)]">Summary</h2>
            <div className="text-sm text-[var(--text-secondary)] space-y-1">
              <div className="flex justify-between">
                <span>Payment</span>
                <span>{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Address</span>
                <span className="text-right max-w-32 truncate">{order.shippingAddress}</span>
              </div>
              {order.deliveryMethod && (
                <div className="flex justify-between">
                  <span>{t('checkout:delivery.title', { ns: 'checkout' })}</span>
                  <span>{order.deliveryMethod}</span>
                </div>
              )}
              {order.deliveryCost !== undefined && order.deliveryCost > 0 && (
                <div className="flex justify-between">
                  <span>{t('checkout:delivery.deliveryCost', { ns: 'checkout' })}</span>
                  <span>&euro;{order.deliveryCost.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="border-t border-[var(--border)] pt-2 flex justify-between font-bold text-[var(--text-primary)]">
              <span>Total</span>
              <span>&euro;{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <Modal
        open={cancelModalOpen}
        title={t('orderCancel.cancelTitle')}
        onConfirm={handleCancel}
        onCancel={() => setCancelModalOpen(false)}
        confirmLabel={t('orderCancel.confirm')}
        cancelLabel={t('actions.cancel')}
        danger
        loading={cancelling}
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">{t('orderCancel.cancelMessage')}</p>

          <div>
            <label
              htmlFor="cancel-reason"
              className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide"
            >
              {t('orderCancel.reason')}
            </label>
            <select
              id="cancel-reason"
              data-testid="cancel-reason-select"
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none"
            >
              {CANCEL_REASONS.map(reason => (
                <option key={reason} value={reason}>
                  {t(`orderCancel.reasons.${reason}`)}
                </option>
              ))}
            </select>
          </div>

          {isWalletPayment && (
            <p
              data-testid="cancel-refund-info"
              className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg p-3"
            >
              {t('orderCancel.refundInfo', {
                amount: `\u20AC${order.totalAmount.toFixed(2)}`,
              })}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
