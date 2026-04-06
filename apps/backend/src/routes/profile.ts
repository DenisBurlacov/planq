import { Router, type Router as ExpressRouter } from 'express';
import { getAuthUser } from '@utils/getAuthUser.js';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '@middleware/auth.js';
import { validate } from '@middleware/validate.js';
import { uploadAvatar } from '@middleware/upload.js';
import * as profileService from '@services/profile.service.js';
import { ok, noContent } from '@utils/response.js';

const router: ExpressRouter = Router();
router.use(authenticate);

const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

/**
 * @openapi
 * /profile:
 *   get:
 *     tags: [Profile]
 *     summary: Get current user profile
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             example:
 *               id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *               email: alice@example.com
 *               name: Alice Johnson
 *               avatar: "/uploads/avatars/alice.jpg"
 *               emailVerified: true
 *               role: USER
 *               walletBalance: 150.00
 *               createdAt: "2025-01-10T08:00:00.000Z"
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await profileService.getProfile(getAuthUser(req).userId));
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /profile:
 *   patch:
 *     tags: [Profile]
 *     summary: Update profile (name, avatar)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: Alice Updated
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             example:
 *               id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *               email: alice@example.com
 *               name: Alice Updated
 *               avatar: "/uploads/avatars/alice.jpg"
 */
router.patch(
  '/',
  validate(profileService.UpdateProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(
        res,
        await profileService.updateProfile(
          getAuthUser(req).userId,
          req.body as z.infer<typeof profileService.UpdateProfileSchema>
        )
      );
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /profile/avatar:
 *   post:
 *     tags: [Profile]
 *     summary: Upload avatar image (max 2MB, jpg/png only)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated
 *         content:
 *           application/json:
 *             example:
 *               id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *               email: alice@example.com
 *               name: Alice Johnson
 *               avatar: "/uploads/avatars/a1b2c3d4.jpg"
 */
/**
 * @openapi
 * /profile/avatar:
 *   delete:
 *     tags: [Profile]
 *     summary: Delete avatar (set to null)
 *     responses:
 *       200:
 *         description: Avatar removed
 *         content:
 *           application/json:
 *             example:
 *               id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *               email: alice@example.com
 *               name: Alice Johnson
 *               avatar: null
 */
router.delete('/avatar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await profileService.deleteAvatar(getAuthUser(req).userId));
  } catch (err) {
    next(err);
  }
});

router.post('/avatar', uploadAvatar, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'NO_FILE', message: 'No file uploaded', statusCode: 400 });
      return;
    }
    const avatarPath = `/uploads/avatars/${file.filename}`;
    ok(res, await profileService.updateProfile(getAuthUser(req).userId, { avatar: avatarPath }));
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /profile/password:
 *   patch:
 *     tags: [Profile]
 *     summary: Change password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             currentPassword: Password1!
 *             newPassword: NewPassword2!
 *     responses:
 *       204:
 *         description: Password changed
 *       400:
 *         description: Current password incorrect
 */
router.patch(
  '/password',
  validate(profileService.ChangePasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await profileService.changePassword(
        getAuthUser(req).userId,
        req.body as z.infer<typeof profileService.ChangePasswordSchema>
      );
      noContent(res);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /profile/wallet:
 *   get:
 *     tags: [Profile]
 *     summary: Get wallet transactions
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *     responses:
 *       200:
 *         description: Wallet transactions
 *         content:
 *           application/json:
 *             example:
 *               balance: 150.00
 *               data:
 *                 - id: t1a2b3c4-d5e6-7890-abcd-ef1234567890
 *                   type: TOP_UP
 *                   amount: 100.00
 *                   description: Wallet top-up
 *                   createdAt: "2025-03-10T14:30:00.000Z"
 *                 - id: t2b3c4d5-e6f7-8901-bcde-f23456789012
 *                   type: PURCHASE
 *                   amount: -49.99
 *                   description: "Order #0515506f"
 *                   createdAt: "2025-03-12T09:15:00.000Z"
 *               meta:
 *                 page: 1
 *                 limit: 20
 *                 total: 8
 *                 totalPages: 1
 */
router.get('/wallet', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = PaginationSchema.parse(req.query);
    ok(res, await profileService.getTransactions(getAuthUser(req).userId, page, limit));
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /profile/wallet/topup:
 *   post:
 *     tags: [Profile]
 *     summary: Top up wallet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             amount: 100.00
 *     responses:
 *       200:
 *         description: Wallet topped up
 *         content:
 *           application/json:
 *             example:
 *               balance: 250.00
 *               transaction:
 *                 id: t3c4d5e6-f7a8-9012-cdef-a34567890123
 *                 type: TOP_UP
 *                 amount: 100.00
 *                 description: Wallet top-up
 *                 createdAt: "2025-03-15T16:00:00.000Z"
 */
router.post(
  '/wallet/topup',
  validate(profileService.TopUpSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(
        res,
        await profileService.topUpWallet(
          getAuthUser(req).userId,
          req.body as z.infer<typeof profileService.TopUpSchema>
        )
      );
    } catch (err) {
      next(err);
    }
  }
);

export default router;
