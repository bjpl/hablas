/**
 * Logout API Route
 * POST /api/auth/logout
 * Supports both regular logout and logout from all devices
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import { createClearCookie } from '@/lib/auth/cookies';
import {
  blacklistToken,
  revokeAllUserSessions,
  getSessionByRefreshToken,
  revokeSession
} from '@/lib/auth/session';
import { createCorsPreflightResponse, addCorsHeaders } from '@/lib/utils/cors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const logoutAll = body.logoutAll === true;
    const refreshToken = body.refreshToken;

    // Get access token from request
    const accessToken = getTokenFromRequest(request);

    if (accessToken) {
      // Verify and blacklist the access token
      const payload = await verifyToken(accessToken);

      if (payload && payload.exp) {
        const expiresAt = new Date(payload.exp * 1000).toISOString();
        await blacklistToken(accessToken, expiresAt);

        // If logout all devices, revoke all sessions
        if (logoutAll && payload.userId) {
          await revokeAllUserSessions(payload.userId);
        }
      }
    }

    // If refresh token provided, revoke its session
    if (refreshToken && !logoutAll) {
      const session = await getSessionByRefreshToken(refreshToken);
      if (session) {
        await revokeSession(session.id);
      }
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: logoutAll
        ? 'Logged out from all devices successfully'
        : 'Logged out successfully',
    });

    // Clear auth cookie
    const clearCookie = createClearCookie();
    response.headers.set('Set-Cookie', clearCookie);

    // Add CORS headers
    return addCorsHeaders(response, request.headers.get('origin'));
  } catch (error) {
    console.error('Logout error:', error);
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
