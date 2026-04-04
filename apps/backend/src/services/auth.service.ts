import { z } from 'zod';
import { randomUUID } from 'crypto';
import prisma from '@utils/prisma.js';
import { hashPassword, comparePassword } from '@utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@utils/jwt.js';
import { AppError } from '@utils/AppError.js';
import logger from '@utils/logger.js';

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const RefreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findFirst({ where: { email: input.email } });
  if (existing) {
    throw new AppError('EMAIL_TAKEN', 'Email is already registered', 409);
  }

  const hashed = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { email: input.email, password: hashed, name: input.name },
    select: { id: true, email: true, name: true, avatar: true, walletBalance: true },
  });

  logger.info({ message: 'User registered', userId: user.id });
  return user;
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findFirst({ where: { email: input.email } });

  if (!user) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }

  if (user.isBlocked) {
    throw new AppError('ACCOUNT_BLOCKED', 'Account has been blocked', 403);
  }

  const valid = await comparePassword(input.password, user.password);
  if (!valid) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }

  const payload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

  logger.info({ message: 'User logged in', userId: user.id });

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
    },
  };
}

export async function refresh(token: string) {
  const stored = await prisma.refreshToken.findUnique({ where: { token } });

  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError('INVALID_TOKEN', 'Refresh token is invalid or expired', 401);
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError('INVALID_TOKEN', 'Refresh token is invalid or expired', 401);
  }

  // Rotation: delete old, issue new
  await prisma.refreshToken.delete({ where: { token } });

  // Fetch fresh user role for new token
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { role: true },
  });

  const newAccessToken = signAccessToken({
    userId: payload.userId,
    email: payload.email,
    role: user?.role,
  });
  const newRefreshToken = signRefreshToken({
    userId: payload.userId,
    email: payload.email,
    role: user?.role,
  });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: { token: newRefreshToken, userId: payload.userId, expiresAt },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function logout(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });

  // Always return same message to prevent email enumeration
  const message = 'If email exists, reset link sent';

  if (!user) {
    return { message };
  }

  // Delete existing tokens for this user
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  logger.info({ message: 'Password reset token created', userId: user.id });

  // In dev/test environment, include token in response for QA testability
  const isDev = process.env.NODE_ENV !== 'production';
  return isDev ? { message, token } : { message };
}

export async function resetPassword(token: string, newPassword: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw new AppError('INVALID_TOKEN', 'Reset token is invalid or expired', 400);
  }

  const hashed = await hashPassword(newPassword);

  await prisma.$transaction(async tx => {
    await tx.user.update({
      where: { id: resetToken.userId },
      data: { password: hashed },
    });
    await tx.passwordResetToken.delete({ where: { id: resetToken.id } });
  });

  logger.info({ message: 'Password reset completed', userId: resetToken.userId });

  return { message: 'Password updated' };
}
