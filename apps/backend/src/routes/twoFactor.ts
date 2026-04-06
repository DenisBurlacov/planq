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
 *         content:
 *           application/json:
 *             example:
 *               secret: JBSWY3DPEHPK3PXP
 *               qrCodeUrl: "otpauth://totp/Planq:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Planq"
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
 *           example:
 *             code: "123456"
 *     responses:
 *       200:
 *         description: 2FA enabled
 *         content:
 *           application/json:
 *             example:
 *               enabled: true
 *               message: Two-factor authentication has been enabled
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
 *         content:
 *           application/json:
 *             example:
 *               enabled: false
 *               message: Two-factor authentication has been disabled
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
 *         content:
 *           application/json:
 *             example:
 *               enabled: true
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
 *           example:
 *             tempToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             code: "654321"
 *     responses:
 *       200:
 *         description: Login completed with tokens
 *         content:
 *           application/json:
 *             example:
 *               accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               refreshToken: d4f8e2a1-b3c7-4e5f-9a1b-2c3d4e5f6a7b
 *               user:
 *                 id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *                 email: alice@example.com
 *                 name: Alice Johnson
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
