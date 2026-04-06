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
 *         content:
 *           application/json:
 *             example:
 *               - code: SAVE10
 *                 discountPercent: 10
 *                 validUntil: "2025-12-31T23:59:59.000Z"
 *                 minOrderAmount: 50.00
 *               - code: SUMMER20
 *                 discountPercent: 20
 *                 validUntil: "2025-08-31T23:59:59.000Z"
 *                 minOrderAmount: 100.00
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
 *           example:
 *             code: SAVE10
 *             orderTotal: 89.99
 *     responses:
 *       200:
 *         description: Promo code is valid
 *         content:
 *           application/json:
 *             example:
 *               valid: true
 *               code: SAVE10
 *               discountPercent: 10
 *               discountAmount: 9.00
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
