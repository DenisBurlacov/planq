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
 *         content:
 *           application/json:
 *             example:
 *               - id: c1d2e3f4-a5b6-7890-cdef-123456789012
 *                 name: Living Room
 *                 slug: living-room
 *                 image: "https://example.com/categories/living-room.jpg"
 *               - id: d2e3f4a5-b6c7-8901-defg-345678901234
 *                 name: Lighting
 *                 slug: lighting
 *                 image: "https://example.com/categories/lighting.jpg"
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
