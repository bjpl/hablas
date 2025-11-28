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
    console.log(`[Audio] Dev mode, using local path: ${audioPath}`);
    return audioPath;
  }

  // In production, use API endpoint that redirects to blob storage
  // Extract resource ID from path like "/audio/resource-1.mp3" -> "resource-1.mp3"
  const filename = audioPath.replace(/^\/audio\//, '');
  const apiUrl = `/api/audio/${filename}`;
  console.log(`[Audio] Production mode, using API URL: ${apiUrl}`);
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
    console.warn(`[Audio] Failed to resolve direct blob URL for ${filename}:`, error);
  }

  // Fallback to API URL (will redirect on access)
  return `/api/audio/${filename}`;
}

/**
 * Client-side hook to resolve audio URL
 * Now synchronous since resolveAudioUrl returns immediately
 * (no async fetch needed - API handles redirects)
 */
export function useAudioUrl(audioPath?: string): {
  url: string | null;
  loading: boolean;
  error: string | null;
} {
  // Resolve URL synchronously - no loading state needed
  const resolvedUrl = React.useMemo(() => {
    if (!audioPath) {
      return null;
    }

    try {
      const url = resolveAudioUrl(audioPath);
      console.log(`[Audio Hook] Resolved: ${audioPath} -> ${url}`);
      return url;
    } catch (err) {
      console.error(`[Audio Hook] Resolution error:`, err);
      return audioPath; // Fallback to original path
    }
  }, [audioPath]);

  return {
    url: resolvedUrl,
    loading: false, // No async loading needed
    error: null,
  };
}
