/**
 * Vercel Blob Storage Utilities for Audio Files
 * Client-side and server-side helpers for audio file management
 */

import { put, del, head, list } from '@vercel/blob';

export interface AudioMetadata {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
  uploadedAt: Date;
}

export interface UploadOptions {
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

export interface ListOptions {
  prefix?: string;
  limit?: number;
  cursor?: string;
}

/**
 * Upload audio file to Vercel Blob Storage (server-side only)
 */
export async function uploadAudioFile(
  file: File | Buffer,
  filename: string,
  options?: UploadOptions
): Promise<AudioMetadata> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
  }

  // Validate filename
  const sanitizedFilename = filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.+/g, '.')
    .replace(/^\./, '')
    .substring(0, 255);

  const timestamp = Date.now();
  const pathname = `audio/${timestamp}-${sanitizedFilename}`;

  // Determine content type
  let contentType = 'audio/mpeg'; // default
  if (file instanceof File) {
    contentType = file.type;
  } else if (filename.endsWith('.wav')) {
    contentType = 'audio/wav';
  } else if (filename.endsWith('.ogg')) {
    contentType = 'audio/ogg';
  } else if (filename.endsWith('.webm')) {
    contentType = 'audio/webm';
  }

  // Upload file
  const blob = await put(pathname, file, {
    access: 'public',
    contentType,
    token: process.env.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: false,
  });

  // Get file size from File object
  const fileSize = file instanceof File ? file.size : Buffer.byteLength(file);

  return {
    url: blob.url,
    pathname: blob.pathname,
    contentType: blob.contentType || contentType,
    size: fileSize,
    uploadedAt: new Date(),
  };
}

/**
 * Delete audio file from Vercel Blob Storage (server-side only)
 */
export async function deleteAudioFile(pathname: string): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
  }

  // Validate pathname
  if (!pathname.startsWith('audio/')) {
    throw new Error('Invalid pathname: must start with audio/');
  }

  await del(pathname, {
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

/**
 * Get audio file metadata from Vercel Blob Storage (server-side only)
 */
export async function getAudioMetadata(pathname: string): Promise<AudioMetadata | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
  }

  // Validate pathname
  if (!pathname.startsWith('audio/')) {
    throw new Error('Invalid pathname: must start with audio/');
  }

  try {
    const blob = await head(pathname, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!blob) {
      return null;
    }

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType || 'audio/mpeg',
      size: blob.size,
      uploadedAt: new Date(blob.uploadedAt),
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return null;
    }
    throw error;
  }
}

/**
 * List audio files from Vercel Blob Storage (server-side only)
 */
export async function listAudioFiles(
  options: ListOptions = {}
): Promise<{ files: AudioMetadata[]; cursor?: string; hasMore: boolean }> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
  }

  const { prefix = 'audio/', limit = 100, cursor } = options;

  const result = await list({
    prefix,
    limit,
    cursor,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  const files = result.blobs.map(blob => ({
    url: blob.url,
    pathname: blob.pathname,
    contentType: 'audio/mpeg', // Default content type
    size: blob.size,
    uploadedAt: blob.uploadedAt,
  }));

  return {
    files,
    cursor: result.cursor,
    hasMore: result.hasMore,
  };
}

/**
 * Client-side upload helper
 * Uploads file via API endpoint
 */
export async function uploadAudioViaAPI(
  file: File,
  options?: UploadOptions
): Promise<AudioMetadata> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/audio/upload', {
    method: 'POST',
    body: formData,
    signal: options?.signal,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Upload failed');
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.details || result.error || 'Upload failed');
  }

  return {
    url: result.url,
    pathname: result.pathname,
    contentType: result.contentType,
    size: result.size,
    uploadedAt: new Date(),
  };
}

/**
 * Client-side download helper
 * Gets audio file URL via API endpoint
 */
export async function getAudioURL(audioId: string): Promise<string> {
  const response = await fetch(`/api/audio/${audioId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Failed to get audio URL');
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.details || result.error || 'Failed to get audio URL');
  }

  return result.url;
}

/**
 * Client-side delete helper
 * Deletes audio file via API endpoint
 */
export async function deleteAudioViaAPI(audioId: string): Promise<void> {
  const response = await fetch(`/api/audio/${audioId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Delete failed');
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.details || result.error || 'Delete failed');
  }
}

/**
 * Extract audio ID from blob pathname or URL
 */
export function extractAudioId(pathOrUrl: string): string {
  // If it's a URL, extract pathname
  if (pathOrUrl.startsWith('http')) {
    const url = new URL(pathOrUrl);
    pathOrUrl = url.pathname;
  }

  // Remove leading slash if present
  pathOrUrl = pathOrUrl.replace(/^\//, '');

  // Remove 'audio/' prefix if present
  if (pathOrUrl.startsWith('audio/')) {
    pathOrUrl = pathOrUrl.substring(6);
  }

  return pathOrUrl;
}

/**
 * Validate audio file before upload
 */
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac', 'audio/m4a'];

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_SIZE / 1024 / 1024}MB`,
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`,
    };
  }

  return { valid: true };
}
