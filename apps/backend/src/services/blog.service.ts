import { z } from 'zod';
import prisma from '@utils/prisma.js';
import { AppError } from '@utils/AppError.js';

export const BlogQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  category: z.string().optional(),
});

export async function listArticles(page: number, limit: number, category?: string) {
  const skip = (page - 1) * limit;

  const where = {
    ...(category && { category }),
  };

  const [items, total] = await Promise.all([
    prisma.blogArticle.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.blogArticle.count({ where }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getArticleBySlug(slug: string) {
  const article = await prisma.blogArticle.findUnique({ where: { slug } });
  if (!article) throw new AppError('ARTICLE_NOT_FOUND', 'Blog article not found', 404);
  return article;
}
