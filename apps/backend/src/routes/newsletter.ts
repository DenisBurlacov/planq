import { Router, type Router as ExpressRouter } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { validate } from '@middleware/validate.js';
import * as newsletterService from '@services/newsletter.service.js';
import { ok } from '@utils/response.js';

const router: ExpressRouter = Router();

/**
 * @openapi
 * /newsletter/subscribe:
 *   post:
 *     tags: [Newsletter]
 *     summary: Subscribe to the newsletter
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *           example:
 *             email: alice@example.com
 *     responses:
 *       200:
 *         description: Subscription confirmed
 *         content:
 *           application/json:
 *             example:
 *               message: Successfully subscribed to newsletter
 */
router.post(
  '/subscribe',
  validate(newsletterService.NewsletterSubscribeSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body as { email: string };
      ok(res, await newsletterService.subscribe(email));
    } catch (err) {
      next(err);
    }
  }
);

export default router;
