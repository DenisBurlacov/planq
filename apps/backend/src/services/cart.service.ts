import { z } from 'zod';
import prisma from '@utils/prisma.js';
import { AppError } from '@utils/AppError.js';

export const AddToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  variantId: z.string().optional(),
});

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(0),
});

async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function getCart(userId: string) {
  const cart = await getOrCreateCart(userId);

  const cartItems = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: true },
  });

  const total =
    Math.round(
      cartItems.reduce((sum, item) => {
        const price = item.product.salePrice ?? item.product.price;
        return sum + price * item.quantity;
      }, 0) * 100
    ) / 100;

  return { id: cart.id, items: cartItems, total };
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity: number,
  variantId?: string
) {
  const product = await prisma.product.findFirst({ where: { id: productId, deletedAt: null } });
  if (!product) throw new AppError('PRODUCT_NOT_FOUND', 'Product not found', 404);

  // Check variant stock if variantId is provided, otherwise check product stock
  if (variantId) {
    const variant = await prisma.productVariant.findFirst({ where: { id: variantId, productId } });
    if (!variant) throw new AppError('VARIANT_NOT_FOUND', 'Product variant not found', 404);
    if (variant.stock < quantity) throw new AppError('INSUFFICIENT_STOCK', 'Not enough stock', 400);
  } else {
    if (product.stock < quantity) throw new AppError('INSUFFICIENT_STOCK', 'Not enough stock', 400);
  }

  const cart = await getOrCreateCart(userId);

  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId, variantId: variantId ?? null },
  });

  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
      include: { product: true },
    });
  }

  return prisma.cartItem.create({
    data: { cartId: cart.id, productId, quantity, variantId: variantId ?? null },
    include: { product: true },
  });
}

export async function updateCartItem(userId: string, productId: string, quantity: number) {
  const cart = await getOrCreateCart(userId);

  if (quantity === 0) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
    return null;
  }

  const item = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });
  if (!item) throw new AppError('ITEM_NOT_FOUND', 'Item not in cart', 404);

  return prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity },
    include: { product: true },
  });
}

export async function removeFromCart(userId: string, productId: string) {
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
}

export async function clearCart(userId: string) {
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
}
