import {
  Router,
  type Router as ExpressRouter,
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import { authenticate } from '@middleware/auth.js';
import { validate } from '@middleware/validate.js';
import { getAuthUser } from '@utils/getAuthUser.js';
import { ok, noContent } from '@utils/response.js';
import * as webhooksService from '@services/webhooks.service.js';

const router: ExpressRouter = Router();

/**
 * @openapi
 * /webhooks:
 *   get:
 *     tags: [Webhooks]
 *     summary: List webhook subscriptions
 *     responses:
 *       200:
 *         description: List of webhook subscriptions
 *         content:
 *           application/json:
 *             example:
 *               - id: w1a2b3c4-d5e6-7890-abcd-ef1234567890
 *                 url: "https://example.com/webhooks/orders"
 *                 events: ["order.created", "order.status.updated"]
 *                 active: true
 *                 createdAt: "2025-02-01T10:00:00.000Z"
 */
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req).userId;
    const webhooks = await webhooksService.listWebhooks(userId);
    ok(res, webhooks);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /webhooks:
 *   post:
 *     tags: [Webhooks]
 *     summary: Create a webhook subscription
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url, events]
 *             properties:
 *               url: { type: string, format: uri }
 *               events: { type: array, items: { type: string, enum: ['order.created', 'order.status.updated'] } }
 *           example:
 *             url: "https://example.com/webhooks/orders"
 *             events: ["order.created", "order.status.updated"]
 *     responses:
 *       201:
 *         description: Webhook created
 *         content:
 *           application/json:
 *             example:
 *               id: w1a2b3c4-d5e6-7890-abcd-ef1234567890
 *               url: "https://example.com/webhooks/orders"
 *               events: ["order.created", "order.status.updated"]
 *               active: true
 *               secret: whsec_a1b2c3d4e5f6g7h8
 *               createdAt: "2025-03-15T10:00:00.000Z"
 */
router.post(
  '/',
  authenticate,
  validate(webhooksService.CreateWebhookSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUser(req).userId;
      const webhook = await webhooksService.createWebhook(
        userId,
        req.body as webhooksService.CreateWebhookInput
      );
      ok(res, webhook, 201);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /webhooks/{id}/toggle:
 *   patch:
 *     tags: [Webhooks]
 *     summary: Toggle webhook active state
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [active]
 *             properties:
 *               active: { type: boolean }
 *           example:
 *             active: false
 *     responses:
 *       200:
 *         description: Webhook updated
 *         content:
 *           application/json:
 *             example:
 *               id: w1a2b3c4-d5e6-7890-abcd-ef1234567890
 *               url: "https://example.com/webhooks/orders"
 *               events: ["order.created", "order.status.updated"]
 *               active: false
 */
router.patch(
  '/:id/toggle',
  authenticate,
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUser(req).userId;
      const { active } = req.body as { active: boolean };
      const webhook = await webhooksService.toggleWebhook(userId, req.params.id, active);
      ok(res, webhook);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /webhooks/{id}:
 *   delete:
 *     tags: [Webhooks]
 *     summary: Delete a webhook subscription
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204:
 *         description: Webhook deleted
 */
router.delete(
  '/:id',
  authenticate,
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUser(req).userId;
      await webhooksService.deleteWebhook(userId, req.params.id);
      noContent(res);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /webhooks/{id}/deliveries:
 *   get:
 *     tags: [Webhooks]
 *     summary: Get delivery log for a webhook
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: List of deliveries
 *         content:
 *           application/json:
 *             example:
 *               - id: del_a1b2c3d4-e5f6-7890
 *                 event: order.created
 *                 status: SUCCESS
 *                 httpStatus: 200
 *                 attemptedAt: "2025-03-15T10:05:00.000Z"
 *               - id: del_b2c3d4e5-f6a7-8901
 *                 event: order.status.updated
 *                 status: FAILED
 *                 httpStatus: 500
 *                 attemptedAt: "2025-03-15T10:10:00.000Z"
 */
router.get(
  '/:id/deliveries',
  authenticate,
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUser(req).userId;
      const deliveries = await webhooksService.getDeliveries(userId, req.params.id);
      ok(res, deliveries);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
