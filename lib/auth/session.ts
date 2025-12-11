/**
 * Session Management
 * Handles refresh tokens and session persistence
 * Uses PostgreSQL-backed sessions via lib/db/sessions.ts
 * Edge Runtime compatible using jose library
 */

import { SignJWT, jwtVerify } from 'jose';
import type { UserRole } from './types';
import { authLogger as logger } from '@/lib/utils/logger';

/**
 * SECURITY FIX: Remove hardcoded fallback secret
 * Fail-fast in production if REFRESH_TOKEN_SECRET is not set
 */
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Track if we're using a temp secret for development
let TEMP_REFRESH_SECRET: string | undefined;

if (!REFRESH_TOKEN_SECRET) {
  // During build/static generation, use placeholder (API routes are dynamic)
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    TEMP_REFRESH_SECRET = 'build-time-placeholder-not-used-at-runtime';
  } else if (process.env.NODE_ENV === 'production') {
    throw new Error('CRITICAL: REFRESH_TOKEN_SECRET environment variable must be set in production. Generate a secure secret using: openssl rand -base64 48');
  } else {
    // In development, generate a temporary secure random secret
    // Use dynamic import for crypto to avoid ESLint no-require-imports error
    // This code only runs in development/build-time
    TEMP_REFRESH_SECRET = Array.from(
      { length: 64 },
      () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
    logger.warn('Using auto-generated REFRESH_TOKEN_SECRET for development only');
  }
}

// Validate secret length (minimum 32 characters for security)
if (REFRESH_TOKEN_SECRET && REFRESH_TOKEN_SECRET.length < 32) {
  throw new Error('CRITICAL: REFRESH_TOKEN_SECRET must be at least 32 characters long. Generate a secure secret using: openssl rand -base64 48');
}

const REFRESH_SECRET = new TextEncoder().encode(
  REFRESH_TOKEN_SECRET || TEMP_REFRESH_SECRET || ''
);

export interface Session {
  id: string; // Session ID for database compatibility
  userId: string;
  refreshToken: string;
  createdAt: Date;
  expiresAt: Date;
  userRole?: UserRole;
  email?: string; // User email for token refresh
  userAgent?: string; // User agent string
  ipAddress?: string; // IP address for security
}

interface BlacklistedToken {
  token: string;
  blacklistedAt: Date;
  expiresAt: Date;
}

// Import database session functions
// NOTE: These are lazy-loaded to avoid Edge Runtime issues in middleware
// The middleware uses jose for JWT verification; database calls happen in API routes

// Declare EdgeRuntime global for TypeScript
declare const EdgeRuntime: string | undefined;

/**
 * Check if we're in Edge Runtime (middleware context)
 * Edge Runtime cannot use Node.js modules like pg
 */
function isEdgeRuntime(): boolean {
  return typeof EdgeRuntime !== 'undefined' || process.env.NEXT_RUNTIME === 'edge';
}

/**
 * Get database session module (lazy load to avoid Edge Runtime issues)
 */
async function getDBSessions() {
  if (isEdgeRuntime()) {
    logger.debug('Edge Runtime detected - database operations not available');
    return null;
  }
  try {
    return await import('@/lib/db/sessions');
  } catch (error) {
    logger.warn('Failed to load database sessions module', { error: error instanceof Error ? error.message : 'Unknown' });
    return null;
  }
}

/**
 * Generate refresh token
 */
export async function generateRefreshToken(userId: string, email: string, role: UserRole): Promise<string> {
  const token = await new SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(REFRESH_SECRET);

  return token;
}

/**
 * Verify and decode refresh token
 */
export async function verifyRefreshToken(token: string): Promise<{ userId: string; email: string; role: UserRole } | null> {
  try {
    // Check if token is blacklisted using database
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      logger.debug('Refresh token is blacklisted');
      return null;
    }

    const { payload } = await jwtVerify(token, REFRESH_SECRET);

    if (!payload.userId || !payload.email || !payload.role) {
      return null;
    }

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as UserRole,
    };
  } catch (error) {
    logger.debug('Refresh token verification failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return null;
  }
}

/**
 * Store refresh token session
 */
export async function storeSession(
  userId: string,
  email: string,
  refreshToken: string,
  role: UserRole,
  userAgent?: string,
  ipAddress?: string
): Promise<void> {
  const dbSessions = await getDBSessions();

  if (dbSessions) {
    // Use PostgreSQL-backed sessions
    const sessionToken = crypto.randomUUID();
    const accessToken = ''; // Access token stored separately
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await dbSessions.createDBSession(
      userId,
      sessionToken,
      accessToken,
      refreshToken,
      expiresAt,
      { userAgent, ipAddress }
    );

    logger.debug('Session stored in database', { userId });
  } else {
    // Edge Runtime fallback - session stored in JWT only
    logger.debug('Session storage skipped (Edge Runtime)', { userId });
  }
}

