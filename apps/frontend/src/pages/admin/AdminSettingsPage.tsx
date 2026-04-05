import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@components/ui/Button';
import { Toggle } from '@components/ui/Toggle';
import { useToast } from '@components/ui/Toast';

interface StoreSettings {
  storeName: string;
  contactEmail: string;
  currency: string;
  maxCartItems: number;
  freeShippingThreshold: number;
  returnWindowDays: number;
  maintenanceMode: boolean;
}

const STORAGE_KEY = 'planq_store_settings';

const defaultSettings: StoreSettings = {
  storeName: 'PLANQ',
  contactEmail: 'support@planq.store',
  currency: '€',
  maxCartItems: 20,
  freeShippingThreshold: 200,
  returnWindowDays: 30,
  maintenanceMode: false,
};

function loadSettings(): StoreSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {
    /* ignore */
  }
  return defaultSettings;
}

export function AdminSettingsPage() {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  const [settings, setSettings] = useState<StoreSettings>(loadSettings);
  const [original, setOriginal] = useState<StoreSettings>(loadSettings);
  const [saving, setSaving] = useState(false);

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(original);

  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    setOriginal(loaded);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setOriginal(settings);
      toast('success', t('settings.saved'));
    } catch {
      toast('error', t('settings.saveError'));
    }
    setSaving(false);
  };

  const update = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const inputCls =
    'w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-accent';

  return (
    <div data-testid="admin-settings-page">
      <h1
        data-testid="admin-settings-title"
        className="text-xl font-bold text-[var(--text-primary)] mb-6"
      >
        {t('settings.title')}
      </h1>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <form
          data-testid="admin-settings-form"
          onSubmit={e => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-5"
        >
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                {t('settings.storeName')}
              </label>
              <input
                data-testid="admin-settings-store-name"
                value={settings.storeName}
                onChange={e => update('storeName', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                {t('settings.contactEmail')}
              </label>
              <input
                data-testid="admin-settings-contact-email"
                type="email"
                value={settings.contactEmail}
                onChange={e => update('contactEmail', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                {t('settings.currency')}
              </label>
              <input
                data-testid="admin-settings-currency"
                value={settings.currency}
                onChange={e => update('currency', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                {t('settings.maxCartItems')}
              </label>
              <input
                data-testid="admin-settings-max-cart"
                type="number"
                min={1}
                max={50}
                value={settings.maxCartItems}
                onChange={e => update('maxCartItems', +e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                {t('settings.freeShippingThreshold')}
              </label>
              <input
                data-testid="admin-settings-free-shipping"
                type="number"
                min={0}
                value={settings.freeShippingThreshold}
                onChange={e => update('freeShippingThreshold', +e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                {t('settings.returnWindowDays')}
              </label>
              <input
                data-testid="admin-settings-return-days"
                type="number"
                min={0}
                value={settings.returnWindowDays}
                onChange={e => update('returnWindowDays', +e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)]">
            <Toggle
              data-testid="admin-settings-maintenance"
              checked={settings.maintenanceMode}
              onChange={v => update('maintenanceMode', v)}
              label={t('settings.maintenanceMode')}
              description={t('settings.maintenanceDesc')}
            />
          </div>

          {hasChanges && <p className="text-xs text-yellow-600">{t('settings.unsavedChanges')}</p>}

          <div className="pt-4">
            <Button
              data-testid="admin-settings-save"
              type="submit"
              disabled={!hasChanges}
              loading={saving}
            >
              {t('settings.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
