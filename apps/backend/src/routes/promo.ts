import { Router, type Router as ExpressRouter } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as promoService from '@services/promo.service.js';
import { ok } from '@utils/response.js';

const router: ExpressRouter = Router();

/**
 * @openapi
 * /promotions/active:
 *   get:
 *     tags: [Promotions]
 *     summary: Get active promotions (polling endpoint)
 *     security: []
 *     responses:
 *       200:
 *         description: List of active promo codes
 */
router.get('/active', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await promoService.getActivePromotions());
  } catch (err) {
    next(err);
  }
});

const ValidateSchema = z.object({
  code: z.string().min(1),
  orderTotal: z.number().optional(),
});

/**
 * @openapi
 * /promotions/validate:
 *   post:
 *     tags: [Promotions]
 *     summary: Validate a promo code
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code: { type: string }
 *               orderTotal: { type: number }
 *     responses:
 *       200:
 *         description: Promo code is valid
 *       400:
 *         description: Promo code is invalid or expired
 */
router.post('/validate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, orderTotal } = ValidateSchema.parse(req.body);
    ok(res, await promoService.validatePromoCode(code, orderTotal));
  } catch (err) {
    next(err);
  }
});

export default router;
