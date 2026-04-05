import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { SESSION_EXPIRED_EVENT } from '@api/client';

export function SessionExpiredModal() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(true);
    window.addEventListener(SESSION_EXPIRED_EVENT, handler);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
  }, []);

  if (!visible) return null;

  return (
    <div
      data-testid="session-expired-overlay"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
    >
      <div
        data-testid="session-expired-modal"
        className="w-full max-w-sm rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-8 shadow-xl mx-4 text-center"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <LogIn className="h-7 w-7 text-accent" />
        </div>
        <h2
          data-testid="session-expired-title"
          className="text-lg font-bold text-[var(--text-primary)] mb-2"
        >
          {t('sessionExpired.title')}
        </h2>
        <p
          data-testid="session-expired-message"
          className="text-sm text-[var(--text-secondary)] mb-6"
        >
          {t('sessionExpired.message')}
        </p>
        <Button
          data-testid="session-expired-signin"
          className="w-full"
          onClick={() => {
            setVisible(false);
            navigate('/login');
          }}
        >
          {t('sessionExpired.signIn')}
        </Button>
      </div>
    </div>
  );
}
