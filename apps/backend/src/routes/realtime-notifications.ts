import { Router, type Router as ExpressRouter } from 'express';
import { getAuthUser } from '@utils/getAuthUser.js';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '@middleware/auth.js';
import * as rtNotifService from '@services/realtime-notifications.service.js';
import { ok } from '@utils/response.js';

const router: ExpressRouter = Router();
router.use(authenticate);

/**
 * @openapi
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List notifications (paginated, newest first)
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *     responses:
 *       200:
 *         description: Paginated notification list
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - id: n1a2b3c4-d5e6-7890-abcd-ef1234567890
 *                   type: ORDER_STATUS
 *                   title: "Order Shipped"
 *                   message: "Your order #0515506f has been shipped"
 *                   read: false
 *                   createdAt: "2025-03-15T10:00:00.000Z"
 *                 - id: n2b3c4d5-e6f7-8901-bcde-f23456789012
 *                   type: PROMO
 *                   title: "New Promotion"
 *                   message: "Use code SAVE10 for 10% off"
 *                   read: true
 *                   createdAt: "2025-03-14T08:00:00.000Z"
 *               meta:
 *                 page: 1
 *                 limit: 20
 *                 total: 5
 *                 totalPages: 1
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = rtNotifService.NotificationsPaginationSchema.parse(req.query);
    ok(res, await rtNotifService.listNotifications(getAuthUser(req).userId, page, limit));
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /notifications/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Get unread notification count
 *     responses:
 *       200:
 *         description: Unread count
 *         content:
 *           application/json:
 *             example:
 *               count: 3
 */
router.get('/unread-count', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await rtNotifService.getUnreadCount(getAuthUser(req).userId));
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /notifications/{id}/read:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark a notification as read
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             example:
 *               id: n1a2b3c4-d5e6-7890-abcd-ef1234567890
 *               type: ORDER_STATUS
 *               title: "Order Shipped"
 *               message: "Your order #0515506f has been shipped"
 *               read: true
 *               createdAt: "2025-03-15T10:00:00.000Z"
 *       404:
 *         description: Notification not found
 */
router.put('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await rtNotifService.markAsRead(getAuthUser(req).userId, req.params.id as string));
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /notifications/read-all:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             example:
 *               updated: 3
 */
router.put('/read-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await rtNotifService.markAllAsRead(getAuthUser(req).userId));
  } catch (err) {
    next(err);
  }
});

export default router;
