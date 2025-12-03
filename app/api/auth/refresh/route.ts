/**
 * Token Refresh API Route
 * POST /api/auth/refresh
 * Supports both access token refresh and refresh token rotation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/lib/auth/cookies';
import { refreshToken as refreshAccessToken } from '@/lib/auth/jwt';
import { generateToken } from '@/lib/auth/jwt';
import { authLogger as logger } from '@/lib/utils/logger';
import {
  verifyRefreshToken,
  getSessionByRefreshToken,
  updateSessionLastUsed,
  createSession,
  revokeSession
} from '@/lib/auth/session';
import { createAuthCookie } from '@/lib/auth/cookies';
import { validateRequest, tokenRefreshSchema } from '@/lib/auth/validation';
import { createCorsPreflightResponse, addCorsHeaders } from '@/lib/utils/cors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Check if refresh token is provided in body (preferred method)
    if (body.refreshToken) {
      return await handleRefreshTokenRotation(request, body.refreshToken);
    }

    // Fallback: Try to refresh access token from cookie
    const currentToken = getTokenFromRequest(request);

    if (!currentToken) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    // Try to refresh the access token
    const newToken = await refreshAccessToken(currentToken);

    // Token invalid
    if (newToken === false) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Token still valid, no need to refresh
    if (newToken === null) {
      return NextResponse.json({
        success: true,
        message: 'Token still valid',
        token: currentToken,
      });
    }

    // Token refreshed successfully
    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed',
      token: newToken,
    });

    // Update cookie with new token
    const cookie = createAuthCookie(newToken, false);
    response.headers.set('Set-Cookie', cookie);

    // Add CORS headers
    return addCorsHeaders(response, request.headers.get('origin'));
  } catch (error) {
    logger.error('Token refresh error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle refresh token rotation
 */
async function handleRefreshTokenRotation(
  request: NextRequest,
  refreshToken: string
): Promise<NextResponse> {
  // Verify refresh token
  const tokenData = await verifyRefreshToken(refreshToken);

  if (!tokenData) {
    return NextResponse.json(
      { success: false, error: 'Invalid or expired refresh token' },
      { status: 401 }
    );
  }

  // Get session
  const session = await getSessionByRefreshToken(refreshToken);

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Session not found' },
      { status: 401 }
    );
  }

  // Generate new access token
  const accessToken = await generateToken(
    tokenData.userId,
    tokenData.email,
    tokenData.role,
    false
  );

  // Rotate refresh token (invalidate old, create new)
  const userAgent = request.headers.get('user-agent') || undefined;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  // Revoke old session
  await revokeSession(session.id);

  // Create new session with new refresh token
  const { refreshToken: newRefreshToken } = await createSession(
    tokenData.userId,
    tokenData.email,
    tokenData.role,
    userAgent,
    ip
  );

  // Create response with both tokens
  const response = NextResponse.json({
    success: true,
    message: 'Tokens refreshed',
    tokens: {
      accessToken,
      refreshToken: newRefreshToken,
    },
  });

  // Update cookie with new access token
  const cookie = createAuthCookie(accessToken, false);
  response.headers.set('Set-Cookie', cookie);

  // Add CORS headers
  return addCorsHeaders(response, request.headers.get('origin'));
}

// OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request.headers.get('origin'));
}
