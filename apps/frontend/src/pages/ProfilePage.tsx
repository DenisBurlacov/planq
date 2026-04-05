import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Wallet, MapPin, Trash2, Shield, ChevronDown, ChevronUp, CreditCard } from 'lucide-react';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { FileUploadZone } from '@components/ui/FileUploadZone';
import { Skeleton } from '@components/ui/Skeleton';
import { Toggle } from '@components/ui/Toggle';
import { Modal } from '@components/ui/Modal';
import { Badge } from '@components/ui/Badge';
import { CopyButton } from '@components/ui/CopyButton';
import { profileApi } from '@api/profile';
import { notificationsApi, type NotificationPreferences } from '@api/notifications';
import { addressesApi, type Address, type AddressInput } from '@api/addresses';
import { uploadApi } from '@api/upload';
import { webhooksApi, type WebhookSubscription } from '@api/webhooks';
import { twoFactorApi } from '@api/twoFactor';
import { useAuthStore } from '@store/auth.store';
import { useToast } from '@components/ui/Toast';
import { ApiException } from '@api/client';
import { useConfirmModal } from '@hooks/useConfirmModal';

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
type TabId =
  | 'settings'
  | 'security'
  | 'notifications'
  | 'addresses'
  | 'webhooks'
  | 'paymentMethods';

const COUNTRIES = [
  'Sweden',
  'Germany',
  'France',
  'United Kingdom',
  'Netherlands',
  'Spain',
  'Italy',
  'Norway',
  'Denmark',
  'Finland',
  'Poland',
  'United States',
];

