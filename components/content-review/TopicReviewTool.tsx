'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2, Loader2, FolderOpen, ArrowLeft } from 'lucide-react';
import { useTopicManager } from './hooks/useTopicManager';
import { TopicResourceTab } from './TopicResourceTab';

export interface TopicReviewToolProps {
  topicSlug: string;
  onSave?: () => void;
  onBack?: () => void;
  className?: string;
}

/**
 * Main Topic Review Tool Component
 *
 * Orchestrates the review and editing of all resources within a topic.
 * Uses tabs to display each resource variation for easy comparison.
 *
 * Features:
 * - Tab-based navigation between resource variations
 * - Individual and batch save operations
 * - Unsaved changes tracking and warnings
 * - Keyboard shortcuts (Ctrl+S for save)
 * - Loading states and error handling
 * - Optimistic updates
 */
export const TopicReviewTool: React.FC<TopicReviewToolProps> = ({
  topicSlug,
  onSave,
  onBack,
  className = '',
}) => {
  const {
    topic,
    isLoading,
    error,
    resourceEdits,
    updateResourceContent,
    saveResource,
    saveAll,
    hasUnsavedChanges,
    dirtyResourceIds,
  } = useTopicManager(topicSlug);

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState<string>('');

  /**
   * Handle batch save of all dirty resources
   */
  const handleSaveAll = useCallback(async () => {
    if (!hasUnsavedChanges) return;

    setSaveStatus('saving');
    setSaveMessage('');

    try {
      await saveAll();
      setSaveStatus('success');
      setSaveMessage(`Saved ${dirtyResourceIds.length} resource(s)`);

      // Callback
      if (onSave) {
        onSave();
      }

      // Reset success status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setSaveMessage(error instanceof Error ? error.message : 'Failed to save resources');
    }
  }, [hasUnsavedChanges, saveAll, dirtyResourceIds.length, onSave]);

  /**
   * Handle save for currently active resource
   */
  const handleSaveActive = useCallback(async () => {
    if (!topic || activeTabIndex >= topic.resources.length) return;

    const activeResource = topic.resources[activeTabIndex];
    const resourceId = activeResource.resource.id;

    setSaveStatus('saving');
    setSaveMessage('');

    try {
      await saveResource(resourceId);
      setSaveStatus('success');
      setSaveMessage('Saved successfully');

      // Callback
      if (onSave) {
        onSave();
      }

      // Reset success status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setSaveMessage(error instanceof Error ? error.message : 'Failed to save resource');
    }
  }, [topic, activeTabIndex, saveResource, onSave]);

  /**
   * Keyboard shortcut handler (Ctrl+S)
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveActive();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveActive]);

  /**
   * Warn user about unsaved changes before leaving
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Loading topic resources...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !topic) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-sm border border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Failed to load topic
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {error || 'Topic not found'}
              </p>
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Go back
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeResource = topic.resources[activeTabIndex];
  const activeEditState = activeResource ? resourceEdits.get(activeResource.resource.id) : undefined;

  return (
    <div className={`topic-review-tool min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}

              {/* Topic Info */}
              <div>
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-gray-600" />
                  <h1 className="text-2xl font-bold text-gray-900">
                    {topic.topic.name}
                  </h1>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {topic.topic.description} • {topic.resources.length} variation(s)
                </p>
              </div>
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
                  <span className="text-sm">{saveMessage}</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{saveMessage}</span>
                </div>
              )}

              {/* Unsaved Changes Badge */}
              {hasUnsavedChanges && (
                <span className="px-3 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded-full">
                  {dirtyResourceIds.length} unsaved
                </span>
              )}

              {/* Save All Button */}
              <button
                onClick={handleSaveAll}
                disabled={!hasUnsavedChanges || saveStatus === 'saving'}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                  transition-colors duration-200
                  ${hasUnsavedChanges
                    ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                  disabled:opacity-50
                `}
                aria-label="Save all changes"
              >
                <Save className="w-4 h-4" />
                <span>Save All</span>
              </button>
            </div>
          </div>

          {/* Keyboard Shortcut Hint */}
          {hasUnsavedChanges && (
            <p className="mt-2 text-xs text-gray-500">
              Tip: Press Ctrl+S (or Cmd+S on Mac) to save the active resource
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex gap-2 overflow-x-auto">
            {topic.resources.map((resource, index) => {
              const editState = resourceEdits.get(resource.resource.id);
              const isActive = index === activeTabIndex;
              const isDirty = editState?.isDirty || false;

              return (
                <button
                  key={resource.resource.id}
                  onClick={() => setActiveTabIndex(index)}
                  className={`
                    px-4 py-3 text-sm font-medium whitespace-nowrap
                    border-b-2 transition-colors duration-200
                    ${isActive
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <span>{resource.resource.title}</span>
                  {isDirty && (
                    <span className="ml-2 inline-block w-2 h-2 bg-amber-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="pb-8">
        {activeResource && activeEditState && (
          <TopicResourceTab
            resource={activeResource}
            editState={activeEditState}
            onContentChange={(content) => updateResourceContent(activeResource.resource.id, content)}
            onSave={() => saveResource(activeResource.resource.id)}
          />
        )}
      </div>
    </div>
  );
};
