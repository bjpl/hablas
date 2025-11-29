'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Resource } from '@/data/resources';
import type { ReviewableResource, ReviewContent, ContentStatus, SaveResult } from './types';

interface UseResourceContentOptions {
  autoFetch?: boolean;
}

interface UseResourceContentReturn {
  data: ReviewableResource | null;
  loading: boolean;
  error: string | null;
  updatePdfContent: (edited: string) => void;
  updateAudioScript: (edited: string) => void;
  savePdfContent: () => Promise<SaveResult>;
  saveAudioScript: () => Promise<SaveResult>;
  saveAll: () => Promise<SaveResult>;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching and managing resource content for review
 *
 * Handles both PDF content and audio script content with independent
 * edit tracking and save operations.
 */
export function useResourceContent(
  resource: Resource,
  options: UseResourceContentOptions = {}
): UseResourceContentReturn {
  const { autoFetch = true } = options;

  const [data, setData] = useState<ReviewableResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch content from API
  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch PDF/main content
      const pdfResponse = await fetch(`/api/content/${resource.id}`);
      let pdfContent: ReviewContent | undefined;

      if (pdfResponse.ok) {
        const pdfData = await pdfResponse.json();
        pdfContent = {
          id: `pdf-${resource.id}`,
          original: pdfData.content || '',
          edited: pdfData.editedContent || pdfData.content || '',
          status: (pdfData.status as ContentStatus) || 'draft',
          lastModified: pdfData.updatedAt,
          editedBy: pdfData.editedBy,
        };
      }

      // Check for audio script (different file path pattern)
      let audioScript: ReviewContent | undefined;
      const hasAudioScript = resource.downloadUrl?.includes('audio-script') ||
                             resource.type === 'audio';

      if (hasAudioScript && resource.downloadUrl) {
        try {
          const scriptResponse = await fetch(resource.downloadUrl);
          if (scriptResponse.ok) {
            const scriptText = await scriptResponse.text();
            audioScript = {
              id: `script-${resource.id}`,
              original: scriptText,
              edited: scriptText,
              status: 'draft',
            };
          }
        } catch {
          // Audio script fetch failed, continue without it
        }
      }

      setData({
        resource,
        pdfContent,
        audioScript,
        audioUrl: resource.audioUrl,
        hasAudio: Boolean(resource.audioUrl),
        hasAudioScript: Boolean(audioScript),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch content');
    } finally {
      setLoading(false);
    }
  }, [resource]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchContent();
    }
  }, [autoFetch, fetchContent]);

  // Update PDF content locally
  const updatePdfContent = useCallback((edited: string) => {
    setData(prev => {
      if (!prev || !prev.pdfContent) return prev;
      return {
        ...prev,
        pdfContent: {
          ...prev.pdfContent,
          edited,
          status: 'pending' as ContentStatus,
        },
      };
    });
  }, []);

  // Update audio script locally
  const updateAudioScript = useCallback((edited: string) => {
    setData(prev => {
      if (!prev || !prev.audioScript) return prev;
      return {
        ...prev,
        audioScript: {
          ...prev.audioScript,
          edited,
          status: 'pending' as ContentStatus,
        },
      };
    });
  }, []);

  // Save PDF content to API
  const savePdfContent = useCallback(async (): Promise<SaveResult> => {
    if (!data?.pdfContent) {
      return { success: false, error: 'No PDF content to save' };
    }

    try {
      const response = await fetch('/api/content/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: resource.id,
          editedContent: data.pdfContent.edited,
          contentType: 'pdf',
          status: 'pending',
          editedBy: 'admin',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save PDF content');
      }

      setData(prev => {
        if (!prev?.pdfContent) return prev;
        return {
          ...prev,
          pdfContent: {
            ...prev.pdfContent,
            status: 'pending',
            lastModified: new Date().toISOString(),
          },
        };
      });

      return { success: true, message: 'PDF content saved' };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Save failed'
      };
    }
  }, [data, resource.id]);

  // Save audio script to API
  const saveAudioScript = useCallback(async (): Promise<SaveResult> => {
    if (!data?.audioScript) {
      return { success: false, error: 'No audio script to save' };
    }

    try {
      const response = await fetch('/api/content/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: resource.id,
          editedContent: data.audioScript.edited,
          contentType: 'audio-script',
          status: 'pending',
          editedBy: 'admin',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save audio script');
      }

      setData(prev => {
        if (!prev?.audioScript) return prev;
        return {
          ...prev,
          audioScript: {
            ...prev.audioScript,
            status: 'pending',
            lastModified: new Date().toISOString(),
          },
        };
      });

      return { success: true, message: 'Audio script saved' };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Save failed'
      };
    }
  }, [data, resource.id]);

  // Save all content
  const saveAll = useCallback(async (): Promise<SaveResult> => {
    const results: SaveResult[] = [];

    if (data?.pdfContent) {
      results.push(await savePdfContent());
    }
    if (data?.audioScript) {
      results.push(await saveAudioScript());
    }

    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
      return {
        success: false,
        error: failed.map(f => f.error).join('; ')
      };
    }

    return { success: true, message: 'All content saved' };
  }, [data, savePdfContent, saveAudioScript]);

  return {
    data,
    loading,
    error,
    updatePdfContent,
    updateAudioScript,
    savePdfContent,
    saveAudioScript,
    saveAll,
    refetch: fetchContent,
  };
}
