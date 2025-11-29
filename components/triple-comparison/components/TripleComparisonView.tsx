'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Save, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { PDFPreviewPanel } from '../panels/PDFPreviewPanel';
import { WebContentPanel } from '../panels/WebContentPanel';
import { AudioTranscriptPanel } from '../panels/AudioTranscriptPanel';
import { DiffViewer } from './DiffViewer';
import { SyncControls } from './SyncControls';
import { useTripleComparison } from '../hooks/useTripleComparison';
import { useContentLoader } from '../hooks/useContentLoader';
import type { TripleComparisonViewProps, ContentType, SyncOperation } from '../types';

export function TripleComparisonView({
  resourceId,
  downloadableUrl,
  webUrl,
  audioUrl,
  onSave,
  onCancel,
}: TripleComparisonViewProps) {
  const [selectedPanels, setSelectedPanels] = useState<Record<ContentType, boolean>>({
    downloadable: false,
    web: false,
    audio: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Load content from actual sources with modern React patterns
  const {
    content: loadedContent,
    deferredContent,
    isLoading: isLoadingContent,
    isPending,
    error: loadError,
    errors: loadErrors,
    reloadContent,
  } = useContentLoader({
    resourceId,
    downloadableUrl,
    webUrl,
    audioUrl,
    autoLoad: true,
    cache: true,
  });

  // Initialize hook with loaded content
  const {
    state,
    content,
    updateContent,
    saveAll,
    syncContent,
    calculateDiff,
  } = useTripleComparison({
    initialDownloadable: '',
    initialWeb: '',
    initialAudio: '',
  });

  // Update content when loaded from sources
  useEffect(() => {
    if (loadedContent && !isLoadingContent) {
      // Use deferred content for smoother UI updates
      const contentToUse = deferredContent || loadedContent;

      if (contentToUse.downloadable && !content.downloadable.current) {
        updateContent('downloadable', contentToUse.downloadable);
      }
      if (contentToUse.web && !content.web.current) {
        updateContent('web', contentToUse.web);
      }
      if (contentToUse.audio && !content.audio.current) {
        updateContent('audio', contentToUse.audio);
      }
    }
  }, [loadedContent, deferredContent, isLoadingContent, updateContent, content]);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const results = await saveAll();
      const updates = Object.entries(results).map(([type, result]) => ({
        type: type as ContentType,
        content: content[type as ContentType].current,
      }));
      await onSave(updates);
    } catch (err) {
      console.error('Failed to save changes:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSync = async (operation: SyncOperation) => {
    const parts = operation.split('-');
    if (parts.length === 3 && parts[1] === 'to') {
      const from = parts[0] as ContentType;
      const to = parts[2] as ContentType;
      await syncContent(from, to);
    } else if (operation.startsWith('sync-all-to-')) {
      const target = operation.replace('sync-all-to-', '') as ContentType;
      // Sync all other panels to target
      const types: ContentType[] = ['downloadable', 'web', 'audio'];
      for (const type of types) {
        if (type !== target) {
          await syncContent(target, type);
        }
      }
    }
  };

  const togglePanelSelection = (type: ContentType) => {
    setSelectedPanels((prev) => {
      const newState = { ...prev, [type]: !prev[type] };
      // Ensure only 2 panels can be selected at once
      const selectedCount = Object.values(newState).filter(Boolean).length;
      if (selectedCount > 2) {
        return prev; // Don't allow more than 2 selections
      }
      return newState;
    });
  };

  const selectedCount = Object.values(selectedPanels).filter(Boolean).length;
  const showDiff = selectedCount === 2;

  // Get content for diff viewer
  const getDiffContent = () => {
    if (selectedPanels.downloadable && selectedPanels.web) {
      return {
        left: { title: 'Downloadable', content: content.downloadable.current },
        right: { title: 'Web', content: content.web.current },
      };
    }
    if (selectedPanels.downloadable && selectedPanels.audio) {
      return {
        left: { title: 'Downloadable', content: content.downloadable.current },
        right: { title: 'Audio', content: content.audio.current },
      };
    }
    if (selectedPanels.web && selectedPanels.audio) {
      return {
        left: { title: 'Web', content: content.web.current },
        right: { title: 'Audio', content: content.audio.current },
      };
    }
    return null;
  };

  // Helper to save individual content changes
  const handleContentSave = async (type: ContentType, newContent: string) => {
    updateContent(type, newContent);
  };

  // Loading state with user feedback
  if (isLoadingContent && !loadedContent) {
    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-lg mt-3">Loading content...</span>
          <p className="text-sm text-gray-500 mt-2">
            Fetching downloadable, web, and audio content
          </p>
        </div>
      </div>
    );
  }

  // Error state with retry option
  if (loadError) {
    return (
      <div className="w-full bg-white rounded-lg border border-red-200 shadow-sm p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to Load Content
          </h3>
          <p className="text-gray-600 text-center mb-6 max-w-md">
            {loadError}
          </p>
          <div className="flex gap-3">
            <button
              onClick={reloadContent}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Triple Resource Comparison & Editor</h2>
              <p className="text-sm text-gray-600 mt-1">
                Compare and edit content across downloadable PDF, web version, and audio transcript
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onCancel && (
                <button
                  onClick={onCancel}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              )}
              <button
                onClick={handleSaveAll}
                disabled={isSaving || state.isLoading || !state.hasUnsavedChanges}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save All Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Controls */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Content Synchronization</h3>
        <SyncControls
          onSync={handleSync}
          dirtyStates={{
            downloadable: content.downloadable.isDirty,
            web: content.web.isDirty,
            audio: content.audio.isDirty,
          }}
          disabled={state.isLoading}
        />
      </div>

      {/* Comparison Selection Helper */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Click the checkboxes below to select two panels for side-by-side comparison
        </p>
      </div>

      {/* Individual Content Load Errors */}
      {loadErrors.size > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-yellow-900 mb-2">
                Some content failed to load:
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                {Array.from(loadErrors.entries()).map(([type, error]) => (
                  <li key={type}>
                    <strong className="capitalize">{type}:</strong> {error}
                  </li>
                ))}
              </ul>
              <button
                onClick={reloadContent}
                className="mt-3 text-sm text-yellow-900 underline hover:no-underline flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Retry loading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Downloadable PDF Panel */}
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <input
              type="checkbox"
              checked={selectedPanels.downloadable}
              onChange={() => togglePanelSelection('downloadable')}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          <PDFPreviewPanel
            markdownContent={content.downloadable.current}
            title="Resource Content"
            category={resourceId}
            level="Intermediate"
            showMarkdownSource={true}
            onDownload={() => console.log('PDF downloaded')}
          />
        </div>

        {/* Web Version Panel */}
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <input
              type="checkbox"
              checked={selectedPanels.web}
              onChange={() => togglePanelSelection('web')}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          <WebContentPanel
            content={{
              text: content.web.current,
              status: content.web.isDirty ? 'modified' : 'synced',
              lastModified: new Date(),
            }}
            onSave={(newContent) => handleContentSave('web', newContent)}
          />
        </div>

        {/* Audio Transcript Panel */}
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <input
              type="checkbox"
              checked={selectedPanels.audio}
              onChange={() => togglePanelSelection('audio')}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          <AudioTranscriptPanel
            audioUrl={audioUrl || ''}
            transcript={content.audio.current}
            status={content.audio.isDirty ? 'modified' : 'synced'}
            lastModified={new Date()}
            onSave={(newTranscript) => handleContentSave('audio', newTranscript)}
          />
        </div>
      </div>

      {/* Diff Viewer - Full Width Below Grid */}
      {showDiff && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Content Comparison</h3>
            <p className="text-sm text-gray-600 mt-1">
              Side-by-side comparison of selected content
            </p>
          </div>
          <div className="p-6">
            <div className="max-h-[600px] overflow-auto">
              {(() => {
                const diffContent = getDiffContent();
                return diffContent ? (
                  <DiffViewer
                    leftContent={diffContent.left.content}
                    rightContent={diffContent.right.content}
                    leftLabel={diffContent.left.title}
                    rightLabel={diffContent.right.title}
                  />
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Help Text for Selection States */}
      {selectedCount === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="text-center text-gray-600 py-8">
            <p className="text-lg font-medium">Select panels to compare</p>
            <p className="text-sm mt-2">
              Click the checkbox on any two panels to view a side-by-side comparison
            </p>
          </div>
        </div>
      )}

      {selectedCount === 1 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="text-center text-gray-600 py-8">
            <p className="text-lg font-medium">Select one more panel</p>
            <p className="text-sm mt-2">Choose another panel to enable comparison view</p>
          </div>
        </div>
      )}

      {selectedCount === 3 && (
        <div className="bg-white rounded-lg border border-yellow-200 shadow-sm p-6">
          <div className="text-center text-yellow-700 py-8">
            <p className="text-lg font-medium">Too many panels selected</p>
            <p className="text-sm mt-2">
              Please deselect one panel to view comparison (maximum 2 panels)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
