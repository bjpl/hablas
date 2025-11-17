'use client';

import { useState } from 'react';
import AudioResourcePreview from './AudioResourcePreview';
import PDFResourcePreview from './PDFResourcePreview';
import { FileAudio, FileText, Image, Video } from 'lucide-react';

interface ResourceData {
  id: number;
  title: string;
  type: 'audio' | 'pdf' | 'image' | 'video' | 'markdown';
  originalContent: string;
  editedContent?: string;
  audioUrl?: string;
  metadata?: {
    duration?: string;
    voice?: string;
    accent?: string;
    narrator?: string;
  };
}

interface ResourcePreviewPanelProps {
  resource: ResourceData;
  onSave: (resourceId: number, editedContent: string) => Promise<void>;
  className?: string;
}

export default function ResourcePreviewPanel({
  resource,
  onSave,
  className = '',
}: ResourcePreviewPanelProps) {
  const [isDirty, setIsDirty] = useState(false);

  const handleSave = async (resourceId: number, editedContent: string) => {
    await onSave(resourceId, editedContent);
    setIsDirty(false);
  };

  const handleDiscard = () => {
    setIsDirty(false);
  };

  const getResourceIcon = () => {
    switch (resource.type) {
      case 'audio':
        return <FileAudio className="w-5 h-5" />;
      case 'pdf':
      case 'markdown':
        return <FileText className="w-5 h-5" />;
      case 'image':
        return <Image className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getResourceTypeBadge = () => {
    const badges = {
      audio: 'bg-purple-100 text-purple-700',
      pdf: 'bg-blue-100 text-blue-700',
      markdown: 'bg-blue-100 text-blue-700',
      image: 'bg-green-100 text-green-700',
      video: 'bg-red-100 text-red-700',
    };

    const colors = badges[resource.type] || badges.pdf;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${colors}`}>
        {getResourceIcon()}
        {resource.type.toUpperCase()}
      </span>
    );
  };

  // Render appropriate preview component based on resource type
  const renderPreview = () => {
    switch (resource.type) {
      case 'audio':
        return (
          <AudioResourcePreview
            resourceId={resource.id}
            title={resource.title}
            audioUrl={resource.audioUrl}
            originalTranscript={resource.originalContent}
            editedTranscript={resource.editedContent}
            metadata={resource.metadata}
            onSave={handleSave}
            onDiscard={handleDiscard}
            isDirty={isDirty}
          />
        );

      case 'pdf':
      case 'markdown':
        return (
          <PDFResourcePreview
            resourceId={resource.id}
            title={resource.title}
            originalContent={resource.originalContent}
            editedContent={resource.editedContent}
            onSave={handleSave}
            onDiscard={handleDiscard}
            isDirty={isDirty}
          />
        );

      case 'image':
      case 'video':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                {getResourceIcon()}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)} Preview
              </h3>
              <p className="text-gray-600">
                Preview for {resource.type} resources is coming soon.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center text-gray-500">
              Unknown resource type: {resource.type}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Resource Type Badge (optional header) */}
      <div className="flex items-center justify-between">
        {getResourceTypeBadge()}
      </div>

      {/* Main Preview */}
      {renderPreview()}
    </div>
  );
}
