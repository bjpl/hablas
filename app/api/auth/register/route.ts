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

// Rate limiting for registration
const registrationAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_REGISTRATION_ATTEMPTS = 3;
const LOCKOUT_DURATION = 60 * 60 * 1000; // 1 hour

function checkRegistrationRateLimit(ip: string): { allowed: boolean; error?: string } {
  const now = Date.now();
  const attempts = registrationAttempts.get(ip);

  if (attempts) {
    if (now < attempts.resetAt) {
      if (attempts.count >= MAX_REGISTRATION_ATTEMPTS) {
        return {
          allowed: false,
          error: `Too many registration attempts. Please try again in ${Math.ceil((attempts.resetAt - now) / 60000)} minutes.`,
        };
      }
    } else {
      registrationAttempts.delete(ip);
    }
  }

  return { allowed: true };
}

function recordRegistrationAttempt(ip: string, success: boolean): void {
  const now = Date.now();
  const attempts = registrationAttempts.get(ip);

  if (success) {
    registrationAttempts.delete(ip);
    return;
  }

  if (attempts) {
    attempts.count += 1;
  } else {
    registrationAttempts.set(ip, {
      count: 1,
      resetAt: now + LOCKOUT_DURATION,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Check rate limit
    const rateLimit = checkRegistrationRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: rateLimit.error },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequest(registerSchema, body);

    if (!validation.success) {
      recordRegistrationAttempt(ip, false);
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
      recordRegistrationAttempt(ip, false);
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create user' },
        { status: 400 }
      );
    }

    // Record successful registration
    recordRegistrationAttempt(ip, true);

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
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
