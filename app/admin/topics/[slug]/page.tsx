'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  History,
} from 'lucide-react';
import type { TopicReviewResponse, TopicResourceWithContent } from '@/lib/types/topics';
import { ApprovalActions, EditHistoryModal } from '@/components/content-review';

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
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(null);
  const [expandedResourceId, setExpandedResourceId] = useState<number | null>(null);

  const fetchTopicData = useCallback(async () => {
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
  }, [slug]);

  useEffect(() => {
    if (slug) {
      fetchTopicData();
    }
  }, [slug, fetchTopicData]);

  const openHistoryModal = (resourceId: number) => {
    setSelectedResourceId(resourceId);
    setHistoryModalOpen(true);
  };

  const handleStatusChange = (resourceId: number, newStatus: string) => {
    // Update local state to reflect the change
    if (data) {
      const updatedResources = data.resources.map((r) => {
        if (r.resource.id === resourceId) {
          return { ...r, editStatus: newStatus as 'pending' | 'approved' | 'rejected' };
        }
        return r;
      });
      setData({ ...data, resources: updatedResources });
    }
  };

  const toggleResourceExpand = (resourceId: number) => {
    setExpandedResourceId(expandedResourceId === resourceId ? null : resourceId);
  };

  const getStatusBadge = (resource: TopicResourceWithContent) => {
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
                  {data.resources.map((item) => (
                    <React.Fragment key={item.resource.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.resource.title}</div>
                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">{item.resource.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                            {item.resource.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(item)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.lastEditDate
                            ? new Date(item.lastEditDate).toLocaleDateString()
                            : '-'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {item.hasEdit && (
                              <button
                                onClick={() => openHistoryModal(item.resource.id)}
                                className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700"
                                title="View History"
                              >
                                <History className="w-4 h-4" />
                              </button>
                            )}
                            {item.hasEdit && item.editStatus === 'pending' && (
                              <button
                                onClick={() => toggleResourceExpand(item.resource.id)}
                                className="inline-flex items-center gap-1 text-yellow-600 hover:text-yellow-700"
                                title="Review"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Review
                              </button>
                            )}
                            <Link
                              href={`/admin/edit/${item.resource.id}`}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                      {/* Expandable Approval Actions Row */}
                      {expandedResourceId === item.resource.id && item.hasEdit && (
                        <tr className="bg-gray-50">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="max-w-md">
                              <h4 className="text-sm font-medium text-gray-900 mb-3">
                                Review: {item.resource.title}
                              </h4>
                              <ApprovalActions
                                resourceId={item.resource.id}
                                currentStatus={item.editStatus}
                                onStatusChange={(newStatus) => {
                                  handleStatusChange(item.resource.id, newStatus);
                                  setExpandedResourceId(null);
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit History Modal */}
      {selectedResourceId && (
        <EditHistoryModal
          resourceId={selectedResourceId}
          isOpen={historyModalOpen}
          onClose={() => {
            setHistoryModalOpen(false);
            setSelectedResourceId(null);
          }}
        />
      )}
    </div>
  );
}
