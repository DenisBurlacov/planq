import { useState, useRef, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { notificationsApi, type NotificationPreferences } from '@api/notifications';
import { useNotificationsStore } from '@store/notifications.store';
import { useAuthStore } from '@store/auth.store';
import { useWebSocket } from '@ws/useWebSocket';
import { useToast } from '@components/ui/Toast';
import type { WsMessage, Notification } from '@appTypes/api';

// Maps scheduler notification types to user preference keys
const TYPE_TO_PREF: Record<string, keyof NotificationPreferences | null> = {
  promo: 'promotions',
  order_update: 'orderUpdates',
  newsletter: 'newsletter',
  system: null, // always delivered
};

function isNotificationMuted(notifType: string, prefs: NotificationPreferences | null): boolean {
  const prefKey = TYPE_TO_PREF[notifType];
  if (prefKey === null || prefKey === undefined) return false; // system or unknown — not muted
  if (!prefs) return true; // no prefs loaded — treat as muted for non-system
  return !prefs[prefKey];
}

export function NotificationDropdown() {
  const { t } = useTranslation('common');
  const { accessToken } = useAuthStore();
  const { unreadCount, setUnreadCount, increment } = useNotificationsStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch user notification preferences
  const { data: userPrefs } = useQuery({
    queryKey: ['notification-prefs'],
    queryFn: async () => {
      try {
        return await notificationsApi.get();
      } catch {
        return null;
      }
    },
    enabled: !!accessToken,
    staleTime: 60_000,
  });

  // Fetch unread count
  useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      try {
        const data = await notificationsApi.unreadCount();
        setUnreadCount(data.count);
        return data;
      } catch {
        return { count: 0 };
      }
    },
    enabled: !!accessToken,
    refetchInterval: 60_000,
  });

  // Fetch notifications list when dropdown is open
  const { data: notifications } = useQuery({
    queryKey: ['notifications-list'],
    queryFn: async () => {
      try {
        return await notificationsApi.list();
      } catch {
        return { items: [] as Notification[], total: 0, page: 1, limit: 10, pages: 1 };
      }
    },
    enabled: !!accessToken && open,
  });

  // Listen for real-time notifications
  useWebSocket({
    token: accessToken,
    enabled: !!accessToken,
    onMessage: (msg: WsMessage) => {
      if (msg.event === 'notification.new') {
        increment();
        void qc.invalidateQueries({ queryKey: ['notifications-list'] });

        // Show toast only if preference for this type is ON
        const payload = msg.payload as Notification | undefined;
        if (payload) {
          const muted = isNotificationMuted(payload.type, userPrefs ?? null);
          if (!muted) {
            toast('info', payload.title);
          }
        }
      }
    },
  });

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setUnreadCount(Math.max(0, unreadCount - 1));
      void qc.invalidateQueries({ queryKey: ['notifications-list'] });
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setUnreadCount(0);
      void qc.invalidateQueries({ queryKey: ['notifications-list'] });
    } catch {
      // ignore
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        data-testid="notification-bell"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors"
        aria-label={t('tooltips.notifications')}
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            data-testid="notification-badge"
            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold"
            style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          data-testid="notification-dropdown"
          className="absolute right-0 top-full mt-1 w-80 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-lg z-50"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              {t('notifications.title')}
            </h3>
            {unreadCount > 0 && (
              <button
                data-testid="mark-all-read"
                onClick={handleMarkAllRead}
                className="text-xs text-accent hover:text-accent-hover"
              >
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {!notifications?.items.length ? (
              <div
                data-testid="notification-empty"
                className="flex flex-col items-center justify-center px-4 py-8 gap-2"
              >
                <BellOff
                  className="h-10 w-10 text-[var(--text-secondary)] opacity-50"
                  strokeWidth={1.2}
                />
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {t('notifications.empty')}
                </p>
                <p className="text-xs text-[var(--text-secondary)] text-center">
                  {t('notifications.emptyDesc')}
                </p>
              </div>
            ) : (
              notifications.items.map(notif => {
                const muted = isNotificationMuted(notif.type, userPrefs ?? null);
                return (
                  <div
                    key={notif.id}
                    data-testid={`notification-item-${notif.id}`}
                    className={`px-4 py-3 border-b border-[var(--border)] last:border-0 ${
                      !notif.read ? 'bg-accent/5' : ''
                    } ${muted ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            muted ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {notif.title}
                          {muted && (
                            <span
                              data-testid={`notification-muted-${notif.id}`}
                              className="ml-1 text-xs font-normal text-[var(--text-secondary)]"
                            >
                              {t('notifications.muted')}
                            </span>
                          )}
                        </p>
                        <p
                          className={`text-xs mt-0.5 line-clamp-2 ${
                            muted ? 'text-[var(--text-secondary)]' : 'text-[var(--text-secondary)]'
                          }`}
                        >
                          {notif.message}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notif.read && (
                        <button
                          data-testid={`mark-read-${notif.id}`}
                          onClick={() => handleMarkRead(notif.id)}
                          className="shrink-0 h-2 w-2 rounded-full bg-accent mt-1.5"
                          aria-label={t('notifications.markRead')}
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
