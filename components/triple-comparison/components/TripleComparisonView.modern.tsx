'use client';

/**
 * Modernized TripleComparisonView Component
 *
 * Features:
 * - React 18+ patterns (useTransition, useDeferredValue, Suspense)
 * - Skeleton loaders for loading states
 * - Dark mode support with theme context
 * - Optimized performance with React.memo
 * - Enhanced accessibility (ARIA labels, keyboard navigation)
 * - Micro-interactions and smooth transitions
 * - Responsive design improvements
 *
 * @module TripleComparisonView
 */

import React, { useState, useEffect, useMemo, useTransition, useDeferredValue, Suspense, useCallback } from 'react';
import { Loader2, Save, X, FileText, Globe, Volume2, Moon, Sun } from 'lucide-react';
import { createLogger } from '@/lib/utils/logger';
import { ContentPanel } from './ContentPanel';
import { DiffViewer } from './DiffViewer';
import { SyncControls } from './SyncControls';
import { useTripleComparison } from '../hooks/useTripleComparison';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import { useTheme } from '@/lib/hooks/useTheme';
import type { TripleComparisonViewProps, ContentType, SyncOperation, ContentData } from '../types';

/**
 * Memoized content panel to prevent unnecessary re-renders
 */
const MemoizedContentPanel = React.memo(ContentPanel);

/**
 * Memoized diff viewer for performance
 */
const MemoizedDiffViewer = React.memo(DiffViewer);

const tripleComparisonModernLogger = createLogger('TripleComparisonView.modern');

/**
 * Loading fallback component
 */
function LoadingFallback() {
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        <span className="ml-3 text-lg text-gray-900 dark:text-gray-100">Loading content...</span>
      </div>
    </div>
  );
}

/**
 * TripleComparisonView - Main component for comparing three content versions
 *
 * Supports downloadable PDF, web version, and audio transcript comparison
 * with real-time editing, synchronization, and diff viewing.
 *
 * @param props - Component properties
 * @returns Rendered triple comparison interface
 */
