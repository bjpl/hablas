/**
 * JWT Token Management with Edge Runtime Support
 * Uses jose library for Edge-compatible JWT operations
 */

import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload as JoseJWTPayload } from 'jose';
import type { JWTPayload, UserSession } from './types';
import { SECURITY_CONFIG } from '@/lib/config/security';

// Get JWT secret with validation
const JWT_SECRET = SECURITY_CONFIG.JWT.getSecret();
const TOKEN_EXPIRY = SECURITY_CONFIG.JWT.TOKEN_EXPIRY;
const REMEMBER_ME_EXPIRY = SECURITY_CONFIG.JWT.REMEMBER_ME_EXPIRY;
const REFRESH_THRESHOLD = SECURITY_CONFIG.JWT.REFRESH_THRESHOLD_SECONDS;

// Convert secret string to Uint8Array for jose
const secretKey = new TextEncoder().encode(JWT_SECRET);

/**
 * Convert expiry string to seconds
 */
function getExpirySeconds(expiry: string): number {
  const match = expiry.match(/^(\d+)([dhms])$/);
  if (!match) return 7 * 24 * 60 * 60; // Default 7 days

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'd': return value * 24 * 60 * 60;
    case 'h': return value * 60 * 60;
    case 'm': return value * 60;
    case 's': return value;
    default: return 7 * 24 * 60 * 60;
  }
}

/**
 * Generate a new JWT token for a user
 */
export async function generateToken(
  userId: string,
  email: string,
  role: 'admin' | 'editor' | 'viewer',
  rememberMe: boolean = false
): Promise<string> {
  const expiry = rememberMe ? REMEMBER_ME_EXPIRY : TOKEN_EXPIRY;
  const expirySeconds = getExpirySeconds(expiry);

  const token = await new SignJWT({
    userId,
    email,
    role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expirySeconds)
    .sign(secretKey);

  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as 'admin' | 'editor' | 'viewer',
      exp: payload.exp,
      iat: payload.iat,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        console.log('Token expired:', error.message);
      } else {
        console.error('Token verification error:', error.message);
      }
    }
    return null;
  }
}

/**
 * Refresh a token if it's close to expiring
 * Returns new token if refreshed, null if still valid, or false if invalid
 */
export async function refreshToken(token: string): Promise<string | null | false> {
  const decoded = await verifyToken(token);

  if (!decoded) {
    return false; // Invalid token
  }

  // Check if token expires within the refresh threshold
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = (decoded.exp || 0) - now;

  if (expiresIn < REFRESH_THRESHOLD && expiresIn > 0) {
    // Token expires soon, generate new one
    return await generateToken(decoded.userId, decoded.email, decoded.role, false);
  }

  return null; // Token still valid, no need to refresh
}

/**
 * Extract user session from token
 */
export async function getUserFromToken(token: string): Promise<UserSession | null> {
  const decoded = await verifyToken(token);

  if (!decoded) {
    return null;
  }

  return {
    id: decoded.userId,
    email: decoded.email,
    role: decoded.role,
    name: decoded.email.split('@')[0], // Default to email username
  };
}

/**
 * Check if token is valid (not expired)
 */
export async function isTokenValid(token: string): Promise<boolean> {
  const decoded = await verifyToken(token);
  return decoded !== null;
}

/**
 * Get token expiration time
 */
export async function getTokenExpiry(token: string): Promise<Date | null> {
  try {
    const decoded = await verifyToken(token);
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch {
    return null;
  }
}
