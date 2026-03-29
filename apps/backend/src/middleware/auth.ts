import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type AccessTokenPayload } from '@utils/jwt.js';
import { AppError } from '@utils/AppError.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('UNAUTHORIZED', 'Authentication required', 401));
  }

  const token = authHeader.slice(7);

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError('INVALID_TOKEN', 'Token is invalid or expired', 401));
  }
}
