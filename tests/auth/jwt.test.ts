/**
 * JWT Token Tests
 * Tests for JWT token generation, verification, and refresh
 */

import { describe, it, expect } from '@jest/globals';
import {
  generateToken,
  verifyToken,
  refreshToken,
  getUserFromToken,
  isTokenValid,
  getTokenExpiry,
} from '@/lib/auth/jwt';

describe('JWT Token Management', () => {
  const testUserId = 'test-user-123';
  const testEmail = 'test@example.com';
  const testRole = 'admin' as const;

  describe('Token Generation', () => {
    it('should generate a valid JWT token', async () => {
      const token = await generateToken(testUserId, testEmail, testRole, false);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different tokens for remember me', async () => {
      const token1 = await generateToken(testUserId, testEmail, testRole, false);
      const token2 = await generateToken(testUserId, testEmail, testRole, true);

      expect(token1).not.toBe(token2);

      // Verify both tokens
      const payload1 = await verifyToken(token1);
      const payload2 = await verifyToken(token2);

      expect(payload1).toBeTruthy();
      expect(payload2).toBeTruthy();

      // Remember me token should have longer expiry
      if (payload1 && payload2 && payload1.exp && payload2.exp) {
        expect(payload2.exp).toBeGreaterThan(payload1.exp);
      }
    });

    it('should include correct payload data', async () => {
      const token = await generateToken(testUserId, testEmail, testRole, false);
      const payload = await verifyToken(token);

      expect(payload).toBeTruthy();
      expect(payload?.userId).toBe(testUserId);
      expect(payload?.email).toBe(testEmail);
      expect(payload?.role).toBe(testRole);
      expect(payload?.exp).toBeDefined();
      expect(payload?.iat).toBeDefined();
    });
  });

  describe('Token Verification', () => {
    it('should verify a valid token', async () => {
      const token = await generateToken(testUserId, testEmail, testRole, false);
      const payload = await verifyToken(token);

      expect(payload).toBeTruthy();
      expect(payload?.userId).toBe(testUserId);
    });

    it('should reject invalid token', async () => {
      const invalidToken = 'invalid.token.here';
      const payload = await verifyToken(invalidToken);

      expect(payload).toBeNull();
    });

    it('should reject malformed token', async () => {
      const malformedToken = 'notavalidjwt';
      const payload = await verifyToken(malformedToken);

      expect(payload).toBeNull();
    });

    it('should validate token correctly', async () => {
      const token = await generateToken(testUserId, testEmail, testRole, false);
      const isValid = await isTokenValid(token);

      expect(isValid).toBe(true);
    });

    it('should return false for invalid token', async () => {
      const isValid = await isTokenValid('invalid.token');

      expect(isValid).toBe(false);
    });
  });

  describe('Token Refresh', () => {
    it('should not refresh token if still valid', async () => {
      const token = await generateToken(testUserId, testEmail, testRole, false);
      const refreshed = await refreshToken(token);

      // Token should still be valid, no refresh needed
      expect(refreshed).toBeNull();
    });

    it('should reject invalid token for refresh', async () => {
      const refreshed = await refreshToken('invalid.token');

      expect(refreshed).toBe(false);
    });
  });

  describe('User Session Extraction', () => {
    it('should extract user session from token', async () => {
      const token = await generateToken(testUserId, testEmail, testRole, false);
      const session = await getUserFromToken(token);

      expect(session).toBeTruthy();
      expect(session?.id).toBe(testUserId);
      expect(session?.email).toBe(testEmail);
      expect(session?.role).toBe(testRole);
      expect(session?.name).toBeDefined();
    });

    it('should return null for invalid token', async () => {
      const session = await getUserFromToken('invalid.token');

      expect(session).toBeNull();
    });
  });

  describe('Token Expiry', () => {
    it('should get token expiry time', async () => {
      const token = await generateToken(testUserId, testEmail, testRole, false);
      const expiry = await getTokenExpiry(token);

      expect(expiry).toBeInstanceOf(Date);
      expect(expiry).not.toBeNull();

      if (expiry) {
        expect(expiry.getTime()).toBeGreaterThan(Date.now());
      }
    });

    it('should return null for invalid token', async () => {
      const expiry = await getTokenExpiry('invalid.token');

      expect(expiry).toBeNull();
    });
  });

  describe('Role-Based Access', () => {
    it('should support different user roles', async () => {
      const roles = ['admin', 'editor', 'viewer'] as const;

      for (const role of roles) {
        const token = await generateToken(testUserId, testEmail, role, false);
        const payload = await verifyToken(token);

        expect(payload?.role).toBe(role);
      }
    });
  });
});
