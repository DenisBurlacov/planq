import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Mail } from 'lucide-react';
import type { Order } from '@appTypes/api';

interface OrderConfirmationEmailProps {
  order: Order;
}

export function OrderConfirmationEmail({ order }: OrderConfirmationEmailProps) {
  const { t } = useTranslation('common');
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      data-testid="order-confirmation-email"
      className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden"
    >
      <button
        data-testid="order-confirmation-email-toggle"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--bg-sidebar)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {t('orderConfirmation.emailPreview')}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-[var(--text-secondary)]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
        )}
      </button>

      {expanded && (
        <div
          data-testid="order-confirmation-email-content"
          className="border-t border-[var(--border)] p-5"
        >
          {/* Mock email */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-sidebar)] p-5 space-y-4">
            <div className="text-center space-y-1">
              <p className="text-xs text-[var(--text-secondary)]">
                {t('orderConfirmation.subject')}
              </p>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                {t('orderConfirmation.greeting')}
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {t('orderConfirmation.orderNumber', { id: order.id.slice(0, 8).toUpperCase() })}
              </p>
            </div>

            <div className="border-t border-[var(--border)] pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-2">
                {t('orderConfirmation.itemsOrdered')}
              </p>
              <div className="space-y-2">
                {order.items.map(item => (
                  <div
                    key={item.id}
                    data-testid="order-confirmation-email-item"
                    className="flex justify-between text-sm"
                  >
                    <span className="text-[var(--text-primary)]">
                      {item.product.name} x{item.quantity}
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      &euro;{(item.priceAtOrder * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-1">
                {t('orderConfirmation.shippingTo')}
              </p>
              <p
                data-testid="order-confirmation-email-address"
                className="text-sm text-[var(--text-primary)]"
              >
                {order.shippingAddress}
              </p>
            </div>

            <div className="border-t border-[var(--border)] pt-3 flex justify-between font-bold text-[var(--text-primary)]">
              <span>{t('orderConfirmation.total')}</span>
              <span data-testid="order-confirmation-email-total">
                &euro;{order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
