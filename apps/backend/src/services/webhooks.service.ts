import { z } from 'zod';
import prisma from '@utils/prisma.js';
import { AppError } from '@utils/AppError.js';

export const CreateWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.enum(['order.created', 'order.status.updated'])).min(1),
});

export type CreateWebhookInput = z.infer<typeof CreateWebhookSchema>;

export async function createWebhook(userId: string, input: CreateWebhookInput) {
  const count = await prisma.webhookSubscription.count({ where: { userId } });
  if (count >= 10) {
    throw new AppError('LIMIT_REACHED', 'Maximum 10 webhook subscriptions allowed', 400);
  }

  return prisma.webhookSubscription.create({
    data: {
      userId,
      url: input.url,
      events: input.events,
    },
    include: { deliveries: { take: 10, orderBy: { createdAt: 'desc' } } },
  });
}

export async function listWebhooks(userId: string) {
  return prisma.webhookSubscription.findMany({
    where: { userId },
    include: { deliveries: { take: 10, orderBy: { createdAt: 'desc' } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function toggleWebhook(userId: string, id: string, active: boolean) {
  const sub = await prisma.webhookSubscription.findFirst({ where: { id, userId } });
  if (!sub) throw new AppError('NOT_FOUND', 'Webhook subscription not found', 404);

  return prisma.webhookSubscription.update({
    where: { id },
    data: { active },
    include: { deliveries: { take: 10, orderBy: { createdAt: 'desc' } } },
  });
}

export async function deleteWebhook(userId: string, id: string) {
  const sub = await prisma.webhookSubscription.findFirst({ where: { id, userId } });
  if (!sub) throw new AppError('NOT_FOUND', 'Webhook subscription not found', 404);

  await prisma.webhookSubscription.delete({ where: { id } });
}

export async function getDeliveries(userId: string, subscriptionId: string) {
  const sub = await prisma.webhookSubscription.findFirst({
    where: { id: subscriptionId, userId },
  });
  if (!sub) throw new AppError('NOT_FOUND', 'Webhook subscription not found', 404);

  return prisma.webhookDelivery.findMany({
    where: { subscriptionId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
}

/** Mock: record a webhook delivery (called internally when order events happen) */
export async function recordDelivery(
  subscriptionId: string,
  event: string,
  payload: Record<string, unknown>
) {
  return prisma.webhookDelivery.create({
    data: {
      subscriptionId,
      event,
      payload: payload as unknown as import('@prisma/client').Prisma.InputJsonValue,
      status: 'sent',
    },
  });
}

/** Fire webhook event: find matching subscriptions and record deliveries */
export async function fireWebhookEvent(event: string, payload: Record<string, unknown>) {
  const subs = await prisma.webhookSubscription.findMany({
    where: { active: true, events: { has: event } },
  });
  await Promise.allSettled(subs.map(sub => recordDelivery(sub.id, event, payload)));
}
