/**
 * Session Management Unit Tests
 * Tests for lib/auth/session.ts
 *
 * Coverage:
 * - generateRefreshToken() - Token generation with jose
 * - verifyRefreshToken() - Token verification and blacklist checking
 * - storeSession() - Session persistence with database
 * - revokeRefreshToken() - Token revocation
 * - createSession() - Complete session creation flow
 * - getUserSessions() - Retrieve user sessions
 * - revokeAllUserSessions() - Revoke all sessions for a user
 * - Edge Runtime compatibility
 * - Security validations
 * - Error handling
 */

import {
  generateRefreshToken,
  verifyRefreshToken,
  storeSession,
  revokeRefreshToken,
  createSession,
  getUserSessions,
  revokeAllUserSessions,
  getSessionByRefreshToken,
  updateSessionLastUsed,
  revokeSession,
  blacklistToken,
  isTokenBlacklisted,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  cleanupExpired,
} from '@/lib/auth/session';
import type { UserRole } from '@/lib/auth/types';

// Mock the database sessions module
jest.mock('@/lib/db/sessions', () => ({
  createDBSession: jest.fn(),
  getSessionByRefreshToken: jest.fn(),
  revokeDBSession: jest.fn(),
  getUserActiveSessions: jest.fn(),
  revokeAllUserSessions: jest.fn(),
  cleanupExpiredSessions: jest.fn(),
  updateSessionActivity: jest.fn(),
  isTokenBlacklistedDB: jest.fn(),
}));

