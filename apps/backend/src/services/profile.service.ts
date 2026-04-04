import { z } from 'zod';
import { TransactionType } from '@prisma/client';
import prisma from '@utils/prisma.js';
import { AppError } from '@utils/AppError.js';
import { hashPassword } from '@utils/password.js';

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().min(1).optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const TopUpSchema = z.object({
  amount: z.number().positive().max(10000),
  cardNumber: z.string().min(1),
});

export async function getProfile(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      walletBalance: true,
      createdAt: true,
    },
  });
  if (!user) throw new AppError('USER_NOT_FOUND', 'User not found', 404);
  return user;
}

export async function updateProfile(userId: string, input: z.infer<typeof UpdateProfileSchema>) {
  return prisma.user.update({
    where: { id: userId },
    data: input,
    select: { id: true, email: true, name: true, avatar: true, walletBalance: true },
  });
}

export async function changePassword(userId: string, input: z.infer<typeof ChangePasswordSchema>) {
  const { comparePassword } = await import('@utils/password.js');
  const user = await prisma.user.findFirst({ where: { id: userId } });
  if (!user) throw new AppError('USER_NOT_FOUND', 'User not found', 404);

  const valid = await comparePassword(input.currentPassword, user.password);
  if (!valid) throw new AppError('INVALID_CREDENTIALS', 'Current password is incorrect', 400);

  const hashed = await hashPassword(input.newPassword);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
}

export async function getTransactions(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where: { userId } }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function topUpWallet(userId: string, input: z.infer<typeof TopUpSchema>) {
  // Card scenario simulation
  const cardDigits = input.cardNumber.replace(/\s/g, '');
  if (cardDigits === '4000000000000002') {
    throw new AppError('CARD_DECLINED', 'Card was declined', 402);
  }
  if (cardDigits === '4000000000000995') {
    throw new AppError('CARD_INSUFFICIENT_FUNDS', 'Insufficient funds on card', 402);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { walletBalance: { increment: input.amount } },
    select: { id: true, walletBalance: true },
  });

  await prisma.transaction.create({
    data: {
      userId,
      amount: input.amount,
      type: TransactionType.TOPUP,
      description: `Wallet top-up via card`,
    },
  });

  return user;
}
