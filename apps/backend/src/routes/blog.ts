import { Router, type Router as ExpressRouter } from 'express';
import type { Request, Response, NextFunction } from 'express';
import * as blogService from '@services/blog.service.js';
import { ok } from '@utils/response.js';

const router: ExpressRouter = Router();

/**
 * @openapi
 * /blog:
 *   get:
 *     tags: [Blog]
 *     summary: List blog articles (paginated, filterable by category)
 *     security: []
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 12 } }
 *       - { in: query, name: category, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated list of blog articles
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, category } = blogService.BlogQuerySchema.parse(req.query);
    ok(res, await blogService.listArticles(page, limit, category));
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /blog/{slug}:
 *   get:
 *     tags: [Blog]
 *     summary: Get a single blog article by slug
 *     security: []
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Blog article
 *       404:
 *         description: Article not found
 */
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await blogService.getArticleBySlug(req.params.slug as string));
  } catch (err) {
    next(err);
  }
});

export default router;
