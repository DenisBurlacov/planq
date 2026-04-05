import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { useAuthStore } from '@store/auth.store';
import { authApi } from '@api/auth';
import { twoFactorApi } from '@api/twoFactor';
import { useState, useCallback } from 'react';
import { ApiException } from '@api/client';
import { SocialLoginButtons } from '@components/SocialLoginButtons';
import { CaptchaMock } from '@components/CaptchaMock';
import { Users, X } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

const DEMO_ACCOUNTS = [
  {
    email: 'alice@example.com',
    password: 'Password1!',
    role: 'USER',
    label: 'Regular user with orders, wallet & reviews',
  },
  {
    email: 'bob@example.com',
    password: 'Password1!',
    role: 'USER',
    label: 'Regular user (clean account)',
  },
  {
    email: 'admin@planq.com',
    password: 'Password1!',
    role: 'ADMIN',
    label: 'Full admin access — manage products, orders, users',
  },
  {
    email: 'manager@planq.com',
    password: 'Password1!',
    role: 'MANAGER',
    label: 'Limited admin — orders & reviews only',
  },
  {
    email: 'blocked@example.com',
    password: 'Password1!',
    role: 'BLOCKED',
    label: 'Blocked account — login should fail',
  },
  {
    email: 'unverified@example.com',
    password: 'Password1!',
    role: 'UNVERIFIED',
    label: 'Unverified email — shows verification banner',
  },
];

export function LoginPage() {
  const { t } = useTranslation('profile');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showAccounts, setShowAccounts] = useState(false);

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [verifying2FA, setVerifying2FA] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    if (!captchaToken) {
      setServerError(t('captcha.required'));
      return;
    }
    try {
      const res = await authApi.login(data.email, data.password, captchaToken);
      if ('requires2FA' in res && res.requires2FA) {
        setRequires2FA(true);
        setTempToken((res as { tempToken: string }).tempToken);
        return;
      }
      if ('accessToken' in res) {
        setAuth(res.accessToken, res.refreshToken, res.user);
        navigate(from, { replace: true });
      }
    } catch (err) {
      if (err instanceof ApiException) {
        setServerError(err.message);
      }
    }
  };

  const handle2FAVerify = useCallback(async () => {
    setServerError('');
    setVerifying2FA(true);
    try {
      const res = await twoFactorApi.verifyLogin(tempToken, twoFactorCode);
      setAuth(res.accessToken, res.refreshToken, res.user);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiException) {
        setServerError(err.message);
      }
    } finally {
      setVerifying2FA(false);
    }
  }, [tempToken, twoFactorCode, from, navigate, setAuth]);

  const fillDemo = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
  };

  // 2FA verification screen
  if (requires2FA) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-8 shadow-sm">
            <h1
              data-testid="2fa-title"
              className="text-2xl font-bold text-[var(--text-primary)] mb-1"
            >
              {t('twoFactor.enterCodeLogin')}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              {t('twoFactor.enterCodeLoginDesc')}
            </p>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="2fa-code"
                  className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                >
                  {t('twoFactor.enterCode')}
                </label>
                <input
                  id="2fa-code"
                  data-testid="2fa-code-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder={t('twoFactor.codePlaceholder')}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-accent"
                  autoFocus
                />
              </div>

              {serverError && (
                <p data-testid="2fa-error" className="text-sm text-red-500">
                  {serverError}
                </p>
              )}

              <Button
                data-testid="2fa-submit"
                onClick={handle2FAVerify}
                loading={verifying2FA}
                disabled={twoFactorCode.length !== 6}
                className="w-full"
              >
                {t('twoFactor.verify')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-8 shadow-sm">
          <h1
            data-testid="login-title"
            className="text-2xl font-bold text-[var(--text-primary)] mb-1"
          >
            {t('auth.loginTitle')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-6">{t('auth.loginSubtitle')}</p>

          <form data-testid="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="email"
              data-testid="login-email"
              label={t('auth.email')}
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              id="password"
              data-testid="login-password"
              label={t('auth.password')}
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            {/* Captcha */}
            <CaptchaMock onVerified={setCaptchaToken} />

            {serverError && (
              <p data-testid="login-error" className="text-sm text-red-500">
                {serverError}
              </p>
            )}

            <Button
              type="submit"
              data-testid="login-submit"
              loading={isSubmitting}
              className="w-full"
            >
              {t('auth.login')}
            </Button>
          </form>

          <SocialLoginButtons onError={setServerError} />

          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-sm text-accent hover:underline">
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
            {t('auth.noAccount')}{' '}
            <Link
              data-testid="register-link"
              to="/register"
              className="text-accent hover:underline font-medium"
            >
              {t('auth.register')}
            </Link>
          </p>

          {/* Test accounts button */}
          <button
            data-testid="show-test-accounts"
            type="button"
            onClick={() => setShowAccounts(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border)] py-2 text-xs text-[var(--text-secondary)] hover:border-accent hover:text-accent transition-colors"
          >
            <Users className="h-3.5 w-3.5" />
            {t('auth.demoAccounts')}
          </button>
        </div>
      </div>

      {/* Sliding drawer with test accounts */}
      {showAccounts && (
        <div className="fixed inset-0 z-50" data-testid="demo-accounts-overlay">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowAccounts(false)} />
          <div
            data-testid="demo-accounts"
            className="absolute right-0 top-0 h-full w-80 bg-[var(--bg-card)] border-l border-[var(--border)] shadow-2xl p-5 overflow-y-auto animate-in slide-in-from-right"
            style={{ animation: 'slideInRight 0.2s ease-out' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--text-primary)]">{t('auth.demoAccounts')}</h3>
              <button
                data-testid="close-test-accounts"
                onClick={() => setShowAccounts(false)}
                className="p-1 rounded hover:bg-[var(--bg-sidebar)] text-[var(--text-secondary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    fillDemo(acc.email, acc.password);
                    setShowAccounts(false);
                  }}
                  className="w-full text-left text-xs px-3 py-2.5 rounded-lg border border-[var(--border)] hover:border-accent/40 hover:bg-accent/5 transition-colors group"
                  data-testid={`demo-account-${acc.email.split('@')[0]}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-accent text-sm">{acc.email}</span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        acc.role === 'ADMIN'
                          ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                          : acc.role === 'MANAGER'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                            : acc.role === 'BLOCKED'
                              ? 'bg-gray-200 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400'
                              : acc.role === 'UNVERIFIED'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                                : 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                      }`}
                    >
                      {acc.role}
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)]">{acc.label}</p>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-lg bg-[var(--bg-sidebar)] p-3">
              <p className="text-xs text-[var(--text-secondary)]">
                <span className="font-medium">{t('auth.demoPassword')}:</span> Password1!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
