import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { CheckCircle } from 'lucide-react';

export function ForgotPasswordPage() {
  const { t } = useTranslation('profile');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulated — no real reset email in this demo
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{t('auth.resetSent')}</h2>
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
            {t('auth.resetPassword')}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              label={t('auth.email')}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              {t('auth.resetPassword')}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm">
            <Link to="/login" className="text-accent hover:underline">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
