import { Router, type Router as ExpressRouter } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '@middleware/auth.js';
import { adminAuth } from '@middleware/adminAuth.js';
import { validate } from '@middleware/validate.js';
import { getAuthUser } from '@utils/getAuthUser.js';
import * as featureFlagsService from '@services/featureFlags.service.js';
import * as auditService from '@services/audit.service.js';
import { ok } from '@utils/response.js';

const router: ExpressRouter = Router();

/**
 * @openapi
 * /feature-flags:
 *   get:
 *     tags: [Feature Flags]
 *     summary: List all feature flags (public)
 *     responses:
 *       200:
 *         description: List of feature flags
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await featureFlagsService.listFlags());
  } catch (err) {
    next(err);
  }
});

export default router;

// Admin routes (mounted separately under /api/v1/admin/feature-flags)
export const adminFeatureFlagsRouter: ExpressRouter = Router();
adminFeatureFlagsRouter.use(authenticate);
adminFeatureFlagsRouter.use(adminAuth);

/**
 * @openapi
 * /admin/feature-flags/{key}:
 *   put:
 *     tags: [Admin, Feature Flags]
 *     summary: Toggle a feature flag
 *     parameters:
 *       - { in: path, name: key, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [enabled]
 *             properties:
 *               enabled: { type: boolean }
 *     responses:
 *       200:
 *         description: Feature flag updated
 */
adminFeatureFlagsRouter.put(
  '/:key',
  validate(featureFlagsService.ToggleFlagSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { enabled } = req.body as featureFlagsService.ToggleFlagInput;
      const flag = await featureFlagsService.toggleFlag(req.params.key as string, enabled);
      await auditService.logAction(
        getAuthUser(req).userId,
        'feature_flag_toggle',
        'feature_flag',
        flag.key,
        { enabled }
      );
      ok(res, flag);
    } catch (err) {
      next(err);
    }
  }
);
