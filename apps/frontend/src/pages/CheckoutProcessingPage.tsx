import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@store/auth.store';
import { useWebSocket } from '@ws/useWebSocket';
import type { WsMessage, PaymentResultPayload } from '@appTypes/api';

export function CheckoutProcessingPage() {
  const { t } = useTranslation('checkout');
  const { accessToken } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = (location.state as { orderId?: string })?.orderId;
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!orderId) {
      navigate('/cart', { replace: true });
    }
  }, [orderId, navigate]);

  // Animated dots
  useEffect(() => {
    const timer = setInterval(() => {
      setDots(d => (d.length >= 3 ? '' : d + '.'));
    }, 500);
    return () => clearInterval(timer);
  }, []);

  useWebSocket({
    token: accessToken,
    enabled: !!orderId,
    onMessage: (msg: WsMessage) => {
      if (msg.event === 'payment.result') {
        const payload = msg.payload as PaymentResultPayload;
        if (payload.orderId !== orderId) return;

        if (payload.status === 'success') {
          navigate(`/checkout/success?orderId=${orderId}`, { replace: true });
        } else {
          navigate('/checkout/failed', {
            state: { reason: payload.reason },
            replace: true,
          });
        }
      }
    },
  });

  return (
    <div
      data-testid="processing-page"
      className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center px-4"
    >
      {/* Spinner */}
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 rounded-full border-4 border-[var(--border)]" />
        <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin" />
      </div>

      <div>
        <h1
          data-testid="processing-title"
          className="text-2xl font-bold text-[var(--text-primary)]"
        >
          {t('processing.title')}
        </h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          {t('processing.subtitle')}
          {dots}
        </p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">{t('processing.doNotClose')}</p>
      </div>
    </div>
  );
}
