import { Router, type Router as ExpressRouter } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { AppError } from '@utils/AppError.js';
import logger from '@utils/logger.js';
import prisma from '@utils/prisma.js';
import { hashPassword } from '@utils/password.js';
import { wsServer } from '@ws/wsServer.js';

const router: ExpressRouter = Router();

function requireResetToken(req: Request, next: NextFunction): boolean {
  const token = req.headers['x-reset-token'];
  const expected = process.env.RESET_TOKEN;
  if (!expected || token !== expected) {
    next(new AppError('UNAUTHORIZED', 'Invalid reset token', 401));
    return false;
  }
  return true;
}

const VALID_SCOPES = [
  'orders',
  'cart',
  'wishlist',
  'reviews',
  'notifications',
  'addresses',
] as const;
type ResetScope = (typeof VALID_SCOPES)[number];

const ScopedResetSchema = z
  .object({
    scope: z.array(z.enum(VALID_SCOPES)).optional(),
  })
  .optional();

const GenerateSchema = z.object({
  users: z.number().int().min(0).max(100).optional(),
  products: z.number().int().min(0).max(500).optional(),
  orders: z.number().int().min(0).max(200).optional(),
  reviews: z.number().int().min(0).max(500).optional(),
});

/**
 * @openapi
 * /api/test/reset:
 *   post:
 *     tags: [Test]
 *     summary: Reset database — full or scoped (QA use only)
 *     security: []
 *     parameters:
 *       - in: header
 *         name: X-Reset-Token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scope:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [orders, cart, wishlist, reviews, notifications, addresses]
 *     responses:
 *       200:
 *         description: Database reset successfully
 *       401:
 *         description: Invalid reset token
 */
router.post('/reset', async (req: Request, res: Response, next: NextFunction) => {
  if (!requireResetToken(req, next)) return;

  try {
    const parsed = ScopedResetSchema.parse(req.body);
    const requestedScopes = parsed?.scope;

    // If no scopes specified, do full reset (backward compatible)
    if (!requestedScopes || requestedScopes.length === 0) {
      logger.info({ message: 'DB full reset triggered', requestId: req.requestId });
      const { default: runSeed } = await import('../../prisma/seed.js');
      await runSeed();
      logger.info({ message: 'DB full reset completed', requestId: req.requestId });
      return res.json({ status: 'ok', message: 'Database reset to seed state' });
    }

    // Scoped reset
    const reset: string[] = [];
    const skipped: string[] = [];

    const scopeHandlers: Record<ResetScope, () => Promise<void>> = {
      orders: async () => {
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
      },
      cart: async () => {
        await prisma.cartItem.deleteMany();
        await prisma.cart.deleteMany();
      },
      wishlist: async () => {
        await prisma.wishlist.deleteMany();
      },
      reviews: async () => {
        await prisma.review.deleteMany();
        // Reset product review counts
        await prisma.product.updateMany({ data: { rating: 0, reviewCount: 0 } });
      },
      notifications: async () => {
        // Clear notification preferences on all users
        await prisma.user.updateMany({ data: { notificationPrefs: undefined } });
      },
      addresses: async () => {
        await prisma.address.deleteMany();
      },
    };

    for (const scope of requestedScopes) {
      const handler = scopeHandlers[scope];
      if (handler) {
        await handler();
        reset.push(scope);
      } else {
        skipped.push(scope);
      }
    }

    logger.info({ message: 'DB scoped reset completed', reset, skipped, requestId: req.requestId });
    res.json({ reset, skipped });
  } catch (err) {
    next(err);
  }
});

// ─── Random data helpers ──────────────────────────────────────────────────────

