'use client';

import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, FileText, Globe, Volume2 } from 'lucide-react';
import type { ContentType, ContentData } from '../types';

interface ContentPanelProps {
  type: ContentType;
  content: ContentData;
  onSave: (type: ContentType, newContent: string) => void;
  className?: string;
}

export const ContentPanel: React.FC<ContentPanelProps> = ({
  type,
  content,
  onSave,
  className = '',
}) => {
  const [editedContent, setEditedContent] = useState(content.text);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditedContent(content.text);
    setHasChanges(false);
  }, [content.text]);

  const handleContentChange = (value: string) => {
    setEditedContent(value);
    setHasChanges(value !== content.text);
  };

  const handleSave = () => {
    onSave(type, editedContent);
    setHasChanges(false);
  };

  const handleRevert = () => {
    setEditedContent(content.text);
    setHasChanges(false);
  };

  const getIcon = () => {
    switch (type) {
      case 'downloadable':
        return <FileText className="h-4 w-4" />;
      case 'web':
        return <Globe className="h-4 w-4" />;
      case 'audio':
        return <Volume2 className="h-4 w-4" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'downloadable':
        return 'Downloadable Content';
      case 'web':
        return 'Web Content';
      case 'audio':
        return 'Audio Transcript';
    }
  };

  const getStatusClasses = () => {
    switch (content.status) {
      case 'synced':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'modified':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'conflict':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </h3>
          <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusClasses()}`}>
            {content.status}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{editedContent.length} characters</span>
          <span>Modified: {formatDate(content.lastModified)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-3 p-4">
        {type === 'audio' && content.audioUrl && (
          <div className="w-full">
            <audio
              controls
              className="w-full h-10"
              src={content.audioUrl}
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        <div className="flex-1 relative">
          <textarea
            value={editedContent}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full h-full min-h-[300px] p-3 font-mono text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Enter ${type} content...`}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={handleRevert}
            disabled={!hasChanges}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Revert
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
