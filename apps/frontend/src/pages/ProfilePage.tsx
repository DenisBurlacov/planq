import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Skeleton } from '@components/ui/Skeleton';
import { Modal } from '@components/ui/Modal';
import { profileApi } from '@api/profile';
import { useToast } from '@components/ui/Toast';
import { SettingsTab } from './profile/SettingsTab';
import { SecurityTab } from './profile/SecurityTab';
import { NotificationsTab } from './profile/NotificationsTab';
import { AddressesTab } from './profile/AddressesTab';
import { WebhooksTab } from './profile/WebhooksTab';
import { PaymentMethodsTab } from './profile/PaymentMethodsTab';

type TabId =
  | 'settings'
  | 'security'
  | 'notifications'
  | 'addresses'
  | 'webhooks'
  | 'paymentMethods';

export function ProfilePage() {
  const { t } = useTranslation('profile');
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('settings');
  const [unsavedModal, setUnsavedModal] = useState<string | null>(null);

  // Track unsaved changes from child tabs
  const [hasUnsavedSettingsChanges, setHasUnsavedSettingsChanges] = useState(false);
  const [hasUnsavedNotifChanges, setHasUnsavedNotifChanges] = useState(false);

  const onSettingsUnsavedChanges = useCallback((v: boolean) => setHasUnsavedSettingsChanges(v), []);
  const onNotifUnsavedChanges = useCallback((v: boolean) => setHasUnsavedNotifChanges(v), []);

  const { data: profile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: profileApi.get });

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
    if (activeTab === 'notifications') {
      NotificationsTab.discard();
    }
    if (activeTab === 'settings') {
      SettingsTab.discard();
    }
    if (unsavedModal) setActiveTab(unsavedModal as TabId);
    setUnsavedModal(null);
  };

  const handleSaveAndSwitch = async () => {
    if (activeTab === 'notifications') {
      await NotificationsTab.save();
    }
    if (activeTab === 'settings') {
      await SettingsTab.save();
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

      {/* Tab panels */}
      {activeTab === 'settings' && profile && (
        <SettingsTab profile={profile} toast={toast} onUnsavedChanges={onSettingsUnsavedChanges} />
      )}

      {activeTab === 'security' && <SecurityTab toast={toast} />}

      {activeTab === 'notifications' && (
        <NotificationsTab toast={toast} onUnsavedChanges={onNotifUnsavedChanges} />
      )}

      {activeTab === 'addresses' && <AddressesTab toast={toast} />}

      {activeTab === 'webhooks' && <WebhooksTab toast={toast} />}

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
