import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@utils/AppError.js';

/**
 * Middleware that checks if the authenticated user has the ADMIN role.
 * Must be used after the `authenticate` middleware.
 */
export function adminAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new AppError('UNAUTHORIZED', 'Authentication required', 401));
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
    return next(new AppError('FORBIDDEN', 'Admin access required', 403));
  }

  next();
}
