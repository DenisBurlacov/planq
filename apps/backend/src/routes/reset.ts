import { Router, type Router as ExpressRouter } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@utils/AppError.js';
import logger from '@utils/logger.js';

const router: ExpressRouter = Router();

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
  const token = req.headers['x-reset-token'];
  const expected = process.env.RESET_TOKEN;

  if (!expected || token !== expected) {
    return next(new AppError('UNAUTHORIZED', 'Invalid reset token', 401));
  }

  try {
    logger.info({ message: 'DB reset triggered', requestId: req.requestId });

    // Dynamic import to avoid loading seed in production bundle
    const { default: runSeed } = await import('../../prisma/seed.js');
    await runSeed();

    logger.info({ message: 'DB reset completed', requestId: req.requestId });
    res.json({ status: 'ok', message: 'Database reset to seed state' });
  } catch (err) {
    next(err);
  }
});

export default router;
