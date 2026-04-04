import { OrderStatus } from '@prisma/client';
import prisma from '@utils/prisma.js';
import logger from '@utils/logger.js';
import { wsServer } from '../wsServer.js';

export function schedulePaymentResult(
  userId: string,
  orderId: string,
  cardNumber?: string,
  delayMs = 3000
): void {
  const cardDigits = (cardNumber ?? '').replace(/\s/g, '');

  // 4000000000000002 -> declined
  if (cardDigits === '4000000000000002') {
    setTimeout(async () => {
      try {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.CANCELLED },
        });
        wsServer.sendToUser(userId, 'payment.result', {
          status: 'declined',
          orderId,
        });
        logger.info({ message: 'payment.result declined sent', userId, orderId });
      } catch (err) {
        logger.error({ message: 'Failed to send payment.result declined', orderId, error: err });
      }
    }, delayMs);
    return;
  }

  // 4000000000000069 -> timeout after 5s
  if (cardDigits === '4000000000000069') {
    setTimeout(async () => {
      try {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.CANCELLED },
        });
        wsServer.sendToUser(userId, 'payment.result', {
          status: 'timeout',
          orderId,
        });
        logger.info({ message: 'payment.result timeout sent', userId, orderId });
      } catch (err) {
        logger.error({ message: 'Failed to send payment.result timeout', orderId, error: err });
      }
    }, 5000);
    return;
  }

  // Default: success
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
