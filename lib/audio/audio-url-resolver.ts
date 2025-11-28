'use client';

import React from 'react';

/**
 * Audio URL Resolver
 * Resolves audio URLs to use blob storage in production or local files in development
 */

// Resolution timeout in milliseconds
const RESOLUTION_TIMEOUT = 5000;

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
 * Fetch with timeout wrapper
 */
async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
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
    // Try to fetch from blob storage API with timeout
    const response = await fetchWithTimeout(`/api/audio/${filename}`, RESOLUTION_TIMEOUT);
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
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn(`[Audio] Resolution timeout for ${filename}`);
    } else {
      console.warn(`[Audio] Failed to resolve blob URL for ${filename}:`, error);
    }
  }

  // Fallback to public path (will 404 in production if file not deployed)
  console.warn(`[Audio] Falling back to public path for ${filename}`);
  return audioPath;
}

/**
 * Client-side hook to resolve audio URL
 * Enhanced with proper mounting tracking and guaranteed state resolution
 */
export function useAudioUrl(audioPath?: string): {
  url: string | null;
  loading: boolean;
  error: string | null;
} {
  // Track mounted state to prevent state updates after unmount
  const mountedRef = React.useRef(true);
  const [state, setState] = React.useState<{
    url: string | null;
    loading: boolean;
    error: string | null;
  }>({
    url: null,
    loading: !!audioPath, // Only loading if we have a path to resolve
    error: null,
  });

  React.useEffect(() => {
    mountedRef.current = true;

    // No path provided - nothing to resolve
    if (!audioPath) {
      setState({ url: null, loading: false, error: null });
      return;
    }

    // Reset state for new path
    setState(prev => ({ ...prev, loading: true, error: null }));

    const resolve = async () => {
      try {
        console.log(`[Audio Hook] Resolving: ${audioPath}`);
        const resolvedUrl = await resolveAudioUrl(audioPath);
        console.log(`[Audio Hook] Resolved to: ${resolvedUrl}`);

        if (mountedRef.current) {
          setState({ url: resolvedUrl, loading: false, error: null });
        }
      } catch (err) {
        console.error(`[Audio Hook] Resolution error:`, err);
        if (mountedRef.current) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to resolve audio URL';
          // Even on error, provide fallback URL
          setState({
            url: audioPath, // Fallback to original path
            loading: false,
            error: errorMsg,
          });
        }
      }
    };

    resolve();

    return () => {
      mountedRef.current = false;
    };
  }, [audioPath]);

  return state;
}
