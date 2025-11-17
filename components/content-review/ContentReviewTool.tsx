'use client';

import React, { useState, useCallback } from 'react';
import { Save, AlertCircle, CheckCircle2, Loader2, GitCompare } from 'lucide-react';
import { ComparisonView } from './ComparisonView';
import { EditPanel } from './EditPanel';
import { DiffHighlighter } from './DiffHighlighter';
import { useAutoSave } from './hooks/useAutoSave';
import { useContentManager } from './hooks/useContentManager';

export interface ContentItem {
  id: string;
  original: string;
  edited: string;
  metadata?: {
    title?: string;
    category?: string;
    lastModified?: string;
  };
}

interface ContentReviewToolProps {
  initialContent?: ContentItem;
  onSave?: (content: ContentItem) => Promise<void>;
  autoSaveDelay?: number;
  className?: string;
}

export const ContentReviewTool: React.FC<ContentReviewToolProps> = ({
  initialContent,
  onSave,
  autoSaveDelay = 2000,
  className = '',
}) => {
  const {
    content,
    updateContent,
    isDirty,
    resetDirty,
  } = useContentManager(initialContent);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showDiff, setShowDiff] = useState(false);

  // Handle manual save
  const handleManualSave = useCallback(async () => {
    if (!onSave || !content) return;

    setSaveStatus('saving');
    setErrorMessage('');

    try {
      await onSave(content);
      setSaveStatus('success');
      resetDirty();

      // Reset success status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save content');
    }
  }, [content, onSave, resetDirty]);

  // Auto-save callback
  const handleAutoSave = useCallback(async (currentContent: ContentItem) => {
    if (!onSave) return;

    try {
      await onSave(currentContent);
      console.log('Auto-saved successfully');
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [onSave]);

  // Setup auto-save
  useAutoSave({
    content,
    onSave: handleAutoSave,
    delay: autoSaveDelay,
    enabled: isDirty && !!onSave,
  });

  // Handle content updates
  const handleEditChange = useCallback((newEditedContent: string) => {
    updateContent({ edited: newEditedContent });
  }, [updateContent]);

  if (!content) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No content to review</p>
      </div>
    );
  }

  return (
    <div className={`content-review-tool ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Content Review Tool
            </h1>
            {content.metadata?.title && (
              <p className="text-sm text-gray-600 mt-1">
                {content.metadata.title}
              </p>
            )}
          </div>

          {/* Save Controls */}
          <div className="flex items-center gap-3">
            {/* Status Indicator */}
            {saveStatus === 'saving' && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Saving...</span>
              </div>
            )}
            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">Saved</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Save failed</span>
              </div>
            )}

            {/* Diff Toggle Button */}
            <button
              onClick={() => setShowDiff(!showDiff)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg font-medium
                transition-colors duration-200
                ${showDiff
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              aria-label="Toggle diff view"
            >
              <GitCompare className="w-4 h-4" />
              <span className="text-sm">Diff</span>
            </button>

            {/* Manual Save Button */}
            <button
              onClick={handleManualSave}
              disabled={!isDirty || saveStatus === 'saving'}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                transition-colors duration-200
                ${isDirty
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
                disabled:opacity-50
              `}
              aria-label="Save changes"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Metadata */}
        {content.metadata && (
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            {content.metadata.category && (
              <span className="px-2 py-1 bg-gray-100 rounded">
                {content.metadata.category}
              </span>
            )}
            {content.metadata.lastModified && (
              <span>
                Last modified: {new Date(content.metadata.lastModified).toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="bg-gray-50 min-h-screen">
        {showDiff ? (
          /* Diff View */
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-gray-600" />
                  <h2 className="text-sm font-semibold text-gray-700">
                    Changes Comparison
                  </h2>
                </div>
              </div>
              <DiffHighlighter original={content.original} edited={content.edited} />
            </div>
          </div>
        ) : (
          /* Side-by-side View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Original Content Panel */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <ComparisonView
                title="Original Content"
                content={content.original}
                isOriginal={true}
              />
            </div>

            {/* Edit Panel */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <EditPanel
                content={content.edited}
                onChange={handleEditChange}
                onSave={handleManualSave}
                isDirty={isDirty}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
