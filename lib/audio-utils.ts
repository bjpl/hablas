/**
 * Audio Utilities for Preloading and Offline Support
 * Optimized for budget Android devices on slow networks
 */

export interface AudioCacheStatus {
  isCached: boolean;
  isPreloading: boolean;
  error?: string;
}

export interface AudioPreloadOptions {
  priority?: 'high' | 'low';
  resourceId?: number;
}

// Track preloading states
const preloadingAudio = new Map<string, boolean>();
const audioCache = new Map<string, Blob>();

/**
 * Preload audio file for offline use
 * Uses Service Worker caching when available
 */
export async function preloadAudio(
  audioUrl: string,
  options: AudioPreloadOptions = {}
): Promise<boolean> {
  if (!audioUrl) return false;

  // Check if already preloading
  if (preloadingAudio.get(audioUrl)) {
    return false;
  }

  try {
    preloadingAudio.set(audioUrl, true);

    // Try to use Service Worker cache first
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_URLS',
        urls: [audioUrl]
      });
    }

    // Fetch and cache the audio blob
    const response = await fetch(audioUrl, {
      method: 'GET',
      headers: {
        'Accept': 'audio/mpeg,audio/*'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to preload audio: ${response.status}`);
    }

    const blob = await response.blob();
    audioCache.set(audioUrl, blob);

    return true;
  } catch (error) {
    console.error('Error preloading audio:', error);
    return false;
  } finally {
    preloadingAudio.set(audioUrl, false);
  }
}

/**
 * Check if audio is cached
 */
export async function isAudioCached(audioUrl: string): Promise<AudioCacheStatus> {
  if (!audioUrl) {
    return { isCached: false, isPreloading: false, error: 'No URL provided' };
  }

  const isPreloading = preloadingAudio.get(audioUrl) || false;

  // Check memory cache
  if (audioCache.has(audioUrl)) {
    return { isCached: true, isPreloading };
  }

  // Check Service Worker cache
  if ('caches' in window) {
    try {
      const cache = await caches.open('hablas-runtime-v1');
      const response = await cache.match(audioUrl);
      return {
        isCached: !!response,
        isPreloading
      };
    } catch (error) {
      return {
        isCached: false,
        isPreloading,
        error: 'Cache check failed'
      };
    }
  }

  return { isCached: false, isPreloading };
}

/**
 * Download audio for offline use
 * Provides user feedback via download progress
 */
export async function downloadAudio(
  audioUrl: string,
  filename?: string
): Promise<{ success: boolean; error?: string }> {
  if (!audioUrl) {
    return { success: false, error: 'No URL provided' };
  }

  try {
    // First cache it
    await preloadAudio(audioUrl);

    // Get blob from cache or fetch
    let blob = audioCache.get(audioUrl);
    if (!blob) {
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      blob = await response.blob();
    }

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || audioUrl.split('/').pop() || 'audio.mp3';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Error downloading audio:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Download failed'
    };
  }
}

/**
 * Clear audio cache to free up space
 */
export async function clearAudioCache(): Promise<void> {
  audioCache.clear();

  if ('caches' in window) {
    const cache = await caches.open('hablas-runtime-v1');
    const keys = await cache.keys();

    for (const request of keys) {
      if (request.url.includes('/audio/')) {
        await cache.delete(request);
      }
    }
  }
}

/**
 * Get total cached audio size estimate
 */
export async function getCachedAudioSize(): Promise<number> {
  let totalSize = 0;

  // Memory cache size
  for (const blob of audioCache.values()) {
    totalSize += blob.size;
  }

  // Service Worker cache size (estimate)
  if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || totalSize;
  }

  return totalSize;
}

/**
 * Store playback position for resuming later
 */
export function savePlaybackPosition(audioUrl: string, position: number): void {
  if (typeof window === 'undefined') return;

  try {
    const key = `audio-position-${btoa(audioUrl)}`;
    localStorage.setItem(key, position.toString());
  } catch (error) {
    console.error('Error saving playback position:', error);
  }
}

/**
 * Get saved playback position
 */
export function getPlaybackPosition(audioUrl: string): number {
  if (typeof window === 'undefined') return 0;

  try {
    const key = `audio-position-${btoa(audioUrl)}`;
    const position = localStorage.getItem(key);
    return position ? parseFloat(position) : 0;
  } catch (error) {
    console.error('Error getting playback position:', error);
    return 0;
  }
}

/**
 * Clear saved playback position
 */
export function clearPlaybackPosition(audioUrl: string): void {
  if (typeof window === 'undefined') return;

  try {
    const key = `audio-position-${btoa(audioUrl)}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing playback position:', error);
  }
}
