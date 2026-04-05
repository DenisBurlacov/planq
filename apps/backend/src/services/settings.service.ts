import { z } from 'zod';
import prisma from '@utils/prisma.js';

export const UpdateSettingsSchema = z.object({
  settings: z.array(
    z.object({
      key: z.string().min(1).max(100),
      value: z.string().max(1000),
    })
  ),
});

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;

export async function listSettings() {
  return prisma.storeSetting.findMany({ orderBy: { key: 'asc' } });
}

export async function updateSettings(settings: { key: string; value: string }[]) {
  const results = await Promise.all(
    settings.map(({ key, value }) =>
      prisma.storeSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  );

  return results;
}
