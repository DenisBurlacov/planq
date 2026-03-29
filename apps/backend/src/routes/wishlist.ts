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

/**
 * @openapi
 * /wishlist:
 *   get:
 *     tags: [Wishlist]
 *     summary: Get user's wishlist
 *     responses:
 *       200:
 *         description: List of wishlist items
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await wishlistService.getWishlist(getAuthUser(req).userId));
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
