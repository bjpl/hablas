/**
 * Token Refresh API Route
 * POST /api/auth/refresh
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/lib/auth/cookies';
import { refreshToken } from '@/lib/auth/jwt';
import { createAuthCookie } from '@/lib/auth/cookies';

export async function POST(request: NextRequest) {
  try {
    // Get current token from cookies
    const currentToken = getTokenFromRequest(request);

    if (!currentToken) {
      return NextResponse.json(
        { success: false, error: 'No token found' },
        { status: 401 }
      );
    }

    // Try to refresh token
    const newToken = refreshToken(currentToken);

    if (newToken === false) {
      // Invalid token
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (newToken === null) {
      // Token still valid, no need to refresh
      return NextResponse.json({
        success: true,
        refreshed: false,
        message: 'Token still valid',
      });
    }

    // Token refreshed successfully
    const response = NextResponse.json({
      success: true,
      refreshed: true,
      token: newToken,
    });

    // Set new auth cookie
    const cookie = createAuthCookie(newToken, false);
    response.headers.set('Set-Cookie', cookie);

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
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
