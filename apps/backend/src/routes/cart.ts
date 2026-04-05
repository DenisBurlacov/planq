import { Router, type Router as ExpressRouter } from 'express';
import { getAuthUser } from '@utils/getAuthUser.js';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '@middleware/auth.js';
import { validate } from '@middleware/validate.js';
import * as cartService from '@services/cart.service.js';
import { ok, noContent } from '@utils/response.js';

const router: ExpressRouter = Router();
router.use(authenticate);

/**
 * @openapi
 * /cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get current user's cart
 *     responses:
 *       200:
 *         description: Cart with items and total
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await cartService.getCart(getAuthUser(req).userId));
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /cart:
 *   post:
 *     tags: [Cart]
 *     summary: Add item to cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId: { type: string }
 *               quantity: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Item added
 */
router.post(
  '/',
  validate(cartService.AddToCartSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId, quantity, variantId } = req.body as {
        productId: string;
        quantity: number;
        variantId?: string;
      };
      ok(res, await cartService.addToCart(getAuthUser(req).userId, productId, quantity, variantId));
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /cart/{productId}:
 *   patch:
 *     tags: [Cart]
 *     summary: Update item quantity (0 = remove)
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string } }
 */
router.patch(
  '/:productId',
  validate(cartService.UpdateCartItemSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await cartService.updateCartItem(
        getAuthUser(req).userId,
        req.params.productId as string,
        (req.body as { quantity: number }).quantity
      );
      if (result === null) {
        noContent(res);
      } else {
        ok(res, result);
      }
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /cart/{productId}:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove item from cart
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string } }
 */
router.delete('/:productId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await cartService.removeFromCart(getAuthUser(req).userId, req.params.productId as string);
    noContent(res);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /cart:
 *   delete:
 *     tags: [Cart]
 *     summary: Clear entire cart
 */
router.delete('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await cartService.clearCart(getAuthUser(req).userId);
    noContent(res);
  } catch (err) {
    next(err);
  }
});

export default router;
