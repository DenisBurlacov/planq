import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { authApi } from '@api/auth';
import { useAuthStore } from '@store/auth.store';

type VerifyState = 'idle' | 'verifying' | 'success' | 'failed';

export function VerifyEmailPage() {
  const { t } = useTranslation('common');
  const [params] = useSearchParams();
  const token = params.get('token');
  const { user } = useAuthStore();
  const [state, setState] = useState<VerifyState>(token ? 'verifying' : 'idle');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    authApi
      .verifyEmail(token)
      .then(() => {
        if (!cancelled) setState('success');
      })
      .catch(() => {
        if (!cancelled) setState('failed');
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendVerification();
      setResent(true);
    } catch {
      // ignore
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-8 shadow-sm text-center">
          {state === 'verifying' && (
            <div data-testid="verify-email-verifying">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                <Mail className="h-7 w-7 text-accent animate-pulse" />
              </div>
              <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                {t('emailVerification.verifying')}
              </h1>
            </div>
          )}

          {state === 'success' && (
            <div data-testid="verify-email-success">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-7 w-7 text-green-500" />
              </div>
              <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                {t('emailVerification.verified')}
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                {t('emailVerification.verifiedDesc')}
              </p>
              <Link to="/">
                <Button data-testid="verify-email-home">{t('errorPages.goHome')}</Button>
              </Link>
            </div>
          )}

          {state === 'failed' && (
            <div data-testid="verify-email-failed">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <XCircle className="h-7 w-7 text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                {t('emailVerification.failed')}
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                {t('emailVerification.failedDesc')}
              </p>
              <Button
                data-testid="verify-email-resend-failed"
                onClick={handleResend}
                disabled={resending}
              >
                {t('emailVerification.resend')}
              </Button>
            </div>
          )}

          {state === 'idle' && (
            <div data-testid="verify-email-idle">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                <Mail className="h-7 w-7 text-accent" />
              </div>
              <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                {t('emailVerification.checkEmail')}
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                {t('emailVerification.checkEmailDesc')}
              </p>

              {/* Mock email preview */}
              <div
                data-testid="verify-email-mock"
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-sidebar)] p-4 text-left mb-6"
              >
                <p className="text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  {t('emailVerification.mockSubject')}
                </p>
                <p className="text-sm text-[var(--text-secondary)] mb-3">
                  {user?.email && (
                    <span className="font-medium text-[var(--text-primary)]">{user.email}</span>
                  )}
                </p>
                <p className="text-sm text-[var(--text-secondary)] mb-3">
                  {t('emailVerification.mockBody')}
                </p>
                <div className="text-center">
                  <span className="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">
                    {t('emailVerification.verifyButton')}
                  </span>
                </div>
              </div>

              {resent ? (
                <p data-testid="verify-email-resent" className="text-sm text-green-600">
                  {t('emailVerification.resent')}
                </p>
              ) : (
                <Button
                  data-testid="verify-email-resend"
                  variant="secondary"
                  onClick={handleResend}
                  loading={resending}
                >
                  {t('emailVerification.resend')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
