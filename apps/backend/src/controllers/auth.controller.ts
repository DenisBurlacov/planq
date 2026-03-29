import type { Request, Response, NextFunction } from 'express';
import * as authService from '@services/auth.service.js';
import { getAuthUser } from '@utils/getAuthUser.js';
import { ok, created } from '@utils/response.js';

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.register(req.body as authService.RegisterInput);
    created(res, user);
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body as authService.LoginInput);
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function refreshHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    const result = await authService.refresh(refreshToken);
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function logoutHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    await authService.logout(refreshToken);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function meHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getAuthUser(req).userId;
    const { default: prisma } = await import('@utils/prisma.js');
    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: { id: true, email: true, name: true, avatar: true, walletBalance: true },
    });
    ok(res, user);
  } catch (err) {
    next(err);
  }
}
