'use client';

import { useState, useEffect } from 'react';
import AudioPlayer from '@/components/AudioPlayer';
import { Save, X, RefreshCw, FileAudio } from 'lucide-react';

interface AudioResourcePreviewProps {
  resourceId: number;
  title: string;
  audioUrl?: string;
  originalTranscript: string;
  editedTranscript?: string;
  metadata?: {
    duration?: string;
    voice?: string;
    accent?: string;
    narrator?: string;
  };
  onSave: (resourceId: number, editedContent: string) => Promise<void>;
  onDiscard: () => void;
  isDirty: boolean;
}

export default function AudioResourcePreview({
  resourceId,
  title,
  audioUrl,
  originalTranscript,
  editedTranscript,
  metadata,
  onSave,
  onDiscard,
  isDirty,
}: AudioResourcePreviewProps) {
  const [transcript, setTranscript] = useState(editedTranscript || originalTranscript);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'original' | 'edited'>('edited');

  useEffect(() => {
    setTranscript(editedTranscript || originalTranscript);
  }, [editedTranscript, originalTranscript]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(resourceId, transcript);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setTranscript(originalTranscript);
    onDiscard();
  };

  const hasChanges = transcript !== originalTranscript;
  const displayTranscript = previewMode === 'edited' ? transcript : originalTranscript;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Resource Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileAudio className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                {metadata?.duration && (
                  <span>Duration: {metadata.duration}</span>
                )}
                {metadata?.narrator && (
                  <span>Voice: {metadata.narrator}</span>
                )}
                {metadata?.accent && (
                  <span>Accent: {metadata.accent}</span>
                )}
              </div>
            </div>
          </div>

          {hasChanges && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDiscard}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Audio Player Section */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <AudioPlayer
          audioUrl={audioUrl}
          title={title}
          metadata={metadata}
          resourceId={resourceId}
          enhanced={true}
        />
      </div>

      {/* Transcript Section */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-gray-900">Transcript</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Preview:</span>
            <div className="inline-flex rounded-lg border border-gray-300 p-0.5">
              <button
                onClick={() => setPreviewMode('edited')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  previewMode === 'edited'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Edited
              </button>
              <button
                onClick={() => setPreviewMode('original')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  previewMode === 'original'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Original
              </button>
            </div>
          </div>
        </div>

        {/* Side-by-side view */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Edit Area */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Edit Transcript
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              placeholder="Enter transcript here..."
            />
          </div>

          {/* Preview Area */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              {previewMode === 'edited' ? 'Preview (Edited)' : 'Original Transcript'}
            </label>
            <div className="w-full h-64 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap font-mono text-sm text-gray-900">
                  {displayTranscript || <span className="text-gray-400 italic">No transcript available</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Character count */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>
            {transcript.length} characters
            {hasChanges && (
              <span className="ml-2 text-orange-600 font-medium">
                • {transcript.length - originalTranscript.length > 0 ? '+' : ''}
                {transcript.length - originalTranscript.length} chars
              </span>
            )}
          </span>
          {hasChanges && (
            <span className="text-orange-600 font-medium">Unsaved changes</span>
          )}
        </div>
      </div>
    </div>
  );
}
