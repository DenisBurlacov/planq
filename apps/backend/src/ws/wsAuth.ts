import { verifyAccessToken } from '@utils/jwt.js';
import logger from '@utils/logger.js';

export function wsAuth(token: string): string | null {
  if (!token) return null;
  try {
    const payload = verifyAccessToken(token);
    return payload.userId;
  } catch {
    logger.warn({ message: 'WS auth failed — invalid or expired token' });
    return null;
  }
}
