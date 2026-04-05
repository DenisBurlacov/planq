import { z } from 'zod';
import { randomUUID } from 'crypto';
import prisma from '@utils/prisma.js';
import { AppError } from '@utils/AppError.js';
import { signAccessToken, signRefreshToken } from '@utils/jwt.js';

export const VerifyCodeSchema = z.object({
  code: z
    .string()
    .length(6)
    .regex(/^\d{6}$/),
});

export const Verify2FALoginSchema = z.object({
  tempToken: z.string().min(1),
  code: z
    .string()
    .length(6)
    .regex(/^\d{6}$/),
});

export async function enable2FA(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);
  if (user.twoFactorEnabled) {
    throw new AppError('ALREADY_ENABLED', '2FA is already enabled', 400);
  }

  // Generate a mock secret
  const secret = randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase();

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret },
  });

  return {
    secret,
    qrPlaceholder: `otpauth://totp/PLANQ:${user.email}?secret=${secret}&issuer=PLANQ`,
  };
}

export async function verify2FASetup(userId: string, code: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);
  if (!user.twoFactorSecret) {
    throw new AppError('NOT_SETUP', '2FA has not been initiated', 400);
  }

  // Mock validation: accept any 6-digit code or "123456"
  if (code.length !== 6 || !/^\d{6}$/.test(code)) {
    throw new AppError('INVALID_CODE', 'Invalid verification code', 400);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: true },
  });

  return { message: '2FA enabled successfully' };
}

export async function disable2FA(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);
  if (!user.twoFactorEnabled) {
    throw new AppError('NOT_ENABLED', '2FA is not enabled', 400);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });

  return { message: '2FA disabled successfully' };
}

export async function get2FAStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorEnabled: true },
  });
  if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);
  return { enabled: user.twoFactorEnabled };
}

/**
 * Verify 2FA code during login.
 * tempToken is the userId (mock implementation).
 */
export async function verify2FALogin(tempToken: string, code: string) {
  const user = await prisma.user.findUnique({ where: { id: tempToken } });
  if (!user) throw new AppError('INVALID_TOKEN', 'Invalid temp token', 401);
  if (!user.twoFactorEnabled) {
    throw new AppError('NOT_ENABLED', '2FA is not enabled for this account', 400);
  }

  // Mock validation: accept any 6-digit code
  if (code.length !== 6 || !/^\d{6}$/.test(code)) {
    throw new AppError('INVALID_CODE', 'Invalid verification code', 400);
  }

  const payload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      walletBalance: user.walletBalance,
      role: user.role,
      emailVerified: user.emailVerified,
    },
  };
}
