'use client';

import React from 'react';
import { createLogger } from '@/lib/utils/logger';

const audioResolverLogger = createLogger('audio-url-resolver');

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
 * - In production: use API endpoint that redirects to blob storage
 *
 * The API endpoint (/api/audio/[id]) handles:
 * - Redirect mode: Returns 302 redirect to blob URL (for audio elements)
 * - JSON mode: Returns JSON with blob URL (for programmatic access)
 */
export function resolveAudioUrl(audioPath: string): string {
  // If already a full URL (blob storage), return as-is
  if (audioPath.startsWith('http://') || audioPath.startsWith('https://')) {
    return audioPath;
  }

  // In development, use local path
  if (!isProduction()) {
    audioResolverLogger.debug('Dev mode, using local path', { audioPath });
    return audioPath;
  }

  // In production, use API endpoint that redirects to blob storage
  // Extract resource ID from path like "/audio/resource-1.mp3" -> "resource-1.mp3"
  const filename = audioPath.replace(/^\/audio\//, '');
  const apiUrl = `/api/audio/${filename}`;
  audioResolverLogger.debug('Production mode, using API URL', { apiUrl });
  return apiUrl;
}

/**
 * Resolve audio URL to direct blob URL (for download functionality)
 * This fetches JSON from the API to get the direct blob URL
 */
export async function resolveAudioUrlDirect(audioPath: string): Promise<string> {
  // If already a full URL (blob storage), return as-is
  if (audioPath.startsWith('http://') || audioPath.startsWith('https://')) {
    return audioPath;
  }

  // In development, use local path
  if (!isProduction()) {
    return audioPath;
  }

  // In production, fetch JSON from API to get direct blob URL
  const filename = audioPath.replace(/^\/audio\//, '');

  try {
    const response = await fetchWithTimeout(`/api/audio/${filename}`, RESOLUTION_TIMEOUT);
    if (response.ok) {
      // Check if it's a redirect (API returns redirect by default)
      if (response.redirected && response.url) {
        return response.url;
      }
      // Otherwise parse JSON
      const data = await response.json();
      if (data.success && data.url) {
        return data.url;
      }
    }
  } catch (error) {
    audioResolverLogger.warn('Failed to resolve direct blob URL', { filename, error });
  }

  // Fallback to API URL (will redirect on access)
  return `/api/audio/${filename}`;
}

/**
 * Client-side hook to resolve audio URL
 * In production, fetches the direct blob URL from the API to avoid redirect issues
 */
export function useAudioUrl(audioPath?: string): {
  url: string | null;
  loading: boolean;
  error: string | null;
} {
  const [state, setState] = React.useState<{
    url: string | null;
    loading: boolean;
    error: string | null;
  }>({
    url: null,
    loading: !!audioPath,
    error: null,
  });

  React.useEffect(() => {
    if (!audioPath) {
      setState({ url: null, loading: false, error: null });
      return;
    }

    // If already a full URL, use it directly
    if (audioPath.startsWith('http://') || audioPath.startsWith('https://')) {
      audioResolverLogger.debug('Already full URL', { audioPath });
      setState({ url: audioPath, loading: false, error: null });
      return;
    }

    // In development, use local path directly
    if (!isProduction()) {
      audioResolverLogger.debug('Hook: Dev mode, using local path', { audioPath });
      setState({ url: audioPath, loading: false, error: null });
      return;
    }

    // In production, fetch the direct blob URL from the API
    const filename = audioPath.replace(/^\/audio\//, '');
    const apiUrl = `/api/audio/${filename}`;

    audioResolverLogger.debug('Hook: Production mode, fetching blob URL', { apiUrl });
    setState(prev => ({ ...prev, loading: true, error: null }));

    // Fetch with JSON mode to get direct blob URL
    fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.url) {
          audioResolverLogger.debug('Hook: Got blob URL', { url: data.url });
          setState({ url: data.url, loading: false, error: null });
        } else {
          throw new Error(data.error || 'Failed to get blob URL');
        }
      })
      .catch((error) => {
        audioResolverLogger.error('Hook: Error fetching blob URL', error as Error);
        // Fallback to API URL with redirect (might work with crossOrigin)
        audioResolverLogger.debug('Hook: Falling back to API URL', { apiUrl });
        setState({ url: apiUrl, loading: false, error: null });
      });
  }, [audioPath]);

  return state;
}
