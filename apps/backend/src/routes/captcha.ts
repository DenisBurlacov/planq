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
 *             example:
 *               captchaId: cap_a1b2c3d4e5f6
 *               images:
 *                 - "https://example.com/captcha/img1.png"
 *                 - "https://example.com/captcha/img2.png"
 *                 - "https://example.com/captcha/img3.png"
 *                 - "https://example.com/captcha/img4.png"
 *                 - "https://example.com/captcha/img5.png"
 *                 - "https://example.com/captcha/img6.png"
 *                 - "https://example.com/captcha/img7.png"
 *                 - "https://example.com/captcha/img8.png"
 *                 - "https://example.com/captcha/img9.png"
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
 *           example:
 *             captchaId: cap_a1b2c3d4e5f6
 *             selectedIndices: [0, 3, 5]
 *     responses:
 *       200:
 *         description: Captcha verification result
 *         content:
 *           application/json:
 *             example:
 *               valid: true
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
