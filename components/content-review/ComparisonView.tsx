'use client';

import React, { useState } from 'react';
import { FileText, Eye, Code, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ComparisonViewProps {
  title: string;
  content: string;
  isOriginal?: boolean;
  className?: string;
}

type ViewMode = 'raw' | 'preview';

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  title,
  content,
  isOriginal = false,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('raw');

  // Handle download
  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`comparison-view ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-600" />
          <h2 className="text-sm font-semibold text-gray-700">
            {title}
          </h2>
          {isOriginal && (
            <span className="ml-auto px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded">
              Read-only
            </span>
          )}
        </div>

        {/* View Mode Toggle and Download */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-md p-0.5">
            <button
              onClick={() => setViewMode('raw')}
              className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'raw'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="View raw markdown"
            >
              <Code className="w-3 h-3" />
              Raw
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'preview'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="View rendered preview"
            >
              <Eye className="w-3 h-3" />
              Preview
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="ml-auto flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            title="Download content as markdown file"
          >
            <Download className="w-3 h-3" />
            Download
          </button>
        </div>
      </div>

      {/* Content Display */}
      <div className="p-6">
        <div
          className="prose prose-sm max-w-none"
          style={{
            minHeight: '400px',
            maxHeight: '600px',
            overflowY: 'auto',
          }}
        >
          {content ? (
            viewMode === 'raw' ? (
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-mono text-sm bg-gray-50 p-4 rounded border border-gray-200">
                {content}
              </div>
            ) : (
              <div className="rendered-content prose prose-sm max-w-none">
                <ReactMarkdown>
                  {content}
                </ReactMarkdown>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>No content available</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500">
          Characters: {content?.length || 0} | Words: {content?.split(/\s+/).filter(Boolean).length || 0} | Mode: {viewMode === 'raw' ? 'Raw Markdown' : 'Rendered Preview'}
        </p>
      </div>
    </div>
  );
};
