jest.mock('@utils/prisma.js', () => ({
  __esModule: true,
  default: {
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { getNotificationPrefs, updateNotificationPrefs } from '@services/notifications.service.js';
import prisma from '@utils/prisma.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFn = (fn: unknown) => fn as jest.MockedFunction<(...args: any[]) => any>;

const DEFAULT_PREFS = {
  email: true,
  push: false,
  newsletter: false,
  orderUpdates: true,
  promotions: false,
};

describe('notifications.service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getNotificationPrefs', () => {
    it('returns stored notification preferences', async () => {
      const stored = {
        email: false,
        push: true,
        newsletter: true,
        orderUpdates: true,
        promotions: false,
      };
      mockFn(prisma.user.findFirst).mockResolvedValue({ notificationPrefs: stored });

      const result = await getNotificationPrefs('u1');

      expect(result).toEqual(stored);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'u1' },
        select: { notificationPrefs: true },
      });
    });

    it('returns default prefs when user has null notificationPrefs', async () => {
      mockFn(prisma.user.findFirst).mockResolvedValue({ notificationPrefs: null });

      const result = await getNotificationPrefs('u1');

      expect(result).toEqual(DEFAULT_PREFS);
    });

    it('throws USER_NOT_FOUND when user does not exist', async () => {
      mockFn(prisma.user.findFirst).mockResolvedValue(null);

      await expect(getNotificationPrefs('nonexistent')).rejects.toMatchObject({
        code: 'USER_NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('updateNotificationPrefs', () => {
    it('merges partial input with current prefs and saves', async () => {
      // getNotificationPrefs is called internally, so mock findFirst
      mockFn(prisma.user.findFirst).mockResolvedValue({ notificationPrefs: DEFAULT_PREFS });
      mockFn(prisma.user.update).mockResolvedValue({});

      const result = await updateNotificationPrefs('u1', { push: true, newsletter: true });

      const expected = { ...DEFAULT_PREFS, push: true, newsletter: true };
      expect(result).toEqual(expected);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { notificationPrefs: expected },
      });
    });

    it('preserves existing prefs when updating a single field', async () => {
      const current = {
        email: false,
        push: true,
        newsletter: true,
        orderUpdates: false,
        promotions: true,
      };
      mockFn(prisma.user.findFirst).mockResolvedValue({ notificationPrefs: current });
      mockFn(prisma.user.update).mockResolvedValue({});

      const result = await updateNotificationPrefs('u1', { email: true });

      expect(result.email).toBe(true);
      expect(result.push).toBe(true);
      expect(result.newsletter).toBe(true);
      expect(result.orderUpdates).toBe(false);
      expect(result.promotions).toBe(true);
    });

    it('uses defaults when user has no stored prefs', async () => {
      mockFn(prisma.user.findFirst).mockResolvedValue({ notificationPrefs: null });
      mockFn(prisma.user.update).mockResolvedValue({});

      const result = await updateNotificationPrefs('u1', { promotions: true });

      expect(result).toEqual({ ...DEFAULT_PREFS, promotions: true });
    });

    it('throws USER_NOT_FOUND when user does not exist', async () => {
      mockFn(prisma.user.findFirst).mockResolvedValue(null);

      await expect(updateNotificationPrefs('nonexistent', { email: false })).rejects.toMatchObject({
        code: 'USER_NOT_FOUND',
        statusCode: 404,
      });
    });
  });
});
