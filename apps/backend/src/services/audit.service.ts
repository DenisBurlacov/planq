import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import prisma from '@utils/prisma.js';
import logger from '@utils/logger.js';

// ─── Validation Schemas ──────────────────────────────────────────────────────

export const AuditQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  action: z.string().optional(),
  userId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// ─── Service ────────────────────────────────────────────────────────────────

export async function logAction(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        details: details ? (details as Prisma.InputJsonValue) : undefined,
      },
    });
  } catch (err) {
    logger.error({
      message: 'Failed to write audit log',
      action,
      resource,
      resourceId,
      error: err,
    });
  }
}

export async function listAuditLogs(
  page: number,
  limit: number,
  action?: string,
  userId?: string,
  dateFrom?: string,
  dateTo?: string
) {
  const skip = (page - 1) * limit;

  const where = {
    ...(action && { action }),
    ...(userId && { userId }),
    ...((dateFrom || dateTo) && {
      createdAt: {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      },
    }),
  };

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}
