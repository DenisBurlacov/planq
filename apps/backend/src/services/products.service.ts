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
  onSale: z
    .string()
    .optional()
    .transform(v => v === 'true'),
  material: z.string().optional(),
  color: z.string().optional(),
  style: z.string().optional(),
  sort: z.enum(['newest', 'priceAsc', 'priceDesc', 'rating']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ProductsQuery = z.infer<typeof ProductsQuerySchema>;

export async function getProducts(query: ProductsQuery) {
  const {
    categoryId,
    search,
    minPrice,
    maxPrice,
    inStock,
    onSale,
    material,
    color,
    style,
    sort,
    page,
    limit,
  } = query;
  const skip = (page - 1) * limit;

  // Build JSON path filters for specs (case-insensitive via multiple variants)
  const specsFilters: Record<string, unknown>[] = [];
  const buildSpecsFilter = (field: string, value: string) => {
    const values = value
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);
    if (values.length === 0) return;
    specsFilters.push({
      OR: values.flatMap(v => [
        { specs: { path: [field], string_contains: v } },
        { specs: { path: [field], string_contains: v.charAt(0).toUpperCase() + v.slice(1) } },
        { specs: { path: [field], string_contains: v.toLowerCase() } },
      ]),
    });
  };
  if (material) buildSpecsFilter('material', material);
  if (color) buildSpecsFilter('color', color);
  if (style) buildSpecsFilter('style', style);

  const where = {
    deletedAt: null,
    ...(categoryId && { categoryId }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
    ...(inStock && { stock: { gt: 0 } }),
    ...(onSale && { salePrice: { not: null } }),
    ...(specsFilters.length > 0 && { AND: specsFilters }),
  };

  const orderBy = (() => {
    switch (sort) {
      case 'priceAsc':
        return { price: 'asc' as const };
      case 'priceDesc':
        return { price: 'desc' as const };
      case 'rating':
        return { rating: 'desc' as const };
      default:
        return { createdAt: 'desc' as const };
    }
  })();

  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip, take: limit, include: { category: true } }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: {
      category: true,
      reviews: { where: { deletedAt: null }, take: 10 },
      variants: true,
    },
  });

  if (!product) {
    throw new AppError('PRODUCT_NOT_FOUND', 'Product not found', 404);
  }

  return product;
}

export async function suggestProducts(q: string) {
  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      name: { contains: q, mode: 'insensitive' },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      salePrice: true,
      images: true,
    },
    take: 5,
  });

  return products.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    salePrice: p.salePrice,
    image: p.images[0] ?? null,
  }));
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
