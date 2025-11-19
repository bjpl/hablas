/**
 * TopicVariationManager Component
 * Side-by-side variation comparison with batch editing
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  FileText,
  Check,
  AlertCircle,
  Edit3,
  Copy,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { ContentVariation } from '@/lib/content-validation/types';
import ReactMarkdown from 'react-markdown';

interface TopicVariationManagerProps {
  topicSlug: string;
  topicTitle: string;
  variations: ContentVariation[];
  onVariationUpdate?: (variationId: string, content: string) => void;
  onBatchEdit?: (section: string, content: string) => Promise<void>;
  className?: string;
}

interface VariationSelectorProps {
  variations: ContentVariation[];
  selectedVariations: number[];
  onToggle: (index: number) => void;
}

const VariationSelector: React.FC<VariationSelectorProps> = ({
  variations,
  selectedVariations,
  onToggle,
}) => (
  <div className="flex gap-2 flex-wrap">
    {variations.map((variation, idx) => {
      const isSelected = selectedVariations.includes(idx);
      return (
        <button
          key={variation.id}
          onClick={() => onToggle(idx)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
            ${
              isSelected
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }
          `}
          aria-pressed={isSelected}
        >
          <span>Variation {idx + 1}</span>
          {variation.isDirty && (
            <span
              className={`w-2 h-2 rounded-full ${
                isSelected ? 'bg-amber-300' : 'bg-amber-500'
              }`}
              title="Unsaved changes"
            />
          )}
          {isSelected && <Check className="w-4 h-4" />}
        </button>
      );
    })}
  </div>
);

interface ContentEditorProps {
  content: string;
  variationId: string;
  variationIndex: number;
  onChange?: (content: string) => void;
  readOnly?: boolean;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  content,
  variationId,
  variationIndex,
  onChange,
  readOnly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleSave = useCallback(() => {
    if (onChange && editedContent !== content) {
      onChange(editedContent);
    }
    setIsEditing(false);
  }, [onChange, editedContent, content]);

  const handleCancel = useCallback(() => {
    setEditedContent(content);
    setIsEditing(false);
  }, [content]);

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
        <h4 className="font-semibold text-gray-900">Variation {variationIndex + 1}</h4>
        {!readOnly && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Edit3 className="w-3 h-3" />
            {isEditing ? 'Preview' : 'Edit'}
          </button>
        )}
      </div>

      {/* Editor/Preview Area */}
      <div className="flex-1 overflow-y-auto">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedContent}
              onChange={e => setEditedContent(e.target.value)}
              className="w-full h-96 p-3 text-sm font-mono border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`Edit variation ${variationIndex + 1}`}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

interface SharedSectionsPanelProps {
  variations: ContentVariation[];
  onBatchEdit?: (section: string, content: string) => Promise<void>;
}

