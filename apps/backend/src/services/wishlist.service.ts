import prisma from '@utils/prisma.js';
import { AppError } from '@utils/AppError.js';

export async function getWishlist(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.wishlist.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.wishlist.count({ where: { userId } }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
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
