import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@utils/AppError.js';

/**
 * Middleware that blocks MANAGER users from restricted operations.
 * Must be used after `authenticate` and `adminAuth` middleware.
 */
export function managerRestrictions(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role === 'MANAGER') {
    return next(new AppError('FORBIDDEN', 'This operation is not available for managers', 403));
  }
  next();
}
