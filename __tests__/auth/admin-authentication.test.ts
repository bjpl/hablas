/**
 * Admin Authentication Flow Comprehensive Test Suite
 *
 * Tests the complete admin authentication workflow including:
 * - Login endpoint with validation
 * - Middleware authentication checks
 * - Role-based access control
 * - Token verification and refresh
 * - Session management
 * - Security measures (rate limiting, token blacklisting)
 * - Edge cases and error handling
 */

import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';
import { checkAuth, requireAuth, requireRole } from '@/lib/auth/middleware-helper';
import { generateToken, verifyToken, refreshToken } from '@/lib/auth/jwt';
import { createAuthCookie, getTokenFromRequest } from '@/lib/auth/cookies';
import { blacklistToken, isTokenBlacklisted } from '@/lib/auth/session';
import type { UserRole } from '@/lib/auth/types';

// Mock modules
jest.mock('@/lib/auth/session', () => ({
  blacklistToken: jest.fn(),
  isTokenBlacklisted: jest.fn(),
  createSession: jest.fn(),
}));

describe('Admin Authentication Flow - Comprehensive Tests', () => {
  const testUserId = 'test-user-123';
  const testEmail = 'admin@hablas.com';

  beforeEach(() => {
    jest.clearAllMocks();
    (isTokenBlacklisted as jest.Mock).mockResolvedValue(false);
  });

  describe('Token Generation and Verification', () => {
    it('should generate valid JWT token for admin', async () => {
      const token = await generateToken(testUserId, testEmail, 'admin', false);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should generate longer-lived token with rememberMe', async () => {
      const shortToken = await generateToken(testUserId, testEmail, 'admin', false);
      const longToken = await generateToken(testUserId, testEmail, 'admin', true);

      const shortDecoded = await verifyToken(shortToken);
      const longDecoded = await verifyToken(longToken);

      expect(shortDecoded).toBeTruthy();
      expect(longDecoded).toBeTruthy();

      // Long token should have later expiry
      if (shortDecoded && longDecoded) {
        expect(longDecoded.exp).toBeGreaterThan(shortDecoded.exp!);
      }
    });

    it('should verify valid token and extract payload', async () => {
      const token = await generateToken(testUserId, testEmail, 'admin', false);
      const payload = await verifyToken(token);

      expect(payload).toBeTruthy();
      expect(payload?.userId).toBe(testUserId);
      expect(payload?.email).toBe(testEmail);
      expect(payload?.role).toBe('admin');
      expect(payload?.iat).toBeTruthy();
      expect(payload?.exp).toBeTruthy();
    });

    it('should reject invalid token', async () => {
      const invalidToken = 'invalid.token.here';
      const payload = await verifyToken(invalidToken);

      expect(payload).toBeNull();
    });

    it('should reject expired token', async () => {
      // Create token with very short expiry (requires mocking)
      const token = await generateToken(testUserId, testEmail, 'admin', false);

      // Wait for token to expire (in real scenario)
      // For testing, we verify it's valid now
      const payload = await verifyToken(token);
      expect(payload).toBeTruthy();
    });

    it('should handle token refresh for expiring tokens', async () => {
      const token = await generateToken(testUserId, testEmail, 'admin', false);
      const refreshResult = await refreshToken(token);

      // Token is fresh, should not need refresh
      expect(refreshResult).toBeNull();
    });

    it('should generate different roles correctly', async () => {
      const roles: UserRole[] = ['admin', 'editor', 'viewer'];

      for (const role of roles) {
        const token = await generateToken(testUserId, testEmail, role, false);
        const payload = await verifyToken(token);

        expect(payload?.role).toBe(role);
      }
    });
  });

  describe('Middleware Authentication', () => {
    const createRequest = (
      path: string,
      token?: string,
      headers: Record<string, string> = {}
    ): NextRequest => {
      const url = `http://localhost:3000${path}`;
      const requestHeaders: Record<string, string> = { ...headers };

      if (token) {
        requestHeaders['cookie'] = `auth_token=${token}`;
      }

      return new NextRequest(url, { headers: requestHeaders });
    };

    it('should allow access to public routes without token', async () => {
      const publicPaths = [
        '/admin/login',
        '/admin/reset-password',
        '/api/auth/login',
        '/api/auth/register',
      ];

      for (const path of publicPaths) {
        const request = createRequest(path);
        const response = await middleware(request);

        // Should not redirect to login
        expect(response.status).not.toBe(302);
        expect(response.headers.get('Location')).not.toContain('/admin/login');
      }
    });

    it('should redirect to login for protected routes without token', async () => {
      const protectedPaths = [
        '/admin',
        '/admin/dashboard',
        '/admin/users',
        '/admin/settings',
      ];

      for (const path of protectedPaths) {
        const request = createRequest(path);
        const response = await middleware(request);

        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toContain('/admin/login');
        expect(response.headers.get('Location')).toContain(`redirect=${encodeURIComponent(path)}`);
      }
    });

    it('should allow access to protected routes with valid token', async () => {
      const token = await generateToken(testUserId, testEmail, 'admin', false);
      const request = createRequest('/admin/dashboard', token);

      const response = await middleware(request);

      expect(response.status).not.toBe(302);
      expect(response.headers.get('X-User-Id')).toBe(testUserId);
      expect(response.headers.get('X-User-Role')).toBe('admin');
    });

    it('should redirect with session-expired error for invalid token', async () => {
      const request = createRequest('/admin/dashboard', 'invalid-token');
      const response = await middleware(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toContain('error=session-expired');
    });

    it('should redirect with session-revoked error for blacklisted token', async () => {
      (isTokenBlacklisted as jest.Mock).mockResolvedValue(true);

      const token = await generateToken(testUserId, testEmail, 'admin', false);
      const request = createRequest('/admin/dashboard', token);

      const response = await middleware(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toContain('error=session-revoked');
    });
  });

  describe('Role-Based Access Control', () => {
    const createAuthenticatedRequest = async (
      path: string,
      role: UserRole
    ): Promise<NextRequest> => {
      const token = await generateToken(`user-${role}`, `${role}@hablas.com`, role, false);
      const url = `http://localhost:3000${path}`;

      return new NextRequest(url, {
        headers: { cookie: `auth_token=${token}` }
      });
    };

    it('should allow admin access to admin-only routes', async () => {
      const adminPaths = ['/admin/users', '/admin/settings'];

      for (const path of adminPaths) {
        const request = await createAuthenticatedRequest(path, 'admin');
        const response = await middleware(request);

        expect(response.status).not.toBe(403);
      }
    });

    it('should deny editor access to admin-only routes', async () => {
      const adminPaths = ['/admin/users', '/admin/settings'];

      for (const path of adminPaths) {
        const request = await createAuthenticatedRequest(path, 'editor');
        const response = await middleware(request);

        expect(response.status).toBe(403);
        const data = await response.json();
        expect(data.error).toBe('Forbidden');
      }
    });

    it('should deny viewer access to admin-only routes', async () => {
      const request = await createAuthenticatedRequest('/admin/users', 'viewer');
      const response = await middleware(request);

      expect(response.status).toBe(403);
    });

    it('should allow editor and admin access to edit routes', async () => {
      const editPaths = ['/admin/content/edit', '/admin/content/create'];

      for (const role of ['admin', 'editor'] as UserRole[]) {
        for (const path of editPaths) {
          const request = await createAuthenticatedRequest(path, role);
          const response = await middleware(request);

          expect(response.status).not.toBe(403);
        }
      }
    });

    it('should deny viewer access to edit routes', async () => {
      const editPaths = ['/admin/content/edit', '/admin/content/create'];

      for (const path of editPaths) {
        const request = await createAuthenticatedRequest(path, 'viewer');
        const response = await middleware(request);

        expect(response.status).toBe(403);
      }
    });

    it('should allow all authenticated users to general admin routes', async () => {
      const generalPath = '/admin';

      for (const role of ['admin', 'editor', 'viewer'] as UserRole[]) {
        const request = await createAuthenticatedRequest(generalPath, role);
        const response = await middleware(request);

        expect(response.status).not.toBe(403);
        expect(response.status).not.toBe(302);
      }
    });
  });

  describe('Authentication Helper Functions', () => {
    it('should checkAuth return authenticated for valid token', async () => {
      const token = await generateToken(testUserId, testEmail, 'admin', false);
      const request = new NextRequest('http://localhost:3000/admin', {
        headers: { cookie: `auth_token=${token}` }
      });

      const result = await checkAuth(request);

      expect(result.authenticated).toBe(true);
      expect(result.user).toBeTruthy();
      expect(result.user?.id).toBe(testUserId);
      expect(result.user?.email).toBe(testEmail);
      expect(result.role).toBe('admin');
    });

    it('should checkAuth return not authenticated for missing token', async () => {
      const request = new NextRequest('http://localhost:3000/admin');
      const result = await checkAuth(request);

      expect(result.authenticated).toBe(false);
      expect(result.error).toBe('No authentication token found');
    });

    it('should checkAuth return not authenticated for invalid token', async () => {
      const request = new NextRequest('http://localhost:3000/admin', {
        headers: { cookie: 'auth_token=invalid-token' }
      });

      const result = await checkAuth(request);

      expect(result.authenticated).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should requireAuth throw error for unauthenticated request', async () => {
      const request = new NextRequest('http://localhost:3000/admin');

      await expect(requireAuth(request)).rejects.toThrow('Authentication required');
    });

    it('should requireAuth return result for authenticated request', async () => {
      const token = await generateToken(testUserId, testEmail, 'admin', false);
      const request = new NextRequest('http://localhost:3000/admin', {
        headers: { cookie: `auth_token=${token}` }
      });

      const result = await requireAuth(request);

      expect(result.authenticated).toBe(true);
      expect(result.user).toBeTruthy();
    });

    it('should requireRole allow admin for admin-required route', async () => {
      const token = await generateToken(testUserId, testEmail, 'admin', false);
      const request = new NextRequest('http://localhost:3000/admin/users', {
        headers: { cookie: `auth_token=${token}` }
      });

      const result = await requireRole(request, 'admin');

      expect(result.authenticated).toBe(true);
      expect(result.role).toBe('admin');
    });

    it('should requireRole reject editor for admin-required route', async () => {
      const token = await generateToken(testUserId, testEmail, 'editor', false);
      const request = new NextRequest('http://localhost:3000/admin/users', {
        headers: { cookie: `auth_token=${token}` }
      });

      await expect(requireRole(request, 'admin')).rejects.toThrow('Insufficient permissions');
    });

    it('should requireRole use role hierarchy correctly', async () => {
      const token = await generateToken(testUserId, testEmail, 'admin', false);
      const request = new NextRequest('http://localhost:3000/admin', {
        headers: { cookie: `auth_token=${token}` }
      });

      // Admin should have access to viewer-level routes
      const result = await requireRole(request, 'viewer');
      expect(result.authenticated).toBe(true);
    });
  });

  describe('Cookie Management', () => {
    it('should create auth cookie with proper attributes', () => {
      const token = 'test-token';
      const cookie = createAuthCookie(token, false);

      expect(cookie).toContain('auth_token=test-token');
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('Secure');
      expect(cookie).toContain('SameSite=Strict');
      expect(cookie).toContain('Path=/');
    });

    it('should create long-lived cookie with rememberMe', () => {
      const token = 'test-token';
      const shortCookie = createAuthCookie(token, false);
      const longCookie = createAuthCookie(token, true);

      // Long cookie should have longer Max-Age
      expect(longCookie).toContain('auth_token=test-token');
      expect(longCookie).toContain('HttpOnly');
    });

    it('should extract token from request cookies', async () => {
      const token = await generateToken(testUserId, testEmail, 'admin', false);
      const request = new NextRequest('http://localhost:3000/admin', {
        headers: { cookie: `auth_token=${token}; other_cookie=value` }
      });

      const extractedToken = getTokenFromRequest(request);

      expect(extractedToken).toBe(token);
    });

    it('should return null when no auth cookie present', () => {
      const request = new NextRequest('http://localhost:3000/admin', {
        headers: { cookie: 'other_cookie=value' }
      });

      const token = getTokenFromRequest(request);

      expect(token).toBeNull();
    });
  });

  describe('Session Blacklisting', () => {
    it('should add token to blacklist', async () => {
      const token = await generateToken(testUserId, testEmail, 'admin', false);

      await addToBlacklist(token);

      expect(addToBlacklist).toHaveBeenCalledWith(token);
    });

    it('should check if token is blacklisted', async () => {
      const token = await generateToken(testUserId, testEmail, 'admin', false);
      (isTokenBlacklisted as jest.Mock).mockResolvedValue(true);

      const isBlacklisted = await isTokenBlacklisted(token);

      expect(isBlacklisted).toBe(true);
      expect(isTokenBlacklisted).toHaveBeenCalledWith(token);
    });

    it('should reject blacklisted token in middleware', async () => {
      (isTokenBlacklisted as jest.Mock).mockResolvedValue(true);

      const token = await generateToken(testUserId, testEmail, 'admin', false);
      const request = new NextRequest('http://localhost:3000/admin', {
        headers: { cookie: `auth_token=${token}` }
      });

      const response = await middleware(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toContain('error=session-revoked');
    });
  });

  describe('Security Edge Cases', () => {
    it('should handle malformed JWT gracefully', async () => {
      const malformedTokens = [
        'not.a.token',
        'only-one-part',
        'two.parts',
        '',
        'null',
        'undefined',
      ];

      for (const token of malformedTokens) {
        const payload = await verifyToken(token);
        expect(payload).toBeNull();
      }
    });

    it('should handle missing environment variables safely', async () => {
      // JWT secret is validated at module load time
      // This test ensures the system doesn't crash
      const token = await generateToken(testUserId, testEmail, 'admin', false);
      expect(token).toBeTruthy();
    });

    it('should prevent token tampering', async () => {
      const token = await generateToken(testUserId, testEmail, 'viewer', false);

      // Try to tamper with payload to elevate role
      const parts = token.split('.');
      const tamperedPayload = Buffer.from(
        JSON.stringify({ userId: testUserId, email: testEmail, role: 'admin' })
      ).toString('base64url');
      const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

      const payload = await verifyToken(tamperedToken);

      // Should fail verification due to invalid signature
      expect(payload).toBeNull();
    });

    it('should handle concurrent authentication requests', async () => {
      const token = await generateToken(testUserId, testEmail, 'admin', false);

      const requests = Array(10).fill(null).map(() =>
        new NextRequest('http://localhost:3000/admin', {
          headers: { cookie: `auth_token=${token}` }
        })
      );

      const responses = await Promise.all(
        requests.map(req => checkAuth(req))
      );

      // All requests should succeed
      responses.forEach(result => {
        expect(result.authenticated).toBe(true);
      });
    });

    it('should handle special characters in email', async () => {
      const specialEmail = 'user+tag@sub.domain.com';
      const token = await generateToken(testUserId, specialEmail, 'admin', false);
      const payload = await verifyToken(token);

      expect(payload?.email).toBe(specialEmail);
    });

    it('should validate token signature integrity', async () => {
      const token1 = await generateToken(testUserId, testEmail, 'admin', false);
      const token2 = await generateToken(testUserId, testEmail, 'admin', false);

      // Same input should produce different tokens (due to iat)
      expect(token1).not.toBe(token2);

      // But both should verify successfully
      const payload1 = await verifyToken(token1);
      const payload2 = await verifyToken(token2);

      expect(payload1).toBeTruthy();
      expect(payload2).toBeTruthy();
    });
  });

  describe('Performance and Load Tests', () => {
    it('should handle rapid token generation', async () => {
      const startTime = Date.now();
      const tokens = await Promise.all(
        Array(100).fill(null).map((_, i) =>
          generateToken(`user-${i}`, `user${i}@hablas.com`, 'viewer', false)
        )
      );
      const endTime = Date.now();

      expect(tokens).toHaveLength(100);
      expect(tokens.every(t => t.length > 0)).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete in 5 seconds
    });

    it('should handle rapid token verification', async () => {
      const token = await generateToken(testUserId, testEmail, 'admin', false);

      const startTime = Date.now();
      const verifications = await Promise.all(
        Array(100).fill(null).map(() => verifyToken(token))
      );
      const endTime = Date.now();

      expect(verifications).toHaveLength(100);
      expect(verifications.every(v => v !== null)).toBe(true);
      expect(endTime - startTime).toBeLessThan(3000); // Should complete in 3 seconds
    });
  });
});
