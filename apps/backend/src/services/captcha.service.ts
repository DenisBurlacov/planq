import { z } from 'zod';
import { randomUUID } from 'crypto';
import logger from '@utils/logger.js';

// ─── Validation Schemas ─────────────────────────────────────────────────────

export const CaptchaVerifySchema = z.object({
  captchaId: z.string().min(1),
  selectedIndices: z.array(z.number().int().min(0).max(5)),
});

export type CaptchaVerifyInput = z.infer<typeof CaptchaVerifySchema>;

// ─── In-memory store for captcha IDs (mock) ─────────────────────────────────

const CAPTCHA_PLACEHOLDER_COUNT = 6;
const captchaStore = new Map<string, { createdAt: number }>();

// Clean up old entries every 10 minutes
setInterval(
  () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    for (const [id, entry] of captchaStore) {
      if (entry.createdAt < fiveMinutesAgo) {
        captchaStore.delete(id);
      }
    }
  },
  10 * 60 * 1000
);

// ─── Service Functions ──────────────────────────────────────────────────────

export function generateCaptcha() {
  const captchaId = randomUUID();
  const images = Array.from(
    { length: CAPTCHA_PLACEHOLDER_COUNT },
    (_, i) => `/placeholder/captcha-${i + 1}.png`
  );

  captchaStore.set(captchaId, { createdAt: Date.now() });

  logger.info({ message: 'Captcha generated', captchaId });

  return { captchaId, images };
}

export function verifyCaptcha(input: CaptchaVerifyInput) {
  const entry = captchaStore.get(input.captchaId);

  if (!entry) {
    // In dev/test mode, always accept even unknown captchas
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      return { valid: true };
    }
    return { valid: false };
  }

  // Remove used captcha
  captchaStore.delete(input.captchaId);

  // In dev/test: always valid
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    return { valid: true };
  }

  // Production: always valid (mock)
  return { valid: true };
}
