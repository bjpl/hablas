/**
 * Media Streaming API Route
 *
 * GET /api/media/[id]
 *
 * Streams media files (audio, video, images) with proper headers
 */

import { NextResponse } from 'next/server';
import { resources } from '@/data/resources';
import fs from 'fs/promises';
import path from 'path';
import { stat } from 'fs/promises';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resourceId = parseInt(id);

    // Find resource
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Determine which URL to use (audioUrl for audio, downloadUrl for others)
    const mediaUrl = resource.type === 'audio' && resource.audioUrl
      ? resource.audioUrl
      : resource.downloadUrl;

    // Read media file
    const publicPath = path.join(process.cwd(), 'public', mediaUrl);

    try {
      await stat(publicPath);
    } catch {
      return NextResponse.json(
        { error: 'Media file not found' },
        { status: 404 }
      );
    }

    const fileBuffer = await fs.readFile(publicPath);
    const fileStats = await stat(publicPath);

    // Determine content type based on resource type and file extension
    const contentTypes: Record<string, string> = {
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
      'md': 'text/markdown',
      'txt': 'text/plain',
    };

    const ext = path.extname(publicPath).slice(1).toLowerCase();
    const contentType = contentTypes[ext] || 'application/octet-stream';

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileStats.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('Error streaming media:', error);
    return NextResponse.json(
      { error: 'Failed to stream media' },
      { status: 500 }
    );
  }
}

/**
 * Get media metadata
 */
export async function HEAD(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resourceId = parseInt(id);

    const resource = resources.find(r => r.id === resourceId);
    if (!resource) {
      return new NextResponse(null, { status: 404 });
    }

    const mediaUrl = resource.type === 'audio' && resource.audioUrl
      ? resource.audioUrl
      : resource.downloadUrl;

    const publicPath = path.join(process.cwd(), 'public', mediaUrl);
    const fileStats = await stat(publicPath);

    return new NextResponse(null, {
      headers: {
        'Content-Length': fileStats.size.toString(),
        'Last-Modified': fileStats.mtime.toUTCString(),
      },
    });
  } catch (error) {
    return new NextResponse(null, { status: 404 });
  }
}
