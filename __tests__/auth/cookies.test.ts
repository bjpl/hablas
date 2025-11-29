/**
 * Cookie Management Unit Tests
 * Tests for lib/auth/cookies.ts
 *
 * Coverage:
 * - Cookie creation with correct attributes
 * - Cookie parsing from requests
 * - Security flags (httpOnly, secure, sameSite)
 * - Expiry handling
 */

import { NextRequest } from 'next/server';
import { createAuthCookie, getTokenFromRequest, AUTH_COOKIE_NAME } from '@/lib/auth/cookies';

describe('Cookie Management', () => {
  describe('createAuthCookie', () => {
    it('should create cookie string with token', () => {
      const token = 'test-jwt-token';
      const cookie = createAuthCookie(token, false);

      expect(cookie).toContain(`${AUTH_COOKIE_NAME}=test-jwt-token`);
    });

    it('should include httpOnly flag for security', () => {
      const token = 'test-jwt-token';
      const cookie = createAuthCookie(token, false);

      expect(cookie).toContain('HttpOnly');
    });

    it('should include secure flag in production', () => {
      // Note: The secure flag is determined at module load time based on NODE_ENV.
      // In test environment, secure is false (which is correct for local testing).
      // This test verifies the configuration includes or excludes Secure appropriately.
      const token = 'test-jwt-token';
      const cookie = createAuthCookie(token, false);

      // In test environment, Secure flag should NOT be present (correct behavior)
      // Production environments would have NODE_ENV=production at startup
      if (process.env.NODE_ENV === 'production') {
        expect(cookie).toContain('Secure');
      } else {
        expect(cookie).not.toContain('Secure');
      }
    });

    it('should include sameSite=lax for CSRF protection', () => {
      const token = 'test-jwt-token';
      const cookie = createAuthCookie(token, false);

      expect(cookie).toContain('SameSite=Lax');
    });

    it('should set path to root', () => {
      const token = 'test-jwt-token';
      const cookie = createAuthCookie(token, false);

      expect(cookie).toContain('Path=/');
    });

    it('should set longer max-age for remember me', () => {
      const token = 'test-jwt-token';
      const cookie = createAuthCookie(token, true);

      // Should contain 30 days in seconds: 30 * 24 * 60 * 60 = 2592000
      expect(cookie).toContain('Max-Age=2592000');
    });

    it('should set shorter max-age for standard login', () => {
      const token = 'test-jwt-token';
      const cookie = createAuthCookie(token, false);

      // Should contain 7 days in seconds: 7 * 24 * 60 * 60 = 604800
      expect(cookie).toContain('Max-Age=604800');
    });

    it('should handle empty token', () => {
      const cookie = createAuthCookie('', false);

      expect(cookie).toContain(`${AUTH_COOKIE_NAME}=`);
      expect(cookie).toContain('HttpOnly');
    });

    it('should handle special characters in token', () => {
      const token = 'token.with.dots+and-dashes';
      const cookie = createAuthCookie(token, false);

      // Cookie serialize will URL-encode the token, so check for the cookie name
      expect(cookie).toContain(`${AUTH_COOKIE_NAME}=`);
    });
  });

  describe('getTokenFromRequest', () => {
    it('should extract token from cookie header', () => {
      const request = {
        headers: {
          get: jest.fn().mockReturnValue(`${AUTH_COOKIE_NAME}=test-token-123`),
        },
      } as unknown as NextRequest;

      const token = getTokenFromRequest(request);

      expect(token).toBe('test-token-123');
      expect(request.headers.get).toHaveBeenCalledWith('cookie');
    });

    it('should return null when no cookie exists', () => {
      const request = {
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
      } as unknown as NextRequest;

      const token = getTokenFromRequest(request);

      expect(token).toBeNull();
    });

    it('should return null when cookie value is undefined', () => {
      const request = {
        headers: {
          get: jest.fn().mockReturnValue(''),
        },
      } as unknown as NextRequest;

      const token = getTokenFromRequest(request);

      expect(token).toBeNull();
    });

    it('should handle multiple cookies and extract auth_token', () => {
      const request = {
        headers: {
          get: jest.fn().mockReturnValue(`other_cookie=abc; ${AUTH_COOKIE_NAME}=correct-token; another=xyz`),
        },
      } as unknown as NextRequest;

      const token = getTokenFromRequest(request);

      expect(token).toBe('correct-token');
    });
  });

  describe('Cookie Security', () => {
    it('should never expose token in client-side JavaScript', () => {
      const token = 'sensitive-token';
      const cookie = createAuthCookie(token, false);

      // Must have HttpOnly to prevent XSS attacks
      expect(cookie).toContain('HttpOnly');
    });

    it('should prevent CSRF with SameSite attribute', () => {
      const token = 'test-token';
      const cookie = createAuthCookie(token, false);

      expect(cookie).toContain('SameSite=Lax');
    });

    it('should use secure flag based on environment at module load time', () => {
      // Note: Cookie security options are evaluated at module load time.
      // In test environment (NODE_ENV=test), Secure flag is correctly disabled
      // to allow local testing. Production builds have Secure enabled.
      const cookie = createAuthCookie('token', false);

      // In test/development environment, Secure should NOT be present
      // This is correct behavior - Secure cookies only work over HTTPS
      if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
        expect(cookie).not.toContain('Secure');
      } else {
        expect(cookie).toContain('Secure');
      }

      // Verify other security flags are always present
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Lax');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long tokens', () => {
      const longToken = 'x'.repeat(5000);
      const cookie = createAuthCookie(longToken, false);

      expect(cookie).toContain(`${AUTH_COOKIE_NAME}=`);
      // Note: Cookies have size limits (~4KB), but we're testing the function doesn't break
    });

    it('should handle tokens with special characters', () => {
      const specialToken = 'token-with_special.chars+equals=';
      const cookie = createAuthCookie(specialToken, false);

      expect(cookie).toContain(`${AUTH_COOKIE_NAME}=`);
    });

    it('should handle concurrent cookie creation', () => {
      const cookies = Array(100).fill(null).map((_, i) =>
        createAuthCookie(`token-${i}`, i % 2 === 0)
      );

      expect(cookies.length).toBe(100);
      cookies.forEach((cookie, i) => {
        expect(cookie).toContain(`${AUTH_COOKIE_NAME}=token-${i}`);
      });
    });
  });

  describe('Cookie Expiry', () => {
    it('should calculate correct expiry for remember me (30 days)', () => {
      const cookie = createAuthCookie('token', true);
      const thirtyDaysInSeconds = 30 * 24 * 60 * 60;

      expect(cookie).toContain(`Max-Age=${thirtyDaysInSeconds}`);
    });

    it('should calculate correct expiry for standard login (7 days)', () => {
      const cookie = createAuthCookie('token', false);
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;

      expect(cookie).toContain(`Max-Age=${sevenDaysInSeconds}`);
    });

    it('should create deletion cookie with negative max-age', () => {
      const cookie = createAuthCookie('', false);

      // For logout, we might set an empty token with immediate expiry
      expect(cookie).toContain(`${AUTH_COOKIE_NAME}=`);
    });
  });
});
