import { z } from 'zod';
import prisma from '@utils/prisma.js';
import logger from '@utils/logger.js';

export const ContactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});

export type ContactInput = z.infer<typeof ContactSchema>;

export async function submitContactForm(input: ContactInput) {
  const record = await prisma.contactMessage.create({ data: input });

  logger.info({
    message: 'Contact form submitted',
    contactId: record.id,
    name: input.name,
    email: input.email,
    subject: input.subject,
  });

  return {
    id: record.id,
    message: 'Your message has been received. We will get back to you soon.',
  };
}
