'use client';

import React, { useCallback } from 'react';
import { Save, FileText, AlertCircle } from 'lucide-react';
import { ComparisonView } from './ComparisonView';
import { EditPanel } from './EditPanel';
import type { TopicResourceWithContent } from '@/lib/types/topics';
import type { ResourceEditState } from './hooks/useTopicManager';

interface TopicResourceTabProps {
  resource: TopicResourceWithContent;
  editState: ResourceEditState;
  onContentChange: (content: string) => void;
  onSave: () => Promise<void>;
  className?: string;
}

/**
 * Individual tab content for a single resource variation
 *
 * Displays side-by-side view of original and edited content
 * for one resource variation within a topic
 */
export const TopicResourceTab: React.FC<TopicResourceTabProps> = ({
  resource,
  editState,
  onContentChange,
  onSave,
  className = '',
}) => {
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      await onSave();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  return (
    <div className={`topic-resource-tab ${className}`}>
      {/* Tab Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {resource.resource.title}
                </h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  {resource.resource.description}
                </p>
              </div>
            </div>

            {/* Resource Metadata */}
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                {resource.resource.category}
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                {resource.resource.level}
              </span>
              {resource.hasEdit && (
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded">
                  Has pending edit
                </span>
              )}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!editState.isDirty || isSaving}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium
              transition-colors duration-200
              ${editState.isDirty
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
              disabled:opacity-50
            `}
            aria-label="Save resource"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>

        {/* Save Error */}
        {saveError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{saveError}</p>
          </div>
        )}
      </div>

      {/* Side-by-side Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-gray-50">
        {/* Original Content Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <ComparisonView
            title="Original Content"
            content={editState.originalContent}
            isOriginal={true}
          />
        </div>

        {/* Edit Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <EditPanel
            content={editState.editedContent}
            onChange={onContentChange}
            onSave={handleSave}
            isDirty={editState.isDirty}
          />
        </div>
      </div>

      {/* Audio Player (if available) */}
      {resource.audioUrl && (
        <div className="border-t border-gray-200 px-6 py-4 bg-white">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Audio:</span>
            <audio
              src={resource.audioUrl}
              controls
              className="flex-1 max-w-md"
              preload="metadata"
            >
              Your browser does not support audio playback.
            </audio>
          </div>
        </div>
      )}
    </div>
  );
};
