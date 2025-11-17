/**
 * JWT Token Management
 * Handles token generation, verification, and refresh
 */

import jwt from 'jsonwebtoken';
import type { JWTPayload, UserSession } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const TOKEN_EXPIRY = '7d'; // 7 days default
const REMEMBER_ME_EXPIRY = '30d'; // 30 days for remember me

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('⚠️  WARNING: JWT_SECRET not set in production!');
}

/**
 * Generate a new JWT token for a user
 */
export function generateToken(
  userId: string,
  email: string,
  role: 'admin' | 'editor' | 'viewer',
  rememberMe: boolean = false
): string {
  const payload: JWTPayload = {
    userId,
    email,
    role,
  };

  const options: jwt.SignOptions = {
    expiresIn: rememberMe ? REMEMBER_ME_EXPIRY : TOKEN_EXPIRY,
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log('Token expired:', error.message);
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('Invalid token:', error.message);
    } else {
      console.error('Token verification error:', error);
    }
    return null;
  }
}

/**
 * Refresh a token if it's close to expiring
 * Returns new token if refreshed, null if still valid, or false if invalid
 */
export function refreshToken(token: string): string | null | false {
  const decoded = verifyToken(token);

  if (!decoded) {
    return false; // Invalid token
  }

  // Check if token expires in less than 1 day
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = (decoded.exp || 0) - now;
  const oneDayInSeconds = 24 * 60 * 60;

  if (expiresIn < oneDayInSeconds && expiresIn > 0) {
    // Token expires soon, generate new one
    return generateToken(decoded.userId, decoded.email, decoded.role, false);
  }

  return null; // Token still valid, no need to refresh
}

/**
 * Extract user session from token
 */
export function getUserFromToken(token: string): UserSession | null {
  const decoded = verifyToken(token);

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
export function isTokenValid(token: string): boolean {
  const decoded = verifyToken(token);
  return decoded !== null;
}

/**
 * Get token expiration time
 */
export function getTokenExpiry(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch {
    return null;
  }
}
