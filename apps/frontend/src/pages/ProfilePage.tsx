import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { Skeleton } from '@components/ui/Skeleton';
import { profileApi } from '@api/profile';
import { useAuthStore } from '@store/auth.store';
import { useToast } from '@components/ui/Toast';
import { ApiException } from '@api/client';

const nameSchema = z.object({ name: z.string().min(2) });
const pwSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
});

type NameForm = z.infer<typeof nameSchema>;
type PwForm = z.infer<typeof pwSchema>;

export function ProfilePage() {
  const { t } = useTranslation('profile');
  const { setUser } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'settings' | 'security'>('settings');

  const { data: profile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: profileApi.get });

  const nameForm = useForm<NameForm>({
    resolver: zodResolver(nameSchema),
    values: { name: profile?.name ?? '' },
  });
  const pwForm = useForm<PwForm>({ resolver: zodResolver(pwSchema) });

  const onSaveName = async (data: NameForm) => {
    try {
      const updated = await profileApi.update({ name: data.name });
      setUser(updated);
      await qc.invalidateQueries({ queryKey: ['profile'] });
      toast('success', 'Profile updated');
    } catch (err) {
      toast('error', err instanceof ApiException ? err.message : 'Failed');
    }
  };

  const onChangePassword = async (data: PwForm) => {
    try {
      await profileApi.changePassword(data.currentPassword, data.newPassword);
      pwForm.reset();
      toast('success', 'Password changed');
    } catch (err) {
      toast('error', err instanceof ApiException ? err.message : 'Failed');
    }
  };

  if (isLoading)
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>

      {/* Wallet card */}
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent/20 p-2.5">
            <Wallet className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)]">{t('wallet.balance')}</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              €{profile?.walletBalance.toFixed(2) ?? '0.00'}
            </p>
          </div>
        </div>
        <Link to="/profile/wallet">
          <Button variant="secondary" size="sm">
            {t('wallet.topUp')}
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div data-testid="profile-tabs" className="flex border-b border-[var(--border)]">
        <button
          data-testid="tab-settings"
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'settings'
              ? 'border-accent text-accent'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          {t('tabs.settings')}
        </button>
        <button
          data-testid="tab-security"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'security'
              ? 'border-accent text-accent'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          {t('tabs.security')}
        </button>
      </div>

      {/* Tab: Settings */}
      {activeTab === 'settings' && (
        <div
          data-testid="tab-panel-settings"
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6"
        >
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">{t('settings')}</h2>
          <form onSubmit={nameForm.handleSubmit(onSaveName)} className="space-y-4">
            <Input
              id="name"
              label={t('form.name')}
              error={nameForm.formState.errors.name?.message}
              {...nameForm.register('name')}
            />
            <Input id="email" label={t('form.email')} value={profile?.email ?? ''} disabled />
            <Button type="submit" size="sm" loading={nameForm.formState.isSubmitting}>
              {t('form.saveChanges')}
            </Button>
          </form>
        </div>
      )}

      {/* Tab: Security */}
      {activeTab === 'security' && (
        <div
          data-testid="tab-panel-security"
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6"
        >
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">
            {t('form.changePassword')}
          </h2>
          <form onSubmit={pwForm.handleSubmit(onChangePassword)} className="space-y-4">
            <Input
              id="currentPassword"
              label={t('form.currentPassword')}
              type="password"
              error={pwForm.formState.errors.currentPassword?.message}
              {...pwForm.register('currentPassword')}
            />
            <Input
              id="newPassword"
              label={t('form.newPassword')}
              type="password"
              error={pwForm.formState.errors.newPassword?.message}
              {...pwForm.register('newPassword')}
            />
            <Button type="submit" size="sm" loading={pwForm.formState.isSubmitting}>
              {t('form.changePassword')}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
