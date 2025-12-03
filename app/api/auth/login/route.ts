/**
 * Login API Route
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, toUserSession, initializeDefaultAdmin } from '@/lib/auth/users';
import { generateToken } from '@/lib/auth/jwt';
import { createSession } from '@/lib/auth/session';
import { createAuthCookie } from '@/lib/auth/cookies';
import { validateRequest, loginSchema } from '@/lib/auth/validation';
import { checkRateLimit, resetRateLimit } from '@/lib/utils/rate-limiter';
import { createCorsPreflightResponse, addCorsHeaders } from '@/lib/utils/cors';
import { authLogger as logger } from '@/lib/utils/logger';
import type { LoginCredentials } from '@/lib/auth/types';

export async function POST(request: NextRequest) {
  try {
    // Initialize default admin if needed
    await initializeDefaultAdmin();

    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Check rate limit using new distributed rate limiter
    const rateLimit = await checkRateLimit(ip, 'LOGIN');
    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        {
          success: false,
          error: rateLimit.error,
          remaining: rateLimit.remaining,
          resetAt: rateLimit.resetAt,
        },
        { status: 429 }
      );
      return addCorsHeaders(response, request.headers.get('origin'));
    }

    // Parse request body
    const body = await request.json() as LoginCredentials;
    const { email, password, rememberMe = false } = body;

    // Validate input
    if (!email || !password) {
      const response = NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
      return addCorsHeaders(response, request.headers.get('origin'));
    }

    // Validate credentials
    const result = await validateCredentials({ email, password });

    if (!result.valid || !result.user) {
      const response = NextResponse.json(
        { success: false, error: result.error || 'Invalid credentials' },
        { status: 401 }
      );
      return addCorsHeaders(response, request.headers.get('origin'));
    }

    // Reset rate limit on successful login
    await resetRateLimit(ip, 'LOGIN');

    // Generate JWT access token (async with jose)
    const accessToken = await generateToken(
      result.user.id,
      result.user.email,
      result.user.role,
      rememberMe
    );

    // Create session with refresh token
    const userAgent = request.headers.get('user-agent') || undefined;
    const { refreshToken } = await createSession(
      result.user.id,
      result.user.email,
      result.user.role,
      userAgent,
      ip
    );

    // Create user session (without password)
    const userSession = toUserSession(result.user);

    // Create response with auth cookie and tokens
    const response = NextResponse.json({
      success: true,
      user: userSession,
      tokens: {
        accessToken,
        refreshToken,
      },
    });

    // Set auth cookie with access token
    const cookie = createAuthCookie(accessToken, rememberMe);
    response.headers.set('Set-Cookie', cookie);

    // Add CORS headers
    return addCorsHeaders(response, request.headers.get('origin'));
  } catch (error) {
    logger.error('Login error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request.headers.get('origin'));
}
