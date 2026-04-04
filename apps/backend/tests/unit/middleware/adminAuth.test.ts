import type { Request, Response, NextFunction } from 'express';
import { adminAuth } from '@middleware/adminAuth.js';
import { AppError } from '@utils/AppError.js';

describe('adminAuth middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockReq = {};
    mockRes = {};
    mockNext = jest.fn();
  });

  it('calls next() when user has ADMIN role', () => {
    mockReq.user = { userId: 'u1', email: 'admin@planq.com', role: 'ADMIN' };

    adminAuth(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('calls next with FORBIDDEN error when user has USER role', () => {
    mockReq.user = { userId: 'u1', email: 'alice@example.com', role: 'USER' };

    adminAuth(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    const error = mockNext.mock.calls[0][0] as unknown as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe('FORBIDDEN');
    expect(error.statusCode).toBe(403);
  });

  it('calls next with FORBIDDEN error when user has no role', () => {
    mockReq.user = { userId: 'u1', email: 'user@example.com' };

    adminAuth(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    const error = mockNext.mock.calls[0][0] as unknown as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe('FORBIDDEN');
    expect(error.statusCode).toBe(403);
  });

  it('calls next with UNAUTHORIZED error when req.user is undefined', () => {
    mockReq.user = undefined;

    adminAuth(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    const error = mockNext.mock.calls[0][0] as unknown as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.statusCode).toBe(401);
  });

  it('does not modify req or res', () => {
    mockReq.user = { userId: 'u1', email: 'admin@planq.com', role: 'ADMIN' };

    const reqBefore = { ...mockReq };
    adminAuth(mockReq as Request, mockRes as Response, mockNext);

    // user should remain unchanged
    expect(mockReq.user).toEqual(reqBefore.user);
  });
});
