import { Router, type Router as ExpressRouter } from 'express';
import { getAuthUser } from '@utils/getAuthUser.js';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '@middleware/auth.js';
import { validate } from '@middleware/validate.js';
import * as wishlistService from '@services/wishlist.service.js';
import { ok, created, noContent } from '@utils/response.js';

const router: ExpressRouter = Router();
router.use(authenticate);

const AddSchema = z.object({ productId: z.string().min(1) });

const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

/**
 * @openapi
 * /wishlist:
 *   get:
 *     tags: [Wishlist]
 *     summary: Get user's wishlist (paginated)
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *     responses:
 *       200:
 *         description: Paginated list of wishlist items
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - id: wl1a2b3c4-d5e6-7890-abcd-ef1234567890
 *                   productId: 383bf383-85a4-46ee-99f8-9517b7a588b3
 *                   product:
 *                     name: Nordic Sofa
 *                     price: 899.99
 *                     image: "https://example.com/sofa.jpg"
 *                     stock: 15
 *                   addedAt: "2025-03-10T09:00:00.000Z"
 *               meta:
 *                 page: 1
 *                 limit: 20
 *                 total: 3
 *                 totalPages: 1
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = PaginationSchema.parse(req.query);
    ok(res, await wishlistService.getWishlist(getAuthUser(req).userId, page, limit));
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /wishlist:
 *   post:
 *     tags: [Wishlist]
 *     summary: Add product to wishlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             productId: 383bf383-85a4-46ee-99f8-9517b7a588b3
 *     responses:
 *       201:
 *         description: Product added to wishlist
 *         content:
 *           application/json:
 *             example:
 *               id: wl2b3c4d5-e6f7-8901-bcde-f23456789012
 *               productId: 383bf383-85a4-46ee-99f8-9517b7a588b3
 *               addedAt: "2025-03-15T12:00:00.000Z"
 */
router.post('/', validate(AddSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    created(
      res,
      await wishlistService.addToWishlist(
        getAuthUser(req).userId,
        (req.body as { productId: string }).productId
      )
    );
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /wishlist/{productId}:
 *   delete:
 *     tags: [Wishlist]
 *     summary: Remove product from wishlist
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string } }
 *     responses:
 *       204:
 *         description: Product removed from wishlist
 */
router.delete('/:productId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await wishlistService.removeFromWishlist(
      getAuthUser(req).userId,
      req.params.productId as string
    );
    noContent(res);
  } catch (err) {
    next(err);
  }
});

export default router;
