import { Router, type Router as ExpressRouter } from 'express';
import { getAuthUser } from '@utils/getAuthUser.js';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '@middleware/auth.js';
import { uploadReviewImages } from '@middleware/upload.js';
import * as reviewsService from '@services/reviews.service.js';
import { ok, created, noContent } from '@utils/response.js';

const router: ExpressRouter = Router();

const ReviewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  rating: z.coerce.number().int().min(1).max(5).optional(),
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
 *       - { in: query, name: rating, schema: { type: integer, minimum: 1, maximum: 5 } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200:
 *         description: Product reviews
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - id: r1a2b3c4-d5e6-7890-abcd-ef1234567890
 *                   rating: 5
 *                   comment: "Excellent quality, very comfortable!"
 *                   images: ["/uploads/reviews/img1.jpg"]
 *                   user:
 *                     id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *                     name: Alice Johnson
 *                   createdAt: "2025-02-20T14:30:00.000Z"
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 12
 *                 totalPages: 2
 *               averageRating: 4.5
 */
router.get('/product/:productId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, rating } = ReviewsQuerySchema.parse(req.query);
    ok(
      res,
      await reviewsService.getProductReviews(req.params.productId as string, page, limit, rating)
    );
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /reviews/product/{productId}:
 *   post:
 *     tags: [Reviews]
 *     summary: Create a review for a product (multipart with optional images)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *               images:
 *                 type: array
 *                 items: { type: string, format: binary }
 *                 maxItems: 3
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *               images: { type: array, items: { type: string }, maxItems: 3 }
 *     responses:
 *       201:
 *         description: Review created
 *         content:
 *           application/json:
 *             example:
 *               id: r2b3c4d5-e6f7-8901-bcde-f23456789012
 *               productId: 383bf383-85a4-46ee-99f8-9517b7a588b3
 *               rating: 4
 *               comment: "Great product, fast delivery."
 *               images: []
 *               createdAt: "2025-03-15T12:00:00.000Z"
 */
router.post(
  '/product/:productId',
  authenticate,
  uploadReviewImages,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Handle multipart: rating/comment come as strings from form-data
      const files = req.files as Express.Multer.File[] | undefined;
      const imagePaths = files?.map(f => `/uploads/reviews/${f.filename}`) ?? [];

      const input = reviewsService.CreateReviewSchema.parse({
        rating: Number(req.body.rating),
        comment: req.body.comment || undefined,
        images: imagePaths.length > 0 ? imagePaths : req.body.images || undefined,
      });

      created(
        res,
        await reviewsService.createReview(
          getAuthUser(req).userId,
          req.params.productId as string,
          input
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
 *     responses:
 *       204:
 *         description: Review deleted
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
