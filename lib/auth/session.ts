/**
 * Session Management
 * Handles refresh tokens and session persistence
 */

import { promises as fs } from 'fs';
import path from 'path';
import { SignJWT, jwtVerify } from 'jose';
import type { UserRole } from './types';

const SESSIONS_FILE = path.join(process.cwd(), 'data', 'sessions.json');
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret-change-in-production';
const REFRESH_TOKEN_EXPIRY = '30d'; // 30 days for refresh tokens
const BLACKLIST_FILE = path.join(process.cwd(), 'data', 'token-blacklist.json');

// Convert secret to Uint8Array for jose
const refreshSecretKey = new TextEncoder().encode(REFRESH_TOKEN_SECRET);

if (!process.env.REFRESH_TOKEN_SECRET && process.env.NODE_ENV === 'production') {
  console.error('⚠️  WARNING: REFRESH_TOKEN_SECRET not set in production!');
}

export interface Session {
  id: string;
  userId: string;
  refreshToken: string;
  createdAt: string;
  expiresAt: string;
  lastUsed: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface PasswordResetToken {
  token: string;
  userId: string;
  email: string;
  expiresAt: string;
  used: boolean;
}

interface BlacklistedToken {
  token: string;
  blacklistedAt: string;
  expiresAt: string;
}

/**
 * Load sessions from file
 */
async function loadSessions(): Promise<Session[]> {
  try {
    const data = await fs.readFile(SESSIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Save sessions to file
 */
async function saveSessions(sessions: Session[]): Promise<void> {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(SESSIONS_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving sessions:', error);
    throw new Error('Failed to save sessions');
  }
}

/**
 * Load token blacklist
 */
async function loadBlacklist(): Promise<BlacklistedToken[]> {
  try {
    const data = await fs.readFile(BLACKLIST_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Save token blacklist
 */
async function saveBlacklist(blacklist: BlacklistedToken[]): Promise<void> {
  try {
    const dataDir = path.dirname(BLACKLIST_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(BLACKLIST_FILE, JSON.stringify(blacklist, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving blacklist:', error);
  }
}

/**
 * Clean up expired sessions
 */
async function cleanupExpiredSessions(): Promise<void> {
  const sessions = await loadSessions();
  const now = new Date().toISOString();
  const activeSessions = sessions.filter(s => s.expiresAt > now);

  if (activeSessions.length !== sessions.length) {
    await saveSessions(activeSessions);
  }
}

/**
 * Clean up expired blacklist entries
 */
async function cleanupBlacklist(): Promise<void> {
  const blacklist = await loadBlacklist();
  const now = new Date().toISOString();
  const activeEntries = blacklist.filter(b => b.expiresAt > now);

  if (activeEntries.length !== blacklist.length) {
    await saveBlacklist(activeEntries);
  }
}

/**
 * Generate a refresh token
 */
export async function generateRefreshToken(
  userId: string,
  email: string,
  role: UserRole
): Promise<string> {
  // Calculate expiry (30 days from now)
  const expirySeconds = 30 * 24 * 60 * 60;

  const token = await new SignJWT({
    userId,
    email,
    role,
    type: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expirySeconds)
    .setJti(`refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
    .sign(refreshSecretKey);

  return token;
}

/**
 * Verify a refresh token
 */
export async function verifyRefreshToken(token: string): Promise<{
  userId: string;
  email: string;
  role: UserRole;
} | null> {
  try {
    // Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return null;
    }

    const { payload } = await jwtVerify(token, refreshSecretKey);

    if (payload.type !== 'refresh') {
      return null;
    }

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as UserRole,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Refresh token verification error:', error.message);
    }
    return null;
  }
}

/**
 * Create a new session with refresh token
 */
export async function createSession(
  userId: string,
  email: string,
  role: UserRole,
  userAgent?: string,
  ipAddress?: string
): Promise<{ sessionId: string; refreshToken: string }> {
  await cleanupExpiredSessions();

  const refreshToken = await generateRefreshToken(userId, email, role);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const session: Session = {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    refreshToken,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    lastUsed: now.toISOString(),
    userAgent,
    ipAddress,
  };

  const sessions = await loadSessions();
  sessions.push(session);
  await saveSessions(sessions);

  return { sessionId: session.id, refreshToken };
}

/**
 * Get session by refresh token
 */
export async function getSessionByRefreshToken(refreshToken: string): Promise<Session | null> {
  const sessions = await loadSessions();
  const session = sessions.find(s => s.refreshToken === refreshToken);

  if (!session) {
    return null;
  }

  // Check if session is expired
  if (new Date(session.expiresAt) < new Date()) {
    return null;
  }

  return session;
}

/**
 * Update session last used timestamp
 */
export async function updateSessionLastUsed(sessionId: string): Promise<void> {
  const sessions = await loadSessions();
  const session = sessions.find(s => s.id === sessionId);

  if (session) {
    session.lastUsed = new Date().toISOString();
    await saveSessions(sessions);
  }
}

/**
 * Revoke a session (delete it)
 */
export async function revokeSession(sessionId: string): Promise<void> {
  const sessions = await loadSessions();
  const filteredSessions = sessions.filter(s => s.id !== sessionId);
  await saveSessions(filteredSessions);
}

/**
 * Revoke all sessions for a user
 */
export async function revokeAllUserSessions(userId: string): Promise<void> {
  const sessions = await loadSessions();
  const filteredSessions = sessions.filter(s => s.userId !== userId);
  await saveSessions(filteredSessions);
}

/**
 * Get all sessions for a user
 */
export async function getUserSessions(userId: string): Promise<Session[]> {
  const sessions = await loadSessions();
  const now = new Date().toISOString();
  return sessions.filter(s => s.userId === userId && s.expiresAt > now);
}

/**
 * Add token to blacklist
 */
export async function blacklistToken(token: string, expiresAt: string): Promise<void> {
  await cleanupBlacklist();

  const blacklist = await loadBlacklist();
  blacklist.push({
    token,
    blacklistedAt: new Date().toISOString(),
    expiresAt,
  });

  await saveBlacklist(blacklist);
}

/**
 * Check if token is blacklisted
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  const blacklist = await loadBlacklist();
  return blacklist.some(b => b.token === token);
}

/**
 * Generate password reset token
 */
export async function generatePasswordResetToken(
  userId: string,
  email: string
): Promise<string> {
  const expirySeconds = 60 * 60; // 1 hour

  const token = await new SignJWT({
    userId,
    email,
    type: 'password-reset',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expirySeconds)
    .setJti(`reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
    .sign(refreshSecretKey);

  return token;
}

/**
 * Verify password reset token
 */
export async function verifyPasswordResetToken(token: string): Promise<{
  userId: string;
  email: string;
} | null> {
  try {
    const { payload } = await jwtVerify(token, refreshSecretKey);

    if (payload.type !== 'password-reset') {
      return null;
    }

    return {
      userId: payload.userId as string,
      email: payload.email as string,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Password reset token verification error:', error.message);
    }
    return null;
  }
}
