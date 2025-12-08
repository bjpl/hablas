'use client';

import React, { useState, useMemo } from 'react';
import { AudioPlayer } from './AudioPlayer';
import { ContentReviewTool, AudioTranscriptReview, type ContentItem } from '@/components/content-review';
import type { MediaResource } from '@/lib/types/media';
import { FileText, Music, Captions, FileText as FileTextIcon } from 'lucide-react';
import { isAudioScript, parseAudioScript, generateVTT, type TranscriptSegment } from '@/lib/utils/transcript-parser';
import { createLogger } from '@/lib/utils/logger';

const pdfAudioReviewLogger = createLogger('components:PDFWithAudioReview');

interface PDFWithAudioReviewProps {
  resource: MediaResource;
  content: string;
  onContentSave: (text: string) => Promise<void>;
}

type ViewMode = 'transcript' | 'editor';

/**
 * PDFWithAudioReview Component
 *
 * Displays PDF/text content alongside audio player for resources that have both.
 * Provides synchronized review of written content and audio narration.
 *
 * Enhanced features:
 * - Detects audio scripts with timestamps
 * - Uses AudioTranscriptReview for synchronized playback
 * - Falls back to ContentReviewTool for regular content
 */
export const PDFWithAudioReview: React.FC<PDFWithAudioReviewProps> = ({
  resource,
  content,
  onContentSave,
}) => {
  // Check if content is an audio script with timestamps
  const hasTimestamps = useMemo(() => isAudioScript(content), [content]);

  // Parse transcript segments if this is an audio script
  const transcriptSegments = useMemo(() => {
    if (hasTimestamps) {
      return parseAudioScript(content);
    }
    return [];
  }, [content, hasTimestamps]);

  // View mode - show transcript view by default for audio scripts
  const [viewMode, setViewMode] = useState<ViewMode>(
    hasTimestamps && transcriptSegments.length > 0 ? 'transcript' : 'editor'
  );

  // Create ContentItem for the text content
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

  // Handle content save
  const handleContentSave = async (item: ContentItem) => {
    await onContentSave(item.edited);
  };

  // Handle transcript segment save
  const handleTranscriptSave = async (segments: TranscriptSegment[]) => {
    // Convert segments back to text format and save
    // For now, just log - in production, this would update the content
    pdfAudioReviewLogger.debug('Saving transcript segments', { segmentCount: segments.length });
    // The transcript is displayed from the original content
    // Editing individual segments would require a different data model
  };

  // Handle VTT export
  const handleExportVTT = () => {
    const vttContent = generateVTT(transcriptSegments, true);
    const blob = new Blob([vttContent], { type: 'text/vtt' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resource.title.replace(/\s+/g, '-')}.vtt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Check if resource has audio
  const hasAudio = Boolean(resource.audioUrl);

  return (
    <div className="pdf-audio-review-container">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">Content & Audio Review</h2>
            <p className="text-sm text-gray-600">{resource.title}</p>
          </div>

          {/* View Mode Toggle - Only show for audio scripts with timestamps */}
          {hasTimestamps && transcriptSegments.length > 0 && (
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('transcript')}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'transcript'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-pressed={viewMode === 'transcript'}
              >
                <Captions className="w-4 h-4" />
                Transcript
              </button>
              <button
                onClick={() => setViewMode('editor')}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'editor'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-pressed={viewMode === 'editor'}
              >
                <FileTextIcon className="w-4 h-4" />
                Editor
              </button>
            </div>
          )}

          {hasAudio && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
              <Music className="w-4 h-4 text-green-700" />
              <span className="text-xs font-medium text-green-700">Audio Available</span>
            </div>
          )}
        </div>

        {/* Resource Metadata */}
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
          <span className="px-2 py-1 bg-white rounded shadow-sm">
            Type: {resource.type.toUpperCase()}
          </span>
          <span className="px-2 py-1 bg-white rounded shadow-sm">
            Category: {resource.category}
          </span>
          <span className="px-2 py-1 bg-white rounded shadow-sm">
            Level: {resource.level}
          </span>
          <span className="px-2 py-1 bg-white rounded shadow-sm">
            Size: {resource.size}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'transcript' && hasAudio && transcriptSegments.length > 0 ? (
        /* Transcript View - Synchronized audio/transcript review */
        <div className="p-6 bg-gray-50 min-h-screen">
          <AudioTranscriptReview
            audioUrl={resource.audioUrl || ''}
            title={resource.title}
            transcriptSegments={transcriptSegments}
            onSaveTranscript={handleTranscriptSave}
            onExportVTT={handleExportVTT}
            readOnly={false}
          />

          {/* Resource Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Editor View - Traditional grid layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-gray-50 min-h-screen">
          {/* Audio Player Side (1/3 width on large screens) */}
          {hasAudio && (
            <div className="lg:col-span-1 space-y-6">
              {/* Audio Player */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Music className="w-5 h-5 text-purple-600" />
                  Audio Narration
                </h3>
                <AudioPlayer src={resource.audioUrl || ''} />

                {/* Audio Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Audio Information</h4>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-gray-500">File Path</dt>
                      <dd className="mt-1 text-gray-900 font-mono text-xs bg-gray-50 p-2 rounded break-all">
                        {resource.audioUrl}
                      </dd>
                    </div>
                    {resource.metadata?.duration && (
                      <div>
                        <dt className="text-gray-500">Duration</dt>
                        <dd className="mt-1 text-gray-900">
                          {Math.floor(resource.metadata.duration / 60)}:
                          {(resource.metadata.duration % 60).toFixed(0).padStart(2, '0')}
                        </dd>
                      </div>
                    )}
                    {resource.metadata?.format && (
                      <div>
                        <dt className="text-gray-500">Format</dt>
                        <dd className="mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {resource.metadata.format.toUpperCase()}
                          </span>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Usage Instructions */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Review Tips</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Play audio while reviewing text</li>
                    <li>• Ensure text matches audio narration</li>
                    <li>• Check pronunciation accuracy</li>
                    <li>• Verify timing and pacing</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Content Editor Side (2/3 width on large screens, or full width if no audio) */}
          <div className={hasAudio ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Content Editor</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Edit the content to match the audio narration and improve clarity
                </p>
              </div>

              {/* Embed existing ContentReviewTool for content editing */}
              <div className="p-6">
                <ContentReviewTool
                  initialContent={contentItem}
                  onSave={handleContentSave}
                  autoSaveDelay={3000}
                  className="border-0 shadow-none"
                />
              </div>
            </div>

            {/* Resource Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
