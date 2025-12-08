'use client';

import React, { useEffect, useState } from 'react';
import { History, Clock, User, ChevronDown, ChevronUp, X } from 'lucide-react';
import { createLogger } from '@/lib/utils/logger';

const editHistoryLogger = createLogger('EditHistoryModal');

interface EditHistoryEntry {
  id: number;
  editedBy: string;
  editedAt: string;
  changeDescription: string;
  contentPreview?: string;
}

interface EditHistoryModalProps {
  resourceId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditHistoryModal({
  resourceId,
  isOpen,
  onClose,
}: EditHistoryModalProps) {
  const [history, setHistory] = useState<EditHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen && resourceId) {
      fetchHistory();
    }
  }, [isOpen, resourceId]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/content/${resourceId}/history`);

      if (!response.ok) {
        throw new Error('Failed to fetch edit history');
      }

      const data = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      editHistoryLogger.error('Error fetching edit history', err as Error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Edit History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] px-6 py-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <p className="font-medium">Error loading history</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && history.length === 0 && (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No edit history found</p>
              <p className="text-gray-400 text-sm mt-2">
                Changes will appear here once edits are made
              </p>
            </div>
          )}

          {!loading && !error && history.length > 0 && (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gray-200"></div>

              {/* Timeline entries */}
              <div className="space-y-6">
                {history.map((entry, index) => {
                  const isExpanded = expandedIds.has(entry.id);
                  const previewContent = entry.contentPreview || '';
                  const hasPreview = previewContent.length > 0;
                  const shouldTruncate = hasPreview && previewContent.length > 200;
                  const displayContent = shouldTruncate && !isExpanded
                    ? previewContent.slice(0, 200) + '...'
                    : previewContent;

                  return (
                    <div key={entry.id} className="relative pl-10">
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <History className="w-4 h-4 text-white" />
                      </div>

                      {/* Entry card */}
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                        {/* Timestamp */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">
                            {formatTimestamp(entry.editedAt)}
                          </span>
                        </div>

                        {/* Editor */}
                        <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                          <User className="w-4 h-4" />
                          <span>
                            Edited by <strong>{entry.editedBy}</strong>
                          </span>
                        </div>

                        {/* Change description */}
                        <div className="mb-3">
                          <p className="text-gray-900 font-medium">
                            {entry.changeDescription}
                          </p>
                        </div>

                        {/* Content preview */}
                        {hasPreview && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="bg-white rounded p-3 text-sm text-gray-700 whitespace-pre-wrap">
                              {displayContent}
                            </div>

                            {/* Expand/Collapse button */}
                            {shouldTruncate && (
                              <button
                                onClick={() => toggleExpanded(entry.id)}
                                className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="w-4 h-4" />
                                    Show less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-4 h-4" />
                                    Show more
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
