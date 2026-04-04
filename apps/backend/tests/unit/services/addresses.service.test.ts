jest.mock('@utils/prisma.js', () => ({
  __esModule: true,
  default: {
    address: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

import {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefault,
} from '@services/addresses.service.js';
import prisma from '@utils/prisma.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFn = (fn: unknown) => fn as jest.MockedFunction<(...args: any[]) => any>;

describe('addresses.service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('listAddresses', () => {
    it('returns all addresses for a user ordered by default first', async () => {
      const addresses = [
        { id: 'a1', userId: 'u1', name: 'Home', isDefault: true },
        { id: 'a2', userId: 'u1', name: 'Work', isDefault: false },
      ];
      mockFn(prisma.address.findMany).mockResolvedValue(addresses);

      const result = await listAddresses('u1');

      expect(result).toEqual(addresses);
      expect(prisma.address.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });
    });

    it('returns empty array when user has no addresses', async () => {
      mockFn(prisma.address.findMany).mockResolvedValue([]);

      const result = await listAddresses('u1');

      expect(result).toEqual([]);
    });
  });

  describe('createAddress', () => {
    const input = {
      name: 'Home',
      street: '123 Main St',
      city: 'Stockholm',
      zip: '11122',
      country: 'Sweden',
      isDefault: false,
    };

    it('creates an address and makes it default if it is the first one', async () => {
      mockFn(prisma.address.count).mockResolvedValue(0);
      mockFn(prisma.address.create).mockResolvedValue({ id: 'a1', ...input, isDefault: true });

      const result = await createAddress('u1', input);

      expect(result.isDefault).toBe(true);
      expect(prisma.address.create).toHaveBeenCalledWith({
        data: { ...input, isDefault: true, userId: 'u1' },
      });
    });

    it('does not set isDefault when user already has addresses and isDefault is false', async () => {
      mockFn(prisma.address.count).mockResolvedValue(2);
      mockFn(prisma.address.create).mockResolvedValue({ id: 'a2', ...input, isDefault: false });

      const result = await createAddress('u1', input);

      expect(result.isDefault).toBe(false);
    });

    it('clears existing defaults when new address is marked as default', async () => {
      const defaultInput = { ...input, isDefault: true };
      mockFn(prisma.address.updateMany).mockResolvedValue({ count: 1 });
      mockFn(prisma.address.count).mockResolvedValue(2);
      mockFn(prisma.address.create).mockResolvedValue({ id: 'a3', ...defaultInput, userId: 'u1' });

      await createAddress('u1', defaultInput);

      expect(prisma.address.updateMany).toHaveBeenCalledWith({
        where: { userId: 'u1', isDefault: true },
        data: { isDefault: false },
      });
    });
  });

  describe('updateAddress', () => {
    it('updates an existing address', async () => {
      mockFn(prisma.address.findFirst).mockResolvedValue({ id: 'a1', userId: 'u1' });
      mockFn(prisma.address.update).mockResolvedValue({ id: 'a1', name: 'New Name' });

      const result = await updateAddress('u1', 'a1', { name: 'New Name' });

      expect(result.name).toBe('New Name');
      expect(prisma.address.update).toHaveBeenCalledWith({
        where: { id: 'a1' },
        data: { name: 'New Name' },
      });
    });

    it('throws ADDRESS_NOT_FOUND when address does not belong to user', async () => {
      mockFn(prisma.address.findFirst).mockResolvedValue(null);

      await expect(updateAddress('u1', 'nonexistent', { name: 'X' })).rejects.toMatchObject({
        code: 'ADDRESS_NOT_FOUND',
        statusCode: 404,
      });
    });

    it('clears other defaults when setting address as default', async () => {
      mockFn(prisma.address.findFirst).mockResolvedValue({ id: 'a1', userId: 'u1' });
      mockFn(prisma.address.updateMany).mockResolvedValue({ count: 1 });
      mockFn(prisma.address.update).mockResolvedValue({ id: 'a1', isDefault: true });

      await updateAddress('u1', 'a1', { isDefault: true });

      expect(prisma.address.updateMany).toHaveBeenCalledWith({
        where: { userId: 'u1', isDefault: true },
        data: { isDefault: false },
      });
    });
  });

  describe('deleteAddress', () => {
    it('deletes an address', async () => {
      mockFn(prisma.address.findFirst).mockResolvedValueOnce({
        id: 'a1',
        userId: 'u1',
        isDefault: false,
      });
      mockFn(prisma.address.delete).mockResolvedValue({});

      await deleteAddress('u1', 'a1');

      expect(prisma.address.delete).toHaveBeenCalledWith({ where: { id: 'a1' } });
    });

    it('throws ADDRESS_NOT_FOUND when address does not exist', async () => {
      mockFn(prisma.address.findFirst).mockResolvedValue(null);

      await expect(deleteAddress('u1', 'nonexistent')).rejects.toMatchObject({
        code: 'ADDRESS_NOT_FOUND',
        statusCode: 404,
      });
    });

    it('promotes next address to default when deleting the default', async () => {
      mockFn(prisma.address.findFirst)
        .mockResolvedValueOnce({ id: 'a1', userId: 'u1', isDefault: true })
        .mockResolvedValueOnce({ id: 'a2', userId: 'u1', isDefault: false });
      mockFn(prisma.address.delete).mockResolvedValue({});
      mockFn(prisma.address.update).mockResolvedValue({});

      await deleteAddress('u1', 'a1');

      expect(prisma.address.update).toHaveBeenCalledWith({
        where: { id: 'a2' },
        data: { isDefault: true },
      });
    });

    it('does not promote when deleting the last address', async () => {
      mockFn(prisma.address.findFirst)
        .mockResolvedValueOnce({ id: 'a1', userId: 'u1', isDefault: true })
        .mockResolvedValueOnce(null);
      mockFn(prisma.address.delete).mockResolvedValue({});

      await deleteAddress('u1', 'a1');

      expect(prisma.address.update).not.toHaveBeenCalled();
    });
  });

  describe('setDefault', () => {
    it('sets the address as default and clears other defaults', async () => {
      mockFn(prisma.address.findFirst).mockResolvedValue({ id: 'a2', userId: 'u1' });
      mockFn(prisma.address.updateMany).mockResolvedValue({ count: 1 });
      mockFn(prisma.address.update).mockResolvedValue({ id: 'a2', isDefault: true });

      const result = await setDefault('u1', 'a2');

      expect(prisma.address.updateMany).toHaveBeenCalledWith({
        where: { userId: 'u1', isDefault: true },
        data: { isDefault: false },
      });
      expect(prisma.address.update).toHaveBeenCalledWith({
        where: { id: 'a2' },
        data: { isDefault: true },
      });
      expect(result.isDefault).toBe(true);
    });

    it('throws ADDRESS_NOT_FOUND when address does not exist', async () => {
      mockFn(prisma.address.findFirst).mockResolvedValue(null);

      await expect(setDefault('u1', 'nonexistent')).rejects.toMatchObject({
        code: 'ADDRESS_NOT_FOUND',
        statusCode: 404,
      });
    });
  });
});
