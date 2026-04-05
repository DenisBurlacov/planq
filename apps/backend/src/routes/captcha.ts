import { Router, type Router as ExpressRouter } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { validate } from '@middleware/validate.js';
import * as captchaService from '@services/captcha.service.js';
import { ok } from '@utils/response.js';

const router: ExpressRouter = Router();

/**
 * @openapi
 * /auth/captcha/generate:
 *   post:
 *     tags: [Auth]
 *     summary: Generate a captcha challenge
 *     security: []
 *     responses:
 *       200:
 *         description: Captcha challenge with image URLs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 captchaId: { type: string }
 *                 images: { type: array, items: { type: string } }
 */
router.post('/generate', (_req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, captchaService.generateCaptcha());
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /auth/captcha/verify:
 *   post:
 *     tags: [Auth]
 *     summary: Verify captcha solution
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [captchaId, selectedIndices]
 *             properties:
 *               captchaId: { type: string }
 *               selectedIndices: { type: array, items: { type: integer } }
 *     responses:
 *       200:
 *         description: Captcha verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid: { type: boolean }
 */
router.post(
  '/verify',
  validate(captchaService.CaptchaVerifySchema),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, captchaService.verifyCaptcha(req.body as captchaService.CaptchaVerifyInput));
    } catch (err) {
      next(err);
    }
  }
);

export default router;
