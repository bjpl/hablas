/**
 * Content Fetcher Utility
 *
 * Fetches and caches resource content from various sources:
 * - Downloadable PDF/markdown content
 * - Web version content
 * - Audio transcripts
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Content caching to avoid redundant requests
 * - Type-safe error handling
 * - Loading state management
 */

export interface FetchedContent {
  downloadable: string;
  web: string;
  audio: string;
}

export interface ContentFetchError {
  type: 'downloadable' | 'web' | 'audio';
  message: string;
  originalError?: Error;
}

export interface FetchOptions {
  maxRetries?: number;
  retryDelay?: number;
  cache?: boolean;
  signal?: AbortSignal;
}

// Content cache using Map for O(1) lookup
const contentCache = new Map<string, FetchedContent>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps = new Map<string, number>();

/**
 * Fetch content with retry logic and exponential backoff
 */
async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<string> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    signal,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, { signal });

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const contentType = response.headers.get('content-type');

      // Handle JSON responses (from API)
      if (contentType?.includes('application/json')) {
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // Extract content from API response
        return data.originalContent || data.content || data.text || '';
      }

      // Handle text responses (direct file access)
      return await response.text();

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry on abort
      if (lastError.name === 'AbortError') {
        throw lastError;
      }

      // Don't retry on final attempt
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff
      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Failed to fetch content');
}

/**
 * Fetch downloadable PDF/markdown content
 */
