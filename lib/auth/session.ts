/**
 * Session Management
 * Handles refresh tokens and session persistence
 * NOTE: File-based storage is deprecated - use database sessions instead
 */

import { SignJWT, jwtVerify } from 'jose';
import type { UserRole } from './types';

// Edge Runtime compatible - using database sessions instead of file-based
// File operations are deprecated and disabled for Edge Runtime compatibility
const SESSIONS_FILE = 'deprecated';
const BLACKLIST_FILE = 'deprecated';

/**
 * SECURITY FIX: Remove hardcoded fallback secret
 * Fail-fast in production if REFRESH_TOKEN_SECRET is not set
 */
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!REFRESH_TOKEN_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CRITICAL: REFRESH_TOKEN_SECRET environment variable must be set in production. Generate a secure secret using: openssl rand -base64 48');
  }
  // In development, generate a temporary secure random secret
  const crypto = require('crypto');
  const tempSecret = crypto.randomBytes(64).toString('hex');
  console.warn('⚠️  SECURITY WARNING: Using auto-generated REFRESH_TOKEN_SECRET for development only');
  console.warn('⚠️  DO NOT USE THIS IN PRODUCTION. Set REFRESH_TOKEN_SECRET environment variable.');
  // Use temporary secret (this is OK for development only)
  var TEMP_REFRESH_SECRET = tempSecret;
}

// Validate secret length (minimum 32 characters for security)
if (REFRESH_TOKEN_SECRET && REFRESH_TOKEN_SECRET.length < 32) {
  throw new Error('CRITICAL: REFRESH_TOKEN_SECRET must be at least 32 characters long. Generate a secure secret using: openssl rand -base64 48');
}

const REFRESH_SECRET = new TextEncoder().encode(
  REFRESH_TOKEN_SECRET || (typeof TEMP_REFRESH_SECRET !== 'undefined' ? TEMP_REFRESH_SECRET : '')
);

export interface Session {
  id: string; // Session ID for database compatibility
  userId: string;
  sessionId: string;
  refreshToken: string;
  createdAt: Date;
  expiresAt: Date;
  userRole?: UserRole;
}

interface BlacklistedToken {
  token: string;
  blacklistedAt: Date;
  expiresAt: Date;
}

/**
 * Load sessions from database
 * NOTE: File-based sessions are deprecated - use database sessions table instead
 * This is a stub for backward compatibility
 */
async function loadSessions(): Promise<Session[]> {
  // Deprecated: Sessions are now stored in PostgreSQL sessions table
  return [];
}

/**
 * Save sessions to database
 * NOTE: File-based sessions are deprecated - use database sessions table instead
 * This is a stub for backward compatibility
 */
async function saveSessions(sessions: Session[]): Promise<void> {
  // Deprecated: Sessions are now stored in PostgreSQL sessions table
  // No-op for Edge Runtime compatibility
  return;
}

/**
 * Load token blacklist from database
 * NOTE: File-based storage is deprecated - use database refresh_tokens table instead
 * This is a stub for backward compatibility
 */
async function loadBlacklist(): Promise<BlacklistedToken[]> {
  // Deprecated: Token revocation is now handled by PostgreSQL refresh_tokens table
  return [];
}

/**
 * Save blacklist to database
 * NOTE: File-based storage is deprecated - use database refresh_tokens table instead
 * This is a stub for backward compatibility
 */
async function saveBlacklist(blacklist: BlacklistedToken[]): Promise<void> {
  // Deprecated: Token revocation is now handled by PostgreSQL refresh_tokens table
  // No-op for Edge Runtime compatibility
  return;
}

/**
 * Generate refresh token
 */
export async function generateRefreshToken(userId: string, role: UserRole): Promise<string> {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(REFRESH_SECRET);

  return token;
}

/**
 * Verify and decode refresh token
 */
