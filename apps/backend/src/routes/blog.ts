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
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - id: e1f2a3b4-c5d6-7890-abcd-ef1234567890
 *                   title: "10 Tips for Modern Interior Design"
 *                   slug: 10-tips-modern-interior-design
 *                   excerpt: "Transform your living space with these expert tips..."
 *                   category: design
 *                   coverImage: "https://example.com/blog/interior.jpg"
 *                   publishedAt: "2025-03-01T09:00:00.000Z"
 *               meta:
 *                 page: 1
 *                 limit: 12
 *                 total: 25
 *                 totalPages: 3
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
 *         content:
 *           application/json:
 *             example:
 *               id: e1f2a3b4-c5d6-7890-abcd-ef1234567890
 *               title: "10 Tips for Modern Interior Design"
 *               slug: 10-tips-modern-interior-design
 *               content: "Full article content in markdown..."
 *               category: design
 *               coverImage: "https://example.com/blog/interior.jpg"
 *               author: "Jane Smith"
 *               publishedAt: "2025-03-01T09:00:00.000Z"
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
