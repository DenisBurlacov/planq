import { Router, type Router as ExpressRouter } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { AppError } from '@utils/AppError.js';
import logger from '@utils/logger.js';
import { wsServer } from '@ws/wsServer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router: ExpressRouter = Router();

function requireResetToken(req: Request, next: NextFunction): boolean {
  const token = req.headers['x-reset-token'];
  const expected = process.env.RESET_TOKEN;
  if (!expected || token !== expected) {
    next(new AppError('UNAUTHORIZED', 'Invalid reset token', 401));
    return false;
  }
  return true;
}

/**
 * @openapi
 * /api/test/reset:
 *   post:
 *     tags: [Test]
 *     summary: Reset database to seed state (QA use only)
 *     security: []
 *     parameters:
 *       - in: header
 *         name: X-Reset-Token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Database reset successfully
 *       401:
 *         description: Invalid reset token
 */
router.post('/reset', async (req: Request, res: Response, next: NextFunction) => {
  if (!requireResetToken(req, next)) return;

  try {
    logger.info({ message: 'DB reset triggered', requestId: req.requestId });

    // Use runtime path to avoid TypeScript rootDir error (seed.ts is outside src/)
    const seedPath = join(__dirname, '../../prisma/seed.js');

    const { default: runSeed } = await import(seedPath);

    await runSeed();

    logger.info({ message: 'DB reset completed', requestId: req.requestId });
    res.json({ status: 'ok', message: 'Database reset to seed state' });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/test/trigger-ws:
 *   post:
 *     tags: [Test]
 *     summary: Send a WebSocket event to a user (QA use only)
 *     security: []
 *     parameters:
 *       - in: header
 *         name: X-Reset-Token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, event, payload]
 *             properties:
 *               userId:
 *                 type: string
 *               event:
 *                 type: string
 *                 enum: [payment.result, order.status.updated, cart.updated]
 *               payload:
 *                 type: object
 *     responses:
 *       200:
 *         description: Event sent (or user not connected)
 *       401:
 *         description: Invalid reset token
 */
router.post('/trigger-ws', (req: Request, res: Response, next: NextFunction) => {
  if (!requireResetToken(req, next)) return;

  const { userId, event, payload } = req.body as {
    userId: string;
    event: string;
    payload: unknown;
  };

  if (!userId || !event) {
    return next(new AppError('VALIDATION_ERROR', 'userId and event are required', 400));
  }

  wsServer.sendToUser(userId, event, payload ?? {});
  logger.info({ message: 'WS event triggered via test endpoint', userId, event });
  res.json({ status: 'ok', sent: true });
});

export default router;
