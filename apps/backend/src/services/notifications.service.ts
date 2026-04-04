import { z } from 'zod';
import prisma from '@utils/prisma.js';
import { AppError } from '@utils/AppError.js';

const DEFAULT_PREFS = {
  email: true,
  push: false,
  newsletter: false,
  orderUpdates: true,
  promotions: false,
};

export const UpdateNotificationPrefsSchema = z.object({
  email: z.boolean().optional(),
  push: z.boolean().optional(),
  newsletter: z.boolean().optional(),
  orderUpdates: z.boolean().optional(),
  promotions: z.boolean().optional(),
});

export async function getNotificationPrefs(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId },
    select: { notificationPrefs: true },
  });
  if (!user) throw new AppError('USER_NOT_FOUND', 'User not found', 404);

  return (user.notificationPrefs as Record<string, boolean> | null) ?? DEFAULT_PREFS;
}

export async function updateNotificationPrefs(
  userId: string,
  input: z.infer<typeof UpdateNotificationPrefsSchema>
) {
  const current = await getNotificationPrefs(userId);
  const merged = { ...current, ...input };

  await prisma.user.update({
    where: { id: userId },
    data: { notificationPrefs: merged },
  });

  return merged;
}
