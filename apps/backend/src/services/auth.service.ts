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
  captchaToken: z.string().optional(),
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

export const OAuthCallbackSchema = z.object({
  provider: z.enum(['google', 'github']),
  code: z.string().min(1),
});

export const ResendVerificationSchema = z.object({
  email: z.string().email(),
});

export type OAuthCallbackInput = z.infer<typeof OAuthCallbackSchema>;

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findFirst({ where: { email: input.email } });
  if (existing) {
    throw new AppError('EMAIL_TAKEN', 'Email is already registered', 409);
  }

  const hashed = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { email: input.email, password: hashed, name: input.name },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      walletBalance: true,
      emailVerified: true,
    },
  });

  // Create email verification token (valid 24h)
  const verificationToken = randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.emailVerificationToken.create({
    data: { userId: user.id, token: verificationToken, expiresAt },
  });

  logger.info({ message: 'User registered', userId: user.id });

  const isDev = process.env.NODE_ENV !== 'production';
  return isDev ? { ...user, verificationToken } : user;
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

  // If 2FA is enabled, return tempToken instead of real tokens
  if (user.twoFactorEnabled) {
    logger.info({ message: 'User login requires 2FA', userId: user.id });
    return {
      requires2FA: true,
      tempToken: user.id,
    };
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
      emailVerified: user.emailVerified,
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

// In-memory rate limiter for forgot password attempts
const forgotPasswordAttempts = new Map<
  string,
  { count: number; firstAttempt: number; blockedUntil?: number }
>();
const FORGOT_PW_MAX_ATTEMPTS = 10;
const FORGOT_PW_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const FORGOT_PW_BLOCK_MS = 5 * 60 * 1000; // 5 minutes block

export async function forgotPassword(email: string) {
  const normalizedEmail = email.toLowerCase().trim();

  // Check rate limit
  const attempts = forgotPasswordAttempts.get(normalizedEmail);
  const now = Date.now();

  if (attempts?.blockedUntil && now < attempts.blockedUntil) {
    const remainingSeconds = Math.ceil((attempts.blockedUntil - now) / 1000);
    throw new AppError(
      'TOO_MANY_ATTEMPTS',
      `Too many attempts. Try again in ${remainingSeconds} seconds.`,
      429
    );
  }

  // Reset window if expired
  if (attempts && now - attempts.firstAttempt > FORGOT_PW_WINDOW_MS) {
    forgotPasswordAttempts.delete(normalizedEmail);
  }

  const user = await prisma.user.findFirst({ where: { email: normalizedEmail, deletedAt: null } });

  if (!user) {
    // Track failed attempt
    const current = forgotPasswordAttempts.get(normalizedEmail) || { count: 0, firstAttempt: now };
    current.count++;
    if (current.count >= FORGOT_PW_MAX_ATTEMPTS) {
      current.blockedUntil = now + FORGOT_PW_BLOCK_MS;
      forgotPasswordAttempts.set(normalizedEmail, current);
      throw new AppError(
        'TOO_MANY_ATTEMPTS',
        'Too many attempts. Your access has been temporarily blocked.',
        429
      );
    }
    forgotPasswordAttempts.set(normalizedEmail, current);
    throw new AppError('EMAIL_NOT_FOUND', 'No account found with this email address.', 404);
  }

  // Success — clear attempts
  forgotPasswordAttempts.delete(normalizedEmail);

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
  return { message: 'Password reset link has been sent to your email.', ...(isDev && { token }) };
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

export async function verifyEmail(token: string) {
  const record = await prisma.emailVerificationToken.findUnique({ where: { token } });

  if (!record || record.expiresAt < new Date()) {
    throw new AppError('INVALID_TOKEN', 'Verification token is invalid or expired', 400);
  }

  await prisma.$transaction(async tx => {
    await tx.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    });
    await tx.emailVerificationToken.delete({ where: { id: record.id } });
  });

  logger.info({ message: 'Email verified', userId: record.userId });

  return { message: 'Email verified successfully' };
}

export async function resendVerification(email: string) {
  const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });

  // Always return same message to prevent email enumeration
  const message = 'If the email exists and is unverified, a new verification link has been sent';

  if (!user || user.emailVerified) {
    return { message };
  }

  // Delete existing tokens for this user
  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.emailVerificationToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  logger.info({ message: 'Verification token resent', userId: user.id });

  const isDev = process.env.NODE_ENV !== 'production';
  return isDev ? { message, token } : { message };
}

export async function oauthCallback(input: OAuthCallbackInput) {
  const email = `oauth-${input.code}@${input.provider}.mock`;

  let user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user) {
    // Mock OAuth: always succeed, create user with random password
    const hashed = await hashPassword(randomUUID());
    user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: `${input.provider}-user-${input.code}`,
        provider: input.provider,
        providerId: input.code,
        emailVerified: true,
      },
    });
    logger.info({ message: 'OAuth user created', userId: user.id, provider: input.provider });
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
    },
  };
}
