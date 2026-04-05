import { z } from 'zod';
import { OrderStatus } from '@prisma/client';
import prisma from '@utils/prisma.js';
import { AppError } from '@utils/AppError.js';
import logger from '@utils/logger.js';
import { fireWebhookEvent } from '@services/webhooks.service.js';

// ─── Validation Schemas ──────────────────────────────────────────────────────

export const AdminPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});

export const AdminOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.nativeEnum(OrderStatus).optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const AdminProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  includeDeleted: z
    .string()
    .optional()
    .transform(v => v === 'true'),
});

export const BulkDeleteProductsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

export const BulkUpdateOrderStatusSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  status: z.nativeEnum(OrderStatus),
});

export const CreateProductSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().min(1),
  price: z.number().positive(),
  salePrice: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0).default(0),
  categoryId: z.string().min(1),
  images: z.array(z.string().url()).default([]),
});

export const UpdateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  salePrice: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.string().min(1).optional(),
  images: z.array(z.string().url()).optional(),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

// ─── Order Status Transitions ────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

// ─── Products ────────────────────────────────────────────────────────────────

export async function listProducts(
  page: number,
  limit: number,
  search?: string,
  includeDeleted = false
) {
  const skip = (page - 1) * limit;

  const where = {
    ...(!includeDeleted && { deletedAt: null }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function createProduct(input: CreateProductInput) {
  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) throw new AppError('CATEGORY_NOT_FOUND', 'Category not found', 404);

  const existingSlug = await prisma.product.findUnique({ where: { slug: input.slug } });
  if (existingSlug) throw new AppError('SLUG_TAKEN', 'Product slug already exists', 409);

  const product = await prisma.product.create({
    data: input,
    include: { category: true },
  });

  logger.info({ message: 'Product created by admin', productId: product.id });
  return product;
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const existing = await prisma.product.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError('PRODUCT_NOT_FOUND', 'Product not found', 404);

  if (input.slug && input.slug !== existing.slug) {
    const slugTaken = await prisma.product.findUnique({ where: { slug: input.slug } });
    if (slugTaken) throw new AppError('SLUG_TAKEN', 'Product slug already exists', 409);
  }

  if (input.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category) throw new AppError('CATEGORY_NOT_FOUND', 'Category not found', 404);
  }

  const product = await prisma.product.update({
    where: { id },
    data: input,
    include: { category: true },
  });

  logger.info({ message: 'Product updated by admin', productId: product.id });
  return product;
}

export async function deleteProduct(id: string) {
  const existing = await prisma.product.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError('PRODUCT_NOT_FOUND', 'Product not found', 404);

  await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  logger.info({ message: 'Product soft-deleted by admin', productId: id });
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function listOrders(
  page: number,
  limit: number,
  status?: OrderStatus,
  search?: string,
  dateFrom?: string,
  dateTo?: string
) {
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(status && { status }),
    ...(search && {
      OR: [
        { id: { contains: search, mode: 'insensitive' as const } },
        { shippingAddress: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...((dateFrom || dateTo) && {
      createdAt: {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      },
    }),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function updateOrderStatus(id: string, newStatus: OrderStatus) {
  const order = await prisma.order.findFirst({ where: { id, deletedAt: null } });
  if (!order) throw new AppError('ORDER_NOT_FOUND', 'Order not found', 404);

  const allowed = VALID_TRANSITIONS[order.status];
  if (!allowed.includes(newStatus)) {
    throw new AppError(
      'INVALID_STATUS_TRANSITION',
      `Cannot transition from ${order.status} to ${newStatus}`,
      400
    );
  }

  // Append tracking event
  const existingEvents =
    (order.trackingEvents as Array<{ status: string; timestamp: string }>) ?? [];
  const trackingEvents = [
    ...existingEvents,
    { status: newStatus.toLowerCase(), timestamp: new Date().toISOString() },
  ];

  const updated = await prisma.order.update({
    where: { id },
    data: { status: newStatus, trackingEvents },
    include: {
      items: { include: { product: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  logger.info({
    message: 'Order status updated by admin',
    orderId: id,
    from: order.status,
    to: newStatus,
  });

  // Fire webhook event for order status update
  void fireWebhookEvent('order.status.updated', {
    event: 'order.status.updated',
    orderId: id,
    previousStatus: order.status,
    status: newStatus,
  });

  return updated;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function listUsers(page: number, limit: number, search?: string) {
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isBlocked: true,
        walletBalance: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function toggleBlockUser(id: string) {
  const user = await prisma.user.findFirst({ where: { id, deletedAt: null } });
  if (!user) throw new AppError('USER_NOT_FOUND', 'User not found', 404);

  if (user.role === 'ADMIN') {
    throw new AppError('CANNOT_BLOCK_ADMIN', 'Cannot block an admin user', 400);
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isBlocked: !user.isBlocked },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      isBlocked: true,
      walletBalance: true,
      createdAt: true,
    },
  });

  logger.info({
    message: updated.isBlocked ? 'User blocked by admin' : 'User unblocked by admin',
    userId: id,
  });

  return updated;
}

// ─── Restore Product ────────────────────────────────────────────────────────

export async function restoreProduct(id: string) {
  const existing = await prisma.product.findFirst({ where: { id, deletedAt: { not: null } } });
  if (!existing) throw new AppError('PRODUCT_NOT_FOUND', 'Deleted product not found', 404);

  const product = await prisma.product.update({
    where: { id },
    data: { deletedAt: null },
    include: { category: true },
  });

  logger.info({ message: 'Product restored by admin', productId: id });
  return product;
}

// ─── Bulk Operations ────────────────────────────────────────────────────────

export async function bulkDeleteProducts(ids: string[]) {
  const result = await prisma.product.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  logger.info({ message: 'Products bulk soft-deleted by admin', count: result.count });
  return { deleted: result.count };
}

export async function bulkUpdateOrderStatus(ids: string[], newStatus: OrderStatus) {
  const orders = await prisma.order.findMany({
    where: { id: { in: ids }, deletedAt: null },
  });

  const results: { id: string; success: boolean; error?: string }[] = [];

  for (const order of orders) {
    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed.includes(newStatus)) {
      results.push({
        id: order.id,
        success: false,
        error: `Cannot transition from ${order.status} to ${newStatus}`,
      });
      continue;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: newStatus },
    });
    results.push({ id: order.id, success: true });
  }

  const foundIds = new Set(orders.map(o => o.id));
  for (const id of ids) {
    if (!foundIds.has(id)) {
      results.push({ id, success: false, error: 'Order not found' });
    }
  }

  logger.info({ message: 'Orders bulk status update by admin', results });
  return { results };
}

// ─── CSV Export ─────────────────────────────────────────────────────────────

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function exportOrdersCsv() {
  const orders = await prisma.order.findMany({
    where: { deletedAt: null },
    include: {
      user: { select: { email: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const header = 'Order ID,Customer Email,Customer Name,Total,Status,Payment Method,Date';
  const rows = orders.map(o =>
    [
      escapeCsv(o.id),
      escapeCsv(o.user.email),
      escapeCsv(o.user.name),
      o.totalAmount.toFixed(2),
      o.status,
      o.paymentMethod,
      o.createdAt.toISOString(),
    ].join(',')
  );

  return [header, ...rows].join('\n');
}

// ─── Product Images ─────────────────────────────────────────────────────────

export async function appendProductImages(id: string, imagePaths: string[]) {
  const existing = await prisma.product.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError('PRODUCT_NOT_FOUND', 'Product not found', 404);

  const product = await prisma.product.update({
    where: { id },
    data: { images: { push: imagePaths } },
    include: { category: true },
  });

  logger.info({ message: 'Product images updated by admin', productId: id });
  return product;
}

// ─── Promo Codes ────────────────────────────────────────────────────────────

export const AdminPromosQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});

export const CreatePromoSchema = z.object({
  code: z.string().min(1).max(50),
  discountPercent: z.number().int().min(1).max(100),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  minOrderAmount: z.number().positive().nullable().optional(),
  maxUses: z.number().int().positive(),
  isActive: z.boolean().default(true),
});

export const UpdatePromoSchema = z.object({
  code: z.string().min(1).max(50).optional(),
  discountPercent: z.number().int().min(1).max(100).optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  minOrderAmount: z.number().positive().nullable().optional(),
  maxUses: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export type CreatePromoInput = z.infer<typeof CreatePromoSchema>;
export type UpdatePromoInput = z.infer<typeof UpdatePromoSchema>;

export async function listPromos(page: number, limit: number, search?: string) {
  const skip = (page - 1) * limit;
  const where = {
    ...(search && {
      code: { contains: search, mode: 'insensitive' as const },
    }),
  };
  const [items, total] = await Promise.all([
    prisma.promoCode.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.promoCode.count({ where }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function createPromo(input: CreatePromoInput) {
  const existing = await prisma.promoCode.findUnique({ where: { code: input.code } });
  if (existing) throw new AppError('PROMO_CODE_EXISTS', 'Promo code already exists', 409);

  const promo = await prisma.promoCode.create({
    data: {
      ...input,
      validFrom: new Date(input.validFrom),
      validUntil: new Date(input.validUntil),
      minOrderAmount: input.minOrderAmount ?? null,
    },
  });
  logger.info({ message: 'Promo code created by admin', promoId: promo.id });
  return promo;
}

export async function updatePromo(id: string, input: UpdatePromoInput) {
  const existing = await prisma.promoCode.findUnique({ where: { id } });
  if (!existing) throw new AppError('PROMO_NOT_FOUND', 'Promo code not found', 404);

  if (input.code && input.code !== existing.code) {
    const codeTaken = await prisma.promoCode.findUnique({ where: { code: input.code } });
    if (codeTaken) throw new AppError('PROMO_CODE_EXISTS', 'Promo code already exists', 409);
  }

  const promo = await prisma.promoCode.update({
    where: { id },
    data: {
      ...input,
      ...(input.validFrom && { validFrom: new Date(input.validFrom) }),
      ...(input.validUntil && { validUntil: new Date(input.validUntil) }),
    },
  });
  logger.info({ message: 'Promo code updated by admin', promoId: promo.id });
  return promo;
}

export async function deletePromo(id: string) {
  const existing = await prisma.promoCode.findUnique({ where: { id } });
  if (!existing) throw new AppError('PROMO_NOT_FOUND', 'Promo code not found', 404);

  await prisma.promoCode.delete({ where: { id } });
  logger.info({ message: 'Promo code deleted by admin', promoId: id });
}

// ─── Categories (Admin) ────────────────────────────────────────────────────

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  image: z.string().nullable().optional(),
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).optional(),
  image: z.string().nullable().optional(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

export async function listAdminCategories(page: number, limit: number, search?: string) {
  const skip = (page - 1) * limit;
  const where = {
    ...(search && {
      name: { contains: search, mode: 'insensitive' as const },
    }),
  };
  const [items, total] = await Promise.all([
    prisma.category.findMany({ where, orderBy: { name: 'asc' }, skip, take: limit }),
    prisma.category.count({ where }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function createCategory(input: CreateCategoryInput) {
  const existingName = await prisma.category.findUnique({ where: { name: input.name } });
  if (existingName) throw new AppError('CATEGORY_NAME_EXISTS', 'Category name already exists', 409);

  const existingSlug = await prisma.category.findUnique({ where: { slug: input.slug } });
  if (existingSlug) throw new AppError('CATEGORY_SLUG_EXISTS', 'Category slug already exists', 409);

  const category = await prisma.category.create({ data: input });
  logger.info({ message: 'Category created by admin', categoryId: category.id });
  return category;
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new AppError('CATEGORY_NOT_FOUND', 'Category not found', 404);

  if (input.name && input.name !== existing.name) {
    const nameTaken = await prisma.category.findUnique({ where: { name: input.name } });
    if (nameTaken) throw new AppError('CATEGORY_NAME_EXISTS', 'Category name already exists', 409);
  }

  if (input.slug && input.slug !== existing.slug) {
    const slugTaken = await prisma.category.findUnique({ where: { slug: input.slug } });
    if (slugTaken) throw new AppError('CATEGORY_SLUG_EXISTS', 'Category slug already exists', 409);
  }

  const category = await prisma.category.update({ where: { id }, data: input });
  logger.info({ message: 'Category updated by admin', categoryId: category.id });
  return category;
}

export async function deleteCategory(id: string) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new AppError('CATEGORY_NOT_FOUND', 'Category not found', 404);

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw new AppError(
      'CATEGORY_HAS_PRODUCTS',
      `Cannot delete category with ${productCount} products`,
      400
    );
  }

  await prisma.category.delete({ where: { id } });
  logger.info({ message: 'Category deleted by admin', categoryId: id });
}

// ─── Review Moderation ──────────────────────────────────────────────────────

export const AdminReviewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});

export async function listAdminReviews(page: number, limit: number, search?: string) {
  const skip = (page - 1) * limit;
  const where = {
    deletedAt: null,
    ...(search && {
      OR: [{ comment: { contains: search, mode: 'insensitive' as const } }],
    }),
  };
  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function deleteReview(id: string) {
  const review = await prisma.review.findFirst({ where: { id, deletedAt: null } });
  if (!review) throw new AppError('REVIEW_NOT_FOUND', 'Review not found', 404);

  await prisma.review.update({ where: { id }, data: { deletedAt: new Date() } });

  // Update product rating
  const stats = await prisma.review.aggregate({
    where: { productId: review.productId, deletedAt: null },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: review.productId },
    data: {
      rating: stats._avg.rating ?? 0,
      reviewCount: stats._count,
    },
  });

  logger.info({ message: 'Review deleted by admin', reviewId: id });
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalOrders, revenueToday, pendingOrders, activeUsers] = await Promise.all([
    prisma.order.count({ where: { deletedAt: null } }),
    prisma.order.aggregate({
      where: {
        deletedAt: null,
        createdAt: { gte: today },
        status: { not: OrderStatus.CANCELLED },
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({ where: { status: OrderStatus.PENDING, deletedAt: null } }),
    prisma.user.count({ where: { isBlocked: false, deletedAt: null } }),
  ]);

  return {
    totalOrders,
    revenueToday: revenueToday._sum.totalAmount ?? 0,
    pendingOrders,
    activeUsers,
  };
}

// ─── Enhanced Stats ��───────────────────────────��────────────────────────────

export async function getRevenueChart() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      deletedAt: null,
      status: { not: OrderStatus.CANCELLED },
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { totalAmount: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const revenueByDay: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    revenueByDay[key] = 0;
  }

  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    if (key in revenueByDay) {
      revenueByDay[key] += order.totalAmount;
    }
  }

  return Object.entries(revenueByDay).map(([date, revenue]) => ({
    date,
    revenue: Math.round(revenue * 100) / 100,
  }));
}

export async function getTopProducts() {
  const items = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { priceAtOrder: true },
    _count: { id: true },
    orderBy: { _sum: { priceAtOrder: 'desc' } },
    take: 10,
  });

  const productIds = items.map(i => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, slug: true, images: true },
  });

  const productMap = new Map(products.map(p => [p.id, p]));

  return items.map(item => ({
    product: productMap.get(item.productId) ?? {
      id: item.productId,
      name: 'Unknown',
      slug: '',
      images: [],
    },
    totalRevenue: Math.round((item._sum.priceAtOrder ?? 0) * 100) / 100,
    totalOrders: item._count.id,
  }));
}

export async function getOrdersByStatus() {
  const counts = await prisma.order.groupBy({
    by: ['status'],
    where: { deletedAt: null },
    _count: { id: true },
  });

  const result: Record<string, number> = {};
  for (const status of Object.values(OrderStatus)) {
    result[status] = 0;
  }
  for (const item of counts) {
    result[item.status] = item._count.id;
  }

  return result;
}
