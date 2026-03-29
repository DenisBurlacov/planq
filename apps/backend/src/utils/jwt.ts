import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? '';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? '';
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface AccessTokenPayload {
  userId: string;
  email: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN } as jwt.SignOptions);
}

export function signRefreshToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): AccessTokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as AccessTokenPayload;
}
