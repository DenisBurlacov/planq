import { z } from 'zod';
import { OrderStatus, PaymentMethod, TransactionType } from '@prisma/client';
import prisma from '@utils/prisma.js';
import { AppError } from '@utils/AppError.js';
import logger from '@utils/logger.js';

export const CheckoutSchema = z.object({
  shippingAddress: z.string().min(5),
  paymentMethod: z.nativeEnum(PaymentMethod),
  promoCode: z.string().optional(),
  cardNumber: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;

const CARD_SCENARIOS: Record<string, 'success' | 'declined' | 'insufficient'> = {
  '4242424242424242': 'success',
  '4000000000000002': 'declined',
  '4000000000000995': 'insufficient',
};

export async function getOrders(userId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId, deletedAt: null },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where: { userId, deletedAt: null } }),
  ]);
  return { items: orders, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getOrderById(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId, deletedAt: null },
    include: { items: { include: { product: true } } },
  });
  if (!order) throw new AppError('ORDER_NOT_FOUND', 'Order not found', 404);
  return order;
}

export async function checkout(userId: string, input: CheckoutInput) {
  const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
  if (!user) throw new AppError('USER_NOT_FOUND', 'User not found', 404);

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError('CART_EMPTY', 'Cart is empty', 400);
  }

  // Calculate total
  let total = cart.items.reduce((sum, item) => {
    const price = item.product.salePrice ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  // Apply promo code
  if (input.promoCode) {
    const promo = await prisma.promoCode.findUnique({ where: { code: input.promoCode } });
    if (!promo || !promo.isActive || promo.validUntil < new Date()) {
      throw new AppError('INVALID_PROMO_CODE', 'Promo code is invalid or expired', 400);
    }
    if (promo.maxUses > 0 && promo.currentUses >= promo.maxUses) {
      throw new AppError('PROMO_CODE_EXHAUSTED', 'Promo code has reached its usage limit', 400);
    }
    if (promo.minOrderAmount && total < promo.minOrderAmount) {
      throw new AppError(
        'PROMO_MIN_ORDER',
        `Minimum order amount for this promo is €${promo.minOrderAmount}`,
        400
      );
    }
    total = total * (1 - promo.discountPercent / 100);
    await prisma.promoCode.update({
      where: { code: input.promoCode },
      data: { currentUses: { increment: 1 } },
    });
  }

  // Payment simulation
  if (input.paymentMethod === PaymentMethod.WALLET) {
    if (user.walletBalance < total) {
      throw new AppError(
        'INSUFFICIENT_WALLET',
        `Insufficient wallet balance. Need €${(total - user.walletBalance).toFixed(2)} more`,
        400
      );
    }
  } else if (input.paymentMethod === PaymentMethod.CARD) {
    const cardDigits = (input.cardNumber ?? '').replace(/\s/g, '');
    const scenario = CARD_SCENARIOS[cardDigits] ?? 'success';

    if (scenario === 'declined') {
      throw new AppError('CARD_DECLINED', 'Card was declined', 402);
    }
    if (scenario === 'insufficient') {
      throw new AppError('CARD_INSUFFICIENT_FUNDS', 'Insufficient funds', 402);
    }
  }

  // Create order in transaction
  const order = await prisma.$transaction(async tx => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        status: OrderStatus.PENDING,
        totalAmount: total,
        shippingAddress: input.shippingAddress,
        paymentMethod: input.paymentMethod,
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtOrder: item.product.salePrice ?? item.product.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // Deduct wallet balance
    if (input.paymentMethod === PaymentMethod.WALLET) {
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: total } },
      });
      await tx.transaction.create({
        data: {
          userId,
          amount: total,
          type: TransactionType.PURCHASE,
          description: `Order #${newOrder.id}`,
          orderId: newOrder.id,
        },
      });
    }

    // Clear cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  logger.info({ message: 'Order created', orderId: order.id, userId });
  return order;
}
