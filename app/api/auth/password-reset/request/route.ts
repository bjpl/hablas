/**
 * Password Reset Request API Route
 * POST /api/auth/password-reset/request
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/auth/users';
import { generatePasswordResetToken } from '@/lib/auth/session';
import { validateRequest, passwordResetRequestSchema } from '@/lib/auth/validation';

// Rate limiting for password reset requests
const resetAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_RESET_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60 * 60 * 1000; // 1 hour

function checkResetRateLimit(ip: string): { allowed: boolean; error?: string } {
  const now = Date.now();
  const attempts = resetAttempts.get(ip);

  if (attempts) {
    if (now < attempts.resetAt) {
      if (attempts.count >= MAX_RESET_ATTEMPTS) {
        return {
          allowed: false,
          error: `Too many reset attempts. Please try again in ${Math.ceil((attempts.resetAt - now) / 60000)} minutes.`,
        };
      }
    } else {
      resetAttempts.delete(ip);
    }
  }

  return { allowed: true };
}

function recordResetAttempt(ip: string): void {
  const now = Date.now();
  const attempts = resetAttempts.get(ip);

  if (attempts) {
    attempts.count += 1;
  } else {
    resetAttempts.set(ip, {
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
    const rateLimit = checkResetRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: rateLimit.error },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequest(passwordResetRequestSchema, body);

    if (!validation.success) {
      recordResetAttempt(ip);
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors: validation.errors
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    recordResetAttempt(ip);

    // Get user by email
    const user = await getUserByEmail(email);

    // Always return success to prevent email enumeration
    // Don't reveal if email exists or not
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
      });
    }

    // Generate password reset token
    const resetToken = await generatePasswordResetToken(user.id, user.email);

    // In production, send email with reset link
    // For now, log the token (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('Password Reset Token:', resetToken);
      console.log('Reset Link:', `${process.env.NEXT_PUBLIC_APP_URL}/admin/reset-password?token=${resetToken}`);
    }

    // TODO: Send email with reset link
    // await sendPasswordResetEmail(user.email, resetToken);

    return NextResponse.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent.',
      // Include token in development mode only
      ...(process.env.NODE_ENV === 'development' && { resetToken }),
    });
  } catch (error) {
    console.error('Password reset request error:', error);
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
