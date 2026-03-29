import prisma from '@utils/prisma.js';
import { AppError } from '@utils/AppError.js';

export async function getWishlist(userId: string) {
  return prisma.wishlist.findMany({
    where: { userId },
    include: { product: true },
  });
}

export async function addToWishlist(userId: string, productId: string) {
  const product = await prisma.product.findFirst({ where: { id: productId } });
  if (!product) throw new AppError('PRODUCT_NOT_FOUND', 'Product not found', 404);

  return prisma.wishlist.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId },
    include: { product: true },
  });
}

export async function removeFromWishlist(userId: string, productId: string) {
  const item = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  if (!item) throw new AppError('ITEM_NOT_FOUND', 'Item not in wishlist', 404);

  await prisma.wishlist.delete({ where: { userId_productId: { userId, productId } } });
}
