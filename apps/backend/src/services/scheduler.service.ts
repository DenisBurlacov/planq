import prisma from '@utils/prisma.js';
import { createNotification } from '@services/realtime-notifications.service.js';
import logger from '@utils/logger.js';

export type SchedulerNotificationType = 'promo' | 'order_update' | 'newsletter' | 'system';

const MESSAGES: Record<SchedulerNotificationType, Array<{ title: string; message: string }>> = {
  promo: [
    { title: 'Flash Sale!', message: 'Flash sale! 20% off all living room furniture' },
    {
      title: 'New Collection',
      message: 'New collection just dropped — explore Scandinavian essentials',
    },
    { title: 'Weekend Deal', message: 'Weekend deal: buy 2 chairs, get 1 free' },
    { title: 'Member Exclusive', message: 'Exclusive for members — 15% off bedroom sets' },
    { title: 'Clearance Event', message: 'Clearance event: up to 40% off last-season items' },
    { title: 'Free Shipping', message: 'Free shipping on all orders over €100 today only' },
  ],
  order_update: [
    { title: 'Order Shipped', message: 'Your order has been shipped and is on its way' },
    { title: 'Order Processing', message: 'Your order is now being processed by our warehouse' },
    { title: 'Delivery Update', message: 'Your package is out for delivery today' },
    { title: 'Order Confirmed', message: 'We have confirmed your order and payment' },
    { title: 'Ready for Pickup', message: 'Your order is ready for pickup at the store' },
    {
      title: 'Delivery Scheduled',
      message: 'Your delivery is scheduled for tomorrow between 10-14h',
    },
  ],
  newsletter: [
    { title: 'Weekly Digest', message: 'Weekly digest: Top 5 trending products this week' },
    { title: 'Design Tips', message: 'Design tips: How to style a small living room' },
    { title: 'Staff Picks', message: 'Staff picks: Our favorite new arrivals this month' },
    { title: 'Trend Report', message: 'Trend report: Minimalist furniture is back in 2026' },
    { title: 'Style Guide', message: 'Your monthly style guide: Spring/Summer essentials' },
    { title: 'Top Rated', message: 'Top rated: Products with 5-star reviews this week' },
  ],
  system: [
    { title: 'Scheduled Maintenance', message: 'Scheduled maintenance on Sunday 2AM-4AM CET' },
    { title: 'System Update', message: 'System update completed — new features available' },
    { title: 'Security Notice', message: 'Security notice: Please update your password regularly' },
    { title: 'Privacy Update', message: 'We have updated our privacy policy — please review' },
    { title: 'Service Restored', message: 'All services have been restored after maintenance' },
    {
      title: 'Performance Improvement',
      message: 'Performance improvements applied — faster page loads',
    },
  ],
};

// Preference key mapping: notification type -> user pref field
const TYPE_TO_PREF: Record<string, string | null> = {
  promo: 'promotions',
  order_update: 'orderUpdates',
  newsletter: 'newsletter',
  system: null, // always delivered
};

const DEFAULT_PREFS: Record<string, boolean> = {
  promotions: false,
  orderUpdates: true,
  newsletter: false,
};

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let sentCount = 0;
let messageIndex = 0;

async function getSchedulerSettings() {
  const rows = await prisma.storeSetting.findMany({
    where: {
      key: {
        in: [
          'notification_scheduler_enabled',
          'notification_scheduler_interval',
          'notification_scheduler_max',
          'notification_scheduler_type',
        ],
      },
    },
  });

  const map = new Map(rows.map(r => [r.key, r.value]));

  return {
    enabled: map.get('notification_scheduler_enabled') === 'true',
    interval: parseInt(map.get('notification_scheduler_interval') ?? '30', 10),
    max: parseInt(map.get('notification_scheduler_max') ?? '10', 10),
    type: (map.get('notification_scheduler_type') ?? 'promo') as SchedulerNotificationType,
  };
}

function shouldDeliver(
  notificationType: SchedulerNotificationType,
  userPrefs: Record<string, boolean> | null
): boolean {
  const prefKey = TYPE_TO_PREF[notificationType];
  if (prefKey === null) return true; // system — always
  const prefs = userPrefs ?? DEFAULT_PREFS;
  return prefs[prefKey] !== false;
}

async function tick(type: SchedulerNotificationType, max: number) {
  if (sentCount >= max) {
    stopScheduler();
    logger.info({ message: 'Notification scheduler reached max, stopping', sentCount, max });
    return;
  }

  const messages = MESSAGES[type];
  const template = messages[messageIndex % messages.length];
  messageIndex++;

  // Get all active users
  const users = await prisma.user.findMany({
    where: { isBlocked: false, deletedAt: null },
    select: { id: true, notificationPrefs: true },
  });

  for (const user of users) {
    // We always create the notification — the frontend handles muted display
    // based on user preferences and the notification type field.
    await createNotification(user.id, type, template.title, template.message);
  }

  sentCount++;
  logger.info({
    message: 'Scheduler tick completed',
    type,
    sentCount,
    usersNotified: users.length,
  });

  if (sentCount >= max) {
    stopScheduler();
    logger.info({ message: 'Notification scheduler reached max, stopping', sentCount, max });
  }
}

export function stopScheduler() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    logger.info({ message: 'Notification scheduler stopped' });
  }
}

export async function startScheduler() {
  stopScheduler();
  sentCount = 0;
  messageIndex = 0;

  const settings = await getSchedulerSettings();
  if (!settings.enabled) {
    logger.info({ message: 'Notification scheduler is disabled' });
    return { started: false, ...settings };
  }

  const intervalMs = settings.interval * 1000;

  logger.info({
    message: 'Starting notification scheduler',
    interval: settings.interval,
    max: settings.max,
    type: settings.type,
  });

  intervalHandle = setInterval(() => {
    tick(settings.type, settings.max).catch(err => {
      logger.error({ message: 'Scheduler tick error', error: String(err) });
    });
  }, intervalMs);

  return { started: true, ...settings };
}

export async function restartScheduler() {
  return startScheduler();
}

export { shouldDeliver, TYPE_TO_PREF, DEFAULT_PREFS };