export async function verifyRefreshToken(token: string): Promise<{ userId: string; role: UserRole } | null> {
  try {
    // Check if token is blacklisted
    const blacklist = await loadBlacklist();
    if (blacklist.some(item => item.token === token)) {
      return null;
    }

    const { payload } = await jwtVerify(token, REFRESH_SECRET);

    if (!payload.userId || !payload.role) {
      return null;
    }

    return {
      userId: payload.userId as string,
      role: payload.role as UserRole,
    };
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

/**
 * Store refresh token session
 */
export async function storeSession(
  userId: string,
  refreshToken: string,
  role: UserRole
): Promise<void> {
  const sessions = await loadSessions();
  const sessionId = crypto.randomUUID();

  const newSession: Session = {
    userId,
    sessionId,
    refreshToken,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    userRole: role,
  };

  sessions.push(newSession);
  await saveSessions(sessions);
}

/**
 * Revoke refresh token
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  const blacklist = await loadBlacklist();

  blacklist.push({
    token,
    blacklistedAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Match token expiry
  });

  await saveBlacklist(blacklist);
}

/**
 * Clean up expired sessions and blacklisted tokens
 */
export async function cleanupExpired(): Promise<void> {
  const now = new Date();

  // Clean sessions
  const sessions = await loadSessions();
  const activeSessions = sessions.filter(session => session.expiresAt > now);
  await saveSessions(activeSessions);

  // Clean blacklist
  const blacklist = await loadBlacklist();
  const activeBlacklist = blacklist.filter(item => item.expiresAt > now);
  await saveBlacklist(activeBlacklist);
}

/**
 * Get user sessions
 */
export async function getUserSessions(userId: string): Promise<Session[]> {
  const sessions = await loadSessions();
  return sessions.filter(session => session.userId === userId && session.expiresAt > new Date());
}

/**
 * Revoke all user sessions
 */
export async function revokeAllUserSessions(userId: string): Promise<void> {
  const sessions = await loadSessions();
  const userSessions = sessions.filter(session => session.userId === userId);

  // Blacklist all user's refresh tokens
  const blacklist = await loadBlacklist();
  for (const session of userSessions) {
    blacklist.push({
      token: session.refreshToken,
      blacklistedAt: new Date(),
      expiresAt: session.expiresAt,
    });
  }

  await saveBlacklist(blacklist);

  // Remove user sessions
  const remainingSessions = sessions.filter(session => session.userId !== userId);
  await saveSessions(remainingSessions);
}

/**
 * Create new session (database stub)
 */
export async function createSession(
  userId: string,
  email: string,
  role: UserRole,
  userAgent?: string,
  ipAddress?: string
): Promise<{ refreshToken: string; sessionId: string }> {
  const refreshToken = await generateRefreshToken(userId, role);
  await storeSession(userId, refreshToken, role);
  return {
    refreshToken,
    sessionId: crypto.randomUUID(),
  };
}

/**
 * Get session by refresh token (database stub)
 */
export async function getSessionByRefreshToken(token: string): Promise<Session | null> {
  const sessions = await loadSessions();
  return sessions.find(s => s.refreshToken === token) || null;
}

/**
 * Revoke session (database stub)
 */
export async function revokeSession(sessionId: string): Promise<void> {
  // Deprecated: Use database sessions table
  return;
}

/**
 * Blacklist token (database stub)
 */
export async function blacklistToken(token: string, expiresAt?: string): Promise<void> {
  await revokeRefreshToken(token);
}

/**
 * Check if token is blacklisted (database stub)
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  const blacklist = await loadBlacklist();
  return blacklist.some(item => item.token === token);
}

/**
 * Generate password reset token (database stub)
 */
export async function generatePasswordResetToken(email: string): Promise<string> {
  // Generate a password reset token (simplified for Edge Runtime)
  const token = await new SignJWT({ email, type: 'password-reset' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .setIssuedAt()
    .sign(REFRESH_SECRET);
  return token;
}

/**
 * Verify password reset token (database stub)
 */
export async function verifyPasswordResetToken(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    if (payload.type !== 'password-reset' || !payload.email) {
      return null;
    }
    return { email: payload.email as string };
  } catch (error) {
    return null;
  }
}
