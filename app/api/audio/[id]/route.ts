/**
 * Audio Download/Stream API Endpoint
 * Handles audio file retrieval and streaming from Vercel Blob Storage
 */

import { head } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth/middleware-helper';
import { checkRateLimit } from '@/lib/utils/rate-limiter';

interface AudioResponse {
  success: boolean;
  url?: string;
  contentType?: string;
  size?: number;
  error?: string;
  details?: string;
}

/**
 * Validate blob pathname to prevent path traversal
 */
function validatePathname(pathname: string): boolean {
  // Must start with audio/
  if (!pathname.startsWith('audio/')) {
    return false;
  }

  // No path traversal attempts
  if (pathname.includes('..') || pathname.includes('//')) {
    return false;
  }

  // Only alphanumeric, dots, hyphens, underscores, and forward slashes
  const validPattern = /^audio\/[\w\d.-]+$/;
  return validPattern.test(pathname);
}

/**
 * GET /api/audio/[id]
 * Retrieve audio file metadata and streaming URL
 *
 * Supports two modes:
 * - JSON mode (Accept: application/json): Returns JSON with blob URL
 * - Redirect mode (default): Redirects directly to blob URL for audio elements
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
): Promise<NextResponse<AudioResponse> | NextResponse> {
  try {
    // Check if client wants JSON response
    const acceptHeader = request.headers.get('accept') || '';
    const wantsJson = acceptHeader.includes('application/json');

    // Check authentication (optional - can be public)
    const authResult = await checkAuth(request);
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    const identifier = authResult.user?.id || ipAddress || 'anonymous';

    // Check rate limit
    const rateLimit = await checkRateLimit(identifier, 'API');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          details: rateLimit.error || 'Too many requests. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
          },
        }
      );
    }

    // Verify Blob token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'Storage not configured',
          details: 'Blob storage is not properly configured',
        },
        { status: 500 }
      );
    }

    // Construct pathname from ID
    const params = await props.params;
    const { id } = params;
    const pathname = `audio/${id}`;

    // Validate pathname
    if (!validatePathname(pathname)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid audio ID',
          details: 'The provided audio ID is invalid',
        },
        { status: 400 }
      );
    }

    // Get blob metadata
    const blob = await head(pathname, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!blob) {
      return NextResponse.json(
        {
          success: false,
          error: 'Audio not found',
          details: 'The requested audio file does not exist',
        },
        { status: 404 }
      );
    }

    // Return based on request type
    if (wantsJson) {
      // Return JSON for JavaScript clients
      return NextResponse.json(
        {
          success: true,
          url: blob.url,
          contentType: blob.contentType,
          size: blob.size,
        },
        {
          status: 200,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
            'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
          },
        }
      );
    }

    // Redirect to blob URL for audio elements
    // Note: Audio elements need crossorigin="anonymous" attribute to handle cross-origin redirects
    return NextResponse.redirect(blob.url, {
      status: 302,
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Audio retrieval error:', error);

    // Handle blob not found error
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Audio not found',
          details: 'The requested audio file does not exist',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Retrieval failed',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/audio/[id]
 * Delete audio file from Vercel Blob Storage
 * Restricted to admin users only
 */
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
): Promise<NextResponse<AudioResponse>> {
  try {
    // Import delete function dynamically to avoid loading it unnecessarily
    const { del } = await import('@vercel/blob');
    const { requireRole } = await import('@/lib/auth/middleware-helper');

    // Check authentication and require admin role
    const authResult = await requireRole(request, 'admin');
    const userId = authResult.user?.id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          details: 'Admin access required to delete audio files',
        },
        { status: 401 }
      );
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(userId, 'API');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          details: rateLimit.error || 'Too many requests. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
          },
        }
      );
    }

    // Verify Blob token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'Storage not configured',
          details: 'Blob storage is not properly configured',
        },
        { status: 500 }
      );
    }

    // Construct pathname from ID
    const params = await props.params;
    const { id } = params;
    const pathname = `audio/${id}`;

    // Validate pathname
    if (!validatePathname(pathname)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid audio ID',
          details: 'The provided audio ID is invalid',
        },
        { status: 400 }
      );
    }

    // Delete blob
    await del(pathname, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error('Audio deletion error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Authentication required')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized',
            details: 'Authentication required',
          },
          { status: 401 }
        );
      }

      if (error.message.includes('Insufficient permissions')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            details: 'Admin access required',
          },
          { status: 403 }
        );
      }

      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Audio not found',
            details: 'The requested audio file does not exist',
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Deletion failed',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
