/**
 * Security Configuration
 * Centralized security settings for the application
 */

import * as crypto from 'crypto';

// Cookie Configuration
export const COOKIE_CONFIG = {
  // Standard cookie name across entire application
  AUTH_COOKIE_NAME: 'hablas_auth_token',

  // Cookie options
  OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  },

  REMEMBER_ME_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },
} as const;

// CORS Configuration
export const CORS_CONFIG = {
  // Production: Restrict to specific domains
  // Development: Allow localhost
  getAllowedOrigins(): string[] {
    if (process.env.NODE_ENV === 'production') {
      return [
        process.env.NEXT_PUBLIC_APP_URL || 'https://hablas.co',
        process.env.ALLOWED_ORIGIN_1 || '',
        process.env.ALLOWED_ORIGIN_2 || '',
      ].filter(Boolean);
    }

    // Development: Allow localhost on various ports
    return [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ];
  },

  isOriginAllowed(origin: string | null): boolean {
    if (!origin) return false;
    const allowed = this.getAllowedOrigins();
    return allowed.includes(origin) || allowed.includes('*');
  },

  // Default CORS headers for development
  DEFAULT_HEADERS: {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
  },
} as const;

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  // Login attempts
  LOGIN: {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
    MESSAGE: 'Too many login attempts. Please try again later.',
  },

  // API rate limiting
  API: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 60 * 1000, // 1 minute
    MESSAGE: 'Too many requests. Please try again later.',
  },

  // Password reset
  PASSWORD_RESET: {
    MAX_ATTEMPTS: 3,
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MESSAGE: 'Too many password reset attempts. Please try again later.',
  },

  // Registration
  REGISTRATION: {
    MAX_ATTEMPTS: 3,
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MESSAGE: 'Too many registration attempts. Please try again later.',
  },
} as const;

// JWT Configuration
export const JWT_CONFIG = {
  // Token expiry
  TOKEN_EXPIRY: '7d',
  REMEMBER_ME_EXPIRY: '30d',
  REFRESH_TOKEN_EXPIRY: '30d',

  // Token refresh threshold (refresh when less than 1 day remaining)
  REFRESH_THRESHOLD_SECONDS: 24 * 60 * 60,

  // Validate JWT secret
  getSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      // During build/static generation, return placeholder (API routes are dynamic anyway)
      if (process.env.NEXT_PHASE === 'phase-production-build') {
        return 'build-time-placeholder-not-used-at-runtime';
      }
      if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be set in production');
      }
      console.warn('⚠️  WARNING: Using default JWT_SECRET in development');
      return 'development-secret-change-in-production';
    }

    if (secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }

    return secret;
  },
} as const;

// Password Policy
export const PASSWORD_POLICY = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
  SPECIAL_CHARS: '!@#$%^&*(),.?":{}|<>',

  validate(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
    }

    if (password.length > this.MAX_LENGTH) {
      errors.push(`Password must not exceed ${this.MAX_LENGTH} characters`);
    }

    if (this.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (this.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (this.REQUIRE_NUMBER && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (this.REQUIRE_SPECIAL && !new RegExp(`[${this.SPECIAL_CHARS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
} as const;

// Admin Configuration
export const ADMIN_CONFIG = {
  // Generate secure random password
  generateSecurePassword(): string {
    const length = 20;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

    let password = '';
    const randomBytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
      password += charset[randomBytes[i] % charset.length];
    }

    // Ensure it meets password policy
    if (!PASSWORD_POLICY.validate(password).valid) {
      return this.generateSecurePassword(); // Retry if invalid
    }

    return password;
  },

  getDefaultEmail(): string {
    return process.env.ADMIN_EMAIL || 'admin@hablas.co';
  },

  getDefaultPassword(): string {
    // In production, require explicit password or generate random
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.ADMIN_PASSWORD) {
        const password = this.generateSecurePassword();
        console.log('🔐 Generated secure admin password:', password);
        console.log('⚠️  SAVE THIS PASSWORD - it will not be shown again!');
        return password;
      }
      return process.env.ADMIN_PASSWORD;
    }

    // Development: Use environment variable or secure default
    return process.env.ADMIN_PASSWORD || this.generateSecurePassword();
  },
} as const;

// Security Headers
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  ...(process.env.NODE_ENV === 'production' && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  }),
} as const;

// Session Configuration
export const SESSION_CONFIG = {
  // Session expiry (matches JWT)
  EXPIRY_DAYS: 30,

  // Cleanup interval for expired sessions
  CLEANUP_INTERVAL_MS: 24 * 60 * 60 * 1000, // 24 hours

  // Maximum sessions per user
  MAX_SESSIONS_PER_USER: 5,
} as const;

// Export all configurations
export const SECURITY_CONFIG = {
  COOKIE: COOKIE_CONFIG,
  CORS: CORS_CONFIG,
  RATE_LIMIT: RATE_LIMIT_CONFIG,
  JWT: JWT_CONFIG,
  PASSWORD: PASSWORD_POLICY,
  ADMIN: ADMIN_CONFIG,
  HEADERS: SECURITY_HEADERS,
  SESSION: SESSION_CONFIG,
} as const;

export default SECURITY_CONFIG;