async function fetchDownloadableContent(
  resourceId: string,
  downloadUrl?: string,
  options: FetchOptions = {}
): Promise<string> {
  if (!downloadUrl) {
    return '';
  }

  try {
    // Try API endpoint first (includes cleaned content)
    const apiUrl = `/api/content/${resourceId}`;
    const apiContent = await fetchWithRetry(apiUrl, options);

    if (apiContent) {
      return apiContent;
    }
  } catch (error) {
    console.warn('API fetch failed, falling back to direct file access:', error);
  }

  // Fallback to direct file access
  try {
    const fileUrl = downloadUrl.startsWith('/') ? downloadUrl : `/${downloadUrl}`;
    return await fetchWithRetry(fileUrl, options);
  } catch (error) {
    throw new Error(
      `Failed to fetch downloadable content: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Fetch web version content
 * (Currently same as downloadable, but kept separate for future differentiation)
 */
async function fetchWebContent(
  resourceId: string,
  webUrl?: string,
  options: FetchOptions = {}
): Promise<string> {
  // For now, web content is the same as downloadable
  // In the future, this could fetch from a different source
  return fetchDownloadableContent(resourceId, webUrl, options);
}

/**
 * Fetch audio transcript content
 */
async function fetchAudioTranscript(
  audioUrl?: string,
  downloadUrl?: string,
  options: FetchOptions = {}
): Promise<string> {
  if (!audioUrl && !downloadUrl) {
    return '';
  }

  let result = '';

  try {
    // Try to derive transcript URL from download URL
    // Pattern: basic_audio_1-audio-script.txt or basic_phrases_1.md -> basic_phrases_1-audio-script.txt
    if (downloadUrl) {
      const transcriptUrl = downloadUrl
        .replace(/\.md$/, '-audio-script.txt')
        .replace(/\.pdf$/, '-audio-script.txt');

      try {
        const fileUrl = transcriptUrl.startsWith('/') ? transcriptUrl : `/${transcriptUrl}`;
        result = await fetchWithRetry(fileUrl, options);
        if (result) return result;
      } catch (error) {
        // If transcript file doesn't exist, try alternative patterns
        console.warn('Direct transcript fetch failed:', error);
      }
    }

    // Try alternative pattern: look for -audio-script.md
    if (!result && downloadUrl) {
      try {
        const mdTranscriptUrl = downloadUrl
          .replace(/\.md$/, '-audio-script.md')
          .replace(/\.txt$/, '-audio-script.md');
        const fileUrl = mdTranscriptUrl.startsWith('/') ? mdTranscriptUrl : `/${mdTranscriptUrl}`;
        result = await fetchWithRetry(fileUrl, options);
        if (result) return result;
      } catch {
        // MD transcript not found
      }
    }

    // Try pattern: same directory with audio-script suffix
    if (!result && downloadUrl) {
      try {
        const parts = downloadUrl.split('/');
        const filename = parts.pop() || '';
        const baseName = filename.replace(/\.[^.]+$/, '');
        const transcriptUrl = [...parts, `${baseName}-audio-script.txt`].join('/');
        const fileUrl = transcriptUrl.startsWith('/') ? transcriptUrl : `/${transcriptUrl}`;
        result = await fetchWithRetry(fileUrl, options);
        if (result) return result;
      } catch {
        // Alternative pattern not found
      }
    }

    // If we have an audio URL, try to find associated transcript
    if (!result && audioUrl) {
      // Try replacing .mp3 with -audio-script.txt
      const transcriptUrl = audioUrl
        .replace(/\.mp3$/, '-audio-script.txt')
        .replace(/\/audio\//, '/generated-resources/50-batch/repartidor/');

      try {
        result = await fetchWithRetry(transcriptUrl, options);
        if (result) return result;
      } catch (error) {
        console.warn('Audio URL transcript fetch failed:', error);
      }
    }

    // Return empty string if no transcript found
    return result;
  } catch (error) {
    throw new Error(
      `Failed to fetch audio transcript: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check if cached content is still valid
 */
function isCacheValid(key: string): boolean {
  const timestamp = cacheTimestamps.get(key);
  if (!timestamp) {
    return false;
  }
  return Date.now() - timestamp < CACHE_EXPIRY;
}

/**
 * Get cache key for a resource
 */
function getCacheKey(resourceId: string): string {
  return `resource-${resourceId}`;
}

/**
 * Main function to fetch all content types for a resource
 */
export async function fetchResourceContent(
  resourceId: string,
  urls: {
    downloadableUrl?: string;
    webUrl?: string;
    audioUrl?: string;
  },
  options: FetchOptions = {}
): Promise<FetchedContent> {
  const { cache = true } = options;
  const cacheKey = getCacheKey(resourceId);

  // Check cache first
  if (cache && contentCache.has(cacheKey) && isCacheValid(cacheKey)) {
    return contentCache.get(cacheKey)!;
  }

  const errors: ContentFetchError[] = [];

  // Fetch all content types in parallel for performance
  const [downloadable, web, audio] = await Promise.allSettled([
    fetchDownloadableContent(resourceId, urls.downloadableUrl, options),
    fetchWebContent(resourceId, urls.webUrl, options),
    fetchAudioTranscript(urls.audioUrl, urls.downloadableUrl, options),
  ]);

  const content: FetchedContent = {
    downloadable: downloadable.status === 'fulfilled' ? downloadable.value : '',
    web: web.status === 'fulfilled' ? web.value : '',
    audio: audio.status === 'fulfilled' ? audio.value : '',
  };

  // Track errors but don't throw (partial success is acceptable)
  if (downloadable.status === 'rejected') {
    errors.push({
      type: 'downloadable',
      message: 'Failed to load downloadable content',
      originalError: downloadable.reason,
    });
  }

  if (web.status === 'rejected') {
    errors.push({
      type: 'web',
      message: 'Failed to load web content',
      originalError: web.reason,
    });
  }

  if (audio.status === 'rejected') {
    errors.push({
      type: 'audio',
      message: 'Failed to load audio transcript',
      originalError: audio.reason,
    });
  }

  // Log errors for debugging
  if (errors.length > 0) {
    console.warn('Content fetch errors:', errors);
  }

  // Cache the result
  if (cache) {
    contentCache.set(cacheKey, content);
    cacheTimestamps.set(cacheKey, Date.now());
  }

  return content;
}

/**
 * Clear cached content for a specific resource
 */
export function clearContentCache(resourceId?: string): void {
  if (resourceId) {
    const cacheKey = getCacheKey(resourceId);
    contentCache.delete(cacheKey);
    cacheTimestamps.delete(cacheKey);
  } else {
    contentCache.clear();
    cacheTimestamps.clear();
  }
}

/**
 * Prefetch content for a resource (useful for optimization)
 */
export async function prefetchResourceContent(
  resourceId: string,
  urls: {
    downloadableUrl?: string;
    webUrl?: string;
    audioUrl?: string;
  }
): Promise<void> {
  try {
    await fetchResourceContent(resourceId, urls, { cache: true });
  } catch (error) {
    console.warn('Prefetch failed:', error);
  }
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('404')) {
      return 'Content not found. The resource may have been moved or deleted.';
    }
    if (error.message.includes('403')) {
      return 'Access denied. You may not have permission to view this content.';
    }
    if (error.message.includes('500')) {
      return 'Server error. Please try again later.';
    }
    if (error.name === 'AbortError') {
      return 'Request was cancelled.';
    }
    if (error.message.includes('Failed to fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    return error.message;
  }
  return 'An unexpected error occurred while loading content.';
}
