import logger from '@utils/logger.js';
import { wsServer } from '../wsServer.js';

export function emitCartUpdated(userId: string, items: unknown[], total: number): void {
  wsServer.sendToUser(userId, 'cart.updated', { items, total });
  logger.info({ message: 'cart.updated sent', userId });
}
