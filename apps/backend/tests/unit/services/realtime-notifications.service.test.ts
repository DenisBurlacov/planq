jest.mock('@utils/prisma.js', () => ({
  __esModule: true,
  default: {
    notification: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ws/wsServer.js', () => ({
  __esModule: true,
  wsServer: {
    sendToUser: jest.fn(),
  },
}));

import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
} from '@services/realtime-notifications.service.js';
import prisma from '@utils/prisma.js';
import { wsServer } from '@ws/wsServer.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFn = (fn: unknown) => fn as jest.MockedFunction<(...args: any[]) => any>;

describe('realtime-notifications.service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('listNotifications', () => {
    it('returns paginated notifications for user', async () => {
      const items = [
        { id: 'n1', userId: 'u1', title: 'Order shipped', message: 'Your order...', read: false },
      ];
      mockFn(prisma.notification.findMany).mockResolvedValue(items);
      mockFn(prisma.notification.count).mockResolvedValue(1);

      const result = await listNotifications('u1', 1, 20);

      expect(result.items).toEqual(items);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pages).toBe(1);
    });

    it('calculates pages correctly', async () => {
      mockFn(prisma.notification.findMany).mockResolvedValue([]);
      mockFn(prisma.notification.count).mockResolvedValue(50);

      const result = await listNotifications('u1', 1, 20);

      expect(result.pages).toBe(3); // ceil(50/20) = 3
    });

    it('uses correct skip/take', async () => {
      mockFn(prisma.notification.findMany).mockResolvedValue([]);
      mockFn(prisma.notification.count).mockResolvedValue(0);

      await listNotifications('u1', 2, 10);

      const call = mockFn(prisma.notification.findMany).mock.calls[0][0];
      expect(call.skip).toBe(10);
      expect(call.take).toBe(10);
      expect(call.where).toEqual({ userId: 'u1' });
    });

    it('orders by createdAt desc', async () => {
      mockFn(prisma.notification.findMany).mockResolvedValue([]);
      mockFn(prisma.notification.count).mockResolvedValue(0);

      await listNotifications('u1', 1, 20);

      const call = mockFn(prisma.notification.findMany).mock.calls[0][0];
      expect(call.orderBy).toEqual({ createdAt: 'desc' });
    });
  });

  describe('getUnreadCount', () => {
    it('returns unread notification count', async () => {
      mockFn(prisma.notification.count).mockResolvedValue(5);

      const result = await getUnreadCount('u1');

      expect(result).toEqual({ count: 5 });
      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { userId: 'u1', read: false },
      });
    });

    it('returns zero when no unread notifications', async () => {
      mockFn(prisma.notification.count).mockResolvedValue(0);

      const result = await getUnreadCount('u1');

      expect(result).toEqual({ count: 0 });
    });
  });

  describe('markAsRead', () => {
    it('marks a notification as read', async () => {
      const notification = { id: 'n1', userId: 'u1', read: false };
      mockFn(prisma.notification.findFirst).mockResolvedValue(notification);
      mockFn(prisma.notification.update).mockResolvedValue({ ...notification, read: true });

      const result = await markAsRead('u1', 'n1');

      expect(result.read).toBe(true);
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'n1' },
        data: { read: true },
      });
    });

    it('throws NOTIFICATION_NOT_FOUND when notification does not exist', async () => {
      mockFn(prisma.notification.findFirst).mockResolvedValue(null);

      await expect(markAsRead('u1', 'nonexistent')).rejects.toMatchObject({
        code: 'NOTIFICATION_NOT_FOUND',
        statusCode: 404,
      });
    });

    it('throws NOTIFICATION_NOT_FOUND when notification belongs to different user', async () => {
      mockFn(prisma.notification.findFirst).mockResolvedValue(null);

      await expect(markAsRead('u1', 'n2')).rejects.toMatchObject({
        code: 'NOTIFICATION_NOT_FOUND',
        statusCode: 404,
      });

      expect(prisma.notification.findFirst).toHaveBeenCalledWith({
        where: { id: 'n2', userId: 'u1' },
      });
    });
  });

  describe('markAllAsRead', () => {
    it('marks all unread notifications as read', async () => {
      mockFn(prisma.notification.updateMany).mockResolvedValue({ count: 3 });

      const result = await markAllAsRead('u1');

      expect(result).toEqual({ updated: 3 });
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'u1', read: false },
        data: { read: true },
      });
    });

    it('returns zero when no unread notifications', async () => {
      mockFn(prisma.notification.updateMany).mockResolvedValue({ count: 0 });

      const result = await markAllAsRead('u1');

      expect(result).toEqual({ updated: 0 });
    });
  });

  describe('createNotification', () => {
    it('creates a notification and broadcasts via WebSocket', async () => {
      const created = {
        id: 'n1',
        userId: 'u1',
        type: 'order_shipped',
        title: 'Order Shipped',
        message: 'Your order has been shipped.',
        read: false,
        createdAt: new Date(),
      };
      mockFn(prisma.notification.create).mockResolvedValue(created);

      const result = await createNotification(
        'u1',
        'order_shipped',
        'Order Shipped',
        'Your order has been shipped.'
      );

      expect(result).toEqual(created);
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          type: 'order_shipped',
          title: 'Order Shipped',
          message: 'Your order has been shipped.',
        },
      });
      expect(wsServer.sendToUser).toHaveBeenCalledWith('u1', 'notification.new', created);
    });

    it('sends correct WS event name notification.new', async () => {
      const created = { id: 'n1', userId: 'u1', type: 'promo', title: 'Sale', message: '50% off' };
      mockFn(prisma.notification.create).mockResolvedValue(created);

      await createNotification('u1', 'promo', 'Sale', '50% off');

      expect(wsServer.sendToUser).toHaveBeenCalledWith('u1', 'notification.new', created);
    });
  });
});
