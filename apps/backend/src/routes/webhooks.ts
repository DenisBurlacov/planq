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
 *     responses:
 *       201:
 *         description: Webhook created
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
 *     responses:
 *       200:
 *         description: Webhook updated
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
