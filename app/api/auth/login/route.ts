/**
 * Login API Route
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, toUserSession, initializeDefaultAdmin } from '@/lib/auth/users';
import { generateToken } from '@/lib/auth/jwt';
import { createAuthCookie } from '@/lib/auth/cookies';
import type { LoginCredentials } from '@/lib/auth/types';

// Rate limiting (simple in-memory implementation)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): { allowed: boolean; error?: string } {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (attempts) {
    if (now < attempts.resetAt) {
      if (attempts.count >= MAX_ATTEMPTS) {
        return {
          allowed: false,
          error: `Too many login attempts. Please try again in ${Math.ceil((attempts.resetAt - now) / 60000)} minutes.`,
        };
      }
    } else {
      // Reset counter
      loginAttempts.delete(ip);
    }
  }

  return { allowed: true };
}

function recordLoginAttempt(ip: string, success: boolean): void {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (success) {
    // Clear attempts on successful login
    loginAttempts.delete(ip);
    return;
  }

  if (attempts) {
    attempts.count += 1;
  } else {
    loginAttempts.set(ip, {
      count: 1,
      resetAt: now + LOCKOUT_DURATION,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Initialize default admin if needed
    await initializeDefaultAdmin();

    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Check rate limit
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: rateLimit.error },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json() as LoginCredentials;
    const { email, password, rememberMe = false } = body;

    // Validate input
    if (!email || !password) {
      recordLoginAttempt(ip, false);
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate credentials
    const result = await validateCredentials({ email, password });

    if (!result.valid || !result.user) {
      recordLoginAttempt(ip, false);
      return NextResponse.json(
        { success: false, error: result.error || 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Record successful login
    recordLoginAttempt(ip, true);

    // Generate JWT token
    const token = generateToken(
      result.user.id,
      result.user.email,
      result.user.role,
      rememberMe
    );

    // Create user session (without password)
    const userSession = toUserSession(result.user);

    // Create response with auth cookie
    const response = NextResponse.json({
      success: true,
      user: userSession,
      token,
    });

    // Set auth cookie
    const cookie = createAuthCookie(token, rememberMe);
    response.headers.set('Set-Cookie', cookie);

    return response;
  } catch (error) {
    console.error('Login error:', error);
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
