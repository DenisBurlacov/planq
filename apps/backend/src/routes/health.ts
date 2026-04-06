import { Router, type Router as ExpressRouter } from 'express';
import type { Request, Response, NextFunction } from 'express';
import prisma from '@utils/prisma.js';
import logger from '@utils/logger.js';

const router: ExpressRouter = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             example:
 *               status: ok
 *               db: ok
 *               timestamp: "2025-06-15T12:00:00.000Z"
 *       503:
 *         description: Service is unhealthy
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'ok', timestamp: new Date().toISOString() });
  } catch (err) {
    logger.error({ message: 'Health check DB ping failed', error: err });
    next(err);
  }
});

export default router;
