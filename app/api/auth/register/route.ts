/**
 * Registration API Route
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth/users';
import { generateToken } from '@/lib/auth/jwt';
import { createSession } from '@/lib/auth/session';
import { createAuthCookie } from '@/lib/auth/cookies';
import { validateRequest, registerSchema } from '@/lib/auth/validation';

// SECURITY FIX: Use distributed rate limiting from centralized utility
import { checkRateLimit, resetRateLimit } from '@/lib/utils/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // SECURITY FIX: Use distributed rate limiting (Redis-backed when available)
    const rateLimit = await checkRateLimit(ip, 'REGISTRATION');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: rateLimit.error },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.resetAt),
          }
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequest(registerSchema, body);

    if (!validation.success) {
      // Rate limit already incremented by checkRateLimit
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors: validation.errors
        },
        { status: 400 }
      );
    }

    const { email, password, name, role = 'viewer' } = validation.data;

    // For security, only allow viewer registration by default
    // Admin/editor roles should be assigned by existing admins
    const userRole = role === 'viewer' ? 'viewer' : 'viewer';

    // Create user
    const result = await createUser(email, password, userRole, name);

    if (!result.success || !result.user) {
      // Rate limit already incremented by checkRateLimit
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create user' },
        { status: 400 }
      );
    }

    // Reset rate limit on successful registration
    await resetRateLimit(ip, 'REGISTRATION');

    // Generate tokens
    const accessToken = await generateToken(
      result.user.id,
      result.user.email,
      result.user.role,
      false
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

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    }, { status: 201 });

    // Set auth cookie
    const cookie = createAuthCookie(accessToken, false);
    response.headers.set('Set-Cookie', cookie);

    return response;
  } catch (error) {
    // Use structured logging instead of console
    const { authLogger: logger } = await import('@/lib/utils/logger');
    logger.error('Registration error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS - SECURITY FIX: Use configured origins instead of wildcard
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const { CORS } = await import('@/lib/config/security').then(m => m.SECURITY_CONFIG);

  // Only allow configured origins
  const allowedOrigin = CORS.isOriginAllowed(origin) ? origin : CORS.getAllowedOrigins()[0];

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin || '',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
