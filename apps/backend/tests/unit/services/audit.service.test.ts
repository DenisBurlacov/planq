jest.mock('@utils/prisma.js', () => ({
  __esModule: true,
  default: {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@utils/logger.js', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { logAction, listAuditLogs } from '@services/audit.service.js';
import prisma from '@utils/prisma.js';
import logger from '@utils/logger.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFn = (fn: unknown) => fn as jest.MockedFunction<(...args: any[]) => any>;

describe('audit.service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('logAction', () => {
    it('creates an audit log entry', async () => {
      mockFn(prisma.auditLog.create).mockResolvedValue({});

      await logAction('u1', 'product_create', 'product', 'p1', { name: 'Chair' });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          action: 'product_create',
          resource: 'product',
          resourceId: 'p1',
          details: { name: 'Chair' },
        },
      });
    });

    it('creates audit log without optional fields', async () => {
      mockFn(prisma.auditLog.create).mockResolvedValue({});

      await logAction('u1', 'product_bulk_delete', 'product');

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          action: 'product_bulk_delete',
          resource: 'product',
          resourceId: undefined,
          details: undefined,
        },
      });
    });

    it('does not throw on database error, logs error instead', async () => {
      const dbError = new Error('DB connection failed');
      mockFn(prisma.auditLog.create).mockRejectedValue(dbError);

      // Should not throw
      await logAction('u1', 'product_create', 'product', 'p1');

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Failed to write audit log',
          action: 'product_create',
          resource: 'product',
          resourceId: 'p1',
          error: dbError,
        })
      );
    });
  });

  describe('listAuditLogs', () => {
    it('returns paginated audit logs', async () => {
      const items = [
        { id: 'a1', action: 'product_create', user: { id: 'u1', name: 'Admin', email: 'a@b.com' } },
      ];
      mockFn(prisma.auditLog.findMany).mockResolvedValue(items);
      mockFn(prisma.auditLog.count).mockResolvedValue(1);

      const result = await listAuditLogs(1, 20);

      expect(result.items).toEqual(items);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pages).toBe(1);
    });

    it('calculates pages correctly', async () => {
      mockFn(prisma.auditLog.findMany).mockResolvedValue([]);
      mockFn(prisma.auditLog.count).mockResolvedValue(45);

      const result = await listAuditLogs(1, 20);

      expect(result.pages).toBe(3); // ceil(45/20) = 3
    });

    it('applies action filter', async () => {
      mockFn(prisma.auditLog.findMany).mockResolvedValue([]);
      mockFn(prisma.auditLog.count).mockResolvedValue(0);

      await listAuditLogs(1, 20, 'product_create');

      const findManyCall = mockFn(prisma.auditLog.findMany).mock.calls[0][0];
      expect(findManyCall.where).toHaveProperty('action', 'product_create');
    });

    it('applies userId filter', async () => {
      mockFn(prisma.auditLog.findMany).mockResolvedValue([]);
      mockFn(prisma.auditLog.count).mockResolvedValue(0);

      await listAuditLogs(1, 20, undefined, 'u1');

      const findManyCall = mockFn(prisma.auditLog.findMany).mock.calls[0][0];
      expect(findManyCall.where).toHaveProperty('userId', 'u1');
    });

    it('applies date range filters', async () => {
      mockFn(prisma.auditLog.findMany).mockResolvedValue([]);
      mockFn(prisma.auditLog.count).mockResolvedValue(0);

      await listAuditLogs(1, 20, undefined, undefined, '2025-01-01', '2025-12-31');

      const findManyCall = mockFn(prisma.auditLog.findMany).mock.calls[0][0];
      expect(findManyCall.where.createdAt).toEqual({
        gte: new Date('2025-01-01'),
        lte: new Date('2025-12-31'),
      });
    });

    it('applies dateFrom only when dateTo is not provided', async () => {
      mockFn(prisma.auditLog.findMany).mockResolvedValue([]);
      mockFn(prisma.auditLog.count).mockResolvedValue(0);

      await listAuditLogs(1, 20, undefined, undefined, '2025-01-01');

      const findManyCall = mockFn(prisma.auditLog.findMany).mock.calls[0][0];
      expect(findManyCall.where.createdAt).toEqual({
        gte: new Date('2025-01-01'),
      });
    });

    it('uses correct skip/take for pagination', async () => {
      mockFn(prisma.auditLog.findMany).mockResolvedValue([]);
      mockFn(prisma.auditLog.count).mockResolvedValue(0);

      await listAuditLogs(3, 10);

      const findManyCall = mockFn(prisma.auditLog.findMany).mock.calls[0][0];
      expect(findManyCall.skip).toBe(20); // (3-1) * 10
      expect(findManyCall.take).toBe(10);
    });

    it('includes user data in the query', async () => {
      mockFn(prisma.auditLog.findMany).mockResolvedValue([]);
      mockFn(prisma.auditLog.count).mockResolvedValue(0);

      await listAuditLogs(1, 20);

      const findManyCall = mockFn(prisma.auditLog.findMany).mock.calls[0][0];
      expect(findManyCall.include).toEqual({
        user: { select: { id: true, name: true, email: true } },
      });
    });

    it('orders by createdAt desc', async () => {
      mockFn(prisma.auditLog.findMany).mockResolvedValue([]);
      mockFn(prisma.auditLog.count).mockResolvedValue(0);

      await listAuditLogs(1, 20);

      const findManyCall = mockFn(prisma.auditLog.findMany).mock.calls[0][0];
      expect(findManyCall.orderBy).toEqual({ createdAt: 'desc' });
    });
  });
});
