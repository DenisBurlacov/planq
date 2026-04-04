jest.mock('@utils/prisma.js', () => ({
  __esModule: true,
  default: {
    product: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@utils/logger.js', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listOrders,
  updateOrderStatus,
  listUsers,
  toggleBlockUser,
  getStats,
} from '@services/admin.service.js';
import prisma from '@utils/prisma.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFn = (fn: unknown) => fn as jest.MockedFunction<(...args: any[]) => any>;

describe('admin.service', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── Products ──────────────────────────────────────────────────────────────

  describe('listProducts', () => {
    it('returns paginated products', async () => {
      const products = [{ id: 'p1', name: 'Chair' }];
      mockFn(prisma.product.findMany).mockResolvedValue(products);
      mockFn(prisma.product.count).mockResolvedValue(1);

      const result = await listProducts(1, 20);

      expect(result.items).toEqual(products);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pages).toBe(1);
    });

    it('passes search filter when provided', async () => {
      mockFn(prisma.product.findMany).mockResolvedValue([]);
      mockFn(prisma.product.count).mockResolvedValue(0);

      await listProducts(1, 20, 'chair');

      const findManyCall = mockFn(prisma.product.findMany).mock.calls[0][0];
      expect(findManyCall.where).toHaveProperty('OR');
    });
  });

  describe('createProduct', () => {
    const input = {
      name: 'Test Chair',
      slug: 'test-chair',
      description: 'A test chair',
      price: 99.99,
      stock: 10,
      categoryId: 'cat-1',
      images: [],
    };

    it('creates a product when category exists and slug is unique', async () => {
      mockFn(prisma.category.findUnique).mockResolvedValue({ id: 'cat-1' });
      mockFn(prisma.product.findUnique).mockResolvedValue(null);
      mockFn(prisma.product.create).mockResolvedValue({ id: 'p-new', ...input });

      const result = await createProduct(input);

      expect(result.id).toBe('p-new');
      expect(prisma.product.create).toHaveBeenCalled();
    });

    it('throws CATEGORY_NOT_FOUND when category does not exist', async () => {
      mockFn(prisma.category.findUnique).mockResolvedValue(null);

      await expect(createProduct(input)).rejects.toMatchObject({
        code: 'CATEGORY_NOT_FOUND',
        statusCode: 404,
      });
    });

    it('throws SLUG_TAKEN when slug already exists', async () => {
      mockFn(prisma.category.findUnique).mockResolvedValue({ id: 'cat-1' });
      mockFn(prisma.product.findUnique).mockResolvedValue({ id: 'existing', slug: 'test-chair' });

      await expect(createProduct(input)).rejects.toMatchObject({
        code: 'SLUG_TAKEN',
        statusCode: 409,
      });
    });
  });

  describe('updateProduct', () => {
    it('updates an existing product', async () => {
      mockFn(prisma.product.findFirst).mockResolvedValue({ id: 'p1', slug: 'old-slug' });
      mockFn(prisma.product.update).mockResolvedValue({ id: 'p1', name: 'Updated' });

      const result = await updateProduct('p1', { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });

    it('throws PRODUCT_NOT_FOUND when product does not exist', async () => {
      mockFn(prisma.product.findFirst).mockResolvedValue(null);

      await expect(updateProduct('nonexistent', { name: 'X' })).rejects.toMatchObject({
        code: 'PRODUCT_NOT_FOUND',
        statusCode: 404,
      });
    });

    it('throws SLUG_TAKEN when updating to a taken slug', async () => {
      mockFn(prisma.product.findFirst).mockResolvedValue({ id: 'p1', slug: 'old-slug' });
      mockFn(prisma.product.findUnique).mockResolvedValue({ id: 'p2', slug: 'taken-slug' });

      await expect(updateProduct('p1', { slug: 'taken-slug' })).rejects.toMatchObject({
        code: 'SLUG_TAKEN',
        statusCode: 409,
      });
    });

    it('throws CATEGORY_NOT_FOUND when updating with invalid category', async () => {
      mockFn(prisma.product.findFirst).mockResolvedValue({ id: 'p1', slug: 'slug' });
      mockFn(prisma.category.findUnique).mockResolvedValue(null);

      await expect(updateProduct('p1', { categoryId: 'bad-cat' })).rejects.toMatchObject({
        code: 'CATEGORY_NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('deleteProduct', () => {
    it('soft-deletes an existing product', async () => {
      mockFn(prisma.product.findFirst).mockResolvedValue({ id: 'p1' });
      mockFn(prisma.product.update).mockResolvedValue({});

      await deleteProduct('p1');

      expect(prisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'p1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        })
      );
    });

    it('throws PRODUCT_NOT_FOUND when product does not exist', async () => {
      mockFn(prisma.product.findFirst).mockResolvedValue(null);

      await expect(deleteProduct('nonexistent')).rejects.toMatchObject({
        code: 'PRODUCT_NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  // ── Orders ────────────────────────────────────────────────────────────────

  describe('listOrders', () => {
    it('returns paginated orders', async () => {
      const orders = [{ id: 'o1' }];
      mockFn(prisma.order.findMany).mockResolvedValue(orders);
      mockFn(prisma.order.count).mockResolvedValue(1);

      const result = await listOrders(1, 20);

      expect(result.items).toEqual(orders);
      expect(result.total).toBe(1);
    });

    it('applies status filter when provided', async () => {
      mockFn(prisma.order.findMany).mockResolvedValue([]);
      mockFn(prisma.order.count).mockResolvedValue(0);

      await listOrders(1, 20, 'PENDING' as unknown as import('@prisma/client').OrderStatus);

      const call = mockFn(prisma.order.findMany).mock.calls[0][0];
      expect(call.where).toHaveProperty('status', 'PENDING');
    });
  });

  describe('updateOrderStatus', () => {
    it('allows valid transition PENDING -> PROCESSING', async () => {
      mockFn(prisma.order.findFirst).mockResolvedValue({ id: 'o1', status: 'PENDING' });
      mockFn(prisma.order.update).mockResolvedValue({ id: 'o1', status: 'PROCESSING' });

      const result = await updateOrderStatus(
        'o1',
        'PROCESSING' as unknown as import('@prisma/client').OrderStatus
      );

      expect(result.status).toBe('PROCESSING');
    });

    it('allows valid transition PENDING -> CANCELLED', async () => {
      mockFn(prisma.order.findFirst).mockResolvedValue({ id: 'o1', status: 'PENDING' });
      mockFn(prisma.order.update).mockResolvedValue({ id: 'o1', status: 'CANCELLED' });

      const result = await updateOrderStatus(
        'o1',
        'CANCELLED' as unknown as import('@prisma/client').OrderStatus
      );

      expect(result.status).toBe('CANCELLED');
    });

    it('allows valid transition PROCESSING -> SHIPPED', async () => {
      mockFn(prisma.order.findFirst).mockResolvedValue({ id: 'o1', status: 'PROCESSING' });
      mockFn(prisma.order.update).mockResolvedValue({ id: 'o1', status: 'SHIPPED' });

      const result = await updateOrderStatus(
        'o1',
        'SHIPPED' as unknown as import('@prisma/client').OrderStatus
      );

      expect(result.status).toBe('SHIPPED');
    });

    it('allows valid transition SHIPPED -> DELIVERED', async () => {
      mockFn(prisma.order.findFirst).mockResolvedValue({ id: 'o1', status: 'SHIPPED' });
      mockFn(prisma.order.update).mockResolvedValue({ id: 'o1', status: 'DELIVERED' });

      const result = await updateOrderStatus(
        'o1',
        'DELIVERED' as unknown as import('@prisma/client').OrderStatus
      );

      expect(result.status).toBe('DELIVERED');
    });

    it('rejects invalid transition DELIVERED -> SHIPPED', async () => {
      mockFn(prisma.order.findFirst).mockResolvedValue({ id: 'o1', status: 'DELIVERED' });

      await expect(
        updateOrderStatus('o1', 'SHIPPED' as unknown as import('@prisma/client').OrderStatus)
      ).rejects.toMatchObject({
        code: 'INVALID_STATUS_TRANSITION',
        statusCode: 400,
      });
    });

    it('rejects invalid transition CANCELLED -> PENDING', async () => {
      mockFn(prisma.order.findFirst).mockResolvedValue({ id: 'o1', status: 'CANCELLED' });

      await expect(
        updateOrderStatus('o1', 'PENDING' as unknown as import('@prisma/client').OrderStatus)
      ).rejects.toMatchObject({
        code: 'INVALID_STATUS_TRANSITION',
        statusCode: 400,
      });
    });

    it('rejects invalid transition PENDING -> DELIVERED (skipping steps)', async () => {
      mockFn(prisma.order.findFirst).mockResolvedValue({ id: 'o1', status: 'PENDING' });

      await expect(
        updateOrderStatus('o1', 'DELIVERED' as unknown as import('@prisma/client').OrderStatus)
      ).rejects.toMatchObject({
        code: 'INVALID_STATUS_TRANSITION',
        statusCode: 400,
      });
    });

    it('throws ORDER_NOT_FOUND when order does not exist', async () => {
      mockFn(prisma.order.findFirst).mockResolvedValue(null);

      await expect(
        updateOrderStatus(
          'nonexistent',
          'PROCESSING' as unknown as import('@prisma/client').OrderStatus
        )
      ).rejects.toMatchObject({
        code: 'ORDER_NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  // ── Users ─────────────────────────────────────────────────────────────────

  describe('listUsers', () => {
    it('returns paginated users', async () => {
      const users = [{ id: 'u1', name: 'Alice' }];
      mockFn(prisma.user.findMany).mockResolvedValue(users);
      mockFn(prisma.user.count).mockResolvedValue(1);

      const result = await listUsers(1, 20);

      expect(result.items).toEqual(users);
      expect(result.total).toBe(1);
    });

    it('applies search filter', async () => {
      mockFn(prisma.user.findMany).mockResolvedValue([]);
      mockFn(prisma.user.count).mockResolvedValue(0);

      await listUsers(1, 20, 'alice');

      const call = mockFn(prisma.user.findMany).mock.calls[0][0];
      expect(call.where).toHaveProperty('OR');
    });
  });

  describe('toggleBlockUser', () => {
    it('blocks an unblocked user', async () => {
      mockFn(prisma.user.findFirst).mockResolvedValue({
        id: 'u1',
        role: 'USER',
        isBlocked: false,
      });
      mockFn(prisma.user.update).mockResolvedValue({
        id: 'u1',
        isBlocked: true,
      });

      const result = await toggleBlockUser('u1');

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { isBlocked: true },
        })
      );
      expect(result.isBlocked).toBe(true);
    });

    it('unblocks a blocked user', async () => {
      mockFn(prisma.user.findFirst).mockResolvedValue({
        id: 'u1',
        role: 'USER',
        isBlocked: true,
      });
      mockFn(prisma.user.update).mockResolvedValue({
        id: 'u1',
        isBlocked: false,
      });

      const result = await toggleBlockUser('u1');

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { isBlocked: false },
        })
      );
      expect(result.isBlocked).toBe(false);
    });

    it('throws CANNOT_BLOCK_ADMIN when trying to block an admin', async () => {
      mockFn(prisma.user.findFirst).mockResolvedValue({
        id: 'u-admin',
        role: 'ADMIN',
        isBlocked: false,
      });

      await expect(toggleBlockUser('u-admin')).rejects.toMatchObject({
        code: 'CANNOT_BLOCK_ADMIN',
        statusCode: 400,
      });
    });

    it('throws USER_NOT_FOUND when user does not exist', async () => {
      mockFn(prisma.user.findFirst).mockResolvedValue(null);

      await expect(toggleBlockUser('nonexistent')).rejects.toMatchObject({
        code: 'USER_NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  // ── Dashboard Stats ───────────────────────────────────────────────────────

  describe('getStats', () => {
    it('returns all dashboard stats', async () => {
      mockFn(prisma.order.count)
        .mockResolvedValueOnce(42) // totalOrders
        .mockResolvedValueOnce(5); // pendingOrders
      mockFn(prisma.order.aggregate).mockResolvedValue({
        _sum: { totalAmount: 1234.56 },
      });
      mockFn(prisma.user.count).mockResolvedValue(100);

      const result = await getStats();

      expect(result.totalOrders).toBe(42);
      expect(result.revenueToday).toBe(1234.56);
      expect(result.pendingOrders).toBe(5);
      expect(result.activeUsers).toBe(100);
    });

    it('returns 0 revenue when no orders today', async () => {
      mockFn(prisma.order.count).mockResolvedValueOnce(10).mockResolvedValueOnce(0);
      mockFn(prisma.order.aggregate).mockResolvedValue({
        _sum: { totalAmount: null },
      });
      mockFn(prisma.user.count).mockResolvedValue(50);

      const result = await getStats();

      expect(result.revenueToday).toBe(0);
    });
  });
});