const FIRST_NAMES = [
  'Emma',
  'Liam',
  'Sophia',
  'Noah',
  'Olivia',
  'James',
  'Ava',
  'Lucas',
  'Mia',
  'Ethan',
];
const LAST_NAMES = [
  'Smith',
  'Johnson',
  'Brown',
  'Taylor',
  'Anderson',
  'Thomas',
  'Jackson',
  'White',
  'Harris',
  'Clark',
];
const ADJECTIVES = [
  'Modern',
  'Classic',
  'Elegant',
  'Rustic',
  'Minimal',
  'Premium',
  'Cozy',
  'Sleek',
  'Vintage',
  'Nordic',
];
const NOUNS = [
  'Chair',
  'Table',
  'Lamp',
  'Shelf',
  'Desk',
  'Sofa',
  'Rug',
  'Cabinet',
  'Mirror',
  'Vase',
];
const REVIEW_COMMENTS = [
  'Great quality, exactly as described',
  'Very happy with this purchase',
  'Good value for the price',
  'Looks even better in person',
  'Solid construction, well made',
  'Perfect addition to my room',
  'Fast delivery, great packaging',
  'Would recommend to friends',
  'Exceeded my expectations',
  'Nice design, sturdy build',
];
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

function randomFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * @openapi
 * /api/test/generate:
 *   post:
 *     tags: [Test]
 *     summary: Generate random test data (QA use only)
 *     security: []
 *     parameters:
 *       - in: header
 *         name: X-Reset-Token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               users: { type: integer, minimum: 0, maximum: 100 }
 *               products: { type: integer, minimum: 0, maximum: 500 }
 *               orders: { type: integer, minimum: 0, maximum: 200 }
 *               reviews: { type: integer, minimum: 0, maximum: 500 }
 *     responses:
 *       200:
 *         description: Test data generated
 *       401:
 *         description: Invalid reset token
 */
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  if (!requireResetToken(req, next)) return;

  try {
    const input = GenerateSchema.parse(req.body);
    const counts = { users: 0, products: 0, orders: 0, reviews: 0 };

    // Generate users
    const createdUserIds: string[] = [];
    if (input.users && input.users > 0) {
      const passwordHash = await hashPassword('Password1!');
      for (let i = 0; i < input.users; i++) {
        const uid = randomUUID().slice(0, 8);
        const user = await prisma.user.create({
          data: {
            email: `testuser-${uid}@generated.mock`,
            password: passwordHash,
            name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
            emailVerified: true,
            walletBalance: randomFloat(0, 500),
          },
        });
        createdUserIds.push(user.id);
      }
      counts.users = input.users;
    }

    // Generate products
    const createdProductIds: string[] = [];
    if (input.products && input.products > 0) {
      const categories = await prisma.category.findMany();
      if (categories.length === 0) {
        return next(
          new AppError('NO_CATEGORIES', 'No categories found. Seed the database first.', 400)
        );
      }
      for (let i = 0; i < input.products; i++) {
        const uid = randomUUID().slice(0, 8);
        const name = `${pick(ADJECTIVES)} ${pick(NOUNS)} ${uid}`;
        const price = randomFloat(19.99, 999.99);
        const product = await prisma.product.create({
          data: {
            name,
            slug: slugify(name),
            description: `A ${name.toLowerCase()} for your home`,
            price,
            salePrice: Math.random() > 0.7 ? randomFloat(9.99, price) : null,
            stock: Math.floor(Math.random() * 100),
            categoryId: pick(categories).id,
            images: [],
          },
        });
        createdProductIds.push(product.id);
      }
      counts.products = input.products;
    }

    // Generate orders
    if (input.orders && input.orders > 0) {
      // Get existing users if none were just created
      let userIds = createdUserIds;
      if (userIds.length === 0) {
        const users = await prisma.user.findMany({ select: { id: true }, take: 50 });
        userIds = users.map(u => u.id);
      }
      if (userIds.length === 0) {
        return next(new AppError('NO_USERS', 'No users found. Create users first.', 400));
      }

      // Get existing products if none were just created
      let productIds = createdProductIds;
      if (productIds.length === 0) {
        const products = await prisma.product.findMany({ select: { id: true }, take: 100 });
        productIds = products.map(p => p.id);
      }
      if (productIds.length === 0) {
        return next(new AppError('NO_PRODUCTS', 'No products found. Create products first.', 400));
      }

      for (let i = 0; i < input.orders; i++) {
        const userId = pick(userIds);
        const itemCount = Math.floor(Math.random() * 3) + 1;
        const items = Array.from({ length: itemCount }, () => ({
          productId: pick(productIds),
          quantity: Math.floor(Math.random() * 3) + 1,
          priceAtOrder: randomFloat(19.99, 299.99),
        }));
        const total = items.reduce((s, it) => s + it.priceAtOrder * it.quantity, 0);
        await prisma.order.create({
          data: {
            userId,
            status: pick(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const),
            totalAmount: Math.round(total * 100) / 100,
            shippingAddress: `${Math.floor(Math.random() * 999) + 1} Test Street, Test City`,
            paymentMethod: pick(['CARD', 'WALLET'] as const),
            cancellationReason: null,
            items: { create: items },
          },
        });
      }
      counts.orders = input.orders;
    }

    // Generate reviews
    if (input.reviews && input.reviews > 0) {
      let userIds = createdUserIds;
      if (userIds.length === 0) {
        const users = await prisma.user.findMany({ select: { id: true }, take: 50 });
        userIds = users.map(u => u.id);
      }
      let productIds = createdProductIds;
      if (productIds.length === 0) {
        const products = await prisma.product.findMany({ select: { id: true }, take: 100 });
        productIds = products.map(p => p.id);
      }

      if (userIds.length === 0 || productIds.length === 0) {
        return next(new AppError('NO_DATA', 'Need users and products to create reviews.', 400));
      }

      let created = 0;
      const attempted = new Set<string>();
      for (let i = 0; i < input.reviews && created < input.reviews; i++) {
        const userId = pick(userIds);
        const productId = pick(productIds);
        const key = `${userId}:${productId}`;
        if (attempted.has(key)) continue;
        attempted.add(key);

        const existing = await prisma.review.findFirst({ where: { userId, productId } });
        if (existing) continue;

        await prisma.review.create({
          data: {
            userId,
            productId,
            rating: Math.floor(Math.random() * 5) + 1,
            comment: pick(REVIEW_COMMENTS),
          },
        });
        created++;
      }
      counts.reviews = created;
    }

    logger.info({ message: 'Test data generated', counts, requestId: req.requestId });
    res.json({ created: counts });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/test/trigger-ws:
 *   post:
 *     tags: [Test]
 *     summary: Send a WebSocket event to a user (QA use only)
 *     security: []
 *     parameters:
 *       - in: header
 *         name: X-Reset-Token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, event, payload]
 *             properties:
 *               userId:
 *                 type: string
 *               event:
 *                 type: string
 *                 enum: [payment.result, order.status.updated, cart.updated]
 *               payload:
 *                 type: object
 *     responses:
 *       200:
 *         description: Event sent (or user not connected)
 *       401:
 *         description: Invalid reset token
 */
