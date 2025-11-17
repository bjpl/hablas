'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Save, X, RefreshCw, FileText, Eye, Code } from 'lucide-react';

interface PDFResourcePreviewProps {
  resourceId: number;
  title: string;
  originalContent: string;
  editedContent?: string;
  onSave: (resourceId: number, editedContent: string) => Promise<void>;
  onDiscard: () => void;
  isDirty: boolean;
}

export default function PDFResourcePreview({
  resourceId,
  title,
  originalContent,
  editedContent,
  onSave,
  onDiscard,
  isDirty,
}: PDFResourcePreviewProps) {
  const [content, setContent] = useState(editedContent || originalContent);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [previewSource, setPreviewSource] = useState<'edited' | 'original'>('edited');

  useEffect(() => {
    setContent(editedContent || originalContent);
  }, [editedContent, originalContent]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(resourceId, content);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setContent(originalContent);
    onDiscard();
  };

  const hasChanges = content !== originalContent;
  const displayContent = previewSource === 'edited' ? content : originalContent;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Resource Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">Markdown/PDF Content</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-lg border border-gray-300 p-0.5 bg-white">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  viewMode === 'split'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="Split view"
              >
                <Code className="w-3 h-3" />
                Split
              </button>
              <button
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  viewMode === 'edit'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="Edit only"
              >
                <FileText className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  viewMode === 'preview'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="Preview only"
              >
                <Eye className="w-3 h-3" />
                Preview
              </button>
            </div>

            {hasChanges && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className={`grid gap-4 ${
          viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}>
          {/* Edit Area */}
          {(viewMode === 'split' || viewMode === 'edit') && (
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Edit Markdown Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 min-h-[600px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                placeholder="Enter markdown content here..."
              />
            </div>
          )}

          {/* Preview Area */}
          {(viewMode === 'split' || viewMode === 'preview') && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-700">
                  Preview
                </label>
                {viewMode === 'preview' && (
                  <div className="inline-flex rounded-lg border border-gray-300 p-0.5">
                    <button
                      onClick={() => setPreviewSource('edited')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        previewSource === 'edited'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Edited
                    </button>
                    <button
                      onClick={() => setPreviewSource('original')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        previewSource === 'original'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Original
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-[600px] px-4 py-3 bg-white border border-gray-200 rounded-lg overflow-y-auto">
                <div className="prose prose-sm max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100">
                  <ReactMarkdown>
                    {displayContent || '*No content available*'}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500 px-2">
          <div className="flex items-center gap-4">
            <span>
              {content.split('\n').length} lines • {content.length} characters
            </span>
            {hasChanges && (
              <span className="text-orange-600 font-medium">
                • {content.length - originalContent.length > 0 ? '+' : ''}
                {content.length - originalContent.length} chars changed
              </span>
            )}
          </div>
          {hasChanges && (
            <span className="text-orange-600 font-medium">Unsaved changes</span>
          )}
        </div>
      </div>
    </div>
  );
}
