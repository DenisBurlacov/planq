import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { useAuthStore } from '@store/auth.store';
import { authApi } from '@api/auth';
import { useState } from 'react';
import { ApiException } from '@api/client';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

const DEMO_ACCOUNTS = [
  { email: 'user@planq.dev', password: 'Test1234!', label: 'user (3 orders, wallet)' },
  { email: 'new@planq.dev', password: 'Test1234!', label: 'new user (clean)' },
  { email: 'rich@planq.dev', password: 'Test1234!', label: 'rich (wallet €999)' },
];

export function LoginPage() {
  const { t } = useTranslation('profile');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const showDemo = import.meta.env.VITE_SHOW_TEST_CREDENTIALS === 'true';

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
    try {
      const res = await authApi.login(data.email, data.password);
      setAuth(res.accessToken, res.refreshToken, res.user);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiException) {
        setServerError(err.message);
      }
    }
  };

  const fillDemo = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
  };

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

          {/* Demo accounts */}
          {showDemo && (
            <div data-testid="demo-accounts" className="mt-6 rounded-lg bg-[var(--bg-sidebar)] p-4">
              <p className="text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">
                {t('auth.demoAccounts')}
              </p>
              <div className="space-y-1">
                {DEMO_ACCOUNTS.map(acc => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillDemo(acc.email, acc.password)}
                    className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-[var(--bg-card)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    data-testid={`demo-account-${acc.email.split('@')[0]}`}
                  >
                    <span className="font-medium text-accent">{acc.email}</span>
                    <span className="ml-1 text-[var(--text-secondary)]">— {acc.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
