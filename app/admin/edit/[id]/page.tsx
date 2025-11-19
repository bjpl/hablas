'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, Layout, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { MediaReviewTool } from '@/components/media-review';
import { TripleComparisonView } from '@/components/triple-comparison';
import type { GetContentResponse } from '@/lib/types/content-edits';
import type { MediaResource } from '@/lib/types/media';
import type { ContentUpdate } from '@/components/triple-comparison/types';
import { resources } from '@/data/resources';

/**
 * Edit Page for Specific Resource
 *
 * Loads content for a specific resource and provides editing interface
 */
type ViewMode = 'standard' | 'comparison';

export default function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [resource, setResource] = useState<MediaResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('standard');

  useEffect(() => {
    fetchContent();
  }, [resolvedParams.id]);

  const fetchContent = async () => {
    try {
      setLoading(true);

      // Find resource from data source
      const foundResource = resources.find(r => r.id === parseInt(resolvedParams.id));
      if (!foundResource) {
        throw new Error('Resource not found');
      }

      // Fetch content and metadata from API
      const response = await fetch(`/api/content/${resolvedParams.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data: GetContentResponse = await response.json();

      // Combine resource with API data
      setResource({
        ...foundResource,
        metadata: data.metadata ? {
          ...data.metadata,
          format: data.metadata.format || 'unknown',
          size: data.metadata.size || 0
        } : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (editedContent: string) => {
    try {
      const response = await fetch('/api/content/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceId: parseInt(resolvedParams.id),
          editedContent,
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

  const handleTripleComparisonSave = async (updates: ContentUpdate[]) => {
    try {
      // Save all three content types
      for (const update of updates) {
        const response = await fetch('/api/content/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resourceId: parseInt(resolvedParams.id),
            editedContent: update.content,
            contentType: update.type,
            status: 'pending',
            editedBy: 'admin',
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save ${update.type} content`);
        }
      }

      alert('All changes saved successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save changes');
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

  if (error || !resource) {
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
        <div className="flex items-center justify-between">
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
              <h1 className="text-lg font-semibold text-gray-900">{resource.title}</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                {resource.type.toUpperCase()}
              </span>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('standard')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'standard'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layout className="w-4 h-4" />
              Standard View
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'comparison'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Triple Comparison
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {viewMode === 'standard' ? (
          /* Standard Media Review Tool - Intelligently routes based on media type */
          <MediaReviewTool resource={resource} onSave={handleSave} />
        ) : (
          /* Triple Comparison View - Compare & edit all three content types */
          <TripleComparisonView
            resourceId={resolvedParams.id}
            downloadableUrl={resource.downloadUrl}
            webUrl={resource.downloadUrl}
            audioUrl={resource.audioUrl}
            onSave={handleTripleComparisonSave}
            onCancel={() => setViewMode('standard')}
          />
        )}
      </div>
    </div>
  );
}
