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
 *     responses:
 *       201:
 *         description: Order created
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
 *     responses:
 *       200:
 *         description: Order cancelled (wallet refunded if applicable)
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
