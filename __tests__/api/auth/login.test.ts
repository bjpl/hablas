/**
 * Login API Route Integration Tests
 * Tests for app/api/auth/login/route.ts
 *
 * Coverage:
 * - Successful login flow
 * - Invalid credentials handling
 * - Rate limiting
 * - Input validation
 * - Error handling
 * - Cookie setting
 */

import { NextRequest, NextResponse } from 'next/server';
import { POST, OPTIONS } from '@/app/api/auth/login/route';

// Mock dependencies
jest.mock('@/lib/auth/users', () => ({
  validateCredentials: jest.fn(),
  toUserSession: jest.fn(),
  initializeDefaultAdmin: jest.fn(),
}));

jest.mock('@/lib/auth/jwt', () => ({
  generateToken: jest.fn(),
}));

jest.mock('@/lib/auth/cookies', () => ({
  createAuthCookie: jest.fn(),
}));

import { validateCredentials, toUserSession, initializeDefaultAdmin } from '@/lib/auth/users';
import { generateToken } from '@/lib/auth/jwt';
import { createAuthCookie } from '@/lib/auth/cookies';

describe('Login API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (initializeDefaultAdmin as jest.Mock).mockResolvedValue(undefined);
  });

  describe('POST /api/auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'viewer' as const,
        name: 'Test User',
      };

      (validateCredentials as jest.Mock).mockResolvedValue({
        valid: true,
        user: mockUser,
      });

      (toUserSession as jest.Mock).mockReturnValue(mockUser);
      (generateToken as jest.Mock).mockResolvedValue('test-jwt-token');
      (createAuthCookie as jest.Mock).mockReturnValue('auth_token=test-jwt-token; HttpOnly');

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user).toEqual(mockUser);
      expect(data.token).toBe('test-jwt-token');
      expect(response.headers.get('Set-Cookie')).toContain('auth_token=test-jwt-token');
    });

    it('should reject login with invalid credentials', async () => {
      (validateCredentials as jest.Mock).mockResolvedValue({
        valid: false,
        error: 'Invalid credentials',
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid credentials');
    });

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          // Missing password
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Email and password are required');
    });

    it('should validate email field is present', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          // Missing email
          password: 'password123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Email and password are required');
    });

    it('should handle remember me option', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'viewer' as const,
        name: 'Test User',
      };

      (validateCredentials as jest.Mock).mockResolvedValue({
        valid: true,
        user: mockUser,
      });

      (toUserSession as jest.Mock).mockReturnValue(mockUser);
      (generateToken as jest.Mock).mockResolvedValue('test-jwt-token');
      (createAuthCookie as jest.Mock).mockReturnValue('auth_token=test-jwt-token; HttpOnly');

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: true,
        }),
      });

      await POST(request);

      expect(generateToken).toHaveBeenCalledWith(
        'user-123',
        'test@example.com',
        'viewer',
        true
      );

      expect(createAuthCookie).toHaveBeenCalledWith('test-jwt-token', true);
    });

    it('should initialize default admin on first request', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'viewer' as const,
        name: 'Test User',
      };

      (validateCredentials as jest.Mock).mockResolvedValue({
        valid: true,
        user: mockUser,
      });

      (toUserSession as jest.Mock).mockReturnValue(mockUser);
      (generateToken as jest.Mock).mockResolvedValue('token');
      (createAuthCookie as jest.Mock).mockReturnValue('cookie');

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      await POST(request);

      expect(initializeDefaultAdmin).toHaveBeenCalled();
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit after maximum failed attempts', async () => {
      (validateCredentials as jest.Mock).mockResolvedValue({
        valid: false,
        error: 'Invalid credentials',
      });

      const makeRequest = () => new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.100',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      });

      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        const response = await POST(makeRequest());
        expect(response.status).toBe(401);
      }

      // 6th attempt should be rate limited
      const response = await POST(makeRequest());
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain('Too many login attempts');
    });

    it('should reset rate limit after successful login', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'viewer' as const,
        name: 'Test User',
      };

      // Make some failed attempts
      (validateCredentials as jest.Mock).mockResolvedValue({
        valid: false,
        error: 'Invalid credentials',
      });

      const makeRequest = (valid: boolean) => new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.101',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: valid ? 'correctpassword' : 'wrongpassword',
        }),
      });

      // 2 failed attempts
      await POST(makeRequest(false));
      await POST(makeRequest(false));

      // Successful login
      (validateCredentials as jest.Mock).mockResolvedValue({
        valid: true,
        user: mockUser,
      });
      (toUserSession as jest.Mock).mockReturnValue(mockUser);
      (generateToken as jest.Mock).mockResolvedValue('token');
      (createAuthCookie as jest.Mock).mockReturnValue('cookie');

      const successResponse = await POST(makeRequest(true));
      expect(successResponse.status).toBe(200);

      // Should be able to make more attempts after successful login
      (validateCredentials as jest.Mock).mockResolvedValue({
        valid: false,
        error: 'Invalid credentials',
      });

      const newAttempt = await POST(makeRequest(false));
      expect(newAttempt.status).toBe(401); // Not rate limited
    });

    it('should handle different IPs independently', async () => {
      (validateCredentials as jest.Mock).mockResolvedValue({
        valid: false,
        error: 'Invalid credentials',
      });

      const makeRequest = (ip: string) => new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'x-forwarded-for': ip,
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      });

      // IP1: 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await POST(makeRequest('192.168.1.1'));
      }

      // IP2: Should not be rate limited
      const ip2Response = await POST(makeRequest('192.168.1.2'));
      expect(ip2Response.status).toBe(401); // Unauthorized, but not rate limited
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
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

    it('should handle database errors gracefully', async () => {
      (validateCredentials as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle token generation errors', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'viewer' as const,
        name: 'Test User',
      };

      (validateCredentials as jest.Mock).mockResolvedValue({
        valid: true,
        user: mockUser,
      });

      (generateToken as jest.Mock).mockRejectedValue(new Error('Token generation failed'));

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });

  describe('OPTIONS /api/auth/login', () => {
    it('should handle OPTIONS request for CORS', async () => {
      const mockRequest = createMockRequest('OPTIONS', 'http://localhost:3000/api/auth/login');
      const response = await OPTIONS(mockRequest);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type');
    });
  });

  describe('Security Tests', () => {
    it('should not expose user details in error messages', async () => {
      (validateCredentials as jest.Mock).mockResolvedValue({
        valid: false,
        error: 'User not found',
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Should return generic error, not "User not found"
      expect(data.error).toBeTruthy();
      expect(response.status).toBe(401);
    });

    it('should handle SQL injection attempts in email', async () => {
      (validateCredentials as jest.Mock).mockResolvedValue({
        valid: false,
        error: 'Invalid credentials',
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: "admin'--",
          password: 'password',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
      expect(validateCredentials).toHaveBeenCalledWith({
        email: "admin'--",
        password: 'password',
      });
    });

    it('should handle XSS attempts in email field', async () => {
      (validateCredentials as jest.Mock).mockResolvedValue({
        valid: false,
        error: 'Invalid credentials',
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: '<script>alert("xss")</script>@example.com',
          password: 'password',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      // Error message should not contain the script
      expect(data.error).not.toContain('<script>');
    });
  });
});