export function ProfilePage() {
  const { t } = useTranslation('profile');
  const { setUser } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>('settings');

  // Notification state
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>({
    email: true,
    push: false,
    newsletter: true,
    orderUpdates: true,
    promotions: false,
  });
  const [savedNotifPrefs, setSavedNotifPrefs] = useState<NotificationPreferences | null>(null);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [unsavedModal, setUnsavedModal] = useState<string | null>(null);

  const hasUnsavedNotifChanges =
    savedNotifPrefs !== null &&
    (notifPrefs.email !== savedNotifPrefs.email ||
      notifPrefs.push !== savedNotifPrefs.push ||
      notifPrefs.newsletter !== savedNotifPrefs.newsletter ||
      notifPrefs.orderUpdates !== savedNotifPrefs.orderUpdates ||
      notifPrefs.promotions !== savedNotifPrefs.promotions);

  // Settings tab state
  const [settingsName, setSettingsName] = useState('');
  const [settingsEmail, setSettingsEmail] = useState('');
  const [savedSettingsName, setSavedSettingsName] = useState('');
  const [savedSettingsEmail, setSavedSettingsEmail] = useState('');
  const [settingsNameError, setSettingsNameError] = useState<string | null>(null);
  const [settingsEmailError, setSettingsEmailError] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const hasUnsavedSettingsChanges =
    settingsName !== savedSettingsName || settingsEmail !== savedSettingsEmail;

  // Address state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const deleteAddressConfirm = useConfirmModal<Address>();
  const [addressForm, setAddressForm] = useState<AddressInput>({
    name: '',
    street: '',
    city: '',
    zip: '',
    country: 'Sweden',
    isDefault: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Webhook state
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState<Set<string>>(new Set());
  const [savingWebhook, setSavingWebhook] = useState(false);
  const deleteWebhookConfirm = useConfirmModal<WebhookSubscription>();
  const [expandedDeliveries, setExpandedDeliveries] = useState<Set<string>>(new Set());

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

  const { data: profile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: profileApi.get });

  // Sync settings form with profile data
  useEffect(() => {
    if (profile) {
      setSettingsName(profile.name);
      setSettingsEmail(profile.email);
      setSavedSettingsName(profile.name);
      setSavedSettingsEmail(profile.email);
    }
  }, [profile]);

  // Fetch notifications
  useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const prefs = await notificationsApi.get();
        setNotifPrefs(prefs);
        setSavedNotifPrefs(prefs);
        return prefs;
      } catch {
        return notifPrefs;
      }
    },
    enabled: activeTab === 'notifications',
  });

  // Fetch addresses
  const { data: addresses, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      try {
        return await addressesApi.list();
      } catch {
        return [] as Address[];
      }
    },
    enabled: activeTab === 'addresses',
  });

  // Fetch webhooks
  const { data: webhooks, refetch: refetchWebhooks } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      try {
        return await webhooksApi.list();
      } catch {
        return [] as WebhookSubscription[];
      }
    },
    enabled: activeTab === 'webhooks',
  });

  // Fetch 2FA status
  const { data: twoFactorStatus, refetch: refetch2FA } = useQuery({
    queryKey: ['2fa-status'],
    queryFn: async () => {
      try {
        return await twoFactorApi.status();
      } catch {
        return { enabled: false };
      }
    },
    enabled: activeTab === 'security',
  });

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

  const onSaveSettings = async () => {
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
  };

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

  const handleSaveNotifications = async () => {
    setSavingNotifs(true);
    try {
      await notificationsApi.update(notifPrefs);
      setSavedNotifPrefs({ ...notifPrefs });
      toast('success', t('toast.preferencesSaved'));
    } catch (err) {
      toast(
        'error',
        err instanceof ApiException ? err.message : t('common:errors.generic', { ns: 'common' })
      );
    } finally {
      setSavingNotifs(false);
    }
  };

  const handleTabSwitch = (tab: string) => {
    if (activeTab === 'notifications' && hasUnsavedNotifChanges) {
      setUnsavedModal(tab);
      return;
    }
    if (activeTab === 'settings' && hasUnsavedSettingsChanges) {
      setUnsavedModal(tab);
      return;
    }
    setActiveTab(tab as TabId);
  };

  const handleDiscardAndSwitch = () => {
    if (activeTab === 'notifications' && savedNotifPrefs) {
      setNotifPrefs({ ...savedNotifPrefs });
    }
    if (activeTab === 'settings') {
      setSettingsName(savedSettingsName);
      setSettingsEmail(savedSettingsEmail);
      setSettingsNameError(null);
      setSettingsEmailError(null);
    }
    if (unsavedModal) setActiveTab(unsavedModal as TabId);
    setUnsavedModal(null);
  };

  const handleSaveAndSwitch = async () => {
    if (activeTab === 'notifications') {
      await handleSaveNotifications();
    }
    if (activeTab === 'settings') {
      await onSaveSettings();
    }
    if (unsavedModal) setActiveTab(unsavedModal as TabId);
    setUnsavedModal(null);
  };

  // Warn on page leave with unsaved changes
  useEffect(() => {
    if (!hasUnsavedNotifChanges && !hasUnsavedSettingsChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedNotifChanges, hasUnsavedSettingsChanges]);

  const handleOpenAddressModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        name: address.name,
        street: address.street,
        city: address.city,
        zip: address.zip,
        country: address.country,
        isDefault: address.isDefault,
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        name: '',
        street: '',
        city: '',
        zip: '',
        country: 'Sweden',
        isDefault: false,
      });
    }
    setAddressModalOpen(true);
  };

  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  const handleSaveAddress = async () => {
    // Validate all fields
    const { validateField: vf, hasDangerousContent: hdc } = await import('@utils/validation');
    const errs: Record<string, string> = {};
    const nameErr = vf(addressForm.name, {
      required: true,
      minLength: 2,
      maxLength: 50,
      fieldName: t('addresses.form.name'),
    });
    if (nameErr) errs.name = nameErr;
    const streetErr = vf(addressForm.street, {
      required: true,
      minLength: 5,
      maxLength: 100,
      fieldName: t('addresses.form.street'),
    });
    if (streetErr) errs.street = streetErr;
    const cityErr = vf(addressForm.city, {
      required: true,
      minLength: 2,
      maxLength: 50,
      fieldName: t('addresses.form.city'),
    });
    if (cityErr) errs.city = cityErr;
    const zipErr = vf(addressForm.zip, {
      required: true,
      minLength: 3,
      maxLength: 10,
      fieldName: t('addresses.form.zip'),
    });
    if (zipErr) errs.zip = zipErr;
    for (const [key, val] of Object.entries(addressForm)) {
      if (typeof val === 'string' && hdc(val)) {
        errs[key] = t('addresses.validation.dangerousContent');
      }
    }
    setAddressErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSavingAddress(true);
    try {
      if (editingAddress) {
        await addressesApi.update(editingAddress.id, addressForm);
      } else {
        await addressesApi.create(addressForm);
      }
      await refetchAddresses();
      setAddressModalOpen(false);
      toast('success', editingAddress ? t('toast.addressUpdated') : t('toast.addressAdded'));
    } catch (err) {
      toast(
        'error',
        err instanceof ApiException ? err.message : t('common:errors.generic', { ns: 'common' })
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async () => {
    if (!deleteAddressConfirm.target) return;
    try {
      await addressesApi.remove(deleteAddressConfirm.target.id);
      await refetchAddresses();
      toast('success', t('toast.addressDeleted'));
    } catch (err) {
      toast(
        'error',
        err instanceof ApiException ? err.message : t('common:errors.generic', { ns: 'common' })
      );
    } finally {
      deleteAddressConfirm.close();
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressesApi.setDefault(id);
      await refetchAddresses();
      toast('success', t('toast.defaultAddressUpdated'));
    } catch (err) {
      toast(
        'error',
        err instanceof ApiException ? err.message : t('common:errors.generic', { ns: 'common' })
      );
    }
  };

  // Webhook handlers
  const handleAddWebhook = async () => {
    if (!webhookUrl || webhookEvents.size === 0) return;
    setSavingWebhook(true);
    try {
      await webhooksApi.create(webhookUrl, Array.from(webhookEvents));
      await refetchWebhooks();
      setWebhookModalOpen(false);
      setWebhookUrl('');
      setWebhookEvents(new Set());
      toast('success', t('webhooks.created'));
    } catch (err) {
      toast(
        'error',
        err instanceof ApiException ? err.message : t('common:errors.generic', { ns: 'common' })
      );
    } finally {
      setSavingWebhook(false);
    }
  };

  const handleToggleWebhook = async (id: string, active: boolean) => {
    try {
      await webhooksApi.toggle(id, active);
      await refetchWebhooks();
      toast('success', t('webhooks.toggled'));
    } catch (err) {
      toast(
        'error',
        err instanceof ApiException ? err.message : t('common:errors.generic', { ns: 'common' })
      );
    }
  };

  const handleDeleteWebhook = async () => {
    if (!deleteWebhookConfirm.target) return;
    try {
      await webhooksApi.remove(deleteWebhookConfirm.target.id);
      await refetchWebhooks();
      toast('success', t('webhooks.deleted'));
    } catch (err) {
      toast(
        'error',
        err instanceof ApiException ? err.message : t('common:errors.generic', { ns: 'common' })
      );
    } finally {
      deleteWebhookConfirm.close();
    }
  };

  const toggleDeliveries = useCallback((id: string) => {
    setExpandedDeliveries(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // 2FA handlers
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

  if (isLoading)
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );

  const tabClass = (tab: TabId) =>
    `px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
      activeTab === tab
        ? 'border-accent text-accent'
        : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
    }`;

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
              &euro;{profile?.walletBalance.toFixed(2) ?? '0.00'}
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
      <div
        data-testid="profile-tabs"
        className="flex border-b border-[var(--border)] overflow-x-auto"
      >
        <button
          data-testid="tab-settings"
          onClick={() => handleTabSwitch('settings')}
          className={tabClass('settings')}
        >
          {t('tabs.settings')}
        </button>
        <button
          data-testid="tab-security"
          onClick={() => handleTabSwitch('security')}
          className={tabClass('security')}
        >
          {t('tabs.security')}
        </button>
        <button
          data-testid="tab-notifications"
          onClick={() => handleTabSwitch('notifications')}
          className={tabClass('notifications')}
        >
          {t('tabs.notifications')}
        </button>
        <button
          data-testid="tab-addresses"
          onClick={() => handleTabSwitch('addresses')}
          className={tabClass('addresses')}
        >
          {t('tabs.addresses')}
        </button>
        <button
          data-testid="tab-webhooks"
          onClick={() => handleTabSwitch('webhooks')}
          className={tabClass('webhooks')}
        >
          {t('tabs.webhooks')}
        </button>
        <button
          data-testid="tab-payment-methods"
          onClick={() => handleTabSwitch('paymentMethods')}
          className={tabClass('paymentMethods')}
        >
          {t('tabs.paymentMethods')}
        </button>
      </div>

      {/* Tab: Settings */}
      {activeTab === 'settings' && (
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
      )}

      {/* Tab: Security */}
      {activeTab === 'security' && (
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
      )}

      {/* Tab: Notifications */}
      {activeTab === 'notifications' && (
        <div
          data-testid="tab-panel-notifications"
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6"
        >
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">
            {t('notifications.title')}
          </h2>
          <div className="divide-y divide-[var(--border)]">
            <div className="py-4 first:pt-0">
              <Toggle
                data-testid="toggle-email"
                checked={notifPrefs.email}
                onChange={v => setNotifPrefs(p => ({ ...p, email: v }))}
                label={t('notifications.email')}
                description={t('notifications.emailDesc')}
              />
            </div>
            <div className="py-4">
              <Toggle
                data-testid="toggle-push"
                checked={notifPrefs.push}
                onChange={v => setNotifPrefs(p => ({ ...p, push: v }))}
                label={t('notifications.push')}
                description={t('notifications.pushDesc')}
              />
            </div>
            <div className="py-4">
              <Toggle
                data-testid="toggle-newsletter"
                checked={notifPrefs.newsletter}
                onChange={v => setNotifPrefs(p => ({ ...p, newsletter: v }))}
                label={t('notifications.newsletter')}
                description={t('notifications.newsletterDesc')}
              />
            </div>
            <div className="py-4 border-t border-[var(--border)]">
              <Toggle
                data-testid="toggle-order-updates"
                checked={notifPrefs.orderUpdates}
                onChange={v => setNotifPrefs(p => ({ ...p, orderUpdates: v }))}
                label={t('notifications.orderUpdates')}
                description={t('notifications.orderUpdatesDesc')}
              />
            </div>
            <div className="py-4 last:pb-0">
              <Toggle
                data-testid="toggle-promotions"
                checked={notifPrefs.promotions}
                onChange={v => setNotifPrefs(p => ({ ...p, promotions: v }))}
                label={t('notifications.promotions')}
                description={t('notifications.promotionsDesc')}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-4">
            {hasUnsavedNotifChanges && (
              <span
                data-testid="unsaved-changes-indicator"
                className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                {t('notifications.unsavedChanges')}
              </span>
            )}
            <Button
              data-testid="save-notifications"
              size="sm"
              onClick={handleSaveNotifications}
              loading={savingNotifs}
              variant={hasUnsavedNotifChanges ? 'primary' : 'secondary'}
            >
              {t('notifications.save')}
            </Button>
          </div>
        </div>
      )}

      {/* Tab: Addresses */}
      {activeTab === 'addresses' && (
        <div data-testid="tab-panel-addresses">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--text-primary)]">{t('addresses.title')}</h2>
            <Button
              data-testid="add-address-button"
              size="sm"
              onClick={() => handleOpenAddressModal()}
              disabled={(addresses?.length ?? 0) >= 5}
            >
              + {t('addresses.add')}
            </Button>
          </div>

          {!addresses?.length ? (
            <div
              data-testid="addresses-empty"
              className="flex flex-col items-center justify-center py-16 gap-3"
            >
              <MapPin className="h-16 w-16 text-[var(--text-secondary)]" />
              <p className="text-[var(--text-primary)] font-medium">{t('addresses.empty')}</p>
              <p className="text-sm text-[var(--text-secondary)]">{t('addresses.emptyHint')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr, index) => (
                <div
                  key={addr.id}
                  data-testid={`address-card-${index}`}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 relative"
                >
                  {addr.isDefault && (
                    <div data-testid="address-default-badge" className="absolute top-3 right-3">
                      <Badge>{t('addresses.default')}</Badge>
                    </div>
                  )}
                  <p className="font-medium text-sm text-[var(--text-primary)]">{addr.name}</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{addr.street}</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {addr.zip} {addr.city}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">{addr.country}</p>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                    <Button
                      data-testid={`address-edit-${index}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenAddressModal(addr)}
                    >
                      {t('common:actions.edit', { ns: 'common' })}
                    </Button>
                    <Button
                      data-testid={`address-delete-${index}`}
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => deleteAddressConfirm.open(addr)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t('addresses.delete')}
                    </Button>
                    {!addr.isDefault && (
                      <Button
                        data-testid={`address-set-default-${index}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(addr.id)}
                      >
                        {t('addresses.setDefault')}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Address Form Modal */}
          <Modal
            open={addressModalOpen}
            title={editingAddress ? t('addresses.edit') : t('addresses.add')}
            onConfirm={handleSaveAddress}
            onCancel={() => setAddressModalOpen(false)}
            confirmLabel={t('common:actions.save', { ns: 'common' })}
            cancelLabel={t('common:actions.cancel', { ns: 'common' })}
            loading={savingAddress}
          >
            <div data-testid="address-modal">
              <form
                data-testid="address-form"
                className="space-y-3"
                onSubmit={e => e.preventDefault()}
              >
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    {t('addresses.form.name')}
                  </label>
                  <input
                    data-testid="address-name-input"
                    value={addressForm.name}
                    onChange={e => {
                      setAddressForm(f => ({ ...f, name: e.target.value }));
                      setAddressErrors(p => ({ ...p, name: '' }));
                    }}
                    className={`mt-1 w-full rounded-lg border bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${addressErrors.name ? 'border-red-500' : 'border-[var(--border)]'}`}
                    maxLength={50}
                  />
                  {addressErrors.name && (
                    <p data-testid="address-name-error" className="text-xs text-red-500 mt-1">
                      {addressErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    {t('addresses.form.street')}
                  </label>
                  <input
                    data-testid="address-street-input"
                    value={addressForm.street}
                    onChange={e => {
                      setAddressForm(f => ({ ...f, street: e.target.value }));
                      setAddressErrors(p => ({ ...p, street: '' }));
                    }}
                    className={`mt-1 w-full rounded-lg border bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${addressErrors.street ? 'border-red-500' : 'border-[var(--border)]'}`}
                    maxLength={100}
                  />
                  {addressErrors.street && (
                    <p data-testid="address-street-error" className="text-xs text-red-500 mt-1">
                      {addressErrors.street}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--text-secondary)]">
                      {t('addresses.form.city')}
                    </label>
                    <input
                      data-testid="address-city-input"
                      value={addressForm.city}
                      onChange={e => {
                        setAddressForm(f => ({ ...f, city: e.target.value }));
                        setAddressErrors(p => ({ ...p, city: '' }));
                      }}
                      className={`mt-1 w-full rounded-lg border bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${addressErrors.city ? 'border-red-500' : 'border-[var(--border)]'}`}
                      maxLength={50}
                    />
                    {addressErrors.city && (
                      <p data-testid="address-city-error" className="text-xs text-red-500 mt-1">
                        {addressErrors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--text-secondary)]">
                      {t('addresses.form.zip')}
                    </label>
                    <input
                      data-testid="address-zip-input"
                      value={addressForm.zip}
                      onChange={e => {
                        setAddressForm(f => ({ ...f, zip: e.target.value }));
                        setAddressErrors(p => ({ ...p, zip: '' }));
                      }}
                      className={`mt-1 w-full rounded-lg border bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${addressErrors.zip ? 'border-red-500' : 'border-[var(--border)]'}`}
                      maxLength={10}
                    />
                    {addressErrors.zip && (
                      <p data-testid="address-zip-error" className="text-xs text-red-500 mt-1">
                        {addressErrors.zip}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    {t('addresses.form.country')}
                  </label>
                  <select
                    data-testid="address-country-select"
                    value={addressForm.country}
                    onChange={e => setAddressForm(f => ({ ...f, country: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  >
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <label
                  data-testid="address-default-checkbox"
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault ?? false}
                    onChange={e => setAddressForm(f => ({ ...f, isDefault: e.target.checked }))}
                    className="rounded"
                  />
                  {t('addresses.form.isDefault')}
                </label>
              </form>
            </div>
          </Modal>

          {/* Delete confirmation */}
          <Modal
            open={deleteAddressConfirm.isOpen}
            title={t('addresses.delete')}
            onConfirm={handleDeleteAddress}
            onCancel={() => deleteAddressConfirm.close()}
            confirmLabel={t('addresses.delete')}
            cancelLabel={t('common:actions.cancel', { ns: 'common' })}
            danger
          >
            <p>
              {t('addresses.form.name')}: {deleteAddressConfirm.target?.name}
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {deleteAddressConfirm.target?.street}, {deleteAddressConfirm.target?.city}
            </p>
          </Modal>
        </div>
      )}

      {/* Tab: Webhooks */}
      {activeTab === 'webhooks' && (
        <div data-testid="tab-panel-webhooks">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--text-primary)]">{t('webhooks.title')}</h2>
            <Button
              data-testid="add-webhook-button"
              size="sm"
              onClick={() => {
                setWebhookUrl('');
                setWebhookEvents(new Set());
                setWebhookModalOpen(true);
              }}
            >
              + {t('webhooks.addWebhook')}
            </Button>
          </div>

          {!webhooks?.length ? (
            <div
              data-testid="webhooks-empty"
              className="flex flex-col items-center justify-center py-16 gap-3"
            >
              <p className="text-[var(--text-primary)] font-medium">{t('webhooks.empty')}</p>
              <p className="text-sm text-[var(--text-secondary)]">{t('webhooks.emptyHint')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((wh, index) => (
                <div
                  key={wh.id}
                  data-testid={`webhook-card-${index}`}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p
                        data-testid={`webhook-url-${index}`}
                        className="text-sm font-mono text-[var(--text-primary)] truncate"
                      >
                        {wh.url}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {wh.events.map(event => (
                          <span
                            key={event}
                            className="text-xs rounded bg-[var(--bg-sidebar)] px-2 py-0.5 text-[var(--text-secondary)]"
                          >
                            {event}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Toggle
                        data-testid={`webhook-toggle-${index}`}
                        checked={wh.active}
                        onChange={v => handleToggleWebhook(wh.id, v)}
                        label=""
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                    <button
                      data-testid={`webhook-deliveries-${index}`}
                      onClick={() => toggleDeliveries(wh.id)}
                      className="text-xs text-accent hover:underline flex items-center gap-1"
                    >
                      {expandedDeliveries.has(wh.id) ? (
                        <>
                          <ChevronUp className="h-3 w-3" />
                          {t('webhooks.hideDeliveries')}
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          {t('webhooks.viewDeliveries')}
                        </>
                      )}
                    </button>
                    <button
                      data-testid={`webhook-delete-${index}`}
                      onClick={() => deleteWebhookConfirm.open(wh)}
                      className="text-xs text-red-500 hover:underline ml-auto flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      {t('webhooks.delete')}
                    </button>
                  </div>

                  {/* Deliveries */}
                  {expandedDeliveries.has(wh.id) && (
                    <div
                      data-testid={`webhook-deliveries-list-${index}`}
                      className="mt-3 space-y-2"
                    >
                      {wh.deliveries.length === 0 ? (
                        <p className="text-xs text-[var(--text-secondary)] py-2">
                          {t('webhooks.noDeliveries')}
                        </p>
                      ) : (
                        wh.deliveries.map((delivery, di) => (
                          <div
                            key={delivery.id}
                            data-testid={`delivery-${index}-${di}`}
                            className="rounded-lg bg-[var(--bg-sidebar)] p-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[var(--text-primary)]">
                                {delivery.event}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded ${
                                  delivery.status === 'sent'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}
                              >
                                {delivery.status}
                              </span>
                            </div>
                            <p className="text-[var(--text-secondary)] mt-1">
                              {new Date(delivery.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Webhook Modal */}
          <Modal
            open={webhookModalOpen}
            title={t('webhooks.addWebhook')}
            onConfirm={handleAddWebhook}
            onCancel={() => setWebhookModalOpen(false)}
            confirmLabel={t('common:actions.save', { ns: 'common' })}
            cancelLabel={t('common:actions.cancel', { ns: 'common' })}
            loading={savingWebhook}
          >
            <div data-testid="webhook-modal" className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  {t('webhooks.url')}
                </label>
                <input
                  data-testid="webhook-url-input"
                  type="url"
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  placeholder={t('webhooks.urlPlaceholder')}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-2">
                  {t('webhooks.events')}
                </label>
                <div className="space-y-2">
                  {['order.created', 'order.status.updated'].map(event => (
                    <label
                      key={event}
                      data-testid={`webhook-event-${event}`}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={webhookEvents.has(event)}
                        onChange={e => {
                          setWebhookEvents(prev => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(event);
                            else next.delete(event);
                            return next;
                          });
                        }}
                        className="rounded"
                      />
                      <span className="font-mono text-[var(--text-primary)]">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Modal>

          {/* Delete Webhook Confirmation */}
          <Modal
            open={deleteWebhookConfirm.isOpen}
            title={t('webhooks.delete')}
            onConfirm={handleDeleteWebhook}
            onCancel={() => deleteWebhookConfirm.close()}
            confirmLabel={t('webhooks.delete')}
            cancelLabel={t('common:actions.cancel', { ns: 'common' })}
            danger
          >
            <p>{t('webhooks.deleteConfirm')}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1 font-mono">
              {deleteWebhookConfirm.target?.url}
            </p>
          </Modal>
        </div>
      )}

      {/* Tab: Payment Methods */}
      {activeTab === 'paymentMethods' && <PaymentMethodsTab profileName={profile?.name ?? ''} />}

      {/* Unsaved changes modal (notifications + settings) */}
      <Modal
        open={!!unsavedModal}
        title={
          activeTab === 'settings' ? t('settingsTab.unsavedTitle') : t('notifications.unsavedTitle')
        }
        onConfirm={handleSaveAndSwitch}
        onCancel={handleDiscardAndSwitch}
        confirmLabel={
          activeTab === 'settings'
            ? t('settingsTab.saveAndContinue')
            : t('notifications.saveAndContinue')
        }
        cancelLabel={
          activeTab === 'settings'
            ? t('settingsTab.discardChanges')
            : t('notifications.discardChanges')
        }
      >
        <p data-testid="unsaved-changes-modal" className="text-sm text-[var(--text-secondary)]">
          {activeTab === 'settings'
            ? t('settingsTab.unsavedMessage')
            : t('notifications.unsavedMessage')}
        </p>
      </Modal>
    </div>
  );
}

function PaymentMethodsTab({ profileName }: { profileName: string }) {
  const { t } = useTranslation('profile');
  const { toast } = useToast();
  const [cards, setCards] = useState<import('@api/cards').SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const deleteCardConfirm = useConfirmModal<string>();
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expMonth, setExpMonth] = useState(new Date().getMonth() + 1);
  const [expYear, setExpYear] = useState(new Date().getFullYear() + 1);
  const [saving, setSaving] = useState(false);
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const loadCards = useCallback(async () => {
    const { cardsApi } = await import('@api/cards');
    const result = await cardsApi.list();
    setCards(result);
    setLoading(false);
  }, []);

  useState(() => {
    loadCards();
  });

  const validateCard = (): boolean => {
    const errs: Record<string, string> = {};
    const digits = cardNumber.replace(/\s/g, '');
    if (!digits) {
      errs.cardNumber = t('paymentMethods.validation.cardRequired');
    } else if (!/^\d{13,19}$/.test(digits)) {
      errs.cardNumber = t('paymentMethods.validation.cardInvalid');
    }
    if (!cardholderName.trim()) {
      errs.cardholderName = t('paymentMethods.validation.nameRequired');
    } else if (cardholderName.trim().length < 2) {
      errs.cardholderName = t('paymentMethods.validation.nameMin');
    } else if (cardholderName.trim().length > 15) {
      errs.cardholderName = t('paymentMethods.validation.nameMax');
    } else if (!/^[a-zA-Z\s\-']+$/.test(cardholderName.trim())) {
      errs.cardholderName = t('paymentMethods.validation.nameLatinOnly');
    }
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      errs.expiry = t('paymentMethods.validation.expiryPast');
    }
    setCardErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdd = async () => {
    if (!validateCard()) return;
    setSaving(true);
    try {
      const { cardsApi } = await import('@api/cards');
      await cardsApi.add({
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardholderName: cardholderName.trim(),
        expMonth,
        expYear,
      });
      toast('success', t('toast.cardAdded'));
      setAddModalOpen(false);
      setCardNumber('');
      setCardholderName('');
      await loadCards();
    } catch (err) {
      toast('error', err instanceof Error ? err.message : t('paymentMethods.maxCards'));
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteCardConfirm.target) return;
    const { cardsApi } = await import('@api/cards');
    await cardsApi.delete(deleteCardConfirm.target);
    toast('success', t('toast.cardDeleted'));
    deleteCardConfirm.close();
    await loadCards();
  };

  const handleSetDefault = async (id: string) => {
    const { cardsApi } = await import('@api/cards');
    await cardsApi.setDefault(id);
    toast('success', t('toast.defaultCardUpdated'));
    await loadCards();
  };

  const brandIcon = (brand: string) => {
    const colors: Record<string, string> = {
      Visa: 'text-blue-600',
      Mastercard: 'text-orange-500',
      Amex: 'text-blue-400',
    };
    return <span className={`text-xs font-bold ${colors[brand] || ''}`}>{brand}</span>;
  };

  const inputCls =
    'w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-accent';

  return (
    <div
      data-testid="tab-panel-payment-methods"
      className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-[var(--text-primary)]">{t('paymentMethods.title')}</h2>
          <span
            data-testid="card-count"
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              cards.length >= 5
                ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                : 'bg-[var(--bg-sidebar)] text-[var(--text-secondary)]'
            }`}
          >
            {cards.length}/5
          </span>
        </div>
        {cards.length < 5 && (
          <Button
            data-testid="add-card-button"
            size="sm"
            onClick={() => {
              setCardholderName(profileName);
              setAddModalOpen(true);
            }}
            disabled={cards.length >= 5}
          >
            <CreditCard className="h-4 w-4" /> {t('paymentMethods.addCard')}
          </Button>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-20" />
      ) : cards.length === 0 ? (
        <div className="text-center py-8">
          <CreditCard className="h-8 w-8 mx-auto text-[var(--text-secondary)] mb-2" />
          <p className="text-sm text-[var(--text-secondary)]">{t('paymentMethods.empty')}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {t('paymentMethods.emptyHint')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map(card => (
            <div
              key={card.id}
              data-testid={`saved-card-${card.id}`}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] p-4"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-[var(--text-secondary)]" />
                <div>
                  <div className="flex items-center gap-2">
                    {brandIcon(card.brand)}
                    <span className="text-sm text-[var(--text-primary)] font-mono">
                      &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull;{' '}
                      {card.last4}
                    </span>
                    {card.isDefault && <Badge variant="info">{t('paymentMethods.default')}</Badge>}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {card.cardholderName} &middot;{' '}
                    {t('paymentMethods.expires', {
                      month: String(card.expMonth).padStart(2, '0'),
                      year: card.expYear,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!card.isDefault && (
                  <button
                    data-testid={`card-set-default-${card.id}`}
                    onClick={() => handleSetDefault(card.id)}
                    className="text-xs text-accent hover:underline"
                  >
                    {t('paymentMethods.setDefault')}
                  </button>
                )}
                <button
                  data-testid={`card-delete-${card.id}`}
                  onClick={() => deleteCardConfirm.open(card.id)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {cards.length >= 5 && (
            <p className="text-xs text-[var(--text-secondary)] text-center">
              {t('paymentMethods.maxCards')}
            </p>
          )}
        </div>
      )}

      {/* Add Card Modal */}
      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setAddModalOpen(false)}
        >
          <div
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
              {t('paymentMethods.addCard')}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                  {t('paymentMethods.cardNumber')}
                </label>
                <input
                  data-testid="card-number-input"
                  value={cardNumber}
                  onChange={e => {
                    setCardNumber(e.target.value);
                    setCardErrors(prev => ({ ...prev, cardNumber: '' }));
                  }}
                  placeholder={t('paymentMethods.cardNumberPlaceholder')}
                  className={`${inputCls} ${cardErrors.cardNumber ? 'border-red-500' : ''}`}
                />
                {cardErrors.cardNumber && (
                  <p data-testid="card-number-error" className="text-xs text-red-500 mt-1">
                    {cardErrors.cardNumber}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                  {t('paymentMethods.cardholderName')}
                </label>
                <input
                  data-testid="cardholder-name-input"
                  value={cardholderName}
                  onChange={e => {
                    setCardholderName(e.target.value);
                    setCardErrors(prev => ({ ...prev, cardholderName: '' }));
                  }}
                  placeholder={t('paymentMethods.cardholderPlaceholder')}
                  maxLength={15}
                  className={`${inputCls} ${cardErrors.cardholderName ? 'border-red-500' : ''}`}
                />
                {cardErrors.cardholderName && (
                  <p data-testid="cardholder-name-error" className="text-xs text-red-500 mt-1">
                    {cardErrors.cardholderName}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                    {t('paymentMethods.expMonth')}
                  </label>
                  <select
                    value={expMonth}
                    onChange={e => setExpMonth(+e.target.value)}
                    className={inputCls}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>
                        {String(m).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                    {t('paymentMethods.expYear')}
                  </label>
                  <select
                    value={expYear}
                    onChange={e => setExpYear(+e.target.value)}
                    className={inputCls}
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(y => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {cardErrors.expiry && (
                <p data-testid="card-expiry-error" className="text-xs text-red-500 mt-1">
                  {cardErrors.expiry}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setAddModalOpen(false);
                  setCardErrors({});
                }}
              >
                {t('common:actions.cancel', { ns: 'common' })}
              </Button>
              <Button size="sm" onClick={handleAdd} loading={saving}>
                {t('paymentMethods.addCard')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Card Confirmation */}
      <Modal
        open={deleteCardConfirm.isOpen}
        title={t('paymentMethods.deleteCard')}
        onConfirm={handleDelete}
        onCancel={() => deleteCardConfirm.close()}
        confirmLabel={t('paymentMethods.deleteCard')}
        cancelLabel={t('common:actions.cancel', { ns: 'common' })}
        danger
      >
        <p className="text-sm text-[var(--text-secondary)]">{t('paymentMethods.deleteConfirm')}</p>
      </Modal>
    </div>
  );
}
