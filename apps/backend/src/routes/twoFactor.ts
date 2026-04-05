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
import { ok } from '@utils/response.js';
import * as twoFactorService from '@services/twoFactor.service.js';

const router: ExpressRouter = Router();

/**
 * @openapi
 * /auth/2fa/enable:
 *   post:
 *     tags: [Auth, 2FA]
 *     summary: Enable 2FA - returns secret and QR placeholder
 *     responses:
 *       200:
 *         description: Secret and QR data returned
 */
router.post('/enable', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req).userId;
    const result = await twoFactorService.enable2FA(userId);
    ok(res, result);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /auth/2fa/verify-setup:
 *   post:
 *     tags: [Auth, 2FA]
 *     summary: Verify 2FA setup with code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code: { type: string, pattern: '^\d{6}$' }
 *     responses:
 *       200:
 *         description: 2FA enabled
 */
router.post(
  '/verify-setup',
  authenticate,
  validate(twoFactorService.VerifyCodeSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUser(req).userId;
      const { code } = req.body as { code: string };
      const result = await twoFactorService.verify2FASetup(userId, code);
      ok(res, result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /auth/2fa/disable:
 *   post:
 *     tags: [Auth, 2FA]
 *     summary: Disable 2FA
 *     responses:
 *       200:
 *         description: 2FA disabled
 */
router.post('/disable', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req).userId;
    const result = await twoFactorService.disable2FA(userId);
    ok(res, result);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /auth/2fa/status:
 *   get:
 *     tags: [Auth, 2FA]
 *     summary: Get 2FA status
 *     responses:
 *       200:
 *         description: 2FA status
 */
router.get('/status', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req).userId;
    const result = await twoFactorService.get2FAStatus(userId);
    ok(res, result);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /auth/2fa/verify:
 *   post:
 *     tags: [Auth, 2FA]
 *     summary: Verify 2FA code during login (no auth needed)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tempToken, code]
 *             properties:
 *               tempToken: { type: string }
 *               code: { type: string, pattern: '^\d{6}$' }
 *     responses:
 *       200:
 *         description: Login completed with tokens
 */
router.post(
  '/verify',
  validate(twoFactorService.Verify2FALoginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tempToken, code } = req.body as { tempToken: string; code: string };
      const result = await twoFactorService.verify2FALogin(tempToken, code);
      ok(res, result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
