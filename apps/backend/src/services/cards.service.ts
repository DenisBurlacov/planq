import { z } from 'zod';
import prisma from '@utils/prisma.js';
import { AppError } from '@utils/AppError.js';

const MAX_CARDS_PER_USER = 5;

export const CreateCardSchema = z.object({
  cardNumber: z.string().min(13).max(19),
  cardholderName: z.string().min(1).max(100),
  expMonth: z.number().int().min(1).max(12),
  expYear: z.number().int().min(2026).max(2040),
});

export type CreateCardInput = z.infer<typeof CreateCardSchema>;

function detectBrand(cardNumber: string): string {
  const first = cardNumber.charAt(0);
  const firstTwo = cardNumber.slice(0, 2);

  if (first === '4') return 'Visa';
  if (first === '5') return 'Mastercard';
  if (firstTwo === '34' || firstTwo === '37') return 'Amex';

  return 'Unknown';
}

function extractLast4(cardNumber: string): string {
  return cardNumber.slice(-4);
}

export async function listCards(userId: string) {
  return prisma.savedCard.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function createCard(userId: string, input: CreateCardInput) {
  const count = await prisma.savedCard.count({ where: { userId } });
  if (count >= MAX_CARDS_PER_USER) {
    throw new AppError(
      'MAX_CARDS_REACHED',
      `Maximum of ${MAX_CARDS_PER_USER} saved cards allowed`,
      400
    );
  }

  const brand = detectBrand(input.cardNumber);
  const last4 = extractLast4(input.cardNumber);
  const isDefault = count === 0;

  return prisma.savedCard.create({
    data: {
      userId,
      last4,
      brand,
      cardholderName: input.cardholderName,
      expMonth: input.expMonth,
      expYear: input.expYear,
      isDefault,
    },
  });
}

export async function deleteCard(userId: string, cardId: string) {
  const card = await prisma.savedCard.findFirst({ where: { id: cardId, userId } });
  if (!card) throw new AppError('CARD_NOT_FOUND', 'Saved card not found', 404);

  await prisma.savedCard.delete({ where: { id: cardId } });

  // If deleted card was default, promote next one
  if (card.isDefault) {
    const next = await prisma.savedCard.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (next) {
      await prisma.savedCard.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  }
}

export async function setDefault(userId: string, cardId: string) {
  const card = await prisma.savedCard.findFirst({ where: { id: cardId, userId } });
  if (!card) throw new AppError('CARD_NOT_FOUND', 'Saved card not found', 404);

  await prisma.savedCard.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });

  return prisma.savedCard.update({
    where: { id: cardId },
    data: { isDefault: true },
  });
}
