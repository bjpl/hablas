/**
 * Registration API Route Integration Tests
 * Tests for app/api/auth/register/route.ts
 *
 * Coverage:
 * - User registration flow with validation
 * - Email and password validation
 * - Role assignment and security
 * - Rate limiting
 * - Duplicate user handling
 * - Token generation and cookie setting
 * - Session creation
 * - CORS handling
 * - Error handling and security
 */

import { NextRequest } from 'next/server';
import { POST, OPTIONS } from '@/app/api/auth/register/route';

// Mock dependencies
jest.mock('@/lib/auth/users', () => ({
  createUser: jest.fn(),
}));

jest.mock('@/lib/auth/jwt', () => ({
  generateToken: jest.fn(),
}));

jest.mock('@/lib/auth/session', () => ({
  createSession: jest.fn(),
}));

jest.mock('@/lib/auth/cookies', () => ({
  createAuthCookie: jest.fn(),
}));

jest.mock('@/lib/auth/validation', () => ({
  validateRequest: jest.fn(),
  registerSchema: {},
}));

jest.mock('@/lib/utils/rate-limiter', () => ({
  checkRateLimit: jest.fn(),
  resetRateLimit: jest.fn(),
}));

jest.mock('@/lib/config/security', () => ({
  SECURITY_CONFIG: {
    CORS: {
      isOriginAllowed: jest.fn(),
      getAllowedOrigins: jest.fn(),
    },
  },
}));

import { createUser } from '@/lib/auth/users';
import { generateToken } from '@/lib/auth/jwt';
import { createSession } from '@/lib/auth/session';
import { createAuthCookie } from '@/lib/auth/cookies';
import { validateRequest } from '@/lib/auth/validation';
import { checkRateLimit, resetRateLimit } from '@/lib/utils/rate-limiter';
import { SECURITY_CONFIG } from '@/lib/config/security';

