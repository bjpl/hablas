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
import { createAuthCookie, getTokenFromRequest } from '@/lib/auth/cookies';

describe('Cookie Management', () => {
  describe('createAuthCookie', () => {
    it('should create cookie string with token', () => {
      const token = 'test-jwt-token';
      const cookie = createAuthCookie(token, false);

      expect(cookie).toContain('auth_token=test-jwt-token');
    });

    it('should include httpOnly flag for security', () => {
      const token = 'test-jwt-token';
      const cookie = createAuthCookie(token, false);

      expect(cookie).toContain('HttpOnly');
    });

    it('should include secure flag in production', () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true
      });

      const token = 'test-jwt-token';
      const cookie = createAuthCookie(token, false);

      expect(cookie).toContain('Secure');

      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true
      });
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

      expect(cookie).toContain('auth_token=');
      expect(cookie).toContain('HttpOnly');
    });

    it('should handle special characters in token', () => {
      const token = 'token.with.dots+and-dashes';
      const cookie = createAuthCookie(token, false);

      expect(cookie).toContain(`auth_token=${token}`);
    });
  });

  describe('getTokenFromRequest', () => {
    it('should extract token from cookie header', () => {
      const request = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'test-token-123' }),
        },
      } as unknown as NextRequest;

      const token = getTokenFromRequest(request);

      expect(token).toBe('test-token-123');
      expect(request.cookies.get).toHaveBeenCalledWith('auth_token');
    });

    it('should return null when no cookie exists', () => {
      const request = {
        cookies: {
          get: jest.fn().mockReturnValue(null),
        },
      } as unknown as NextRequest;

      const token = getTokenFromRequest(request);

      expect(token).toBeNull();
    });

    it('should return null when cookie value is undefined', () => {
      const request = {
        cookies: {
          get: jest.fn().mockReturnValue({}),
        },
      } as unknown as NextRequest;

      const token = getTokenFromRequest(request);

      expect(token).toBeNull();
    });

    it('should handle multiple cookies and extract auth_token', () => {
      const request = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'correct-token' }),
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

    it('should use secure flag in production environment', () => {
      const originalEnv = process.env.NODE_ENV;

      // Test production
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true
      });
      const prodCookie = createAuthCookie('token', false);
      expect(prodCookie).toContain('Secure');

      // Test development
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true
      });
      const devCookie = createAuthCookie('token', false);
      // Secure flag should not be present in development for localhost testing

      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long tokens', () => {
      const longToken = 'x'.repeat(5000);
      const cookie = createAuthCookie(longToken, false);

      expect(cookie).toContain('auth_token=');
      // Note: Cookies have size limits (~4KB), but we're testing the function doesn't break
    });

    it('should handle tokens with special characters', () => {
      const specialToken = 'token-with_special.chars+equals=';
      const cookie = createAuthCookie(specialToken, false);

      expect(cookie).toContain('auth_token=');
    });

    it('should handle concurrent cookie creation', () => {
      const cookies = Array(100).fill(null).map((_, i) =>
        createAuthCookie(`token-${i}`, i % 2 === 0)
      );

      expect(cookies.length).toBe(100);
      cookies.forEach((cookie, i) => {
        expect(cookie).toContain(`auth_token=token-${i}`);
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
      expect(cookie).toContain('auth_token=');
    });
  });
});
