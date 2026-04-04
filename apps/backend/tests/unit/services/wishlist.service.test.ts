jest.mock('@utils/prisma.js', () => ({
  __esModule: true,
  default: {
    wishlist: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    product: {
      findFirst: jest.fn(),
    },
  },
}));

import { getWishlist, addToWishlist, removeFromWishlist } from '@services/wishlist.service.js';
import prisma from '@utils/prisma.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFn = (fn: unknown) => fn as jest.MockedFunction<(...args: any[]) => any>;

describe('wishlist.service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getWishlist', () => {
    it('returns paginated wishlist items', async () => {
      const items = [
        { id: 'w1', userId: 'u1', productId: 'p1', product: { id: 'p1', name: 'Chair' } },
      ];
      mockFn(prisma.wishlist.findMany).mockResolvedValue(items);
      mockFn(prisma.wishlist.count).mockResolvedValue(1);

      const result = await getWishlist('u1', 1, 20);

      expect(result.items).toEqual(items);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.pages).toBe(1);
    });

    it('calculates pages correctly for multiple pages', async () => {
      mockFn(prisma.wishlist.findMany).mockResolvedValue([]);
      mockFn(prisma.wishlist.count).mockResolvedValue(45);

      const result = await getWishlist('u1', 1, 20);

      expect(result.pages).toBe(3); // ceil(45/20) = 3
      expect(result.total).toBe(45);
    });

    it('uses correct skip/take for pagination', async () => {
      mockFn(prisma.wishlist.findMany).mockResolvedValue([]);
      mockFn(prisma.wishlist.count).mockResolvedValue(0);

      await getWishlist('u1', 3, 10);

      expect(prisma.wishlist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (3-1) * 10
          take: 10,
        })
      );
    });

    it('uses default page=1 and limit=20', async () => {
      mockFn(prisma.wishlist.findMany).mockResolvedValue([]);
      mockFn(prisma.wishlist.count).mockResolvedValue(0);

      await getWishlist('u1');

      expect(prisma.wishlist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        })
      );
    });
  });

  describe('addToWishlist', () => {
    it('adds a product to wishlist when product exists', async () => {
      mockFn(prisma.product.findFirst).mockResolvedValue({ id: 'p1' });
      mockFn(prisma.wishlist.upsert).mockResolvedValue({
        id: 'w1',
        userId: 'u1',
        productId: 'p1',
        product: { id: 'p1', name: 'Chair' },
      });

      const result = await addToWishlist('u1', 'p1');

      expect(result.productId).toBe('p1');
      expect(prisma.wishlist.upsert).toHaveBeenCalled();
    });

    it('throws PRODUCT_NOT_FOUND when product does not exist', async () => {
      mockFn(prisma.product.findFirst).mockResolvedValue(null);

      await expect(addToWishlist('u1', 'nonexistent')).rejects.toMatchObject({
        code: 'PRODUCT_NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('removeFromWishlist', () => {
    it('removes item from wishlist', async () => {
      mockFn(prisma.wishlist.findUnique).mockResolvedValue({
        userId: 'u1',
        productId: 'p1',
      });
      mockFn(prisma.wishlist.delete).mockResolvedValue({});

      await removeFromWishlist('u1', 'p1');

      expect(prisma.wishlist.delete).toHaveBeenCalledWith({
        where: { userId_productId: { userId: 'u1', productId: 'p1' } },
      });
    });

    it('throws ITEM_NOT_FOUND when item is not in wishlist', async () => {
      mockFn(prisma.wishlist.findUnique).mockResolvedValue(null);

      await expect(removeFromWishlist('u1', 'p1')).rejects.toMatchObject({
        code: 'ITEM_NOT_FOUND',
        statusCode: 404,
      });
    });
  });
});
