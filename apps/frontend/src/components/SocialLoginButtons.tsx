import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@store/auth.store';
import { oauthApi } from '@api/oauth';
import { ApiException } from '@api/client';

interface SocialLoginButtonsProps {
  onError?: (msg: string) => void;
}

export function SocialLoginButtons({ onError }: SocialLoginButtonsProps) {
  const { t } = useTranslation('common');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<'google' | 'github' | null>(null);

  const handleOAuth = async (provider: 'google' | 'github') => {
    setLoading(provider);
    try {
      const res = await oauthApi.callback(provider, 'mock');
      setAuth(res.accessToken, res.refreshToken, res.user);
      navigate('/');
    } catch (err) {
      if (err instanceof ApiException) {
        onError?.(err.message);
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div data-testid="social-login-buttons" className="space-y-3">
      <div className="relative flex items-center justify-center py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <span className="relative bg-[var(--bg-card)] px-3 text-xs text-[var(--text-secondary)]">
          {t('oauth.or')}
        </span>
      </div>

      {/* Google */}
      <button
        data-testid="oauth-google"
        onClick={() => handleOAuth('google')}
        disabled={loading !== null}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-[var(--border)] bg-white dark:bg-[var(--bg-sidebar)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[var(--bg-card)] transition-colors disabled:opacity-50"
      >
        {loading === 'google' ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {t('oauth.continueWithGoogle')}
      </button>

      {/* GitHub */}
      <button
        data-testid="oauth-github"
        onClick={() => handleOAuth('github')}
        disabled={loading !== null}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-[var(--border)] bg-[#24292e] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2f363d] transition-colors disabled:opacity-50"
      >
        {loading === 'github' ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        )}
        {t('oauth.continueWithGithub')}
      </button>
    </div>
  );
}
