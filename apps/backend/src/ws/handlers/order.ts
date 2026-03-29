import logger from '@utils/logger.js';
import { wsServer } from '../wsServer.js';

export function emitOrderStatusUpdated(userId: string, orderId: string, status: string): void {
  wsServer.sendToUser(userId, 'order.status.updated', { orderId, status });
  logger.info({ message: 'order.status.updated sent', userId, orderId, status });
}
