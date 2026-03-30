import { OrderStatus } from '@prisma/client';
import prisma from '@utils/prisma.js';
import logger from '@utils/logger.js';
import { wsServer } from '../wsServer.js';

export function schedulePaymentResult(userId: string, orderId: string, delayMs = 3000): void {
  setTimeout(async () => {
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PROCESSING },
      });

      wsServer.sendToUser(userId, 'payment.result', { status: 'success', orderId });
      logger.info({ message: 'payment.result sent', userId, orderId });
    } catch (err) {
      logger.error({ message: 'Failed to send payment.result', orderId, error: err });
    }
  }, delayMs);
}
