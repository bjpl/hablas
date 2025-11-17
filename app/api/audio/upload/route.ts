/**
 * Audio Upload API Endpoint
 * Handles audio file uploads to Vercel Blob Storage
 * Restricted to admin users only
 */

import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/middleware-helper';
import { checkRateLimit } from '@/lib/utils/rate-limiter';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed audio MIME types
const ALLOWED_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  'audio/aac',
  'audio/m4a',
];

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.webm', '.aac', '.m4a'];

interface UploadResponse {
  success: boolean;
  url?: string;
  pathname?: string;
  contentType?: string;
  size?: number;
  error?: string;
  details?: string;
}

/**
 * Validate file metadata
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));

  if (!hasValidExtension) {
    return {
      valid: false,
      error: `Invalid file extension. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Sanitize filename to prevent path traversal and ensure valid characters
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace invalid chars with underscore
    .replace(/\.+/g, '.') // Replace multiple dots with single dot
    .replace(/^\./, '') // Remove leading dot
    .substring(0, 255); // Limit length
}

/**
 * POST /api/audio/upload
 * Upload audio file to Vercel Blob Storage
 */
export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    // Check authentication and require admin role
    const authResult = await requireRole(request, 'admin');
    const userId = authResult.user?.id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          details: 'Admin access required to upload audio files',
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
          details: rateLimit.error || 'Too many upload requests. Please try again later.',
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided',
          details: 'Please provide an audio file to upload',
        },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file',
          details: validation.error,
        },
        { status: 400 }
      );
    }

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(file.name);
    const timestamp = Date.now();
    const pathname = `audio/${timestamp}-${sanitizedFilename}`;

    // Upload to Vercel Blob
    const blob = await put(pathname, file, {
      access: 'public',
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType,
        size: file.size,
      },
      {
        status: 201,
        headers: {
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error('Audio upload error:', error);

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
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
