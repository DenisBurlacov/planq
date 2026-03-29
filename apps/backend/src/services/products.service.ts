import { z } from 'zod';
import prisma from '@utils/prisma.js';
import { AppError } from '@utils/AppError.js';

export const ProductsQuerySchema = z.object({
  categoryId: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  inStock: z
    .string()
    .optional()
    .transform(v => v === 'true'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ProductsQuery = z.infer<typeof ProductsQuerySchema>;

export async function getProducts(query: ProductsQuery) {
  const { categoryId, search, minPrice, maxPrice, inStock, page, limit } = query;
  const skip = (page - 1) * limit;

  const where = {
    ...(categoryId && { categoryId }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(minPrice !== undefined && { price: { gte: minPrice } }),
    ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
    ...(inStock && { stock: { gt: 0 } }),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take: limit, include: { category: true } }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findFirst({
    where: { id },
    include: { category: true, reviews: { where: { deletedAt: null }, take: 10 } },
  });

  if (!product) {
    throw new AppError('PRODUCT_NOT_FOUND', 'Product not found', 404);
  }

  return product;
}

export async function getProductStock(id: string) {
  const product = await prisma.product.findFirst({
    where: { id },
    select: { id: true, stock: true },
  });

  if (!product) {
    throw new AppError('PRODUCT_NOT_FOUND', 'Product not found', 404);
  }

  return { id: product.id, stock: product.stock, inStock: product.stock > 0 };
}
