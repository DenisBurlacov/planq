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

const OrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

/**
 * @openapi
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get user's orders
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *       - { in: query, name: dateFrom, schema: { type: string, format: date-time } }
 *       - { in: query, name: dateTo, schema: { type: string, format: date-time } }
 *     responses:
 *       200:
 *         description: Paginated list of orders
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, dateFrom, dateTo } = OrdersQuerySchema.parse(req.query);
    ok(res, await ordersService.getOrders(getAuthUser(req).userId, page, limit, dateFrom, dateTo));
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

export default router;
