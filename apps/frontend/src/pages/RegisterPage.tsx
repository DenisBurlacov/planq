import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { useAuthStore } from '@store/auth.store';
import { authApi } from '@api/auth';
import { useState } from 'react';
import { ApiException } from '@api/client';
import { SocialLoginButtons } from '@components/SocialLoginButtons';
import { hasDangerousContent } from '@utils/validation';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
});
type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const { t } = useTranslation('profile');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    if (hasDangerousContent(data.name)) {
      setServerError(t('common:errors.dangerousContent', { ns: 'common' }));
      return;
    }
    try {
      const res = await authApi.register(data.name, data.email, data.password);
      setAuth(res.accessToken, res.refreshToken, res.user);
      navigate('/verify-email');
    } catch (err) {
      if (err instanceof ApiException) setServerError(err.message);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-8 shadow-sm">
          <h1
            data-testid="register-title"
            className="text-2xl font-bold text-[var(--text-primary)] mb-1"
          >
            {t('auth.registerTitle')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-6">{t('auth.registerSubtitle')}</p>

          <form data-testid="register-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="name"
              data-testid="register-name"
              label={t('auth.name')}
              autoComplete="name"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              id="email"
              data-testid="register-email"
              label={t('auth.email')}
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              id="password"
              data-testid="register-password"
              label={t('auth.password')}
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />

            {serverError && (
              <p data-testid="register-error" className="text-sm text-red-500">
                {serverError}
              </p>
            )}

            <Button
              type="submit"
              data-testid="register-submit"
              loading={isSubmitting}
              className="w-full"
            >
              {t('auth.register')}
            </Button>
          </form>

          <SocialLoginButtons onError={setServerError} />

          <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-accent hover:underline font-medium">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
