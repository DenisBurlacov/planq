import { z } from 'zod';
import prisma from '@utils/prisma.js';
import logger from '@utils/logger.js';

export const NewsletterSubscribeSchema = z.object({
  email: z.string().email().max(200),
});

export async function subscribe(email: string) {
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) {
    return { message: 'You are already subscribed to our newsletter.' };
  }

  await prisma.newsletterSubscriber.create({ data: { email } });

  logger.info({ message: 'Newsletter subscription', email });

  return { message: 'Successfully subscribed to our newsletter.' };
}