/**
 * Revoke refresh token
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  const dbSessions = await getDBSessions();

  if (dbSessions) {
    // Find and revoke the session by refresh token
    const session = await dbSessions.getSessionByRefreshToken(token);
    if (session) {
      await dbSessions.revokeDBSession(session.id);
      logger.debug('Session revoked via refresh token');
    }
  } else {
    logger.debug('Token revocation skipped (Edge Runtime)');
  }
}

/**
 * Clean up expired sessions and blacklisted tokens
 */
export async function cleanupExpired(): Promise<void> {
  const dbSessions = await getDBSessions();

  if (dbSessions) {
    const count = await dbSessions.cleanupExpiredSessions();
    logger.info('Cleaned up expired sessions', { count });
  } else {
    logger.debug('Session cleanup skipped (Edge Runtime)');
  }
}

/**
 * Get user sessions
 */
export async function getUserSessions(userId: string): Promise<Session[]> {
  const dbSessions = await getDBSessions();

  if (dbSessions) {
    const dbResults = await dbSessions.getUserActiveSessions(userId);
    // Map DB sessions to Session interface
    return dbResults.map(s => ({
      id: s.id,
      userId: s.user_id,
      refreshToken: '', // Not exposed for security
      createdAt: s.created_at,
      expiresAt: s.expires_at,
      userAgent: s.user_agent || undefined,
      ipAddress: s.ip_address || undefined,
    }));
  }

  return [];
}

/**
 * Revoke all user sessions
 */
export async function revokeAllUserSessions(userId: string): Promise<void> {
  const dbSessions = await getDBSessions();

  if (dbSessions) {
    const count = await dbSessions.revokeAllUserSessions(userId);
    logger.info('Revoked all user sessions', { userId, count });
  } else {
    logger.debug('Session revocation skipped (Edge Runtime)', { userId });
  }
}

/**
 * Create new session
 */
export async function createSession(
  userId: string,
  email: string,
  role: UserRole,
  userAgent?: string,
  ipAddress?: string
): Promise<{ refreshToken: string; sessionId: string }> {
  const refreshToken = await generateRefreshToken(userId, email, role);
  const sessionId = crypto.randomUUID();

  const dbSessions = await getDBSessions();
  if (dbSessions) {
    const accessToken = ''; // Access token managed separately
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await dbSessions.createDBSession(
      userId,
      sessionId,
      accessToken,
      refreshToken,
      expiresAt,
      { userAgent, ipAddress }
    );
    logger.debug('Session created in database', { userId, sessionId });
  }

  return { refreshToken, sessionId };
}

/**
 * Get session by refresh token
 */
export async function getSessionByRefreshToken(token: string): Promise<Session | null> {
  const dbSessions = await getDBSessions();

  if (dbSessions) {
    const dbSession = await dbSessions.getSessionByRefreshToken(token);
    if (dbSession) {
      return {
        id: dbSession.id,
        userId: dbSession.user_id,
        refreshToken: '', // Not exposed for security
        createdAt: dbSession.created_at,
        expiresAt: dbSession.expires_at,
        userAgent: dbSession.user_agent || undefined,
        ipAddress: dbSession.ip_address || undefined,
      };
    }
  }

  return null;
}

/**
 * Update session last used timestamp
 */
export async function updateSessionLastUsed(sessionId: string): Promise<void> {
  const dbSessions = await getDBSessions();

  if (dbSessions) {
    await dbSessions.updateSessionActivity(sessionId);
  }
}

/**
 * Revoke session
 */
export async function revokeSession(sessionId: string): Promise<void> {
  const dbSessions = await getDBSessions();

  if (dbSessions) {
    await dbSessions.revokeDBSession(sessionId);
    logger.debug('Session revoked', { sessionId });
  }
}

/**
 * Blacklist token
 */
export async function blacklistToken(token: string, _expiresAt?: string): Promise<void> {
  await revokeRefreshToken(token);
}

/**
 * Check if token is blacklisted
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  const dbSessions = await getDBSessions();

  if (dbSessions) {
    return await dbSessions.isTokenBlacklistedDB(token);
  }

  // In Edge Runtime, we can't check database - allow token (JWT verification still applies)
  return false;
}

/**
 * Generate password reset token (database stub)
 */
export async function generatePasswordResetToken(userId: string, email: string): Promise<string> {
  // Generate a password reset token (simplified for Edge Runtime)
  const token = await new SignJWT({ userId, email, type: 'password-reset' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .setIssuedAt()
    .sign(REFRESH_SECRET);
  return token;
}

/**
 * Verify password reset token (database stub)
 */
export async function verifyPasswordResetToken(token: string): Promise<{ email: string; userId?: string } | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    if (payload.type !== 'password-reset' || !payload.email) {
      return null;
    }
    return {
      email: payload.email as string,
      userId: payload.userId as string | undefined
    };
  } catch (error) {
    return null;
  }
}
