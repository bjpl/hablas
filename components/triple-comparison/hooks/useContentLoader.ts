/**
 * useContentLoader Hook
 *
 * React hook for loading resource content with modern patterns:
 * - Automatic content fetching on mount
 * - Loading states with useTransition
 * - Error handling with retry
 * - Deferred updates for better UX
 */

import { useState, useEffect, useCallback, useTransition, useDeferredValue } from 'react';
import {
  fetchResourceContent,
  clearContentCache,
  getErrorMessage,
  type FetchedContent,
  type ContentFetchError,
} from '@/lib/utils/content-fetcher';

export interface UseContentLoaderOptions {
  resourceId: string;
  downloadableUrl?: string;
  webUrl?: string;
  audioUrl?: string;
  autoLoad?: boolean;
  cache?: boolean;
}

export interface UseContentLoaderReturn {
  content: FetchedContent | null;
  deferredContent: FetchedContent | null;
  isLoading: boolean;
  isPending: boolean;
  error: string | null;
  errors: Map<string, string>;
  loadContent: () => Promise<void>;
  reloadContent: () => Promise<void>;
  clearCache: () => void;
}

/**
 * Hook for loading and managing resource content
 */
export function useContentLoader({
  resourceId,
  downloadableUrl,
  webUrl,
  audioUrl,
  autoLoad = true,
  cache = true,
}: UseContentLoaderOptions): UseContentLoaderReturn {
  const [content, setContent] = useState<FetchedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  // Defer content updates for smoother UX
  const deferredContent = useDeferredValue(content);

  /**
   * Load content from sources
   */
  const loadContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setErrors(new Map());

    try {
      const fetchedContent = await fetchResourceContent(
        resourceId,
        {
          downloadableUrl,
          webUrl,
          audioUrl,
        },
        {
          cache,
          maxRetries: 3,
          retryDelay: 1000,
        }
      );

      // Use transition for non-urgent state updates
      startTransition(() => {
        setContent(fetchedContent);
      });

      // Track individual errors
      const errorMap = new Map<string, string>();

      if (!fetchedContent.downloadable && downloadableUrl) {
        errorMap.set('downloadable', 'Failed to load downloadable content');
      }

      if (!fetchedContent.web && webUrl) {
        errorMap.set('web', 'Failed to load web content');
      }

      if (!fetchedContent.audio && audioUrl) {
        errorMap.set('audio', 'Audio transcript not available');
      }

      if (errorMap.size > 0) {
        setErrors(errorMap);
      }

    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('Content loading error:', err);

      // Set empty content on error
      startTransition(() => {
        setContent({
          downloadable: '',
          web: '',
          audio: '',
        });
      });
    } finally {
      setIsLoading(false);
    }
  }, [resourceId, downloadableUrl, webUrl, audioUrl, cache]);

  /**
   * Reload content with cache bypass
   */
  const reloadContent = useCallback(async () => {
    clearContentCache(resourceId);
    await loadContent();
  }, [resourceId, loadContent]);

  /**
   * Clear cache for this resource
   */
  const clearCache = useCallback(() => {
    clearContentCache(resourceId);
  }, [resourceId]);

  /**
   * Auto-load content on mount or when URLs change
   */
  useEffect(() => {
    if (autoLoad && resourceId) {
      loadContent();
    }
  }, [autoLoad, resourceId, loadContent]);

  return {
    content,
    deferredContent,
    isLoading,
    isPending,
    error,
    errors,
    loadContent,
    reloadContent,
    clearCache,
  };
}
