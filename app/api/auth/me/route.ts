/**
 * Get Current User API Route
 * GET /api/auth/me
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth/middleware-helper';
import { getPermissions } from '@/lib/auth/permissions';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await checkAuth(request);

    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user permissions
    const permissions = getPermissions(authResult.user.role);

    // Return user data with permissions
    return NextResponse.json({
      success: true,
      user: {
        ...authResult.user,
        permissions,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
