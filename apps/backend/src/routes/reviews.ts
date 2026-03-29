import { Router, type Router as ExpressRouter } from 'express';
import { getAuthUser } from '@utils/getAuthUser.js';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '@middleware/auth.js';
import { validate } from '@middleware/validate.js';
import * as reviewsService from '@services/reviews.service.js';
import { ok, created, noContent } from '@utils/response.js';

const router: ExpressRouter = Router();

const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

/**
 * @openapi
 * /reviews/product/{productId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get reviews for a product
 *     security: []
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string } }
 */
router.get('/product/:productId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = PaginationSchema.parse(req.query);
    ok(res, await reviewsService.getProductReviews(req.params.productId as string, page, limit));
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /reviews/product/{productId}:
 *   post:
 *     tags: [Reviews]
 *     summary: Create a review for a product
 */
router.post(
  '/product/:productId',
  authenticate,
  validate(reviewsService.CreateReviewSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      created(
        res,
        await reviewsService.createReview(
          getAuthUser(req).userId,
          req.params.productId as string,
          req.body as reviewsService.CreateReviewInput
        )
      );
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /reviews/{id}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete (soft) a review
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 */
router.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await reviewsService.deleteReview(getAuthUser(req).userId, req.params.id as string);
    noContent(res);
  } catch (err) {
    next(err);
  }
});

export default router;
