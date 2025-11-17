'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { ContentReviewTool, ContentItem } from '@/components/content-review';
import type { GetContentResponse } from '@/lib/types/content-edits';

/**
 * Edit Page for Specific Resource
 *
 * Loads content for a specific resource and provides editing interface
 */
export default function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [resourceTitle, setResourceTitle] = useState<string>('');

  useEffect(() => {
    fetchContent();
  }, [resolvedParams.id]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/content/${resolvedParams.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data: GetContentResponse = await response.json();

      setResourceTitle(data.title);
      setContent({
        id: `resource-${data.resourceId}`,
        original: data.originalContent,
        edited: data.editedContent || data.originalContent,
        metadata: {
          title: data.title,
          category: 'Resource',
          lastModified: data.currentEdit?.updatedAt || new Date().toISOString(),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedContent: ContentItem) => {
    try {
      const response = await fetch('/api/content/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceId: parseInt(resolvedParams.id),
          editedContent: updatedContent.edited,
          status: 'pending',
          editedBy: 'admin',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      // Optionally redirect back to resource or admin dashboard
      // router.push(`/recursos/${resolvedParams.id}`);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Error Loading Content</h2>
          <p className="mt-2 text-gray-600">{error || 'Content not found'}</p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={fetchContent}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="border-l border-gray-300 h-6"></div>
          <div>
            <p className="text-sm text-gray-600">Editing Resource #{resolvedParams.id}</p>
            <h1 className="text-lg font-semibold text-gray-900">{resourceTitle}</h1>
          </div>
        </div>
      </div>

      {/* Content Review Tool */}
      <ContentReviewTool
        initialContent={content}
        onSave={handleSave}
        autoSaveDelay={3000}
      />
    </div>
  );
}
