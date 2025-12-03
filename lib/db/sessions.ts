/**
 * PostgreSQL Session Management
 * Implements database-backed sessions with proper token blacklisting
 * SECURITY FIX: Replaces deprecated file-based stubs in lib/auth/session.ts
 */

import { getPool } from './pool';
import { createHash } from 'crypto';
import type { UserRole } from '@/lib/auth/types';

export interface DBSession {
  id: string;
  user_id: string;
  session_token: string;
  access_token_hash: string | null;
  refresh_token_hash: string | null;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string | null;
  is_active: boolean;
  last_activity: Date;
  expires_at: Date;
  created_at: Date;
  revoked_at: Date | null;
}

/**
 * Hash a token for secure storage
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Detect device type from user agent
 */
function detectDeviceType(userAgent?: string): string {
  if (!userAgent) return 'unknown';
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|ipod/.test(ua)) return 'mobile';
  if (/tablet/.test(ua)) return 'tablet';
  return 'desktop';
}

/**
 * Create a new session in the database
 */
export async function createDBSession(
  userId: string,
  sessionToken: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: Date,
  options?: {
    userAgent?: string;
    ipAddress?: string;
  }
): Promise<DBSession> {
  const pool = getPool();

  const result = await pool.query<DBSession>(
    `INSERT INTO sessions (
      user_id, session_token, access_token_hash, refresh_token_hash,
      ip_address, user_agent, device_type, expires_at, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
    RETURNING *`,
    [
      userId,
      sessionToken,
      hashToken(accessToken),
      hashToken(refreshToken),
      options?.ipAddress || null,
      options?.userAgent || null,
      detectDeviceType(options?.userAgent),
      expiresAt,
    ]
  );

  return result.rows[0];
}

/**
 * Get session by session token
 */
export async function getSessionByToken(sessionToken: string): Promise<DBSession | null> {
  const pool = getPool();

  const result = await pool.query<DBSession>(
    `SELECT * FROM sessions
     WHERE session_token = $1
       AND is_active = true
       AND revoked_at IS NULL
       AND expires_at > NOW()`,
    [sessionToken]
  );

  return result.rows[0] || null;
}

/**
 * Get session by refresh token hash
 */
export async function getSessionByRefreshToken(refreshToken: string): Promise<DBSession | null> {
  const pool = getPool();
  const tokenHash = hashToken(refreshToken);

  const result = await pool.query<DBSession>(
    `SELECT * FROM sessions
     WHERE refresh_token_hash = $1
       AND is_active = true
       AND revoked_at IS NULL
       AND expires_at > NOW()`,
    [tokenHash]
  );

  return result.rows[0] || null;
}

/**
 * Update session last activity
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  const pool = getPool();

  await pool.query(
    `UPDATE sessions SET last_activity = NOW() WHERE id = $1`,
    [sessionId]
  );
}

/**
 * Revoke a session
 */
export async function revokeDBSession(sessionId: string): Promise<void> {
  const pool = getPool();

  await pool.query(
    `UPDATE sessions
     SET is_active = false, revoked_at = NOW()
     WHERE id = $1`,
    [sessionId]
  );
}

/**
 * Revoke session by token
 */
export async function revokeSessionByToken(sessionToken: string): Promise<void> {
  const pool = getPool();

  await pool.query(
    `UPDATE sessions
     SET is_active = false, revoked_at = NOW()
     WHERE session_token = $1`,
    [sessionToken]
  );
}

/**
 * Revoke all user sessions
 */
export async function revokeAllUserSessions(userId: string): Promise<number> {
  const pool = getPool();

  const result = await pool.query(
    `UPDATE sessions
     SET is_active = false, revoked_at = NOW()
     WHERE user_id = $1 AND is_active = true
     RETURNING id`,
    [userId]
  );

  return result.rowCount || 0;
}

/**
 * Get active sessions for a user
 */
export async function getUserActiveSessions(userId: string): Promise<DBSession[]> {
  const pool = getPool();

  const result = await pool.query<DBSession>(
    `SELECT * FROM sessions
     WHERE user_id = $1
       AND is_active = true
       AND revoked_at IS NULL
       AND expires_at > NOW()
     ORDER BY last_activity DESC`,
    [userId]
  );

  return result.rows;
}

/**
 * Check if a token is blacklisted (session revoked)
 */
export async function isTokenBlacklistedDB(token: string): Promise<boolean> {
  const pool = getPool();
  const tokenHash = hashToken(token);

  // Check if there's a revoked session with this token
  const result = await pool.query(
    `SELECT 1 FROM sessions
     WHERE (access_token_hash = $1 OR refresh_token_hash = $1)
       AND (is_active = false OR revoked_at IS NOT NULL)
     LIMIT 1`,
    [tokenHash]
  );

  return (result.rowCount || 0) > 0;
}

/**
 * Update session tokens (for token refresh)
 */
export async function updateSessionTokens(
  sessionId: string,
  newAccessToken: string,
  newRefreshToken?: string
): Promise<void> {
  const pool = getPool();

  if (newRefreshToken) {
    await pool.query(
      `UPDATE sessions
       SET access_token_hash = $2,
           refresh_token_hash = $3,
           last_activity = NOW()
       WHERE id = $1`,
      [sessionId, hashToken(newAccessToken), hashToken(newRefreshToken)]
    );
  } else {
    await pool.query(
      `UPDATE sessions
       SET access_token_hash = $2,
           last_activity = NOW()
       WHERE id = $1`,
      [sessionId, hashToken(newAccessToken)]
    );
  }
}

/**
 * Cleanup expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const pool = getPool();

  const result = await pool.query(
    `DELETE FROM sessions
     WHERE expires_at < NOW() - INTERVAL '7 days'
     RETURNING id`
  );

  return result.rowCount || 0;
}

/**
 * Get session count for a user
 */
export async function getUserSessionCount(userId: string): Promise<number> {
  const pool = getPool();

  const result = await pool.query(
    `SELECT COUNT(*) as count FROM sessions
     WHERE user_id = $1
       AND is_active = true
       AND revoked_at IS NULL
       AND expires_at > NOW()`,
    [userId]
  );

  return parseInt(result.rows[0]?.count || '0', 10);
}
