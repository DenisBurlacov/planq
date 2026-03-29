import { Router, type Router as ExpressRouter } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { getCategories } from '@services/categories.service.js';
import { ok } from '@utils/response.js';

const router: ExpressRouter = Router();

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories
 *     security: []
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await getCategories();
    ok(res, categories);
  } catch (err) {
    next(err);
  }
});

export default router;
