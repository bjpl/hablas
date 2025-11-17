'use client';

import React from 'react';
import { FileText } from 'lucide-react';

interface ComparisonViewProps {
  title: string;
  content: string;
  isOriginal?: boolean;
  className?: string;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  title,
  content,
  isOriginal = false,
  className = '',
}) => {
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
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {content}
            </div>
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
          Characters: {content?.length || 0} | Words: {content?.split(/\s+/).filter(Boolean).length || 0}
        </p>
      </div>
    </div>
  );
};