export function TripleComparisonView({
  resourceId,
  downloadableUrl,
  webUrl,
  audioUrl,
  onSave,
  onCancel,
}: TripleComparisonViewProps) {
  const { theme, toggleTheme } = useTheme();
  const [selectedPanels, setSelectedPanels] = useState<Record<ContentType, boolean>>({
    downloadable: false,
    web: false,
    audio: false,
  });

  const [isSaving, startSaveTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  // Defer non-urgent updates for better performance
  const deferredSelectedPanels = useDeferredValue(selectedPanels);

  // Initialize hook with empty content (will be loaded from URLs)
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

  /**
   * Load content from URLs
   * In production, this would fetch actual content
   */
  useEffect(() => {
    if (downloadableUrl) {
      updateContent('downloadable', 'Downloadable PDF content would be loaded here...');
    }
    if (webUrl) {
      updateContent('web', 'Web content would be loaded here...');
    }
    if (audioUrl) {
      updateContent('audio', 'Audio transcript would be loaded here...');
    }
  }, [downloadableUrl, webUrl, audioUrl, updateContent]);

  /**
   * Handle save all with optimistic UI update
   */
  const handleSaveAll = useCallback(async () => {
    setSaveError(null);

    startSaveTransition(async () => {
      try {
        const results = await saveAll();
        const updates = Object.entries(results).map(([type, result]) => ({
          type: type as ContentType,
          content: content[type as ContentType].current,
        }));
        await onSave(updates);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save changes';
        setSaveError(errorMessage);
        tripleComparisonModernLogger.error('Failed to save changes', err as Error);
      }
    });
  }, [saveAll, content, onSave]);

  /**
   * Handle content synchronization
   */
  const handleSync = useCallback(async (operation: SyncOperation) => {
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
  }, [syncContent]);

  /**
   * Toggle panel selection for comparison
   */
  const togglePanelSelection = useCallback((type: ContentType) => {
    setSelectedPanels((prev) => {
      const newState = { ...prev, [type]: !prev[type] };
      // Ensure only 2 panels can be selected at once
      const selectedCount = Object.values(newState).filter(Boolean).length;
      if (selectedCount > 2) {
        return prev; // Don't allow more than 2 selections
      }
      return newState;
    });
  }, []);

  /**
   * Memoize selected count for performance
   */
  const selectedCount = useMemo(
    () => Object.values(deferredSelectedPanels).filter(Boolean).length,
    [deferredSelectedPanels]
  );

  const showDiff = selectedCount === 2;

  /**
   * Get content for diff viewer (memoized)
   */
  const diffContent = useMemo(() => {
    if (deferredSelectedPanels.downloadable && deferredSelectedPanels.web) {
      return {
        left: { title: 'Downloadable', content: content.downloadable.current },
        right: { title: 'Web', content: content.web.current },
      };
    }
    if (deferredSelectedPanels.downloadable && deferredSelectedPanels.audio) {
      return {
        left: { title: 'Downloadable', content: content.downloadable.current },
        right: { title: 'Audio', content: content.audio.current },
      };
    }
    if (deferredSelectedPanels.web && deferredSelectedPanels.audio) {
      return {
        left: { title: 'Web', content: content.web.current },
        right: { title: 'Audio', content: content.audio.current },
      };
    }
    return null;
  }, [deferredSelectedPanels, content]);

  /**
   * Create content data object (memoized)
   */
  const createContentData = useCallback((type: ContentType): ContentData => ({
    text: content[type].current,
    status: content[type].isDirty ? 'modified' : 'synced',
    lastModified: new Date(),
    audioUrl: type === 'audio' ? audioUrl : undefined,
  }), [content, audioUrl]);

  // Show loading state
  if (state.isLoading && !content.downloadable.current && !content.web.current && !content.audio.current) {
    return <LoadingFallback />;
  }

  return (
    <div className="w-full space-y-4 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Triple Resource Comparison & Editor
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Compare and edit content across downloadable PDF, web version, and audio transcript
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {onCancel && (
                <button
                  onClick={onCancel}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center gap-2 transition-all duration-200"
                  aria-label="Cancel changes"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              )}
              <button
                onClick={handleSaveAll}
                disabled={isSaving || state.isLoading || !state.hasUnsavedChanges}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 transform hover:scale-105 active:scale-95"
                aria-label="Save all changes"
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

          {/* Error Message */}
          {saveError && (
            <div
              className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300"
              role="alert"
            >
              <p className="text-sm text-red-800 dark:text-red-300">{saveError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Sync Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 transition-all duration-200">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Content Synchronization
        </h3>
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
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 transition-all duration-200">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 <strong>Tip:</strong> Click the checkboxes below to select two panels for side-by-side comparison
        </p>
      </div>

      {/* Main Content Grid */}
      <Suspense fallback={<div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Downloadable PDF Panel */}
          <div className="relative group">
            <div className="absolute top-2 right-2 z-10">
              <input
                type="checkbox"
                checked={selectedPanels.downloadable}
                onChange={() => togglePanelSelection('downloadable')}
                className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer transition-transform hover:scale-110"
                aria-label="Select downloadable content for comparison"
              />
            </div>
            <MemoizedContentPanel
              type="downloadable"
              content={createContentData('downloadable')}
              onSave={(type, newContent) => updateContent(type, newContent)}
            />
          </div>

          {/* Web Version Panel */}
          <div className="relative group">
            <div className="absolute top-2 right-2 z-10">
              <input
                type="checkbox"
                checked={selectedPanels.web}
                onChange={() => togglePanelSelection('web')}
                className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer transition-transform hover:scale-110"
                aria-label="Select web content for comparison"
              />
            </div>
            <MemoizedContentPanel
              type="web"
              content={createContentData('web')}
              onSave={(type, newContent) => updateContent(type, newContent)}
            />
          </div>

          {/* Audio Transcript Panel */}
          <div className="relative group">
            <div className="absolute top-2 right-2 z-10">
              <input
                type="checkbox"
                checked={selectedPanels.audio}
                onChange={() => togglePanelSelection('audio')}
                className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer transition-transform hover:scale-110"
                aria-label="Select audio content for comparison"
              />
            </div>
            <MemoizedContentPanel
              type="audio"
              content={createContentData('audio')}
              onSave={(type, newContent) => updateContent(type, newContent)}
            />
          </div>
        </div>
      </Suspense>

      {/* Diff Viewer - Full Width Below Grid */}
      {showDiff && diffContent && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Content Comparison
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Side-by-side comparison of selected content
            </p>
          </div>
          <div className="p-6">
            <div className="max-h-[600px] overflow-auto">
              <MemoizedDiffViewer
                leftContent={diffContent.left.content}
                rightContent={diffContent.right.content}
                leftLabel={diffContent.left.title}
                rightLabel={diffContent.right.title}
              />
            </div>
          </div>
        </div>
      )}

      {/* Help Text for Selection States */}
      {selectedCount === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 transition-all duration-200">
          <div className="text-center text-gray-600 dark:text-gray-400 py-8">
            <p className="text-lg font-medium">Select panels to compare</p>
            <p className="text-sm mt-2">
              Click the checkbox on any two panels to view a side-by-side comparison
            </p>
          </div>
        </div>
      )}

      {selectedCount === 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 transition-all duration-200">
          <div className="text-center text-gray-600 dark:text-gray-400 py-8">
            <p className="text-lg font-medium">Select one more panel</p>
            <p className="text-sm mt-2">Choose another panel to enable comparison view</p>
          </div>
        </div>
      )}

      {selectedCount === 3 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-800 shadow-sm p-6 transition-all duration-200">
          <div className="text-center text-yellow-700 dark:text-yellow-400 py-8">
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
