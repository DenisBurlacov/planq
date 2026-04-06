import { Router, type Router as ExpressRouter } from 'express';
import { getAuthUser } from '@utils/getAuthUser.js';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '@middleware/auth.js';
import { validate } from '@middleware/validate.js';
import * as ordersService from '@services/orders.service.js';
import { ok, created } from '@utils/response.js';
import { z } from 'zod';

const router: ExpressRouter = Router();
router.use(authenticate);

const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

/**
 * @openapi
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get user's orders
 *     responses:
 *       200:
 *         description: Paginated list of orders
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = PaginationSchema.parse(req.query);
    ok(res, await ordersService.getOrders(getAuthUser(req).userId, page, limit));
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by ID
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await ordersService.getOrderById(getAuthUser(req).userId, req.params.id as string));
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /orders/checkout:
 *   post:
 *     tags: [Orders]
 *     summary: Create order (checkout)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shippingAddress, paymentMethod]
 *             properties:
 *               shippingAddress: { type: string }
 *               paymentMethod: { type: string, enum: [CARD, WALLET] }
 *               promoCode: { type: string }
 *               cardNumber: { type: string }
 *               deliveryMethod: { type: string, enum: [standard, express, nextDay], default: standard }
 *           example:
 *             shippingAddress: 123 Test St, Apt 4B, New York, NY 10001
 *             paymentMethod: CARD
 *             cardNumber: "4242424242424242"
 *             deliveryMethod: STANDARD
 *     responses:
 *       201:
 *         description: Order created
 *         content:
 *           application/json:
 *             example:
 *               id: e1f2a3b4-c5d6-7890-efab-cd1234567890
 *               userId: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *               status: PENDING
 *               totalAmount: 959.98
 *               shippingAddress: 123 Test St, Apt 4B, New York, NY 10001
 *               paymentMethod: CARD
 *               deliveryMethod: STANDARD
 *               items:
 *                 - id: f1a2b3c4-d5e6-7890-abcd-ef2345678901
 *                   productId: b1c2d3e4-f5a6-7890-bcde-f12345678901
 *                   quantity: 2
 *                   priceAtOrder: 479.99
 *               createdAt: "2026-04-04T12:00:00.000Z"
 */
router.post(
  '/checkout',
  validate(ordersService.CheckoutSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await ordersService.checkout(
        getAuthUser(req).userId,
        req.body as ordersService.CheckoutInput
      );
      created(res, order);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /orders/{id}/cancel:
 *   put:
 *     tags: [Orders]
 *     summary: Cancel an order (PENDING/PROCESSING only)
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason: { type: string, minLength: 1 }
 *           example:
 *             reason: Changed mind
 *     responses:
 *       200:
 *         description: Order cancelled (wallet refunded if applicable)
 *         content:
 *           application/json:
 *             example:
 *               id: e1f2a3b4-c5d6-7890-efab-cd1234567890
 *               status: CANCELLED
 *               cancellationReason: Changed mind
 *               totalAmount: 959.98
 *               refunded: true
 *       400:
 *         description: Order cannot be cancelled
 *       404:
 *         description: Order not found
 */
router.put(
  '/:id/cancel',
  validate(ordersService.CancelOrderSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ordersService.cancelOrder(
        getAuthUser(req).userId,
        req.params.id as string,
        req.body as ordersService.CancelOrderInput
      );
      ok(res, result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
