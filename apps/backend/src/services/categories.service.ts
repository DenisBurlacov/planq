import prisma from '@utils/prisma.js';

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}
