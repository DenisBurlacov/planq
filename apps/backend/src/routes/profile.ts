import { Router, type Router as ExpressRouter } from 'express';
import { getAuthUser } from '@utils/getAuthUser.js';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '@middleware/auth.js';
import { validate } from '@middleware/validate.js';
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
 * /profile/password:
 *   patch:
 *     tags: [Profile]
 *     summary: Change password
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
