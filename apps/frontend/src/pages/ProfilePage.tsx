import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Wallet, MapPin, Trash2 } from 'lucide-react';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { Skeleton } from '@components/ui/Skeleton';
import { Toggle } from '@components/ui/Toggle';
import { Modal } from '@components/ui/Modal';
import { Badge } from '@components/ui/Badge';
import { profileApi } from '@api/profile';
import { notificationsApi, type NotificationPreferences } from '@api/notifications';
import { addressesApi, type Address, type AddressInput } from '@api/addresses';
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
type TabId = 'settings' | 'security' | 'notifications' | 'addresses';

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
  const [savingNotifs, setSavingNotifs] = useState(false);

  // Address state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteAddress, setDeleteAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<AddressInput>({
    name: '',
    street: '',
    city: '',
    zip: '',
    country: 'Sweden',
    isDefault: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  const { data: profile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: profileApi.get });

  // Fetch notifications (will fail gracefully since backend may not exist yet)
  useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const prefs = await notificationsApi.get();
        setNotifPrefs(prefs);
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
      toast('success', t('toast.profileUpdated'));
    } catch (err) {
      toast(
        'error',
        err instanceof ApiException ? err.message : t('common:errors.generic', { ns: 'common' })
      );
    }
  };

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

  const handleSaveAddress = async () => {
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
    if (!deleteAddress) return;
    try {
      await addressesApi.remove(deleteAddress.id);
      await refetchAddresses();
      toast('success', t('toast.addressDeleted'));
    } catch (err) {
      toast(
        'error',
        err instanceof ApiException ? err.message : t('common:errors.generic', { ns: 'common' })
      );
    } finally {
      setDeleteAddress(null);
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
      <div
        data-testid="profile-tabs"
        className="flex border-b border-[var(--border)] overflow-x-auto"
      >
        <button
          data-testid="tab-settings"
          onClick={() => setActiveTab('settings')}
          className={tabClass('settings')}
        >
          {t('tabs.settings')}
        </button>
        <button
          data-testid="tab-security"
          onClick={() => setActiveTab('security')}
          className={tabClass('security')}
        >
          {t('tabs.security')}
        </button>
        <button
          data-testid="tab-notifications"
          onClick={() => setActiveTab('notifications')}
          className={tabClass('notifications')}
        >
          {t('tabs.notifications')}
        </button>
        <button
          data-testid="tab-addresses"
          onClick={() => setActiveTab('addresses')}
          className={tabClass('addresses')}
        >
          {t('tabs.addresses')}
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
          <div className="flex justify-end mt-4">
            <Button
              data-testid="save-notifications"
              size="sm"
              onClick={handleSaveNotifications}
              loading={savingNotifs}
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
                      onClick={() => setDeleteAddress(addr)}
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
                    onChange={e => setAddressForm(f => ({ ...f, name: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    {t('addresses.form.street')}
                  </label>
                  <input
                    data-testid="address-street-input"
                    value={addressForm.street}
                    onChange={e => setAddressForm(f => ({ ...f, street: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--text-secondary)]">
                      {t('addresses.form.city')}
                    </label>
                    <input
                      data-testid="address-city-input"
                      value={addressForm.city}
                      onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--text-secondary)]">
                      {t('addresses.form.zip')}
                    </label>
                    <input
                      data-testid="address-zip-input"
                      value={addressForm.zip}
                      onChange={e => setAddressForm(f => ({ ...f, zip: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
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
            open={!!deleteAddress}
            title={t('addresses.delete')}
            onConfirm={handleDeleteAddress}
            onCancel={() => setDeleteAddress(null)}
            confirmLabel={t('addresses.delete')}
            danger
          >
            <p>
              {t('addresses.form.name')}: {deleteAddress?.name}
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {deleteAddress?.street}, {deleteAddress?.city}
            </p>
          </Modal>
        </div>
      )}
    </div>
  );
}
