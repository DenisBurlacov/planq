import { z } from 'zod';
import prisma from '@utils/prisma.js';
import { AppError } from '@utils/AppError.js';
import { wsServer } from '@ws/wsServer.js';

// ─── Validation Schemas ──────────────────────────────────────────────────────

export const NotificationsPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

// ─── Service ────────────────────────────────────────────────────────────────

export async function listNotifications(userId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getUnreadCount(userId: string) {
  const count = await prisma.notification.count({
    where: { userId, read: false },
  });
  return { count };
}

export async function markAsRead(userId: string, notificationId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });
  if (!notification) {
    throw new AppError('NOTIFICATION_NOT_FOUND', 'Notification not found', 404);
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

export async function markAllAsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
  return { updated: result.count };
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string
) {
  const notification = await prisma.notification.create({
    data: { userId, type, title, message },
  });

  // Broadcast via WS
  wsServer.sendToUser(userId, 'notification', notification);

  return notification;
}