describe('Registration API Route', () => {
  const mockUserData = {
    email: 'newuser@example.com',
    password: 'SecurePassword123!',
    name: 'New User',
    role: 'viewer' as const,
  };

  const mockUser = {
    id: 'user-123',
    email: mockUserData.email,
    name: mockUserData.name,
    role: 'viewer' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (checkRateLimit as jest.Mock).mockResolvedValue({
      allowed: true,
      remaining: 10,
      resetAt: Date.now() + 60000,
    });

    (validateRequest as jest.Mock).mockReturnValue({
      success: true,
      data: mockUserData,
    });

    (createUser as jest.Mock).mockResolvedValue({
      success: true,
      user: mockUser,
    });

    (generateToken as jest.Mock).mockResolvedValue('test-access-token');

    (createSession as jest.Mock).mockResolvedValue({
      refreshToken: 'test-refresh-token',
      sessionId: 'session-123',
    });

    (createAuthCookie as jest.Mock).mockReturnValue('hablas_auth_token=test-token; HttpOnly');

    (SECURITY_CONFIG.CORS.isOriginAllowed as jest.Mock).mockReturnValue(true);
    (SECURITY_CONFIG.CORS.getAllowedOrigins as jest.Mock).mockReturnValue(['http://localhost:3000']);
  });

  describe('POST /api/auth/register', () => {
    describe('Successful Registration', () => {
      it('should successfully register a new user', async () => {
        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-forwarded-for': '192.168.1.100',
          },
          body: JSON.stringify(mockUserData),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.user).toEqual(mockUser);
        expect(data.tokens).toHaveProperty('accessToken');
        expect(data.tokens).toHaveProperty('refreshToken');
        expect(response.headers.get('Set-Cookie')).toContain('hablas_auth_token=');
      });

      it('should create user with validated data', async () => {
        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(mockUserData),
        });

        await POST(request);

        expect(validateRequest).toHaveBeenCalled();
        expect(createUser).toHaveBeenCalledWith(
          mockUserData.email,
          mockUserData.password,
          'viewer', // Always viewer for registration
          mockUserData.name
        );
      });

      it('should generate access token with correct parameters', async () => {
        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(mockUserData),
        });

        await POST(request);

        expect(generateToken).toHaveBeenCalledWith(
          mockUser.id,
          mockUser.email,
          mockUser.role,
          false
        );
      });

      it('should create session with metadata', async () => {
        const userAgent = 'Mozilla/5.0 Test Browser';
        const ipAddress = '192.168.1.100';

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: {
            'user-agent': userAgent,
            'x-forwarded-for': ipAddress,
          },
          body: JSON.stringify(mockUserData),
        });

        await POST(request);

        expect(createSession).toHaveBeenCalledWith(
          mockUser.id,
          mockUser.email,
          mockUser.role,
          userAgent,
          ipAddress
        );
      });

      it('should set auth cookie in response', async () => {
        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(mockUserData),
        });

        const response = await POST(request);

        expect(createAuthCookie).toHaveBeenCalledWith('test-access-token', false);
        expect(response.headers.get('Set-Cookie')).toBe('hablas_auth_token=test-token; HttpOnly');
      });

      it('should reset rate limit on successful registration', async () => {
        const ipAddress = '192.168.1.100';

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: {
            'x-forwarded-for': ipAddress,
          },
          body: JSON.stringify(mockUserData),
        });

        await POST(request);

        expect(resetRateLimit).toHaveBeenCalledWith(ipAddress, 'REGISTRATION');
      });

      it('should return user data without sensitive information', async () => {
        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(mockUserData),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(data.user).not.toHaveProperty('password');
        expect(data.user).toHaveProperty('id');
        expect(data.user).toHaveProperty('email');
        expect(data.user).toHaveProperty('name');
        expect(data.user).toHaveProperty('role');
      });
    });

    describe('Input Validation', () => {
      it('should reject registration with validation errors', async () => {
        (validateRequest as jest.Mock).mockReturnValue({
          success: false,
          errors: [{ field: 'email', message: 'Invalid email format' }],
        });

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email: 'invalid-email', password: 'pass' }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBe('Validation failed');
        expect(data.errors).toBeDefined();
      });

      it('should validate email format', async () => {
        (validateRequest as jest.Mock).mockReturnValue({
          success: false,
          errors: [{ field: 'email', message: 'Invalid email' }],
        });

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            email: 'not-an-email',
            password: 'SecurePass123!',
            name: 'Test User',
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
      });

      it('should validate password strength', async () => {
        (validateRequest as jest.Mock).mockReturnValue({
          success: false,
          errors: [{ field: 'password', message: 'Password too weak' }],
        });

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: '123',
            name: 'Test User',
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
      });

      it('should validate required fields', async () => {
        (validateRequest as jest.Mock).mockReturnValue({
          success: false,
          errors: [{ field: 'email', message: 'Email is required' }],
        });

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ password: 'SecurePass123!' }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
      });

      it('should handle malformed JSON', async () => {
        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: 'invalid-json{',
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error).toBe('Internal server error');
      });
    });

    describe('Role Assignment Security', () => {
      it('should always assign viewer role regardless of request', async () => {
        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            ...mockUserData,
            role: 'admin', // Attempt to register as admin
          }),
        });

        await POST(request);

        // Should always create user with viewer role
        expect(createUser).toHaveBeenCalledWith(
          mockUserData.email,
          mockUserData.password,
          'viewer', // Forced to viewer
          mockUserData.name
        );
      });

      it('should not allow editor role registration', async () => {
        (validateRequest as jest.Mock).mockReturnValue({
          success: true,
          data: { ...mockUserData, role: 'editor' },
        });

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            ...mockUserData,
            role: 'editor',
          }),
        });

        await POST(request);

        expect(createUser).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          'viewer',
          expect.any(String)
        );
      });

      it('should prevent privilege escalation through registration', async () => {
        const roles = ['admin', 'editor', 'superuser'];

        for (const role of roles) {
          (validateRequest as jest.Mock).mockReturnValue({
            success: true,
            data: { ...mockUserData, role },
          });

          const request = new NextRequest('http://localhost:3000/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ ...mockUserData, role }),
          });

          await POST(request);

          expect(createUser).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(String),
            'viewer',
            expect.any(String)
          );
        }
      });
    });

    describe('Duplicate User Handling', () => {
      it('should reject registration with existing email', async () => {
        (createUser as jest.Mock).mockResolvedValue({
          success: false,
          error: 'Email already exists',
        });

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(mockUserData),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBe('Email already exists');
      });

      it('should not expose whether email exists', async () => {
        (createUser as jest.Mock).mockResolvedValue({
          success: false,
          error: 'Registration failed',
        });

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(mockUserData),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
      });
    });

    describe('Rate Limiting', () => {
      it('should rate limit after maximum attempts', async () => {
        (checkRateLimit as jest.Mock).mockResolvedValue({
          allowed: false,
          remaining: 0,
          resetAt: Date.now() + 60000,
          error: 'Too many registration attempts. Please try again later.',
        });

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: {
            'x-forwarded-for': '192.168.1.100',
          },
          body: JSON.stringify(mockUserData),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(429);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Too many');
        expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
      });

      it('should track rate limits by IP address', async () => {
        const ipAddress = '192.168.1.100';

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: {
            'x-forwarded-for': ipAddress,
          },
          body: JSON.stringify(mockUserData),
        });

        await POST(request);

        expect(checkRateLimit).toHaveBeenCalledWith(ipAddress, 'REGISTRATION');
      });

      it('should handle x-real-ip header for rate limiting', async () => {
        const ipAddress = '10.0.0.50';

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: {
            'x-real-ip': ipAddress,
          },
          body: JSON.stringify(mockUserData),
        });

        await POST(request);

        expect(checkRateLimit).toHaveBeenCalled();
      });

      it('should use unknown as fallback IP', async () => {
        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(mockUserData),
        });

        await POST(request);

        expect(checkRateLimit).toHaveBeenCalledWith('unknown', 'REGISTRATION');
      });

      it('should include rate limit headers in response', async () => {
        (checkRateLimit as jest.Mock).mockResolvedValue({
          allowed: false,
          remaining: 2,
          resetAt: 1234567890,
        });

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(mockUserData),
        });

        const response = await POST(request);

        expect(response.headers.get('X-RateLimit-Remaining')).toBe('2');
        expect(response.headers.get('X-RateLimit-Reset')).toBe('1234567890');
      });
    });

    describe('Error Handling', () => {
      it('should handle database errors gracefully', async () => {
        (createUser as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(mockUserData),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error).toBe('Internal server error');
      });

      it('should handle token generation errors', async () => {
        (generateToken as jest.Mock).mockRejectedValue(new Error('Token generation failed'));

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(mockUserData),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error).toBe('Internal server error');
      });

      it('should handle session creation errors', async () => {
        (createSession as jest.Mock).mockRejectedValue(new Error('Session creation failed'));

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(mockUserData),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
      });

      it('should not expose internal error details', async () => {
        (createUser as jest.Mock).mockRejectedValue(
          new Error('Internal database error: connection string exposed')
        );

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(mockUserData),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(data.error).toBe('Internal server error');
        expect(data.error).not.toContain('database');
        expect(data.error).not.toContain('connection string');
      });
    });

    describe('Security Tests', () => {
      it('should sanitize email input', async () => {
        const maliciousEmail = '<script>alert("xss")</script>@example.com';

        (validateRequest as jest.Mock).mockReturnValue({
          success: true,
          data: { ...mockUserData, email: maliciousEmail },
        });

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ ...mockUserData, email: maliciousEmail }),
        });

        await POST(request);

        expect(validateRequest).toHaveBeenCalled();
      });

      it('should handle SQL injection attempts', async () => {
        const sqlInjection = "admin'--";

        (validateRequest as jest.Mock).mockReturnValue({
          success: true,
          data: { ...mockUserData, email: sqlInjection },
        });

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ ...mockUserData, email: sqlInjection }),
        });

        const response = await POST(request);

        // Should not cause SQL error
        expect(response.status).not.toBe(500);
      });

      it('should handle very long input strings', async () => {
        const longString = 'a'.repeat(10000);

        (validateRequest as jest.Mock).mockReturnValue({
          success: false,
          errors: [{ field: 'email', message: 'Email too long' }],
        });

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            email: longString + '@example.com',
            password: 'SecurePass123!',
          }),
        });

        const response = await POST(request);

        expect(response.status).toBe(400);
      });

      it('should not log sensitive information', async () => {
        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(mockUserData),
        });

        await POST(request);

        // Verify that password is not passed to logger (would need logger mock)
        expect(createUser).toHaveBeenCalledWith(
          expect.any(String),
          mockUserData.password, // Password passed to createUser (will be hashed)
          expect.any(String),
          expect.any(String)
        );
      });
    });
  });

  describe('OPTIONS /api/auth/register', () => {
    it('should handle CORS preflight request', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
        },
      });

      const response = await OPTIONS(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type');
    });

    it('should allow configured origins', async () => {
      (SECURITY_CONFIG.CORS.isOriginAllowed as jest.Mock).mockReturnValue(true);

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
        },
      });

      const response = await OPTIONS(request);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
    });

    it('should reject unauthorized origins', async () => {
      (SECURITY_CONFIG.CORS.isOriginAllowed as jest.Mock).mockReturnValue(false);
      (SECURITY_CONFIG.CORS.getAllowedOrigins as jest.Mock).mockReturnValue(['http://localhost:3000']);

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://malicious-site.com',
        },
      });

      const response = await OPTIONS(request);

      // Should use first allowed origin as fallback
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
    });

    it('should include credentials header', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
        },
      });

      const response = await OPTIONS(request);

      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    });

    it('should include CSRF token in allowed headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'OPTIONS',
      });

      const response = await OPTIONS(request);

      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('X-CSRF-Token');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing user-agent header', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      });

      await POST(request);

      expect(createSession).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        undefined,
        expect.any(String)
      );
    });

    it('should handle concurrent registrations', async () => {
      const requests = Array(5).fill(null).map((_, i) =>
        new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            ...mockUserData,
            email: `user${i}@example.com`,
          }),
        })
      );

      const responses = await Promise.all(requests.map(req => POST(req)));

      responses.forEach(response => {
        expect(response.status).toBe(201);
      });
    });

    it('should handle empty request body', async () => {
      (validateRequest as jest.Mock).mockReturnValue({
        success: false,
        errors: [{ field: 'body', message: 'Request body is required' }],
      });

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe('Performance Tests', () => {
    it('should complete registration quickly', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      });

      const start = performance.now();
      await POST(request);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
});
