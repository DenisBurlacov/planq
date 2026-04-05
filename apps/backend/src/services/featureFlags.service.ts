import { z } from 'zod';
import prisma from '@utils/prisma.js';

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
}

const FLAG_PREFIX = 'ff_';

const DEFAULT_FLAGS: FeatureFlag[] = [
  { key: 'show_testimonials', enabled: true, description: 'Shows testimonials on homepage' },
  { key: 'show_countdown', enabled: true, description: 'Shows sale countdown timers' },
  { key: 'enable_reviews', enabled: true, description: 'Allows review submission' },
  { key: 'show_trust_badges', enabled: true, description: 'Shows trust badges on homepage' },
  { key: 'new_checkout_flow', enabled: false, description: 'A/B test flag for checkout' },
  { key: 'dark_mode_toggle', enabled: true, description: 'Shows dark mode toggle' },
  { key: 'show_flaky_zone', enabled: false, description: 'Shows QA Training Zone on homepage' },
];

function toStorageKey(flagKey: string): string {
  return `${FLAG_PREFIX}${flagKey}`;
}

function fromStorageKey(storageKey: string): string {
  return storageKey.replace(FLAG_PREFIX, '');
}

function parseFlag(row: { key: string; value: string }): FeatureFlag {
  try {
    const parsed = JSON.parse(row.value) as { enabled: boolean; description: string };
    return {
      key: fromStorageKey(row.key),
      enabled: parsed.enabled,
      description: parsed.description,
    };
  } catch {
    return { key: fromStorageKey(row.key), enabled: false, description: '' };
  }
}

export async function seedDefaultFlags(): Promise<void> {
  for (const flag of DEFAULT_FLAGS) {
    const storageKey = toStorageKey(flag.key);
    const existing = await prisma.storeSetting.findUnique({ where: { key: storageKey } });
    if (!existing) {
      await prisma.storeSetting.create({
        data: {
          key: storageKey,
          value: JSON.stringify({ enabled: flag.enabled, description: flag.description }),
        },
      });
    }
  }
}

export async function listFlags(): Promise<FeatureFlag[]> {
  const rows = await prisma.storeSetting.findMany({
    where: { key: { startsWith: FLAG_PREFIX } },
    orderBy: { key: 'asc' },
  });
  return rows.map(parseFlag);
}

export const ToggleFlagSchema = z.object({
  enabled: z.boolean(),
});

export type ToggleFlagInput = z.infer<typeof ToggleFlagSchema>;

export async function toggleFlag(flagKey: string, enabled: boolean): Promise<FeatureFlag> {
  const storageKey = toStorageKey(flagKey);
  const existing = await prisma.storeSetting.findUnique({ where: { key: storageKey } });

  let description = '';
  if (existing) {
    try {
      const parsed = JSON.parse(existing.value) as { description?: string };
      description = parsed.description ?? '';
    } catch {
      // ignore
    }
  }

  const row = await prisma.storeSetting.upsert({
    where: { key: storageKey },
    update: { value: JSON.stringify({ enabled, description }) },
    create: { key: storageKey, value: JSON.stringify({ enabled, description }) },
  });

  return parseFlag(row);
}
