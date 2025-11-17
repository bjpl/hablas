'use client';

import React from 'react';
import { AudioPlayer } from './AudioPlayer';
import { ContentReviewTool, type ContentItem } from '@/components/content-review';
import type { MediaResource } from '@/lib/types/media';
import { Music } from 'lucide-react';

interface AudioReviewProps {
  resource: MediaResource;
  transcript: string;
  onTranscriptEdit: (text: string) => Promise<void>;
}

export const AudioReview: React.FC<AudioReviewProps> = ({
  resource,
  transcript,
  onTranscriptEdit,
}) => {
  // Create ContentItem for the transcript
  const transcriptContent: ContentItem = {
    id: `audio-transcript-${resource.id}`,
    original: transcript,
    edited: transcript,
    metadata: {
      title: `${resource.title} - Audio Script`,
      category: 'Audio Transcript',
      lastModified: new Date().toISOString(),
    },
  };

  // Handle transcript save
  const handleTranscriptSave = async (content: ContentItem) => {
    await onTranscriptEdit(content.edited);
  };

  // Get audio metadata
  const metadata = resource.metadata;
  const duration = metadata?.duration
    ? `${Math.floor(metadata.duration / 60)}:${(metadata.duration % 60).toFixed(0).padStart(2, '0')}`
    : 'Unknown';

  return (
    <div className="audio-review-container">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Music className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Audio Review</h2>
            <p className="text-sm text-gray-600">{resource.title}</p>
          </div>
        </div>

        {/* Audio Metadata */}
        {metadata && (
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
            <span className="px-2 py-1 bg-white rounded shadow-sm">
              Duration: {duration}
            </span>
            {metadata.format && (
              <span className="px-2 py-1 bg-white rounded shadow-sm">
                Format: {metadata.format.toUpperCase()}
              </span>
            )}
            {metadata.bitrate && (
              <span className="px-2 py-1 bg-white rounded shadow-sm">
                Bitrate: {(metadata.bitrate / 1000).toFixed(0)} kbps
              </span>
            )}
            {metadata.sampleRate && (
              <span className="px-2 py-1 bg-white rounded shadow-sm">
                Sample Rate: {(metadata.sampleRate / 1000).toFixed(1)} kHz
              </span>
            )}
          </div>
        )}
      </div>

      {/* Audio Player & Transcript Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-gray-50">
        {/* Audio Player Side */}
        <div className="space-y-6">
          {/* Audio Player */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Audio Player</h3>
            <AudioPlayer src={resource.audioUrl || ''} />
          </div>

          {/* Audio Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Audio Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">File Path</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                  {resource.audioUrl}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {resource.category}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Level</dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {resource.level}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tags</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {resource.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Transcript Side - REUSE EXISTING ContentReviewTool! */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Audio Transcript</h3>
            <p className="text-sm text-gray-600 mt-1">
              Edit the transcript to match the audio content
            </p>
          </div>

          {/* Embed existing ContentReviewTool for transcript editing */}
          <div className="p-4">
            <ContentReviewTool
              initialContent={transcriptContent}
              onSave={handleTranscriptSave}
              autoSaveDelay={3000}
              className="border-0 shadow-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
