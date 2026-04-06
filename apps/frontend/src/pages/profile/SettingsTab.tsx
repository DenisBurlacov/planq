import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { FileUploadZone } from '@components/ui/FileUploadZone';
import { profileApi } from '@api/profile';
import { uploadApi } from '@api/upload';
import { useAuthStore } from '@store/auth.store';
import { ApiException } from '@api/client';
import type { User } from '@appTypes/api';

export interface SettingsTabProps {
  profile: User;
  toast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export function SettingsTab({ profile, toast, onUnsavedChanges }: SettingsTabProps) {
  const { t } = useTranslation('profile');
  const { setUser } = useAuthStore();
  const qc = useQueryClient();

  const [settingsName, setSettingsName] = useState(profile.name);
  const [settingsEmail, setSettingsEmail] = useState(profile.email);
  const [savedSettingsName, setSavedSettingsName] = useState(profile.name);
  const [savedSettingsEmail, setSavedSettingsEmail] = useState(profile.email);
  const [settingsNameError, setSettingsNameError] = useState<string | null>(null);
  const [settingsEmailError, setSettingsEmailError] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const hasUnsavedSettingsChanges =
    settingsName !== savedSettingsName || settingsEmail !== savedSettingsEmail;

  // Sync settings form with profile data
  useEffect(() => {
    setSettingsName(profile.name);
    setSettingsEmail(profile.email);
    setSavedSettingsName(profile.name);
    setSavedSettingsEmail(profile.email);
  }, [profile]);

  // Report unsaved changes to parent
  useEffect(() => {
    onUnsavedChanges(hasUnsavedSettingsChanges);
  }, [hasUnsavedSettingsChanges, onUnsavedChanges]);

  const validateSettingsName = (value: string): string | null => {
    if (value.length < 2) return t('validation.nameMin');
    if (value.length > 15) return t('validation.nameMax');
    if (!/^[a-zA-Z\s\-']+$/.test(value)) return t('validation.nameLatinOnly');
    return null;
  };

  const validateSettingsEmail = (value: string): string | null => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('validation.emailInvalid');
    return null;
  };

  const handleSettingsNameChange = (value: string) => {
    setSettingsName(value);
    setSettingsNameError(value ? validateSettingsName(value) : null);
  };

  const handleSettingsEmailChange = (value: string) => {
    setSettingsEmail(value);
    setSettingsEmailError(value ? validateSettingsEmail(value) : null);
  };

  const onSaveSettings = useCallback(async () => {
    const nameErr = validateSettingsName(settingsName);
    const emailErr = validateSettingsEmail(settingsEmail);
    setSettingsNameError(nameErr);
    setSettingsEmailError(emailErr);
    if (nameErr || emailErr) return;

    setSavingSettings(true);
    try {
      const payload: { name?: string; email?: string } = {};
      if (settingsName !== savedSettingsName) payload.name = settingsName;
      if (settingsEmail !== savedSettingsEmail) payload.email = settingsEmail;
      const updated = await profileApi.update(payload);
      setUser(updated);
      setSavedSettingsName(settingsName);
      setSavedSettingsEmail(settingsEmail);
      await qc.invalidateQueries({ queryKey: ['profile'] });
      toast('success', t('toast.profileUpdated'));
    } catch (err) {
      if (err instanceof ApiException && err.message.includes('already taken')) {
        setSettingsEmailError(t('validation.emailTaken'));
      } else {
        toast(
          'error',
          err instanceof ApiException ? err.message : t('common:errors.generic', { ns: 'common' })
        );
      }
    } finally {
      setSavingSettings(false);
    }
  }, [settingsName, settingsEmail, savedSettingsName, savedSettingsEmail]);

  const handleDiscard = useCallback(() => {
    setSettingsName(savedSettingsName);
    setSettingsEmail(savedSettingsEmail);
    setSettingsNameError(null);
    setSettingsEmailError(null);
  }, [savedSettingsName, savedSettingsEmail]);

  const handleAvatarUpload = async (files: File[]) => {
    if (!files[0]) return;
    setUploadingAvatar(true);
    try {
      const result = await uploadApi.avatar(files[0]);
      if (profile) {
        const updated = { ...profile, avatar: result.url };
        setUser(updated);
      }
      await qc.invalidateQueries({ queryKey: ['profile'] });
      toast('success', t('toast.avatarUpdated'));
    } catch {
      toast('error', t('toast.avatarFailed'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarDelete = async () => {
    try {
      const updated = await profileApi.deleteAvatar();
      setUser(updated);
      await qc.invalidateQueries({ queryKey: ['profile'] });
      toast('success', t('toast.avatarDeleted'));
    } catch {
      toast('error', t('toast.avatarDeleteFailed'));
    }
  };

  // Expose save/discard for parent orchestrator
  // Using a stable ref pattern via the component instance
  useEffect(() => {
    (SettingsTab as unknown as Record<string, unknown>)._save = onSaveSettings;
    (SettingsTab as unknown as Record<string, unknown>)._discard = handleDiscard;
  }, [onSaveSettings, handleDiscard]);

  return (
    <div
      data-testid="tab-panel-settings"
      className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6"
    >
      <h2 className="font-semibold text-[var(--text-primary)] mb-4">{t('settings')}</h2>

      {/* Avatar Upload */}
      <div className="mb-6">
        <label className="text-sm font-medium text-[var(--text-primary)] block mb-2">
          {profile?.avatar ? t('avatar.change') : t('avatar.upload')}
        </label>
        {uploadingAvatar ? (
          <p className="text-sm text-[var(--text-secondary)]">
            {t('common:upload.uploading', { ns: 'common' })}
          </p>
        ) : (
          <FileUploadZone
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            maxSize={2 * 1024 * 1024}
            maxSizeLabel="2MB"
            onUpload={handleAvatarUpload}
            preview={profile?.avatar}
            onRemove={handleAvatarDelete}
            data-testid="avatar-upload"
            data-testid-remove="avatar-delete"
          />
        )}
      </div>

      <div className="space-y-4">
        <Input
          id="name"
          data-testid="profile-name-input"
          label={t('form.name')}
          value={settingsName}
          onChange={e => handleSettingsNameChange(e.target.value)}
          error={settingsNameError ?? undefined}
        />
        <div>
          <Input
            id="email"
            data-testid="profile-email-input"
            label={t('form.email')}
            value={settingsEmail}
            onChange={e => handleSettingsEmailChange(e.target.value)}
            error={settingsEmailError ?? undefined}
          />
          <p className="text-xs text-[var(--text-secondary)] mt-1">{t('form.emailInfo')}</p>
        </div>
        <div className="flex items-center justify-end gap-3">
          {hasUnsavedSettingsChanges && (
            <span
              data-testid="settings-unsaved-indicator"
              className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              {t('settingsTab.unsavedChanges')}
            </span>
          )}
          <Button
            data-testid="save-settings"
            size="sm"
            onClick={onSaveSettings}
            loading={savingSettings}
            variant={hasUnsavedSettingsChanges ? 'primary' : 'secondary'}
          >
            {t('form.saveChanges')}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Static methods for parent orchestrator to call save/discard
SettingsTab.save = async () => {
  const fn = (SettingsTab as unknown as Record<string, unknown>)._save as
    | (() => Promise<void>)
    | undefined;
  if (fn) await fn();
};

SettingsTab.discard = () => {
  const fn = (SettingsTab as unknown as Record<string, unknown>)._discard as
    | (() => void)
    | undefined;
  if (fn) fn();
};
