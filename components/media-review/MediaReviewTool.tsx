'use client';

import React, { useState, useEffect } from 'react';
import { AudioReview } from './AudioReview';
import { PDFWithAudioReview } from './PDFWithAudioReview';
import { ImageReview } from './ImageReview';
import { VideoReview } from './VideoReview';
import { ContentReviewTool, type ContentItem } from '@/components/content-review';
import type { MediaResource } from '@/lib/types/media';
import { Loader2, AlertCircle } from 'lucide-react';

interface MediaReviewToolProps {
  resource: MediaResource;
  onSave: (content: string) => Promise<void>;
}

/**
 * MediaReviewTool - Main Wrapper Component
 *
 * Intelligently routes to the appropriate review component based on media type:
 * - 'audio' -> AudioReview (audio player + transcript editing)
 * - 'pdf' -> ContentReviewTool (reuse existing text editor)
 * - 'image' -> ImageReview (image viewer)
 * - 'video' -> VideoReview (video player)
 *
 * INTEGRATION STRATEGY:
 * - Wraps existing ContentReviewTool for text content
 * - Adds media-specific components for audio/image/video
 * - Maintains compatibility with existing API routes
 * - Uses Resource interface from data/resources.ts
 */
export const MediaReviewTool: React.FC<MediaReviewToolProps> = ({
  resource,
  onSave,
}) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch content on mount
  useEffect(() => {
    fetchContent();
  }, [resource.id]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/content/${resource.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();
      setContent(data.editedContent || data.originalContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleTranscriptSave = async (text: string) => {
    await onSave(text);
    setContent(text);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading media content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Error Loading Media</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={fetchContent}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Route to appropriate component based on media type
  switch (resource.type) {
    case 'audio':
      return (
        <AudioReview
          resource={resource}
          transcript={content}
          onTranscriptEdit={handleTranscriptSave}
        />
      );

    case 'image':
      return <ImageReview resource={resource} />;

    case 'video':
      return <VideoReview resource={resource} />;

    case 'pdf':
    default:
      // Check if PDF resource has audio - use enhanced component if it does
      if (resource.audioUrl) {
        return (
          <PDFWithAudioReview
            resource={resource}
            content={content}
            onContentSave={handleTranscriptSave}
          />
        );
      }

      // Reuse existing ContentReviewTool for PDF/text content without audio
      const contentItem: ContentItem = {
        id: `resource-${resource.id}`,
        original: content,
        edited: content,
        metadata: {
          title: resource.title,
          category: resource.category,
          lastModified: new Date().toISOString(),
        },
      };

      return (
        <ContentReviewTool
          initialContent={contentItem}
          onSave={async (item) => await onSave(item.edited)}
          autoSaveDelay={3000}
        />
      );
  }
};
