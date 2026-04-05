import { z } from 'zod';
import prisma from '@utils/prisma.js';
import { AppError } from '@utils/AppError.js';

export const CreateStockNotificationSchema = z.object({
  email: z.string().email(),
});

export type CreateStockNotificationInput = z.infer<typeof CreateStockNotificationSchema>;

export async function createStockNotification(productId: string, email: string) {
  const product = await prisma.product.findFirst({ where: { id: productId, deletedAt: null } });
  if (!product) {
    throw new AppError('PRODUCT_NOT_FOUND', 'Product not found', 404);
  }

  const existing = await prisma.stockNotification.findUnique({
    where: { email_productId: { email, productId } },
  });
  if (existing) {
    throw new AppError('ALREADY_SUBSCRIBED', 'Already subscribed for this product', 409);
  }

  return prisma.stockNotification.create({
    data: { email, productId },
  });
}
