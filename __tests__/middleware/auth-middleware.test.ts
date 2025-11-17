/**
 * Authentication Middleware Tests
 * Tests for middleware.ts
 *
 * Coverage:
 * - Protected route authentication
 * - Public route access
 * - Token verification
 * - Token refresh flow
 * - Redirect handling
 * - Error scenarios
 */

import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

// Mock dependencies
jest.mock('@/lib/auth/cookies', () => ({
  getTokenFromRequest: jest.fn(),
  createAuthCookie: jest.fn(),
}));

jest.mock('@/lib/auth/jwt', () => ({
  verifyToken: jest.fn(),
  refreshToken: jest.fn(),
}));

import { getTokenFromRequest, createAuthCookie } from '@/lib/auth/cookies';
import { verifyToken, refreshToken } from '@/lib/auth/jwt';

describe('Authentication Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Public Routes', () => {
    it('should allow access to login page', async () => {
      const request = new NextRequest('http://localhost:3000/admin/login');

      const response = await middleware(request);

      expect(response.status).not.toBe(307); // Not redirected
    });

    it('should allow access to auth API routes', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login');

      const response = await middleware(request);

      expect(response.status).not.toBe(307);
    });

    it('should allow access to static files', async () => {
      const request = new NextRequest('http://localhost:3000/_next/static/css/main.css');

      const response = await middleware(request);

      expect(response.status).not.toBe(307);
    });

    it('should allow access to images', async () => {
      const request = new NextRequest('http://localhost:3000/logo.png');

      const response = await middleware(request);

      expect(response.status).not.toBe(307);
    });

    it('should allow access to favicon', async () => {
      const request = new NextRequest('http://localhost:3000/favicon.ico');

      const response = await middleware(request);

      expect(response.status).not.toBe(307);
    });
  });

  describe('Protected Routes - Unauthenticated', () => {
    beforeEach(() => {
      (getTokenFromRequest as jest.Mock).mockReturnValue(null);
    });

    it('should redirect to login when accessing /admin without token', async () => {
      const request = new NextRequest('http://localhost:3000/admin/dashboard');

      const response = await middleware(request);

      expect(response.status).toBe(307); // Temporary redirect
      const location = response.headers.get('location');
      expect(location).toContain('/admin/login');
      expect(location).toContain('redirect=%2Fadmin%2Fdashboard');
    });

    it('should redirect to login when accessing /api/content without token', async () => {
      const request = new NextRequest('http://localhost:3000/api/content/resources');

      const response = await middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/admin/login');
    });

    it('should include redirect parameter in login URL', async () => {
      const request = new NextRequest('http://localhost:3000/admin/settings/profile');

      const response = await middleware(request);

      const location = response.headers.get('location');
      expect(location).toContain('redirect=');
      expect(decodeURIComponent(location!)).toContain('/admin/settings/profile');
    });
  });

  describe('Protected Routes - Valid Token', () => {
    beforeEach(() => {
      (getTokenFromRequest as jest.Mock).mockReturnValue('valid-token');
      (verifyToken as jest.Mock).mockResolvedValue({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 86400, // Expires in 24 hours
        iat: Math.floor(Date.now() / 1000),
      });
      (refreshToken as jest.Mock).mockResolvedValue(null); // No refresh needed
    });

    it('should allow access to /admin with valid token', async () => {
      const request = new NextRequest('http://localhost:3000/admin/dashboard');

      const response = await middleware(request);

      expect(response.status).not.toBe(307);
      expect(verifyToken).toHaveBeenCalledWith('valid-token');
    });

    it('should allow access to /api/content with valid token', async () => {
      const request = new NextRequest('http://localhost:3000/api/content/resources');

      const response = await middleware(request);

      expect(response.status).not.toBe(307);
    });

    it('should verify token on each request', async () => {
      const request = new NextRequest('http://localhost:3000/admin/dashboard');

      await middleware(request);

      expect(getTokenFromRequest).toHaveBeenCalledWith(request);
      expect(verifyToken).toHaveBeenCalledWith('valid-token');
    });
  });

  describe('Protected Routes - Invalid Token', () => {
    beforeEach(() => {
      (getTokenFromRequest as jest.Mock).mockReturnValue('invalid-token');
      (verifyToken as jest.Mock).mockResolvedValue(null);
    });

    it('should redirect to login with expired token', async () => {
      const request = new NextRequest('http://localhost:3000/admin/dashboard');

      const response = await middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/admin/login');
      expect(location).toContain('error=session-expired');
    });

    it('should redirect to login with malformed token', async () => {
      const request = new NextRequest('http://localhost:3000/admin/settings');

      const response = await middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/admin/login');
    });

    it('should include original path in redirect', async () => {
      const request = new NextRequest('http://localhost:3000/admin/users/edit/123');

      const response = await middleware(request);

      const location = response.headers.get('location');
      expect(decodeURIComponent(location!)).toContain('/admin/users/edit/123');
    });
  });

  describe('Token Refresh', () => {
    beforeEach(() => {
      (getTokenFromRequest as jest.Mock).mockReturnValue('expiring-token');
      (verifyToken as jest.Mock).mockResolvedValue({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
        iat: Math.floor(Date.now() / 1000),
      });
    });

    it('should refresh token when close to expiry', async () => {
      (refreshToken as jest.Mock).mockResolvedValue('new-refreshed-token');
      (createAuthCookie as jest.Mock).mockReturnValue('auth_token=new-refreshed-token; HttpOnly');

      const request = new NextRequest('http://localhost:3000/admin/dashboard');

      const response = await middleware(request);

      expect(refreshToken).toHaveBeenCalledWith('expiring-token');
      expect(createAuthCookie).toHaveBeenCalledWith('new-refreshed-token', false);
      expect(response.headers.get('Set-Cookie')).toContain('auth_token=new-refreshed-token');
    });

    it('should not refresh token when not needed', async () => {
      (refreshToken as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/admin/dashboard');

      const response = await middleware(request);

      expect(refreshToken).toHaveBeenCalledWith('expiring-token');
      expect(createAuthCookie).not.toHaveBeenCalled();
      expect(response.headers.get('Set-Cookie')).toBeNull();
    });

    it('should handle refresh failure gracefully', async () => {
      (refreshToken as jest.Mock).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/admin/dashboard');

      const response = await middleware(request);

      // Should still allow access if original token is valid
      expect(response.status).not.toBe(307);
    });
  });

  describe('Edge Cases', () => {
    it('should handle requests without cookies', async () => {
      (getTokenFromRequest as jest.Mock).mockReturnValue(null);

      const request = new NextRequest('http://localhost:3000/admin/dashboard');

      const response = await middleware(request);

      expect(response.status).toBe(307);
    });

    it('should handle malformed URLs gracefully', async () => {
      (getTokenFromRequest as jest.Mock).mockReturnValue(null);

      const request = new NextRequest('http://localhost:3000/admin//dashboard');

      const response = await middleware(request);

      expect(response.status).toBe(307);
    });

    it('should handle query parameters in protected routes', async () => {
      (getTokenFromRequest as jest.Mock).mockReturnValue(null);

      const request = new NextRequest('http://localhost:3000/admin/dashboard?tab=analytics&view=summary');

      const response = await middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('redirect=');
    });

    it('should handle hash fragments in URLs', async () => {
      (getTokenFromRequest as jest.Mock).mockReturnValue('valid-token');
      (verifyToken as jest.Mock).mockResolvedValue({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 86400,
        iat: Math.floor(Date.now() / 1000),
      });
      (refreshToken as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/admin/dashboard#section');

      const response = await middleware(request);

      expect(response.status).not.toBe(307);
    });
  });

  describe('Performance', () => {
    it('should process public routes quickly', async () => {
      const request = new NextRequest('http://localhost:3000/admin/login');

      const start = performance.now();
      await middleware(request);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it('should handle concurrent requests efficiently', async () => {
      (getTokenFromRequest as jest.Mock).mockReturnValue('valid-token');
      (verifyToken as jest.Mock).mockResolvedValue({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 86400,
        iat: Math.floor(Date.now() / 1000),
      });
      (refreshToken as jest.Mock).mockResolvedValue(null);

      const requests = Array(50).fill(null).map(() =>
        new NextRequest('http://localhost:3000/admin/dashboard')
      );

      const start = performance.now();
      await Promise.all(requests.map(req => middleware(req)));
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(5000); // 50 requests in under 5 seconds
    });
  });

  describe('Security', () => {
    it('should not expose token in redirect URLs', async () => {
      (getTokenFromRequest as jest.Mock).mockReturnValue('secret-token');
      (verifyToken as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/admin/dashboard');

      const response = await middleware(request);

      const location = response.headers.get('location');
      expect(location).not.toContain('secret-token');
    });

    it('should handle extremely long paths', async () => {
      const longPath = '/admin/' + 'a'.repeat(10000);
      (getTokenFromRequest as jest.Mock).mockReturnValue(null);

      const request = new NextRequest(`http://localhost:3000${longPath}`);

      const response = await middleware(request);

      expect(response.status).toBe(307);
    });

    it('should sanitize redirect parameter', async () => {
      (getTokenFromRequest as jest.Mock).mockReturnValue(null);

      const request = new NextRequest('http://localhost:3000/admin/dashboard?redirect=javascript:alert(1)');

      const response = await middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      // Should not include malicious redirect
      expect(location).not.toContain('javascript:');
    });
  });
});
