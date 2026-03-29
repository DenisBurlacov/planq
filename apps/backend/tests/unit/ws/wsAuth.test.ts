jest.mock('@utils/jwt.js', () => ({
  __esModule: true,
  verifyAccessToken: jest.fn(),
}));

jest.mock('@utils/logger.js', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { wsAuth } from '@ws/wsAuth.js';
import * as jwtUtils from '@utils/jwt.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFn = (fn: unknown) => fn as jest.MockedFunction<(...args: any[]) => any>;

describe('wsAuth', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns null for empty token', () => {
    expect(wsAuth('')).toBeNull();
  });

  it('returns userId for valid token', () => {
    mockFn(jwtUtils.verifyAccessToken).mockReturnValue({
      userId: 'user-1',
      email: 'user@example.com',
    });

    expect(wsAuth('valid.token.here')).toBe('user-1');
  });

  it('returns null when token verification throws', () => {
    mockFn(jwtUtils.verifyAccessToken).mockImplementation(() => {
      throw new Error('invalid signature');
    });

    expect(wsAuth('bad.token')).toBeNull();
  });

  it('returns null for expired token', () => {
    mockFn(jwtUtils.verifyAccessToken).mockImplementation(() => {
      throw new Error('jwt expired');
    });

    expect(wsAuth('expired.token')).toBeNull();
  });
});
