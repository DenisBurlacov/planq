import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@components/ui/Button';
import { Toggle } from '@components/ui/Toggle';
import { notificationsApi, type NotificationPreferences } from '@api/notifications';
import { ApiException } from '@api/client';

export interface NotificationsTabProps {
  toast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export function NotificationsTab({ toast, onUnsavedChanges }: NotificationsTabProps) {
  const { t } = useTranslation('profile');

  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>({
    email: true,
    push: false,
    newsletter: true,
    orderUpdates: true,
    promotions: false,
  });
  const [savedNotifPrefs, setSavedNotifPrefs] = useState<NotificationPreferences | null>(null);
  const [savingNotifs, setSavingNotifs] = useState(false);

  const hasUnsavedNotifChanges =
    savedNotifPrefs !== null &&
    (notifPrefs.email !== savedNotifPrefs.email ||
      notifPrefs.push !== savedNotifPrefs.push ||
      notifPrefs.newsletter !== savedNotifPrefs.newsletter ||
      notifPrefs.orderUpdates !== savedNotifPrefs.orderUpdates ||
      notifPrefs.promotions !== savedNotifPrefs.promotions);

  // Report unsaved changes to parent
  useEffect(() => {
    onUnsavedChanges(hasUnsavedNotifChanges);
  }, [hasUnsavedNotifChanges, onUnsavedChanges]);

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
  });

  const handleSaveNotifications = useCallback(async () => {
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
  }, [notifPrefs]);

  const handleDiscard = useCallback(() => {
    if (savedNotifPrefs) {
      setNotifPrefs({ ...savedNotifPrefs });
    }
  }, [savedNotifPrefs]);

  // Expose save/discard for parent orchestrator
  useEffect(() => {
    (NotificationsTab as unknown as Record<string, unknown>)._save = handleSaveNotifications;
    (NotificationsTab as unknown as Record<string, unknown>)._discard = handleDiscard;
  }, [handleSaveNotifications, handleDiscard]);

  return (
    <div
      data-testid="tab-panel-notifications"
      className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6"
    >
      <h2 className="font-semibold text-[var(--text-primary)] mb-4">{t('notifications.title')}</h2>
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
  );
}

// Static methods for parent orchestrator to call save/discard
NotificationsTab.save = async () => {
  const fn = (NotificationsTab as unknown as Record<string, unknown>)._save as
    | (() => Promise<void>)
    | undefined;
  if (fn) await fn();
};

NotificationsTab.discard = () => {
  const fn = (NotificationsTab as unknown as Record<string, unknown>)._discard as
    | (() => void)
    | undefined;
  if (fn) fn();
};