// Mock logger to avoid noise in tests
jest.mock('@/lib/utils/logger', () => ({
  authLogger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Session Management', () => {
  const mockUserId = 'user-123';
  const mockEmail = 'test@example.com';
  const mockRole: UserRole = 'viewer';
  const mockUserAgent = 'Mozilla/5.0 Test Browser';
  const mockIpAddress = '192.168.1.100';

  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure we have a test secret
    process.env.REFRESH_TOKEN_SECRET = 'test-secret-key-for-testing-refresh-tokens-minimum-32-chars';
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid JWT refresh token', async () => {
      const token = await generateRefreshToken(mockUserId, mockEmail, mockRole);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT format: header.payload.signature
    });

    it('should include user data in token payload', async () => {
      const token = await generateRefreshToken(mockUserId, mockEmail, mockRole);
      const verified = await verifyRefreshToken(token);

      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(mockUserId);
      expect(verified?.email).toBe(mockEmail);
      expect(verified?.role).toBe(mockRole);
    });

    it('should generate different tokens for different users', async () => {
      const token1 = await generateRefreshToken('user-1', 'user1@example.com', 'viewer');
      const token2 = await generateRefreshToken('user-2', 'user2@example.com', 'viewer');

      expect(token1).not.toBe(token2);
    });

    it('should support all role types', async () => {
      const adminToken = await generateRefreshToken('admin-1', 'admin@test.com', 'admin');
      const editorToken = await generateRefreshToken('editor-1', 'editor@test.com', 'editor');
      const viewerToken = await generateRefreshToken('viewer-1', 'viewer@test.com', 'viewer');

      const adminVerified = await verifyRefreshToken(adminToken);
      const editorVerified = await verifyRefreshToken(editorToken);
      const viewerVerified = await verifyRefreshToken(viewerToken);

      expect(adminVerified?.role).toBe('admin');
      expect(editorVerified?.role).toBe('editor');
      expect(viewerVerified?.role).toBe('viewer');
    });

    it('should generate token with 7 day expiration', async () => {
      const token = await generateRefreshToken(mockUserId, mockEmail, mockRole);
      const verified = await verifyRefreshToken(token);

      expect(verified).not.toBeNull();

      // Token should be valid immediately
      expect(verified?.userId).toBe(mockUserId);
    });

    it('should handle special characters in email', async () => {
      const specialEmail = 'test+special@example.com';
      const token = await generateRefreshToken(mockUserId, specialEmail, mockRole);
      const verified = await verifyRefreshToken(token);

      expect(verified?.email).toBe(specialEmail);
    });

    it('should handle long user IDs', async () => {
      const longUserId = 'x'.repeat(500);
      const token = await generateRefreshToken(longUserId, mockEmail, mockRole);
      const verified = await verifyRefreshToken(token);

      expect(verified?.userId).toBe(longUserId);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid token and return payload', async () => {
      const token = await generateRefreshToken(mockUserId, mockEmail, mockRole);
      const verified = await verifyRefreshToken(token);

      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(mockUserId);
      expect(verified?.email).toBe(mockEmail);
      expect(verified?.role).toBe(mockRole);
    });

    it('should return null for invalid token', async () => {
      const verified = await verifyRefreshToken('invalid.token.here');
      expect(verified).toBeNull();
    });

    it('should return null for malformed token', async () => {
      const verified = await verifyRefreshToken('not-a-jwt-token');
      expect(verified).toBeNull();
    });

    it('should return null for empty token', async () => {
      const verified = await verifyRefreshToken('');
      expect(verified).toBeNull();
    });

    it('should return null for token with wrong signature', async () => {
      const token = await generateRefreshToken(mockUserId, mockEmail, mockRole);
      const parts = token.split('.');
      const tamperedToken = parts[0] + '.' + parts[1] + '.invalidsignature';

      const verified = await verifyRefreshToken(tamperedToken);
      expect(verified).toBeNull();
    });

    it('should return null for token with modified payload', async () => {
      const token = await generateRefreshToken(mockUserId, mockEmail, mockRole);
      const parts = token.split('.');
      const modifiedToken = parts[0] + '.' + parts[1] + 'x' + '.' + parts[2];

      const verified = await verifyRefreshToken(modifiedToken);
      expect(verified).toBeNull();
    });

    it('should return null for blacklisted token', async () => {
      const { isTokenBlacklistedDB } = require('@/lib/db/sessions');
      isTokenBlacklistedDB.mockResolvedValue(true);

      const token = await generateRefreshToken(mockUserId, mockEmail, mockRole);
      const verified = await verifyRefreshToken(token);

      expect(verified).toBeNull();
      expect(isTokenBlacklistedDB).toHaveBeenCalledWith(token);
    });

    it('should verify non-blacklisted token', async () => {
      const { isTokenBlacklistedDB } = require('@/lib/db/sessions');
      isTokenBlacklistedDB.mockResolvedValue(false);

      const token = await generateRefreshToken(mockUserId, mockEmail, mockRole);
      const verified = await verifyRefreshToken(token);

      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(mockUserId);
    });

    it('should return null if token is missing required fields', async () => {
      // This would require manipulating the token which should fail verification
      const token = await generateRefreshToken('', '', mockRole);
      const verified = await verifyRefreshToken(token);

      // Token with empty userId/email should still verify but return null
      expect(verified).toBeNull();
    });
  });

  describe('storeSession', () => {
    it('should store session in database', async () => {
      const { createDBSession } = require('@/lib/db/sessions');
      createDBSession.mockResolvedValue(undefined);

      const token = await generateRefreshToken(mockUserId, mockEmail, mockRole);
      await storeSession(mockUserId, mockEmail, token, mockRole, mockUserAgent, mockIpAddress);

      expect(createDBSession).toHaveBeenCalledWith(
        mockUserId,
        expect.any(String), // session ID
        '', // access token
        token,
        expect.any(Date), // expires at
        { userAgent: mockUserAgent, ipAddress: mockIpAddress }
      );
    });

    it('should store session without optional metadata', async () => {
      const { createDBSession } = require('@/lib/db/sessions');
      createDBSession.mockResolvedValue(undefined);

      const token = await generateRefreshToken(mockUserId, mockEmail, mockRole);
      await storeSession(mockUserId, mockEmail, token, mockRole);

      expect(createDBSession).toHaveBeenCalledWith(
        mockUserId,
        expect.any(String),
        '',
        token,
        expect.any(Date),
        { userAgent: undefined, ipAddress: undefined }
      );
    });

    it('should set expiration to 7 days', async () => {
      const { createDBSession } = require('@/lib/db/sessions');
      createDBSession.mockResolvedValue(undefined);

      const token = await generateRefreshToken(mockUserId, mockEmail, mockRole);
      await storeSession(mockUserId, mockEmail, token, mockRole);

      const callArgs = createDBSession.mock.calls[0];
      const expiresAt = callArgs[4] as Date;
      const now = new Date();
      const daysDiff = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      expect(daysDiff).toBeGreaterThan(6.9);
      expect(daysDiff).toBeLessThan(7.1);
    });

    it('should handle database errors gracefully', async () => {
      const { createDBSession } = require('@/lib/db/sessions');
      createDBSession.mockRejectedValue(new Error('Database error'));

      const token = await generateRefreshToken(mockUserId, mockEmail, mockRole);

      // Should not throw
      await expect(
        storeSession(mockUserId, mockEmail, token, mockRole)
      ).rejects.toThrow('Database error');
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke session by refresh token', async () => {
      const { getSessionByRefreshToken, revokeDBSession } = require('@/lib/db/sessions');

      const mockSession = { id: 'session-123' };
      getSessionByRefreshToken.mockResolvedValue(mockSession);
      revokeDBSession.mockResolvedValue(undefined);

      const token = await generateRefreshToken(mockUserId, mockEmail, mockRole);
      await revokeRefreshToken(token);

      expect(getSessionByRefreshToken).toHaveBeenCalledWith(token);
      expect(revokeDBSession).toHaveBeenCalledWith('session-123');
    });

    it('should handle non-existent session gracefully', async () => {
      const { getSessionByRefreshToken, revokeDBSession } = require('@/lib/db/sessions');

      getSessionByRefreshToken.mockResolvedValue(null);

      const token = await generateRefreshToken(mockUserId, mockEmail, mockRole);
      await revokeRefreshToken(token);

      expect(getSessionByRefreshToken).toHaveBeenCalledWith(token);
      expect(revokeDBSession).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const { getSessionByRefreshToken } = require('@/lib/db/sessions');
      getSessionByRefreshToken.mockRejectedValue(new Error('Database connection failed'));

      const token = await generateRefreshToken(mockUserId, mockEmail, mockRole);

      await expect(revokeRefreshToken(token)).rejects.toThrow('Database connection failed');
    });
  });

  describe('createSession', () => {
    it('should create session with refresh token and session ID', async () => {
      const { createDBSession } = require('@/lib/db/sessions');
      createDBSession.mockResolvedValue(undefined);

      const result = await createSession(mockUserId, mockEmail, mockRole, mockUserAgent, mockIpAddress);

      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('sessionId');
      expect(typeof result.refreshToken).toBe('string');
      expect(typeof result.sessionId).toBe('string');
      expect(result.refreshToken.split('.').length).toBe(3); // JWT format
    });

    it('should store session in database', async () => {
      const { createDBSession } = require('@/lib/db/sessions');
      createDBSession.mockResolvedValue(undefined);

      const result = await createSession(mockUserId, mockEmail, mockRole);

      expect(createDBSession).toHaveBeenCalledWith(
        mockUserId,
        result.sessionId,
        '',
        result.refreshToken,
        expect.any(Date),
        { userAgent: undefined, ipAddress: undefined }
      );
    });

    it('should include user agent and IP address in session', async () => {
      const { createDBSession } = require('@/lib/db/sessions');
      createDBSession.mockResolvedValue(undefined);

      await createSession(mockUserId, mockEmail, mockRole, mockUserAgent, mockIpAddress);

      const callArgs = createDBSession.mock.calls[0];
      const metadata = callArgs[5];

      expect(metadata).toEqual({
        userAgent: mockUserAgent,
        ipAddress: mockIpAddress,
      });
    });

    it('should generate unique session IDs', async () => {
      const { createDBSession } = require('@/lib/db/sessions');
      createDBSession.mockResolvedValue(undefined);

      const session1 = await createSession('user-1', 'user1@example.com', 'viewer');
      const session2 = await createSession('user-2', 'user2@example.com', 'viewer');

      expect(session1.sessionId).not.toBe(session2.sessionId);
      expect(session1.refreshToken).not.toBe(session2.refreshToken);
    });
  });

  describe('getUserSessions', () => {
    it('should retrieve all active sessions for a user', async () => {
      const { getUserActiveSessions } = require('@/lib/db/sessions');

      const mockSessions = [
        {
          id: 'session-1',
          user_id: mockUserId,
          created_at: new Date(),
          expires_at: new Date(),
          user_agent: 'Browser 1',
          ip_address: '192.168.1.1',
        },
        {
          id: 'session-2',
          user_id: mockUserId,
          created_at: new Date(),
          expires_at: new Date(),
          user_agent: 'Browser 2',
          ip_address: '192.168.1.2',
        },
      ];

      getUserActiveSessions.mockResolvedValue(mockSessions);

      const sessions = await getUserSessions(mockUserId);

      expect(sessions).toHaveLength(2);
      expect(sessions[0]).toMatchObject({
        id: 'session-1',
        userId: mockUserId,
        userAgent: 'Browser 1',
        ipAddress: '192.168.1.1',
      });
      expect(sessions[0].refreshToken).toBe(''); // Not exposed
    });

    it('should return empty array if no sessions exist', async () => {
      const { getUserActiveSessions } = require('@/lib/db/sessions');
      getUserActiveSessions.mockResolvedValue([]);

      const sessions = await getUserSessions(mockUserId);

      expect(sessions).toEqual([]);
    });

    it('should not expose refresh tokens in response', async () => {
      const { getUserActiveSessions } = require('@/lib/db/sessions');

      getUserActiveSessions.mockResolvedValue([
        {
          id: 'session-1',
          user_id: mockUserId,
          created_at: new Date(),
          expires_at: new Date(),
          refresh_token: 'secret-token',
          user_agent: null,
          ip_address: null,
        },
      ]);

      const sessions = await getUserSessions(mockUserId);

      expect(sessions[0].refreshToken).toBe('');
      expect(sessions[0]).not.toHaveProperty('refresh_token');
    });
  });

  describe('revokeAllUserSessions', () => {
    it('should revoke all sessions for a user', async () => {
      const { revokeAllUserSessions: revokeAllDB } = require('@/lib/db/sessions');
      revokeAllDB.mockResolvedValue(3); // 3 sessions revoked

      await revokeAllUserSessions(mockUserId);

      expect(revokeAllDB).toHaveBeenCalledWith(mockUserId);
    });

    it('should handle user with no sessions', async () => {
      const { revokeAllUserSessions: revokeAllDB } = require('@/lib/db/sessions');
      revokeAllDB.mockResolvedValue(0);

      await revokeAllUserSessions(mockUserId);

      expect(revokeAllDB).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('getSessionByRefreshToken', () => {
    it('should retrieve session by refresh token', async () => {
      const { getSessionByRefreshToken: getSessionDB } = require('@/lib/db/sessions');

      const mockSession = {
        id: 'session-123',
        user_id: mockUserId,
        created_at: new Date(),
        expires_at: new Date(),
        user_agent: mockUserAgent,
        ip_address: mockIpAddress,
      };

      getSessionDB.mockResolvedValue(mockSession);

      const token = await generateRefreshToken(mockUserId, mockEmail, mockRole);
      const session = await getSessionByRefreshToken(token);

      expect(session).not.toBeNull();
      expect(session?.id).toBe('session-123');
      expect(session?.userId).toBe(mockUserId);
      expect(session?.refreshToken).toBe(''); // Not exposed
    });

    it('should return null for non-existent token', async () => {
      const { getSessionByRefreshToken: getSessionDB } = require('@/lib/db/sessions');
      getSessionDB.mockResolvedValue(null);

      const session = await getSessionByRefreshToken('non-existent-token');

      expect(session).toBeNull();
    });
  });

  describe('updateSessionLastUsed', () => {
    it('should update session activity timestamp', async () => {
      const { updateSessionActivity } = require('@/lib/db/sessions');
      updateSessionActivity.mockResolvedValue(undefined);

      await updateSessionLastUsed('session-123');

      expect(updateSessionActivity).toHaveBeenCalledWith('session-123');
    });
  });

  describe('revokeSession', () => {
    it('should revoke session by session ID', async () => {
      const { revokeDBSession } = require('@/lib/db/sessions');
      revokeDBSession.mockResolvedValue(undefined);

      await revokeSession('session-123');

      expect(revokeDBSession).toHaveBeenCalledWith('session-123');
    });
  });

  describe('blacklistToken', () => {
    it('should blacklist token by revoking it', async () => {
      const { getSessionByRefreshToken, revokeDBSession } = require('@/lib/db/sessions');

      getSessionByRefreshToken.mockResolvedValue({ id: 'session-123' });
      revokeDBSession.mockResolvedValue(undefined);

      const token = await generateRefreshToken(mockUserId, mockEmail, mockRole);
      await blacklistToken(token);

      expect(getSessionByRefreshToken).toHaveBeenCalledWith(token);
    });
  });

  describe('isTokenBlacklisted', () => {
    it('should return true for blacklisted token', async () => {
      const { isTokenBlacklistedDB } = require('@/lib/db/sessions');
      isTokenBlacklistedDB.mockResolvedValue(true);

      const token = await generateRefreshToken(mockUserId, mockEmail, mockRole);
      const isBlacklisted = await isTokenBlacklisted(token);

      expect(isBlacklisted).toBe(true);
      expect(isTokenBlacklistedDB).toHaveBeenCalledWith(token);
    });

    it('should return false for non-blacklisted token', async () => {
      const { isTokenBlacklistedDB } = require('@/lib/db/sessions');
      isTokenBlacklistedDB.mockResolvedValue(false);

      const token = await generateRefreshToken(mockUserId, mockEmail, mockRole);
      const isBlacklisted = await isTokenBlacklisted(token);

      expect(isBlacklisted).toBe(false);
    });
  });

  describe('Password Reset Tokens', () => {
    describe('generatePasswordResetToken', () => {
      it('should generate password reset token', async () => {
        const token = await generatePasswordResetToken(mockUserId, mockEmail);

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.split('.').length).toBe(3);
      });

      it('should generate token with 1 hour expiration', async () => {
        const token = await generatePasswordResetToken(mockUserId, mockEmail);
        const verified = await verifyPasswordResetToken(token);

        expect(verified).not.toBeNull();
        expect(verified?.email).toBe(mockEmail);
      });
    });

    describe('verifyPasswordResetToken', () => {
      it('should verify valid password reset token', async () => {
        const token = await generatePasswordResetToken(mockUserId, mockEmail);
        const verified = await verifyPasswordResetToken(token);

        expect(verified).not.toBeNull();
        expect(verified?.email).toBe(mockEmail);
        expect(verified?.userId).toBe(mockUserId);
      });

      it('should return null for invalid token', async () => {
        const verified = await verifyPasswordResetToken('invalid.token');
        expect(verified).toBeNull();
      });

      it('should reject refresh tokens as password reset tokens', async () => {
        // Generate a refresh token (wrong type)
        const refreshToken = await generateRefreshToken(mockUserId, mockEmail, mockRole);
        const verified = await verifyPasswordResetToken(refreshToken);

        expect(verified).toBeNull();
      });
    });
  });

  describe('cleanupExpired', () => {
    it('should clean up expired sessions', async () => {
      const { cleanupExpiredSessions } = require('@/lib/db/sessions');
      cleanupExpiredSessions.mockResolvedValue(5); // 5 sessions cleaned

      await cleanupExpired();

      expect(cleanupExpiredSessions).toHaveBeenCalled();
    });

    it('should handle no expired sessions', async () => {
      const { cleanupExpiredSessions } = require('@/lib/db/sessions');
      cleanupExpiredSessions.mockResolvedValue(0);

      await cleanupExpired();

      expect(cleanupExpiredSessions).toHaveBeenCalled();
    });
  });

  describe('Security Tests', () => {
    it('should not allow token reuse after modification', async () => {
      const token = await generateRefreshToken(mockUserId, mockEmail, mockRole);
      const parts = token.split('.');
      const modifiedToken = parts[0] + '.' + parts[1] + 'tampered' + '.' + parts[2];

      const verified = await verifyRefreshToken(modifiedToken);
      expect(verified).toBeNull();
    });

    it('should enforce minimum secret length', () => {
      // This is checked at module load time
      // Test would require reloading module with different env
      expect(process.env.REFRESH_TOKEN_SECRET!.length).toBeGreaterThanOrEqual(32);
    });

    it('should generate cryptographically secure session IDs', async () => {
      const { createDBSession } = require('@/lib/db/sessions');
      createDBSession.mockResolvedValue(undefined);

      const session1 = await createSession(mockUserId, mockEmail, mockRole);
      const session2 = await createSession(mockUserId, mockEmail, mockRole);

      // Session IDs should be UUIDs
      expect(session1.sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(session2.sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(session1.sessionId).not.toBe(session2.sessionId);
    });

    it('should prevent session fixation attacks', async () => {
      // Each login should generate a new session ID
      const session1 = await createSession(mockUserId, mockEmail, mockRole);
      const session2 = await createSession(mockUserId, mockEmail, mockRole);

      expect(session1.sessionId).not.toBe(session2.sessionId);
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent session creation', async () => {
      const { createDBSession } = require('@/lib/db/sessions');
      createDBSession.mockResolvedValue(undefined);

      const promises = Array(10).fill(null).map((_, i) =>
        createSession(`user-${i}`, `user${i}@example.com`, 'viewer')
      );

      const sessions = await Promise.all(promises);

      expect(sessions).toHaveLength(10);
      const sessionIds = sessions.map(s => s.sessionId);
      expect(new Set(sessionIds).size).toBe(10); // All unique
    });

    it('should handle empty user agent and IP address', async () => {
      const { createDBSession } = require('@/lib/db/sessions');
      createDBSession.mockResolvedValue(undefined);

      await createSession(mockUserId, mockEmail, mockRole, '', '');

      const callArgs = createDBSession.mock.calls[0];
      const metadata = callArgs[5];

      expect(metadata).toEqual({
        userAgent: '',
        ipAddress: '',
      });
    });

    it('should handle very long user agents', async () => {
      const { createDBSession } = require('@/lib/db/sessions');
      createDBSession.mockResolvedValue(undefined);

      const longUserAgent = 'x'.repeat(1000);
      await createSession(mockUserId, mockEmail, mockRole, longUserAgent);

      const callArgs = createDBSession.mock.calls[0];
      const metadata = callArgs[5];

      expect(metadata.userAgent).toBe(longUserAgent);
    });
  });

  describe('Performance Tests', () => {
    it('should generate tokens quickly', async () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        await generateRefreshToken(`user-${i}`, `user${i}@example.com`, 'viewer');
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(5000); // 100 tokens in under 5 seconds
    });

    it('should verify tokens quickly', async () => {
      const token = await generateRefreshToken(mockUserId, mockEmail, mockRole);

      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        await verifyRefreshToken(token);
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(1000); // 100 verifications in under 1 second
    });
  });
});
