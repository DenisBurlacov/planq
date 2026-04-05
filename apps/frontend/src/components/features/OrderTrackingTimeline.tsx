import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react';
import type { OrderStatus } from '@appTypes/api';

interface OrderTrackingTimelineProps {
  status: OrderStatus;
  createdAt: string;
}

const STEPS: { key: string; status: string }[] = [
  { key: 'ordered', status: 'ORDERED' },
  { key: 'confirmed', status: 'CONFIRMED' },
  { key: 'shipped', status: 'SHIPPED' },
  { key: 'inTransit', status: 'IN_TRANSIT' },
  { key: 'outForDelivery', status: 'OUT_FOR_DELIVERY' },
  { key: 'delivered', status: 'DELIVERED' },
];

function getCompletedIndex(status: OrderStatus): number {
  const map: Record<string, number> = {
    PENDING: 0,
    PROCESSING: 1,
    SHIPPED: 2,
    DELIVERED: 5,
    CANCELLED: -1,
  };
  return map[status] ?? -1;
}

function getEstimatedTimestamp(createdAt: string, stepIndex: number): string | null {
  if (stepIndex === 0) return createdAt;
  const base = new Date(createdAt);
  const offsets = [0, 0.5, 1, 2, 4, 5]; // days offset from creation
  const d = new Date(base.getTime() + offsets[stepIndex] * 24 * 60 * 60 * 1000);
  return d.toISOString();
}

export function OrderTrackingTimeline({ status, createdAt }: OrderTrackingTimelineProps) {
  const { t } = useTranslation('common');

  const isCancelled = status === 'CANCELLED';
  const completedIdx = getCompletedIndex(status);

  return (
    <div data-testid="tracking-timeline" className="py-4">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
        {t('tracking.title')}
      </h3>
      <div className="relative ml-3">
        {STEPS.map((step, i) => {
          const isCompleted = !isCancelled && i <= completedIdx;
          const isCurrent = !isCancelled && i === completedIdx;
          const isCancelPoint = isCancelled && i === 1; // cancelled after confirmed

          const timestamp =
            isCompleted || isCancelPoint ? getEstimatedTimestamp(createdAt, i) : null;

          return (
            <div
              key={step.key}
              data-testid={`tracking-step-${step.status.toLowerCase().replace('_', '-')}`}
              className="relative flex gap-4 pb-6 last:pb-0"
            >
              {/* Vertical line */}
              {i < STEPS.length - 1 && (
                <div
                  className={`absolute left-[9px] top-5 w-0.5 h-full ${
                    isCancelled && i >= 1
                      ? 'border-l-2 border-dashed border-[var(--border)]'
                      : isCompleted && i < completedIdx
                        ? 'bg-green-500'
                        : 'border-l-2 border-dashed border-[var(--border)]'
                  }`}
                />
              )}

              {/* Circle */}
              <div className="relative z-10 shrink-0">
                {isCancelPoint ? (
                  <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                    <X className="h-3 w-3 text-white" />
                  </div>
                ) : isCompleted ? (
                  <div
                    className={`h-5 w-5 rounded-full flex items-center justify-center ${
                      isCurrent ? 'bg-accent animate-pulse ring-4 ring-accent/20' : 'bg-green-500'
                    }`}
                  >
                    {!isCurrent && <Check className="h-3 w-3 text-white" />}
                    {isCurrent && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-dashed border-[var(--border)] bg-[var(--bg-card)]" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 -mt-0.5">
                <p
                  className={`text-sm font-medium ${
                    isCancelPoint
                      ? 'text-red-500'
                      : isCompleted
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {isCancelPoint ? t('tracking.cancelled') : t(`tracking.steps.${step.key}`)}
                </p>
                {timestamp && (
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {new Date(timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
