import { z } from 'zod';
import { OrderStatus } from '@prisma/client';
import prisma from '@utils/prisma.js';
import { AppError } from '@utils/AppError.js';
import logger from '@utils/logger.js';

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

export async function listProducts(page: number, limit: number, search?: string) {
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
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

export async function listOrders(page: number, limit: number, status?: OrderStatus) {
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(status && { status }),
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

  const updated = await prisma.order.update({
    where: { id },
    data: { status: newStatus },
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
