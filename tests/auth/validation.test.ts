/**
 * Validation Tests
 * Tests for request validation schemas using Zod
 */

import { describe, it, expect } from '@jest/globals';
import {
  validateRequest,
  loginSchema,
  registerSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  emailSchema,
  passwordSchema,
} from '@/lib/auth/validation';

describe('Request Validation', () => {
  describe('Email Validation', () => {
    it('should accept valid email', () => {
      const result = validateRequest(emailSchema, 'test@example.com');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test@example.com');
      }
    });

    it('should reject invalid email format', () => {
      const result = validateRequest(emailSchema, 'invalid-email');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it('should convert email to lowercase', () => {
      const result = validateRequest(emailSchema, 'TEST@EXAMPLE.COM');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test@example.com');
      }
    });

    it('should trim whitespace', () => {
      const result = validateRequest(emailSchema, '  test@example.com  ');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test@example.com');
      }
    });
  });

  describe('Password Validation', () => {
    it('should accept strong password', () => {
      const result = validateRequest(passwordSchema, 'Test123!@#');

      expect(result.success).toBe(true);
    });

    it('should reject password without uppercase', () => {
      const result = validateRequest(passwordSchema, 'test123!@#');

      expect(result.success).toBe(false);
    });

    it('should reject password without lowercase', () => {
      const result = validateRequest(passwordSchema, 'TEST123!@#');

      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const result = validateRequest(passwordSchema, 'TestPassword!');

      expect(result.success).toBe(false);
    });

    it('should reject password without special character', () => {
      const result = validateRequest(passwordSchema, 'TestPassword123');

      expect(result.success).toBe(false);
    });

    it('should reject password shorter than 8 characters', () => {
      const result = validateRequest(passwordSchema, 'Test1!');

      expect(result.success).toBe(false);
    });
  });

  describe('Login Validation', () => {
    it('should accept valid login credentials', () => {
      const result = validateRequest(loginSchema, {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.password).toBe('password123');
        expect(result.data.rememberMe).toBe(true);
      }
    });

    it('should default rememberMe to false', () => {
      const result = validateRequest(loginSchema, {
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rememberMe).toBe(false);
      }
    });

    it('should reject missing email', () => {
      const result = validateRequest(loginSchema, {
        password: 'password123',
      });

      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const result = validateRequest(loginSchema, {
        email: 'test@example.com',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Registration Validation', () => {
    it('should accept valid registration data', () => {
      const result = validateRequest(registerSchema, {
        email: 'test@example.com',
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
        name: 'Test User',
      });

      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const result = validateRequest(registerSchema, {
        email: 'test@example.com',
        password: 'Test123!@#',
        confirmPassword: 'Different123!',
        name: 'Test User',
      });

      expect(result.success).toBe(false);
    });

    it('should reject short name', () => {
      const result = validateRequest(registerSchema, {
        email: 'test@example.com',
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
        name: 'T',
      });

      expect(result.success).toBe(false);
    });

    it('should default role to viewer', () => {
      const result = validateRequest(registerSchema, {
        email: 'test@example.com',
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
        name: 'Test User',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe('viewer');
      }
    });
  });

  describe('Password Reset Request Validation', () => {
    it('should accept valid email', () => {
      const result = validateRequest(passwordResetRequestSchema, {
        email: 'test@example.com',
      });

      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = validateRequest(passwordResetRequestSchema, {
        email: 'invalid-email',
      });

      expect(result.success).toBe(false);
    });

    it('should reject missing email', () => {
      const result = validateRequest(passwordResetRequestSchema, {});

      expect(result.success).toBe(false);
    });
  });

  describe('Password Reset Validation', () => {
    it('should accept valid reset data', () => {
      const result = validateRequest(passwordResetSchema, {
        token: 'reset-token-123',
        password: 'NewPass123!',
        confirmPassword: 'NewPass123!',
      });

      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const result = validateRequest(passwordResetSchema, {
        token: 'reset-token-123',
        password: 'NewPass123!',
        confirmPassword: 'Different123!',
      });

      expect(result.success).toBe(false);
    });

    it('should reject missing token', () => {
      const result = validateRequest(passwordResetSchema, {
        password: 'NewPass123!',
        confirmPassword: 'NewPass123!',
      });

      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const result = validateRequest(passwordResetSchema, {
        token: 'reset-token-123',
        password: 'weak',
        confirmPassword: 'weak',
      });

      expect(result.success).toBe(false);
    });
  });
});
