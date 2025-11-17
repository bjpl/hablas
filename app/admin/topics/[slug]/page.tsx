'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit2,
} from 'lucide-react';
import type { TopicReviewResponse } from '@/lib/types/topics';

/**
 * Topic Review Page
 *
 * Displays all resources for a specific topic
 * Allows reviewing and editing resources within the topic context
 */
export default function TopicReviewPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [data, setData] = useState<TopicReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (slug) {
      fetchTopicData();
    }
  }, [slug]);

  const fetchTopicData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/topics/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Topic not found');
        }
        throw new Error('Failed to fetch topic data');
      }

      const result: TopicReviewResponse = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load topic');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (resource: any) => {
    if (!resource.hasEdit) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
          <FileText className="w-3 h-3" />
          No edits
        </span>
      );
    }

    switch (resource.editStatus) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading topic...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Error</h2>
          <p className="mt-2 text-gray-600">{error || 'Topic not found'}</p>
          <Link
            href="/admin/topics"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Topics
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/admin" className="hover:text-gray-900">Admin</Link>
            <span>/</span>
            <Link href="/admin/topics" className="hover:text-gray-900">Topics</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{data.name}</span>
          </nav>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{data.name}</h1>
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">
                  {data.level}
                </span>
              </div>
              <p className="text-gray-600 max-w-3xl">{data.description}</p>

              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {data.category}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {data.resources.length} resources
                </span>
              </div>
            </div>

            <Link
              href="/admin/topics"
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Topics
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Resources</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.resources.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Edits</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{data.metadata?.pendingEdits || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{data.metadata?.approvedEdits || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Edits</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{data.metadata?.totalEdits || 0}</p>
              </div>
              <Edit2 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Resources List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Resources in this Topic</h2>
          </div>

          {data.resources.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="mt-4 text-gray-500">No resources found for this topic</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Edit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.resources.map((resource: any) => (
                    <tr key={resource.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{resource.title}</div>
                          <div className="text-sm text-gray-500 mt-1 line-clamp-2">{resource.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                          {resource.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(resource)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {resource.lastEditDate
                          ? new Date(resource.lastEditDate).toLocaleDateString()
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/edit/${resource.resourceId}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
