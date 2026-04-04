import type { Request, Response, NextFunction } from 'express';
import { managerRestrictions } from '@middleware/managerRestrictions.js';
import { AppError } from '@utils/AppError.js';

describe('managerRestrictions middleware', () => {
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

    managerRestrictions(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('blocks MANAGER role with FORBIDDEN error', () => {
    mockReq.user = { userId: 'u1', email: 'manager@planq.com', role: 'MANAGER' };

    managerRestrictions(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    const error = mockNext.mock.calls[0][0] as unknown as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe('FORBIDDEN');
    expect(error.statusCode).toBe(403);
    expect(error.message).toContain('not available for managers');
  });

  it('allows USER role through (should be caught by adminAuth before this)', () => {
    mockReq.user = { userId: 'u1', email: 'user@example.com', role: 'USER' };

    managerRestrictions(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('allows when user has no role set (not MANAGER)', () => {
    mockReq.user = { userId: 'u1', email: 'user@example.com' };

    managerRestrictions(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('allows when req.user is undefined (should be caught by auth before this)', () => {
    mockReq.user = undefined;

    managerRestrictions(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('does not modify the request object', () => {
    mockReq.user = { userId: 'u1', email: 'admin@planq.com', role: 'ADMIN' };
    const userBefore = { ...mockReq.user };

    managerRestrictions(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.user).toEqual(userBefore);
  });

  it('does not modify the response object', () => {
    mockReq.user = { userId: 'u1', email: 'manager@planq.com', role: 'MANAGER' };
    const resBefore = { ...mockRes };

    managerRestrictions(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes).toEqual(resBefore);
  });
});
