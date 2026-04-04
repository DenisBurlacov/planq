import { z } from 'zod';
import prisma from '@utils/prisma.js';
import { AppError } from '@utils/AppError.js';

export const CreateAddressSchema = z.object({
  name: z.string().min(1).max(100),
  street: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  zip: z.string().min(1).max(20),
  country: z.string().min(1).max(100),
  isDefault: z.boolean().optional().default(false),
});

export const UpdateAddressSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  street: z.string().min(1).max(200).optional(),
  city: z.string().min(1).max(100).optional(),
  zip: z.string().min(1).max(20).optional(),
  country: z.string().min(1).max(100).optional(),
  isDefault: z.boolean().optional(),
});

export async function listAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function createAddress(userId: string, input: z.infer<typeof CreateAddressSchema>) {
  if (input.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  // If this is the first address, make it default
  const count = await prisma.address.count({ where: { userId } });
  const isDefault = count === 0 ? true : input.isDefault;

  return prisma.address.create({
    data: { ...input, isDefault, userId },
  });
}

export async function updateAddress(
  userId: string,
  addressId: string,
  input: z.infer<typeof UpdateAddressSchema>
) {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw new AppError('ADDRESS_NOT_FOUND', 'Address not found', 404);

  if (input.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.address.update({
    where: { id: addressId },
    data: input,
  });
}

export async function deleteAddress(userId: string, addressId: string) {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw new AppError('ADDRESS_NOT_FOUND', 'Address not found', 404);

  await prisma.address.delete({ where: { id: addressId } });

  // If deleted address was default, promote next one
  if (address.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (next) {
      await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  }
}

export async function setDefault(userId: string, addressId: string) {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw new AppError('ADDRESS_NOT_FOUND', 'Address not found', 404);

  await prisma.address.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });

  return prisma.address.update({
    where: { id: addressId },
    data: { isDefault: true },
  });
}
