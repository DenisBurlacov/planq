import { Router, type Router as ExpressRouter } from 'express';
import { getAuthUser } from '@utils/getAuthUser.js';
import type { Request, Response, NextFunction } from 'express';
import type { z } from 'zod';
import { authenticate } from '@middleware/auth.js';
import { validate } from '@middleware/validate.js';
import * as notificationsService from '@services/notifications.service.js';
import { ok } from '@utils/response.js';

const router: ExpressRouter = Router();
router.use(authenticate);

/**
 * @openapi
 * /profile/notifications:
 *   get:
 *     tags: [Profile]
 *     summary: Get notification preferences
 *     responses:
 *       200:
 *         description: Notification preferences
 *         content:
 *           application/json:
 *             example:
 *               orderUpdates: true
 *               promotions: false
 *               newsletter: true
 *               security: true
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await notificationsService.getNotificationPrefs(getAuthUser(req).userId));
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /profile/notifications:
 *   put:
 *     tags: [Profile]
 *     summary: Update notification preferences
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             orderUpdates: true
 *             promotions: true
 *             newsletter: false
 *             security: true
 *     responses:
 *       200:
 *         description: Preferences updated
 *         content:
 *           application/json:
 *             example:
 *               orderUpdates: true
 *               promotions: true
 *               newsletter: false
 *               security: true
 */
router.put(
  '/',
  validate(notificationsService.UpdateNotificationPrefsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(
        res,
        await notificationsService.updateNotificationPrefs(
          getAuthUser(req).userId,
          req.body as z.infer<typeof notificationsService.UpdateNotificationPrefsSchema>
        )
      );
    } catch (err) {
      next(err);
    }
  }
);

export default router;
