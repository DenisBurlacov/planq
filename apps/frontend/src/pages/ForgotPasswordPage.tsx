import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { authApi } from '@api/auth';
import { ApiException } from '@api/client';

export function ForgotPasswordPage() {
  const { t } = useTranslation('profile');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBlocked(false);
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      if (err instanceof ApiException) {
        if (err.code === 'TOO_MANY_ATTEMPTS') {
          setBlocked(true);
          setError(err.message);
        } else if (err.code === 'EMAIL_NOT_FOUND') {
          setError(t('auth.emailNotFound'));
        } else {
          setError(err.message);
        }
      } else {
        setError(t('common:errors.generic'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{t('auth.resetSent')}</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-2">{t('auth.resetSentDesc')}</p>
          <Link to="/login" className="mt-4 inline-block text-sm text-accent hover:underline">
            {t('auth.login')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            {t('auth.resetPassword')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-6">{t('auth.resetPasswordDesc')}</p>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="forgot-password-form">
            <Input
              id="email"
              data-testid="forgot-password-email"
              label={t('auth.email')}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              error={error && !blocked ? error : undefined}
            />

            {blocked && (
              <div
                data-testid="forgot-password-blocked"
                className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 p-3"
              >
                <Clock className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    {t('auth.tooManyAttempts')}
                  </p>
                  <p className="text-xs text-red-500 dark:text-red-400/80 mt-1">{error}</p>
                </div>
              </div>
            )}

            {error && !blocked && (
              <div
                data-testid="forgot-password-error"
                className="flex items-center gap-2 text-sm text-red-500"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              data-testid="forgot-password-submit"
              className="w-full"
              loading={loading}
              disabled={blocked}
            >
              {t('auth.sendResetLink')}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm">
            <Link to="/login" className="text-accent hover:underline">
              {t('auth.backToLogin')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
