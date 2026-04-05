import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import { useAuthStore } from '@store/auth.store';
import { authApi } from '@api/auth';

export function EmailVerificationBanner() {
  const { t } = useTranslation('common');
  const { user, accessToken } = useAuthStore();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!accessToken || !user || user.emailVerified !== false) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await authApi.resendVerification();
      setSent(true);
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      data-testid="email-verification-banner"
      className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <span
            data-testid="email-verification-banner-text"
            className="text-sm text-yellow-800 dark:text-yellow-200"
          >
            {t('emailVerification.banner')}
          </span>
        </div>
        {sent ? (
          <span
            data-testid="email-verification-banner-sent"
            className="text-xs text-yellow-600 dark:text-yellow-400"
          >
            {t('emailVerification.resent')}
          </span>
        ) : (
          <button
            data-testid="email-verification-banner-resend"
            onClick={handleResend}
            disabled={sending}
            className="text-xs font-medium text-yellow-700 dark:text-yellow-300 hover:underline disabled:opacity-50"
          >
            {t('emailVerification.bannerResend')}
          </button>
        )}
      </div>
    </div>
  );
}
