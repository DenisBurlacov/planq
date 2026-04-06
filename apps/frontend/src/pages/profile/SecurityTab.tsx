import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Shield } from 'lucide-react';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';
import { Badge } from '@components/ui/Badge';
import { CopyButton } from '@components/ui/CopyButton';
import { profileApi } from '@api/profile';
import { twoFactorApi } from '@api/twoFactor';
import { ApiException } from '@api/client';

const pwSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
});

type PwForm = z.infer<typeof pwSchema>;

export interface SecurityTabProps {
  toast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export function SecurityTab({ toast }: SecurityTabProps) {
  const { t } = useTranslation('profile');

  // 2FA state
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState<{
    secret: string;
    qrPlaceholder: string;
  } | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [verifying2FA, setVerifying2FA] = useState(false);
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [disabling2FA, setDisabling2FA] = useState(false);

  const { data: twoFactorStatus, refetch: refetch2FA } = useQuery({
    queryKey: ['2fa-status'],
    queryFn: async () => {
      try {
        return await twoFactorApi.status();
      } catch {
        return { enabled: false };
      }
    },
  });

  const pwForm = useForm<PwForm>({ resolver: zodResolver(pwSchema) });

  const onChangePassword = async (data: PwForm) => {
    try {
      await profileApi.changePassword(data.currentPassword, data.newPassword);
      pwForm.reset();
      toast('success', t('toast.passwordChanged'));
    } catch (err) {
      toast(
        'error',
        err instanceof ApiException ? err.message : t('common:errors.generic', { ns: 'common' })
      );
    }
  };

  const handleEnable2FA = async () => {
    try {
      const result = await twoFactorApi.enable();
      setTwoFactorSetup(result);
      setTwoFactorCode('');
      setTwoFactorModalOpen(true);
    } catch (err) {
      toast(
        'error',
        err instanceof ApiException ? err.message : t('common:errors.generic', { ns: 'common' })
      );
    }
  };

  const handleVerify2FASetup = async () => {
    setVerifying2FA(true);
    try {
      await twoFactorApi.verifySetup(twoFactorCode);
      await refetch2FA();
      setTwoFactorModalOpen(false);
      setTwoFactorSetup(null);
      toast('success', t('twoFactor.setupSuccess'));
    } catch (err) {
      toast(
        'error',
        err instanceof ApiException ? err.message : t('common:errors.generic', { ns: 'common' })
      );
    } finally {
      setVerifying2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    setDisabling2FA(true);
    try {
      await twoFactorApi.disable();
      await refetch2FA();
      setDisableModalOpen(false);
      toast('success', t('twoFactor.disableSuccess'));
    } catch (err) {
      toast(
        'error',
        err instanceof ApiException ? err.message : t('common:errors.generic', { ns: 'common' })
      );
    } finally {
      setDisabling2FA(false);
    }
  };

  return (
    <div data-testid="tab-panel-security" className="space-y-6">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
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

      {/* Two-Factor Authentication */}
      <div
        data-testid="2fa-section"
        className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-accent" />
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">{t('twoFactor.title')}</h2>
            <p className="text-sm text-[var(--text-secondary)]">{t('twoFactor.description')}</p>
          </div>
        </div>

        {twoFactorStatus?.enabled ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge>{t('twoFactor.enabled')}</Badge>
            </div>
            <Button
              data-testid="2fa-disable-button"
              variant="danger"
              size="sm"
              onClick={() => setDisableModalOpen(true)}
            >
              {t('twoFactor.disable')}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[var(--text-secondary)]">{t('twoFactor.disabled')}</p>
            <Button data-testid="2fa-enable-button" size="sm" onClick={handleEnable2FA}>
              {t('twoFactor.enable')}
            </Button>
          </div>
        )}
      </div>

      {/* 2FA Enable Modal */}
      <Modal
        open={twoFactorModalOpen}
        title={t('twoFactor.enable')}
        onConfirm={handleVerify2FASetup}
        onCancel={() => {
          setTwoFactorModalOpen(false);
          setTwoFactorSetup(null);
        }}
        confirmLabel={t('twoFactor.verifySetup')}
        cancelLabel={t('common:actions.cancel', { ns: 'common' })}
        loading={verifying2FA}
      >
        <div data-testid="2fa-setup-modal" className="space-y-4">
          {/* Mock QR Code */}
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)] mb-2">
              {t('twoFactor.qrTitle')}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mb-3">
              {t('twoFactor.qrDescription')}
            </p>
            <div
              data-testid="2fa-qr-code"
              className="w-48 h-48 mx-auto rounded-lg bg-[var(--bg-sidebar)] border-2 border-[var(--border)] flex items-center justify-center"
            >
              <div className="text-center">
                <div className="grid grid-cols-5 gap-1 mb-2">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 ${(i + Math.floor(i / 5)) % 3 === 0 ? 'bg-[var(--text-primary)]' : 'bg-transparent'}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-[var(--text-secondary)]">QR Code</span>
              </div>
            </div>
          </div>

          {/* Manual Entry */}
          {twoFactorSetup && (
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                {t('twoFactor.manualEntry')}
              </p>
              <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-sidebar)] p-3">
                <code
                  data-testid="2fa-secret-code"
                  className="text-sm font-mono text-[var(--text-primary)] break-all flex-1"
                >
                  {twoFactorSetup.secret}
                </code>
                <CopyButton text={twoFactorSetup.secret} data-testid="2fa-copy-secret" />
              </div>
            </div>
          )}

          {/* Code Input */}
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] block mb-1">
              {t('twoFactor.enterCode')}
            </label>
            <input
              data-testid="2fa-setup-code-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={twoFactorCode}
              onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={t('twoFactor.codePlaceholder')}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-center text-lg font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
      </Modal>

      {/* 2FA Disable Confirmation Modal */}
      <Modal
        open={disableModalOpen}
        title={t('twoFactor.disable')}
        onConfirm={handleDisable2FA}
        onCancel={() => setDisableModalOpen(false)}
        confirmLabel={t('twoFactor.disable')}
        cancelLabel={t('common:actions.cancel', { ns: 'common' })}
        loading={disabling2FA}
        danger
      >
        <div data-testid="2fa-disable-modal">
          <p>{t('twoFactor.disableConfirm')}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            {t('twoFactor.disableWarning')}
          </p>
        </div>
      </Modal>
    </div>
  );
}
