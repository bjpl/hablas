'use client';

import React from 'react';

/**
 * Audio URL Resolver
 * Resolves audio URLs to use blob storage in production or local files in development
 */

/**
 * Check if running in production environment
 * Uses both NODE_ENV and window.location for reliable detection
 */
function isProduction(): boolean {
  // Build-time check
  if (process.env.NODE_ENV === 'production') {
    return true;
  }

  // Runtime check for client-side
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return hostname !== 'localhost' && hostname !== '127.0.0.1';
  }

  return false;
}

/**
 * Resolve audio URL based on environment
 * - In development: use local /audio/ path
 * - In production: check if file exists in blob storage, fallback to public path
 */
export async function resolveAudioUrl(audioPath: string): Promise<string> {
  // If already a full URL (blob storage), return as-is
  if (audioPath.startsWith('http://') || audioPath.startsWith('https://')) {
    return audioPath;
  }

  // In development, use local path
  if (!isProduction()) {
    return audioPath;
  }

  // In production, try to use blob storage
  // Extract resource ID from path like "/audio/resource-1.mp3" -> "resource-1.mp3"
  const filename = audioPath.replace(/^\/audio\//, '');

  try {
    // Try to fetch from blob storage API
    const response = await fetch(`/api/audio/${filename}`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.url) {
        console.log(`[Audio] Resolved blob URL for ${filename}`);
        return data.url;
      } else {
        console.warn(`[Audio] API returned no URL for ${filename}:`, data);
      }
    } else {
      console.warn(`[Audio] API request failed for ${filename}: ${response.status}`);
    }
  } catch (error) {
    console.warn(`[Audio] Failed to resolve blob URL for ${filename}:`, error);
  }

  // Fallback to public path (will 404 in production if file not deployed)
  console.warn(`[Audio] Falling back to public path for ${filename}`);
  return audioPath;
}

/**
 * Client-side hook to resolve audio URL
 */
export function useAudioUrl(audioPath?: string): {
  url: string | null;
  loading: boolean;
  error: string | null;
} {
  const [url, setUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!audioPath) {
      setUrl(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const resolve = async () => {
      try {
        setLoading(true);
        setError(null);
        const resolvedUrl = await resolveAudioUrl(audioPath);
        if (!cancelled) {
          setUrl(resolvedUrl);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to resolve audio URL');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    resolve();

    return () => {
      cancelled = true;
    };
  }, [audioPath]);

  return { url, loading, error };
}
