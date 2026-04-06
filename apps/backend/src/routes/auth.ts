import { Router, type Router as ExpressRouter } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '@middleware/validate.js';
import { authenticate } from '@middleware/auth.js';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  meHandler,
  verifyEmailHandler,
  resendVerificationHandler,
  oauthCallbackHandler,
} from '@controllers/auth.controller.js';
import {
  RegisterSchema,
  LoginSchema,
  RefreshSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  OAuthCallbackSchema,
  ResendVerificationSchema,
} from '@services/auth.service.js';

const router: ExpressRouter = Router();

const loginLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: process.env.NODE_ENV === 'test' ? 1000 : Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 5,
  message: { error: 'TOO_MANY_REQUESTS', message: 'Too many login attempts', statusCode: 429 },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               name: { type: string }
 *           example:
 *             name: John
 *             email: john@example.com
 *             password: Password1!
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             example:
 *               accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               refreshToken: d4f8e2a1-b3c7-4e5f-9a1b-2c3d4e5f6a7b
 *               user:
 *                 id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *                 email: john@example.com
 *                 name: John
 *                 emailVerified: false
 *               verificationToken: f47ac10b-58cc-4372-a567-0e02b2c3d479
 *       409:
 *         description: Email already registered
 */
router.post('/register', validate(RegisterSchema), registerHandler);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive tokens
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *           example:
 *             email: alice@example.com
 *             password: Password1!
 *     responses:
 *       200:
 *         description: Login successful, returns accessToken + refreshToken
 *         content:
 *           application/json:
 *             example:
 *               accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               refreshToken: d4f8e2a1-b3c7-4e5f-9a1b-2c3d4e5f6a7b
 *               user:
 *                 id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *                 email: alice@example.com
 *                 name: Alice Johnson
 *                 emailVerified: true
 *                 role: USER
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account blocked
 */
router.post('/login', loginLimiter, validate(LoginSchema), loginHandler);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *           example:
 *             refreshToken: d4f8e2a1-b3c7-4e5f-9a1b-2c3d4e5f6a7b
 *     responses:
 *       200:
 *         description: New access + refresh tokens
 *         content:
 *           application/json:
 *             example:
 *               accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               refreshToken: e5a9b3c1-d7f2-4a6e-8b0c-3d4e5f6a7b8c
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', validate(RefreshSchema), refreshHandler);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout (invalidate refresh token)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *           example:
 *             refreshToken: d4f8e2a1-b3c7-4e5f-9a1b-2c3d4e5f6a7b
 *     responses:
 *       204:
 *         description: Logged out successfully
 */
router.post('/logout', validate(RefreshSchema), logoutHandler);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset token
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
 *         description: Reset token created (token included in dev/test env)
 *         content:
 *           application/json:
 *             example:
 *               message: Password reset link sent
 *               token: f47ac10b-58cc-4372-a567-0e02b2c3d479
 */
router.post(
  '/forgot-password',
  loginLimiter,
  validate(ForgotPasswordSchema),
  forgotPasswordHandler
);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Password updated
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password', loginLimiter, validate(ResetPasswordSchema), resetPasswordHandler);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user
 *     responses:
 *       200:
 *         description: Current user info
 *       401:
 *         description: Not authenticated
 */
router.get('/me', authenticate, meHandler);

/**
 * @openapi
 * /auth/verify-email:
 *   get:
 *     tags: [Auth]
 *     summary: Verify user email with token
 *     security: []
 *     parameters:
 *       - { in: query, name: token, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.get('/verify-email', verifyEmailHandler);

/**
 * @openapi
 * /auth/resend-verification:
 *   post:
 *     tags: [Auth]
 *     summary: Resend email verification token
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
 *         description: Verification email resent (token included in dev/test env)
 *         content:
 *           application/json:
 *             example:
 *               message: Verification email sent
 *               token: f47ac10b-58cc-4372-a567-0e02b2c3d479
 */
router.post(
  '/resend-verification',
  loginLimiter,
  validate(ResendVerificationSchema),
  resendVerificationHandler
);

/**
 * @openapi
 * /auth/oauth/callback:
 *   post:
 *     tags: [Auth]
 *     summary: Mock OAuth callback (Google/GitHub)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [provider, code]
 *             properties:
 *               provider: { type: string, enum: [google, github] }
 *               code: { type: string }
 *           example:
 *             provider: google
 *             code: "4/0AX4XfWg..."
 *     responses:
 *       200:
 *         description: OAuth login successful, returns tokens
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
router.post('/oauth/callback', validate(OAuthCallbackSchema), oauthCallbackHandler);

export default router;
