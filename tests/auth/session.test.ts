/**
 * Session Management Tests
 * Tests for refresh tokens, session persistence, and token blacklist
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  generateRefreshToken,
  verifyRefreshToken,
  createSession,
  getSessionByRefreshToken,
  revokeSession,
  revokeAllUserSessions,
  getUserSessions,
  blacklistToken,
  isTokenBlacklisted,
  generatePasswordResetToken,
  verifyPasswordResetToken,
} from '@/lib/auth/session';
import { promises as fs } from 'fs';
import path from 'path';

describe('Session Management', () => {
  const testUserId = 'test-user-123';
  const testEmail = 'test@example.com';
  const testRole = 'admin' as const;
  const sessionsFile = path.join(process.cwd(), 'data', 'sessions.json');
  const blacklistFile = path.join(process.cwd(), 'data', 'token-blacklist.json');

  // Clean up test files before and after tests
  beforeEach(async () => {
    try {
      await fs.unlink(sessionsFile);
    } catch {}
    try {
      await fs.unlink(blacklistFile);
    } catch {}
  });

  afterEach(async () => {
    try {
      await fs.unlink(sessionsFile);
    } catch {}
    try {
      await fs.unlink(blacklistFile);
    } catch {}
  });

  describe('Refresh Token Generation', () => {
    it('should generate a valid refresh token', async () => {
      const token = await generateRefreshToken(testUserId, testEmail, testRole);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include correct payload', async () => {
      const token = await generateRefreshToken(testUserId, testEmail, testRole);
      const payload = await verifyRefreshToken(token);

      expect(payload).toBeTruthy();
      expect(payload?.userId).toBe(testUserId);
      expect(payload?.email).toBe(testEmail);
      expect(payload?.role).toBe(testRole);
    });
  });

  describe('Refresh Token Verification', () => {
    it('should verify valid refresh token', async () => {
      const token = await generateRefreshToken(testUserId, testEmail, testRole);
      const payload = await verifyRefreshToken(token);

      expect(payload).toBeTruthy();
    });

    it('should reject invalid refresh token', async () => {
      const payload = await verifyRefreshToken('invalid.token');

      expect(payload).toBeNull();
    });

    it('should reject blacklisted token', async () => {
      const token = await generateRefreshToken(testUserId, testEmail, testRole);
      const expiresAt = new Date(Date.now() + 60000).toISOString();

      await blacklistToken(token, expiresAt);

      const payload = await verifyRefreshToken(token);
      expect(payload).toBeNull();
    });
  });

  describe('Session Creation and Management', () => {
    it('should create a new session', async () => {
      const result = await createSession(
        testUserId,
        testEmail,
        testRole,
        'Mozilla/5.0',
        '127.0.0.1'
      );

      expect(result.sessionId).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should retrieve session by refresh token', async () => {
      const { refreshToken } = await createSession(
        testUserId,
        testEmail,
        testRole
      );

      const session = await getSessionByRefreshToken(refreshToken);

      expect(session).toBeTruthy();
      expect(session?.userId).toBe(testUserId);
      expect(session?.refreshToken).toBe(refreshToken);
    });

    it('should return null for non-existent session', async () => {
      const session = await getSessionByRefreshToken('non-existent-token');

      expect(session).toBeNull();
    });
  });

  describe('Session Revocation', () => {
    it('should revoke a session', async () => {
      const { sessionId, refreshToken } = await createSession(
        testUserId,
        testEmail,
        testRole
      );

      await revokeSession(sessionId);

      const session = await getSessionByRefreshToken(refreshToken);
      expect(session).toBeNull();
    });

    it('should revoke all user sessions', async () => {
      // Create multiple sessions for the same user
      await createSession(testUserId, testEmail, testRole);
      await createSession(testUserId, testEmail, testRole);
      await createSession(testUserId, testEmail, testRole);

      const sessionsBefore = await getUserSessions(testUserId);
      expect(sessionsBefore.length).toBe(3);

      await revokeAllUserSessions(testUserId);

      const sessionsAfter = await getUserSessions(testUserId);
      expect(sessionsAfter.length).toBe(0);
    });

    it('should get user sessions', async () => {
      await createSession(testUserId, testEmail, testRole);
      await createSession(testUserId, testEmail, testRole);

      const sessions = await getUserSessions(testUserId);

      expect(sessions.length).toBe(2);
      expect(sessions[0].userId).toBe(testUserId);
    });
  });

  describe('Token Blacklist', () => {
    it('should blacklist a token', async () => {
      const token = 'test-token-123';
      const expiresAt = new Date(Date.now() + 60000).toISOString();

      await blacklistToken(token, expiresAt);

      const isBlacklisted = await isTokenBlacklisted(token);
      expect(isBlacklisted).toBe(true);
    });

    it('should check if token is not blacklisted', async () => {
      const isBlacklisted = await isTokenBlacklisted('non-blacklisted-token');

      expect(isBlacklisted).toBe(false);
    });
  });

  describe('Password Reset Tokens', () => {
    it('should generate password reset token', async () => {
      const token = await generatePasswordResetToken(testUserId, testEmail);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should verify password reset token', async () => {
      const token = await generatePasswordResetToken(testUserId, testEmail);
      const payload = await verifyPasswordResetToken(token);

      expect(payload).toBeTruthy();
      expect(payload?.userId).toBe(testUserId);
      expect(payload?.email).toBe(testEmail);
    });

    it('should reject invalid password reset token', async () => {
      const payload = await verifyPasswordResetToken('invalid.token');

      expect(payload).toBeNull();
    });
  });
});
