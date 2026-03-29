import prisma from '@utils/prisma.js';
import { AppError } from '@utils/AppError.js';

export async function getActivePromotions() {
  const now = new Date();
  return prisma.promoCode.findMany({
    where: { isActive: true, validFrom: { lte: now }, validUntil: { gte: now } },
    select: {
      id: true,
      code: true,
      discountPercent: true,
      validUntil: true,
      minOrderAmount: true,
    },
  });
}

export async function validatePromoCode(code: string, orderTotal?: number) {
  const promo = await prisma.promoCode.findUnique({ where: { code } });
  const now = new Date();

  if (!promo) throw new AppError('INVALID_PROMO_CODE', 'Promo code not found', 404);
  if (!promo.isActive) throw new AppError('PROMO_CODE_INACTIVE', 'Promo code is inactive', 400);
  if (promo.validUntil < now)
    throw new AppError('PROMO_CODE_EXPIRED', 'Promo code has expired', 400);
  if (promo.maxUses > 0 && promo.currentUses >= promo.maxUses) {
    throw new AppError('PROMO_CODE_EXHAUSTED', 'Promo code has reached its usage limit', 400);
  }
  if (orderTotal !== undefined && promo.minOrderAmount && orderTotal < promo.minOrderAmount) {
    throw new AppError('PROMO_MIN_ORDER', `Minimum order amount is €${promo.minOrderAmount}`, 400);
  }

  return {
    code: promo.code,
    discountPercent: promo.discountPercent,
    validUntil: promo.validUntil,
    ...(promo.minOrderAmount && { minOrderAmount: promo.minOrderAmount }),
    ...(orderTotal !== undefined && {
      discountAmount: (orderTotal * promo.discountPercent) / 100,
      finalAmount: orderTotal * (1 - promo.discountPercent / 100),
    }),
  };
}
