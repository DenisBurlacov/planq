import type { Request } from 'express';
import { AppError } from '@utils/AppError.js';
import type { AccessTokenPayload } from '@utils/jwt.js';

export function getAuthUser(req: Request): AccessTokenPayload {
  if (!req.user) {
    throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
  }
  return req.user;
}
