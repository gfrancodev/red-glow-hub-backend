import jwt from 'jsonwebtoken';
import { secrets } from '@/shared/config/secrets';

export interface JWTPayload {
  user_id: string;
  role: string;
  session_id: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export function signAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, secrets.jwt.access, {
    expiresIn: '15m',
    issuer: 'player-api',
    audience: 'player-client',
  });
}

export function signRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, secrets.jwt.refresh, {
    expiresIn: '7d',
    issuer: 'player-api',
    audience: 'player-client',
  });
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, secrets.jwt.access, {
    issuer: 'player-api',
    audience: 'player-client',
  }) as JWTPayload;
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, secrets.jwt.refresh, {
    issuer: 'player-api',
    audience: 'player-client',
  }) as JWTPayload;
}

export function createTokenPair(payload: Omit<JWTPayload, 'iat' | 'exp'>): TokenPair {
  return {
    access_token: signAccessToken(payload),
    refresh_token: signRefreshToken(payload),
    expires_in: 15 * 60, // 15 minutes in seconds
  };
}
