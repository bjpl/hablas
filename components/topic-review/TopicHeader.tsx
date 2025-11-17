'use client';

import { useState } from 'react';
import { ArrowLeft, Save, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface TopicHeaderProps {
  topicName: string;
  topicId: string | number;
  totalResources: number;
  editedResources: number;
  hasUnsavedChanges: boolean;
  onSaveAll: () => Promise<void>;
  backUrl?: string;
}

export default function TopicHeader({
  topicName,
  topicId,
  totalResources,
  editedResources,
  hasUnsavedChanges,
  onSaveAll,
  backUrl = '/admin/content/topics',
}: TopicHeaderProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await onSaveAll();
      setSaveStatus('success');

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Failed to save changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Main Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <Link
              href={backUrl}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Topics
            </Link>

            {/* Topic Info */}
            <div className="pl-4 border-l border-gray-300">
              <h1 className="text-2xl font-bold text-gray-900">{topicName}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-600">
                  Topic ID: {topicId}
                </span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-600">
                  {totalResources} {totalResources === 1 ? 'resource' : 'resources'}
                </span>
                {editedResources > 0 && (
                  <>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm font-medium text-blue-600">
                      {editedResources} edited
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Status Indicator */}
            {saveStatus === 'success' && (
              <div className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                All changes saved
              </div>
            )}

            {saveStatus === 'error' && (
              <div className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                Save failed
              </div>
            )}

            {hasUnsavedChanges && saveStatus === 'idle' && (
              <div className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                Unsaved changes
              </div>
            )}

            {/* Save All Button */}
            <button
              onClick={handleSaveAll}
              disabled={!hasUnsavedChanges || isSaving}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                hasUnsavedChanges && !isSaving
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save All Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {totalResources > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-700">
                Review Progress
              </span>
              <span className="text-xs text-gray-600">
                {editedResources} / {totalResources} reviewed
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300 ease-out"
                style={{
                  width: `${totalResources > 0 ? (editedResources / totalResources) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
