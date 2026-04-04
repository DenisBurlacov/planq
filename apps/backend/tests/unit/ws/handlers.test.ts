jest.mock('@ws/wsServer.js', () => ({
  __esModule: true,
  wsServer: { sendToUser: jest.fn() },
}));

jest.mock('@utils/logger.js', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('@utils/prisma.js', () => ({
  __esModule: true,
  default: {
    order: { update: jest.fn() },
  },
}));

import { emitOrderStatusUpdated } from '@ws/handlers/order.js';
import { emitCartUpdated } from '@ws/handlers/cart.js';
import { schedulePaymentResult } from '@ws/handlers/payment.js';
import { wsServer } from '@ws/wsServer.js';
import prisma from '@utils/prisma.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFn = (fn: unknown) => fn as jest.MockedFunction<(...args: any[]) => any>;

describe('WS handlers', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('emitOrderStatusUpdated', () => {
    it('sends order.status.updated to the correct user', () => {
      emitOrderStatusUpdated('user-1', 'order-1', 'SHIPPED');

      expect(wsServer.sendToUser).toHaveBeenCalledWith('user-1', 'order.status.updated', {
        orderId: 'order-1',
        status: 'SHIPPED',
      });
    });
  });

  describe('emitCartUpdated', () => {
    it('sends cart.updated to the correct user', () => {
      const items = [{ productId: 'p1', quantity: 2 }];
      emitCartUpdated('user-1', items, 199.99);

      expect(wsServer.sendToUser).toHaveBeenCalledWith('user-1', 'cart.updated', {
        items,
        total: 199.99,
      });
    });
  });

  describe('schedulePaymentResult', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('sends payment.result after delay', async () => {
      mockFn(prisma.order.update).mockResolvedValue({});

      schedulePaymentResult('user-1', 'order-1', undefined, 100);
      await jest.runAllTimersAsync();

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'PROCESSING' },
      });
      expect(wsServer.sendToUser).toHaveBeenCalledWith('user-1', 'payment.result', {
        status: 'success',
        orderId: 'order-1',
      });
    });

    it('does not throw if order update fails', async () => {
      mockFn(prisma.order.update).mockRejectedValue(new Error('DB error'));

      schedulePaymentResult('user-1', 'order-99', undefined, 100);
      await expect(jest.runAllTimersAsync()).resolves.not.toThrow();
    });
  });
});
