import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@components/ui/Button';
import { Toggle } from '@components/ui/Toggle';
import { useToast } from '@components/ui/Toast';
import { featureFlagsApi, type FeatureFlag } from '@api/featureFlags';
import { useFeatureFlagsStore } from '@store/featureFlags.store';
import { adminApi } from '@api/admin';

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
      {/* ── Notification Scheduler ──────────────────────────────────── */}
      <SchedulerSection />

      {/* ── Feature Flags ──────────────────────────────────────────────── */}
      <FeatureFlagsSection />
    </div>
  );
}

function SchedulerSection() {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [interval, setInterval] = useState('30');
  const [max, setMax] = useState('10');
  const [type, setType] = useState('promo');
  const [loading, setLoading] = useState(true);
  const [restarting, setRestarting] = useState(false);

  const selectCls =
    'w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-accent';

  useEffect(() => {
    adminApi
      .getSettings()
      .then(settings => {
        const map = new Map(settings.map(s => [s.key, s.value]));
        setEnabled(map.get('notification_scheduler_enabled') === 'true');
        setInterval(map.get('notification_scheduler_interval') ?? '30');
        setMax(map.get('notification_scheduler_max') ?? '10');
        setType(map.get('notification_scheduler_type') ?? 'promo');
      })
      .catch(() => {
        /* ignore */
      })
      .finally(() => setLoading(false));
  }, []);

  const handleApplyRestart = async () => {
    setRestarting(true);
    try {
      await adminApi.updateSettings([
        { key: 'notification_scheduler_enabled', value: String(enabled) },
        { key: 'notification_scheduler_interval', value: interval },
        { key: 'notification_scheduler_max', value: max },
        { key: 'notification_scheduler_type', value: type },
      ]);
      const result = await adminApi.restartScheduler();
      toast('success', result.started ? t('scheduler.restarted') : t('scheduler.stopped'));
    } catch {
      toast('error', t('scheduler.restartError'));
    }
    setRestarting(false);
  };

  if (loading) return null;

  return (
    <div data-testid="admin-scheduler-section" className="mt-8">
      <h2
        data-testid="admin-scheduler-title"
        className="text-xl font-bold text-[var(--text-primary)] mb-2"
      >
        {t('scheduler.title')}
      </h2>
      <p className="text-sm text-[var(--text-secondary)] mb-4">{t('scheduler.description')}</p>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-5">
        <Toggle
          data-testid="admin-scheduler-enabled"
          checked={enabled}
          onChange={setEnabled}
          label={t('scheduler.enabled')}
          description={t('scheduler.enabledDesc')}
        />

        <div className="grid md:grid-cols-3 gap-5">
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
              {t('scheduler.interval')}
            </label>
            <select
              data-testid="admin-scheduler-interval"
              value={interval}
              onChange={e => setInterval(e.target.value)}
              className={selectCls}
            >
              <option value="10">{t('scheduler.interval10s')}</option>
              <option value="30">{t('scheduler.interval30s')}</option>
              <option value="60">{t('scheduler.interval1m')}</option>
              <option value="300">{t('scheduler.interval5m')}</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
              {t('scheduler.max')}
            </label>
            <select
              data-testid="admin-scheduler-max"
              value={max}
              onChange={e => setMax(e.target.value)}
              className={selectCls}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
              {t('scheduler.type')}
            </label>
            <select
              data-testid="admin-scheduler-type"
              value={type}
              onChange={e => setType(e.target.value)}
              className={selectCls}
            >
              <option value="promo">{t('scheduler.typePromo')}</option>
              <option value="order_update">{t('scheduler.typeOrderUpdate')}</option>
              <option value="newsletter">{t('scheduler.typeNewsletter')}</option>
              <option value="system">{t('scheduler.typeSystem')}</option>
            </select>
          </div>
        </div>

        <div className="pt-4">
          <Button
            data-testid="admin-scheduler-restart"
            onClick={handleApplyRestart}
            loading={restarting}
          >
            {t('scheduler.applyRestart')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FeatureFlagsSection() {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  const fetchFlags = useFeatureFlagsStore(s => s.fetchFlags);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const loadFlags = useCallback(async () => {
    try {
      const list = await featureFlagsApi.list();
      setFlags(list);
    } catch {
      // silent
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  const handleToggle = async (key: string, enabled: boolean) => {
    setTogglingKey(key);
    try {
      const updated = await featureFlagsApi.toggle(key, enabled);
      setFlags(prev => prev.map(f => (f.key === updated.key ? updated : f)));
      // Refresh global store
      await fetchFlags();
      toast('success', t('featureFlags.toggled'));
    } catch {
      toast('error', t('featureFlags.toggleError'));
    }
    setTogglingKey(null);
  };

  return (
    <div data-testid="admin-feature-flags-section" className="mt-8">
      <h2
        data-testid="admin-feature-flags-title"
        className="text-xl font-bold text-[var(--text-primary)] mb-2"
      >
        {t('featureFlags.title')}
      </h2>
      <p className="text-sm text-[var(--text-secondary)] mb-4">{t('featureFlags.description')}</p>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] divide-y divide-[var(--border)]">
        {loading ? (
          <div className="p-6 text-center text-sm text-[var(--text-secondary)]">
            {t('table.loading')}
          </div>
        ) : flags.length === 0 ? (
          <div className="p-6 text-center text-sm text-[var(--text-secondary)]">
            {t('table.empty')}
          </div>
        ) : (
          flags.map(flag => (
            <div key={flag.key} data-testid={`feature-flag-${flag.key}`} className="px-6 py-4">
              <Toggle
                data-testid={`feature-flag-toggle-${flag.key}`}
                checked={flag.enabled}
                onChange={v => handleToggle(flag.key, v)}
                disabled={togglingKey === flag.key}
                label={t(`featureFlags.flags.${flag.key}`, { defaultValue: flag.key })}
                description={t(`featureFlags.flagDescriptions.${flag.key}`, {
                  defaultValue: flag.description,
                })}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
