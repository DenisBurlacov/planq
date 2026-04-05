// Mock prisma before importing service
jest.mock('@utils/prisma.js', () => ({
  __esModule: true,
  default: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    emailVerificationToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('@utils/password.js', () => ({
  __esModule: true,
  hashPassword: jest.fn(() => Promise.resolve('hashed_password')),
  comparePassword: jest.fn(),
}));

import { register, login, logout, refresh } from '@services/auth.service.js';
import { AppError } from '@utils/AppError.js';
import prisma from '@utils/prisma.js';
import * as passwordUtils from '@utils/password.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFn = (fn: unknown) => fn as jest.MockedFunction<(...args: any[]) => any>;

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('creates a new user when email is not taken', async () => {
      mockFn(prisma.user.findFirst).mockResolvedValue(null);
      mockFn(prisma.user.create).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        avatar: null,
        walletBalance: 0,
      });

      const result = await register({
        email: 'test@example.com',
        password: 'Password1!',
        name: 'Test',
      });

      expect(result).toHaveProperty('id');
      expect(result.email).toBe('test@example.com');
    });

    it('throws EMAIL_TAKEN when email already exists', async () => {
      mockFn(prisma.user.findFirst).mockResolvedValue({ id: 'existing' });

      await expect(
        register({ email: 'taken@example.com', password: 'Password1!', name: 'Test' })
      ).rejects.toThrow(AppError);

      mockFn(prisma.user.findFirst).mockResolvedValue({ id: 'existing' });

      await expect(
        register({ email: 'taken@example.com', password: 'Password1!', name: 'Test' })
      ).rejects.toMatchObject({ code: 'EMAIL_TAKEN', statusCode: 409 });
    });
  });

  describe('login', () => {
    const mockUser = {
      id: 'user-1',
      email: 'user@example.com',
      password: 'hashed',
      name: 'User',
      avatar: null,
      walletBalance: 0,
      isBlocked: false,
    };

    it('returns tokens on valid credentials', async () => {
      mockFn(prisma.user.findFirst).mockResolvedValue(mockUser);
      mockFn(passwordUtils.comparePassword).mockResolvedValue(true);
      mockFn(prisma.refreshToken.create).mockResolvedValue({});

      const result = await login({ email: 'user@example.com', password: 'Password1!' });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('user@example.com');
    });

    it('throws INVALID_CREDENTIALS when user not found', async () => {
      mockFn(prisma.user.findFirst).mockResolvedValue(null);

      await expect(
        login({ email: 'no@example.com', password: 'Password1!' })
      ).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
        statusCode: 401,
      });
    });

    it('throws INVALID_CREDENTIALS when password is wrong', async () => {
      mockFn(prisma.user.findFirst).mockResolvedValue(mockUser);
      mockFn(passwordUtils.comparePassword).mockResolvedValue(false);

      await expect(login({ email: 'user@example.com', password: 'wrong' })).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
        statusCode: 401,
      });
    });

    it('throws ACCOUNT_BLOCKED for blocked user', async () => {
      mockFn(prisma.user.findFirst).mockResolvedValue({ ...mockUser, isBlocked: true });

      await expect(
        login({ email: 'user@example.com', password: 'Password1!' })
      ).rejects.toMatchObject({ code: 'ACCOUNT_BLOCKED', statusCode: 403 });
    });
  });

  describe('logout', () => {
    it('deletes refresh token', async () => {
      mockFn(prisma.refreshToken.deleteMany).mockResolvedValue({ count: 1 });

      await logout('some-token');

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: 'some-token' },
      });
    });
  });

  describe('refresh', () => {
    it('throws INVALID_TOKEN when token not in DB', async () => {
      mockFn(prisma.refreshToken.findUnique).mockResolvedValue(null);

      await expect(refresh('bad-token')).rejects.toMatchObject({
        code: 'INVALID_TOKEN',
        statusCode: 401,
      });
    });

    it('throws INVALID_TOKEN when token is expired', async () => {
      mockFn(prisma.refreshToken.findUnique).mockResolvedValue({
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(refresh('expired-token')).rejects.toMatchObject({
        code: 'INVALID_TOKEN',
        statusCode: 401,
      });
    });
  });
});