router.post('/trigger-ws', (req: Request, res: Response, next: NextFunction) => {
  if (!requireResetToken(req, next)) return;

  const { userId, event, payload } = req.body as {
    userId: string;
    event: string;
    payload: unknown;
  };

  if (!userId || !event) {
    return next(new AppError('VALIDATION_ERROR', 'userId and event are required', 400));
  }

  wsServer.sendToUser(userId, event, payload ?? {});
  logger.info({ message: 'WS event triggered via test endpoint', userId, event });
  res.json({ status: 'ok', sent: true });
});

/**
 * @openapi
 * /test/orders/{id}/auto-progress:
 *   post:
 *     tags: [Test]
 *     summary: Auto-progress order through statuses (PENDING → PROCESSING → SHIPPED → DELIVERED)
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               intervalSeconds: { type: number, default: 10 }
 *     responses:
 *       200:
 *         description: Auto-progress started
 */
const AutoProgressSchema = z.object({
  intervalSeconds: z.coerce.number().min(3).max(120).default(8),
});

const PROGRESS_CHAIN: Array<'PROCESSING' | 'SHIPPED' | 'DELIVERED'> = [
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
];

// Track active auto-progress timers
const activeProgressions = new Map<string, NodeJS.Timeout[]>();

router.post(
  '/orders/:id/auto-progress',
  async (req: Request, res: Response, next: NextFunction) => {
    if (!requireResetToken(req, next)) return;

    try {
      const id = req.params.id as string;
      const { intervalSeconds } = AutoProgressSchema.parse(req.body ?? {});

      // Check order exists
      const order = await prisma.order.findFirst({ where: { id, deletedAt: null } });
      if (!order) {
        next(new AppError('ORDER_NOT_FOUND', 'Order not found', 404));
        return;
      }

      // Cancel any existing progression for this order
      const existing = activeProgressions.get(id);
      if (existing) {
        existing.forEach(t => clearTimeout(t));
        activeProgressions.delete(id);
      }

      // Determine starting point in chain
      const statusIndex: Record<string, number> = {
        PENDING: 0,
        PROCESSING: 1,
        SHIPPED: 2,
      };
      const startIdx = statusIndex[order.status];
      if (startIdx === undefined) {
        res.json({
          status: 'skipped',
          message: `Order is already ${order.status}, cannot progress further`,
        });
        return;
      }

      const remainingSteps = PROGRESS_CHAIN.slice(startIdx);
      const timers: NodeJS.Timeout[] = [];

      remainingSteps.forEach((nextStatus, i) => {
        const delay = (i + 1) * intervalSeconds * 1000;
        const timer = setTimeout(async () => {
          try {
            const current = await prisma.order.findFirst({ where: { id } });
            if (!current || current.status === 'CANCELLED' || current.status === 'DELIVERED')
              return;

            // Update status + tracking event
            const existingEvents =
              (current.trackingEvents as Array<{ status: string; timestamp: string }>) ?? [];
            const trackingEvents = [
              ...existingEvents,
              { status: nextStatus.toLowerCase(), timestamp: new Date().toISOString() },
            ];

            await prisma.order.update({
              where: { id },
              data: { status: nextStatus, trackingEvents },
            });

            // WS broadcast
            wsServer.sendToUser(current.userId, 'order.status.updated', {
              orderId: id,
              status: nextStatus,
            });

            logger.info({
              message: 'Auto-progress: order status updated',
              orderId: id,
              status: nextStatus,
              step: i + 1,
              totalSteps: remainingSteps.length,
            });
          } catch (err) {
            logger.error({ message: 'Auto-progress failed', orderId: id, error: String(err) });
          }
        }, delay);
        timers.push(timer);
      });

      activeProgressions.set(id, timers);

      const schedule = remainingSteps.map((s, i) => ({
        status: s,
        inSeconds: (i + 1) * intervalSeconds,
      }));

      logger.info({
        message: 'Auto-progress started',
        orderId: id,
        intervalSeconds,
        steps: schedule,
      });

      res.json({
        status: 'started',
        orderId: id,
        currentStatus: order.status,
        intervalSeconds,
        schedule,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Stop auto-progress for an order
router.delete('/orders/:id/auto-progress', (req: Request, res: Response, next: NextFunction) => {
  if (!requireResetToken(req, next)) return;

  const id = req.params.id as string;
  const existing = activeProgressions.get(id);
  if (existing) {
    existing.forEach(t => clearTimeout(t));
    activeProgressions.delete(id);
    res.json({ status: 'stopped', orderId: id });
  } else {
    res.json({ status: 'not_found', orderId: id, message: 'No active progression for this order' });
  }
});

export default router;
