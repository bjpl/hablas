'use client';

import React, { useState } from 'react';
import { FileText, Mic, Volume2, LayoutGrid, Loader2, AlertCircle } from 'lucide-react';
import type { Resource } from '@/data/resources';
import { useResourceContent } from './useResourceContent';
import { PDFEditor } from './PDFEditor';
import { AudioScriptEditor } from './AudioScriptEditor';
import { AudioVerifier } from './AudioVerifier';
import type { ReviewMode } from './types';

interface ResourceReviewProps {
  resource: Resource;
  initialMode?: ReviewMode;
  onSaveComplete?: () => void;
}

/**
 * ResourceReview Component
 *
 * Unified entry point for resource content review.
 * Routes to appropriate editors based on content availability:
 *
 * - PDF only: PDFEditor
 * - Audio script only: AudioScriptEditor
 * - PDF + Audio: Tabbed view with both editors
 * - Audio verification: AudioVerifier component
 */
export function ResourceReview({
  resource,
  initialMode,
  onSaveComplete,
}: ResourceReviewProps) {
  const {
    data,
    loading,
    error,
    updatePdfContent,
    updateAudioScript,
    savePdfContent,
    saveAudioScript,
    saveAll,
  } = useResourceContent(resource);

  // Determine available modes based on content
  const availableModes: ReviewMode[] = React.useMemo(() => {
    if (!data) return [];

    const modes: ReviewMode[] = [];
    if (data.pdfContent) modes.push('pdf');
    if (data.audioScript || data.hasAudioScript) modes.push('audio-script');
    if (data.hasAudio) modes.push('audio-verify');
    if (modes.length > 1) modes.push('comparison');

    return modes;
  }, [data]);

  // Current mode
  const [mode, setMode] = useState<ReviewMode>(
    initialMode || (availableModes[0] || 'pdf')
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-xl border border-gray-200">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
          <p className="mt-3 text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-xl border border-red-200">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <p className="mt-3 text-gray-900 font-medium">Failed to load content</p>
          <p className="text-sm text-gray-600 mt-1">{error || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  const getModeIcon = (m: ReviewMode) => {
    switch (m) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'audio-script': return <Mic className="w-4 h-4" />;
      case 'audio-verify': return <Volume2 className="w-4 h-4" />;
      case 'comparison': return <LayoutGrid className="w-4 h-4" />;
    }
  };

  const getModeLabel = (m: ReviewMode) => {
    switch (m) {
      case 'pdf': return 'Reference';
      case 'audio-script': return 'Audio Script';
      case 'audio-verify': return 'Verify Audio';
      case 'comparison': return 'Compare All';
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      {availableModes.length > 1 && (
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg w-fit">
          {availableModes.map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === m
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {getModeIcon(m)}
              {getModeLabel(m)}
            </button>
          ))}
        </div>
      )}

      {/* Content area based on mode */}
      {mode === 'pdf' && data.pdfContent && (
        <PDFEditor
          content={data.pdfContent}
          onChange={updatePdfContent}
          onSave={async () => {
            await savePdfContent();
            onSaveComplete?.();
          }}
          title={`${resource.title} - Reference Content`}
          description="Comprehensive reference guide for web and PDF download"
        />
      )}

      {mode === 'audio-script' && data.audioScript && (
        <AudioScriptEditor
          content={data.audioScript}
          onChange={updateAudioScript}
          onSave={async () => {
            await saveAudioScript();
            onSaveComplete?.();
          }}
          audioUrl={data.audioUrl}
          title={`${resource.title} - Audio Script`}
          description="Concise narration script for TTS generation"
        />
      )}

      {mode === 'audio-verify' && data.audioUrl && (
        <AudioVerifier
          audioUrl={data.audioUrl}
          scriptContent={data.audioScript?.edited || data.pdfContent?.edited || 'No script content available'}
          title={`${resource.title} - Audio Verification`}
        />
      )}

      {mode === 'comparison' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {data.pdfContent ? (
            <PDFEditor
              content={data.pdfContent}
              onChange={updatePdfContent}
              onSave={async () => {
                await savePdfContent();
                onSaveComplete?.();
              }}
              title="Reference Content"
              description="Web/PDF content"
            />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reference Content</h3>
              <p className="text-gray-500">No reference content available for this resource.</p>
              <p className="text-sm text-gray-400 mt-2">Try refreshing or check if the resource file exists.</p>
            </div>
          )}

          {data.audioScript ? (
            <AudioScriptEditor
              content={data.audioScript}
              onChange={updateAudioScript}
              onSave={async () => {
                await saveAudioScript();
                onSaveComplete?.();
              }}
              audioUrl={data.audioUrl}
              title="Audio Script"
              description="TTS narration script"
            />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Audio Script</h3>
              <p className="text-gray-500">No audio script available for this resource.</p>
              <p className="text-sm text-gray-400 mt-2">This resource may not have an audio component.</p>
            </div>
          )}
        </div>
      )}

      {/* No content fallback */}
      {availableModes.length === 0 && (
        <div className="flex items-center justify-center h-96 bg-white rounded-xl border border-gray-200">
          <div className="text-center">
            <FileText className="w-10 h-10 text-gray-400 mx-auto" />
            <p className="mt-3 text-gray-600">No reviewable content found</p>
            <p className="text-sm text-gray-500 mt-1">
              This resource has no PDF content or audio script available
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
