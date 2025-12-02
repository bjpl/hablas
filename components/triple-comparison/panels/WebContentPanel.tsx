'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Save, RotateCcw, Globe, Eye, Code, Columns, AlertCircle } from 'lucide-react';
import type { ContentData } from '../types';

interface WebContentPanelProps {
  content: ContentData;
  onSave: (newContent: string) => void;
  className?: string;
}

type ViewMode = 'split' | 'source' | 'preview';

export const WebContentPanel: React.FC<WebContentPanelProps> = ({
  content,
  onSave,
  className = '',
}) => {
  const [editedContent, setEditedContent] = useState(content.text);
  const [hasChanges, setHasChanges] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    setEditedContent(content.text);
    setHasChanges(false);
    setSaveStatus('idle');
  }, [content.text]);

  const handleContentChange = (value: string) => {
    setEditedContent(value);
    setHasChanges(value !== content.text);
    if (saveStatus === 'saved') {
      setSaveStatus('idle');
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await onSave(editedContent);
      setHasChanges(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Save failed:', error);
    }
  };

  const handleRevert = () => {
    setEditedContent(content.text);
    setHasChanges(false);
    setSaveStatus('idle');
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

  const getSaveStatusIndicator = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <span className="text-xs text-blue-600 flex items-center gap-1">
            <span className="animate-pulse">●</span> Saving...
          </span>
        );
      case 'saved':
        return (
          <span className="text-xs text-green-600 flex items-center gap-1">
            ● Saved
          </span>
        );
      case 'error':
        return (
          <span className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Save failed
          </span>
        );
      default:
        return null;
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

  // Simple markdown-to-HTML converter (basic implementation)
  const renderMarkdown = useMemo(() => {
    return (text: string): string => {
      let html = text;

      // Headings
      html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
      html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
      html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

      // Bold
      html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
      html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');

      // Italic
      html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
      html = html.replace(/_(.*?)_/gim, '<em>$1</em>');

      // Links
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

      // Lists
      html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
      html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
      html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>');

      // Wrap consecutive list items
      html = html.replace(/(<li>.*<\/li>\n?)+/gim, (match) => {
        if (match.match(/^\d+\./m)) {
          return `<ol>${match}</ol>`;
        }
        return `<ul>${match}</ul>`;
      });

      // Code blocks
      html = html.replace(/```([^`]+)```/gim, '<pre><code>$1</code></pre>');
      html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

      // Blockquotes
      html = html.replace(/^&gt; (.*$)/gim, '<blockquote>$1</blockquote>');
      html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

      // Line breaks
      html = html.replace(/\n\n/g, '</p><p>');
      html = html.replace(/\n/g, '<br>');

      // Wrap in paragraphs
      html = `<p>${html}</p>`;

      return html;
    };
  }, []);

  const renderedHtml = useMemo(() => {
    return renderMarkdown(editedContent);
  }, [editedContent, renderMarkdown]);

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Web Content
          </h3>
          <div className="flex items-center gap-2">
            {getSaveStatusIndicator()}
            <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusClasses()}`}>
              {content.status}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{editedContent.length} characters</span>
          <span>Modified: {formatDate(content.lastModified)}</span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-1 pt-2">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              viewMode === 'split'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Split view"
          >
            <Columns className="h-3.5 w-3.5" />
            Split
          </button>
          <button
            onClick={() => setViewMode('source')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              viewMode === 'source'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Source only"
          >
            <Code className="h-3.5 w-3.5" />
            Source
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              viewMode === 'preview'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Preview only"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col gap-3 p-4 overflow-hidden">
        <div className="flex-1 flex gap-3 overflow-hidden">
          {/* Source Editor */}
          {(viewMode === 'split' || viewMode === 'source') && (
            <div className={`flex flex-col ${viewMode === 'split' ? 'flex-1' : 'w-full'} min-h-0`}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <Code className="h-3 w-3" />
                  Raw Source
                </label>
                <span className="text-xs text-gray-500">Markdown/HTML</span>
              </div>
              <textarea
                value={editedContent}
                onChange={(e) => handleContentChange(e.target.value)}
                className="flex-1 w-full p-3 font-mono text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter web content (supports markdown)..."
                spellCheck={false}
              />
            </div>
          )}

          {/* Preview */}
          {(viewMode === 'split' || viewMode === 'preview') && (
            <div className={`flex flex-col ${viewMode === 'split' ? 'flex-1' : 'w-full'} min-h-0`}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Rendered Preview
                </label>
                <span className="text-xs text-gray-500">With styling</span>
              </div>
              <div className="flex-1 w-full p-4 border border-gray-300 rounded-md overflow-auto bg-white">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end pt-2 border-t border-gray-200">
          <button
            onClick={handleRevert}
            disabled={!hasChanges || saveStatus === 'saving'}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Revert
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saveStatus === 'saving'}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            {saveStatus === 'saving' ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
