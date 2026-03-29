import { z } from 'zod';
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
  password: z.string().min(1),
});

export const RefreshSchema = z.object({
  refreshToken: z.string().min(1),
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

  const payload = { userId: user.id, email: user.email };
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

  const newAccessToken = signAccessToken({ userId: payload.userId, email: payload.email });
  const newRefreshToken = signRefreshToken({ userId: payload.userId, email: payload.email });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: { token: newRefreshToken, userId: payload.userId, expiresAt },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function logout(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}
