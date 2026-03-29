jest.mock('@utils/prisma.js', () => ({
  __esModule: true,
  default: {
    promoCode: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

import { validatePromoCode } from '@services/promo.service.js';
import prisma from '@utils/prisma.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFn = (fn: unknown) => fn as jest.MockedFunction<(...args: any[]) => any>;

describe('promo.service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('validatePromoCode', () => {
    const validPromo = {
      code: 'WELCOME10',
      isActive: true,
      discountPercent: 10,
      validFrom: new Date(Date.now() - 1000),
      validUntil: new Date(Date.now() + 86400000),
      maxUses: 100,
      currentUses: 5,
      minOrderAmount: null,
    };

    it('returns discount info for valid code', async () => {
      mockFn(prisma.promoCode.findUnique).mockResolvedValue(validPromo);

      const result = await validatePromoCode('WELCOME10', 100);

      expect(result.code).toBe('WELCOME10');
      expect(result.discountPercent).toBe(10);
      expect(result.discountAmount).toBe(10);
      expect(result.finalAmount).toBe(90);
    });

    it('throws INVALID_PROMO_CODE when not found', async () => {
      mockFn(prisma.promoCode.findUnique).mockResolvedValue(null);

      await expect(validatePromoCode('FAKE')).rejects.toMatchObject({
        code: 'INVALID_PROMO_CODE',
        statusCode: 404,
      });
    });

    it('throws PROMO_CODE_EXPIRED for expired code', async () => {
      mockFn(prisma.promoCode.findUnique).mockResolvedValue({
        ...validPromo,
        validUntil: new Date(Date.now() - 1000),
      });

      await expect(validatePromoCode('EXPIRED20')).rejects.toMatchObject({
        code: 'PROMO_CODE_EXPIRED',
        statusCode: 400,
      });
    });

    it('throws PROMO_MIN_ORDER when order total is below minimum', async () => {
      mockFn(prisma.promoCode.findUnique).mockResolvedValue({
        ...validPromo,
        minOrderAmount: 500,
      });

      await expect(validatePromoCode('BIG30', 100)).rejects.toMatchObject({
        code: 'PROMO_MIN_ORDER',
        statusCode: 400,
      });
    });

    it('throws PROMO_CODE_EXHAUSTED when max uses reached', async () => {
      mockFn(prisma.promoCode.findUnique).mockResolvedValue({
        ...validPromo,
        maxUses: 5,
        currentUses: 5,
      });

      await expect(validatePromoCode('MAXED')).rejects.toMatchObject({
        code: 'PROMO_CODE_EXHAUSTED',
        statusCode: 400,
      });
    });
  });
});
