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

export async function forgotPasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body as { email: string };
    const result = await authService.forgotPassword(email);
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function resetPasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, newPassword } = req.body as { token: string; newPassword: string };
    const result = await authService.resetPassword(token, newPassword);
    ok(res, result);
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
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        walletBalance: true,
        role: true,
        emailVerified: true,
        provider: true,
      },
    });
    ok(res, user);
  } catch (err) {
    next(err);
  }
}

export async function verifyEmailHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.query.token as string;
    if (!token) {
      return next(
        new (await import('@utils/AppError.js')).AppError(
          'VALIDATION_ERROR',
          'Token query parameter is required',
          400
        )
      );
    }
    const result = await authService.verifyEmail(token);
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function resendVerificationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body as { email: string };
    const result = await authService.resendVerification(email);
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function oauthCallbackHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.oauthCallback(req.body as authService.OAuthCallbackInput);
    ok(res, result);
  } catch (err) {
    next(err);
  }
}
