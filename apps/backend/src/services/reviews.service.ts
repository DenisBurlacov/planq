import { z } from 'zod';
import prisma from '@utils/prisma.js';
import { AppError } from '@utils/AppError.js';

export const CreateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

export async function getProductReviews(productId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: { productId } }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function createReview(userId: string, productId: string, input: CreateReviewInput) {
  const product = await prisma.product.findFirst({ where: { id: productId } });
  if (!product) throw new AppError('PRODUCT_NOT_FOUND', 'Product not found', 404);

  const existing = await prisma.review.findFirst({
    where: { userId, productId, deletedAt: null },
  });
  if (existing) throw new AppError('REVIEW_EXISTS', 'You have already reviewed this product', 409);

  const review = await prisma.review.create({
    data: { userId, productId, ...input },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });

  // Update product rating
  const stats = await prisma.review.aggregate({
    where: { productId, deletedAt: null },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: stats._avg.rating ?? 0,
      reviewCount: stats._count,
    },
  });

  return review;
}

export async function deleteReview(userId: string, reviewId: string) {
  const review = await prisma.review.findFirst({
    where: { id: reviewId, userId, deletedAt: null },
  });
  if (!review) throw new AppError('REVIEW_NOT_FOUND', 'Review not found', 404);

  await prisma.review.update({
    where: { id: reviewId },
    data: { deletedAt: new Date() },
  });
}