const SharedSectionsPanel: React.FC<SharedSectionsPanelProps> = ({
  variations,
  onBatchEdit,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Analyze shared content across variations
  const sharedAnalysis = useMemo(() => {
    if (variations.length === 0) return { sections: [], differences: [] };

    // Simple heuristic: extract headers and check if they match across variations
    const headers = variations.map(v => {
      const matches = v.content.match(/^##\s+(.+)$/gm) || [];
      return matches.map(h => h.trim());
    });

    // Find common headers
    const commonHeaders = headers[0]?.filter(header =>
      headers.every(h => h.includes(header))
    );

    return {
      sections: commonHeaders || [],
      differences: headers.length - (commonHeaders?.length || 0),
    };
  }, [variations]);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-blue-600" />
          <h4 className="font-semibold text-blue-900">Shared Content Across Variations</h4>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-blue-600 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <div className="px-4 py-3 border-t border-blue-200">
          <p className="text-sm text-blue-800 mb-3">
            These sections appear in all {variations.length} variations:
          </p>

          {sharedAnalysis.sections.length > 0 ? (
            <ul className="text-sm space-y-2">
              {sharedAnalysis.sections.map((section, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="flex-1">{section}</span>
                  {onBatchEdit && (
                    <button
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                      onClick={() => {
                        /* Open batch edit modal */
                      }}
                    >
                      Edit all
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">No common sections detected</p>
          )}

          {typeof sharedAnalysis.differences === 'number' && sharedAnalysis.differences > 0 && (
            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              {sharedAnalysis.differences} section(s) have different content across
              variations
            </div>
          )}

          {onBatchEdit && sharedAnalysis.sections.length > 0 && (
            <button
              className="mt-3 w-full px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50"
              onClick={() => {
                /* Open batch edit interface */
              }}
            >
              Batch edit shared sections →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const TopicVariationManager: React.FC<TopicVariationManagerProps> = ({
  topicSlug,
  topicTitle,
  variations,
  onVariationUpdate,
  onBatchEdit,
  className = '',
}) => {
  const [selectedVariations, setSelectedVariations] = useState<number[]>(() => {
    // Default to first two variations if available
    if (variations.length >= 2) return [0, 1];
    if (variations.length === 1) return [0];
    return [];
  });

  const toggleVariation = useCallback((index: number) => {
    setSelectedVariations(prev => {
      if (prev.includes(index)) {
        // Deselect - but keep at least one selected
        return prev.length > 1 ? prev.filter(i => i !== index) : prev;
      } else {
        // Select - limit to 3 for comparison
        if (prev.length >= 3) {
          return [...prev.slice(1), index];
        }
        return [...prev, index];
      }
    });
  }, []);

  const handleVariationUpdate = useCallback(
    (variationId: string, content: string) => {
      if (onVariationUpdate) {
        onVariationUpdate(variationId, content);
      }
    },
    [onVariationUpdate]
  );

  const dirtyCount = variations.filter(v => v.isDirty).length;

  return (
    <div className={`topic-variation-manager ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Topic Variation Manager</h2>
            <p className="text-sm text-gray-600 mt-1">
              {topicTitle} • {variations.length} variation{variations.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Unsaved Changes Indicator */}
          {dirtyCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-900">
                {dirtyCount} unsaved change{dirtyCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 bg-gray-50 min-h-screen space-y-4">
        {/* Variation Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Select Variations to Compare (max 3)
          </h3>
          <VariationSelector
            selectedVariations={selectedVariations}
            variations={variations}
            onToggle={toggleVariation}
          />
          <p className="text-xs text-gray-500 mt-2">
            {selectedVariations.length} of {variations.length} selected •{' '}
            {3 - selectedVariations.length} more can be added
          </p>
        </div>

        {/* Shared Sections Panel */}
        {variations.length > 1 && (
          <SharedSectionsPanel variations={variations} onBatchEdit={onBatchEdit} />
        )}

        {/* Side-by-Side Comparison */}
        {selectedVariations.length > 0 ? (
          <div
            className={`grid gap-4 ${
              selectedVariations.length === 1
                ? 'grid-cols-1'
                : selectedVariations.length === 2
                ? 'grid-cols-2'
                : 'grid-cols-3'
            }`}
          >
            {selectedVariations.map(varIdx => {
              const variation = variations[varIdx];
              return (
                <div
                  key={variation.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <ContentEditor
                    content={variation.content}
                    variationId={variation.id}
                    variationIndex={varIdx}
                    onChange={content => handleVariationUpdate(variation.id, content)}
                  />

                  {/* Variation Metadata */}
                  <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {variation.lastModified && (
                        <span>
                          Modified: {new Date(variation.lastModified).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                        title="View full content"
                      >
                        <FileText className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3" />
              <p>Select at least one variation to view content</p>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Variation Statistics</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{variations.length}</div>
              <div className="text-xs text-gray-600 mt-1">Total Variations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {variations.length - dirtyCount}
              </div>
              <div className="text-xs text-gray-600 mt-1">Saved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{dirtyCount}</div>
              <div className="text-xs text-gray-600 mt-1">Unsaved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
