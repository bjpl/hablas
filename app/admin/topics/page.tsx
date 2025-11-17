'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  BookOpen,
  FileText,
  ChevronRight,
  Grid,
  List as ListIcon,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import type { TopicsListResponse, TopicCategory } from '@/lib/types/topics';

/**
 * Admin Topics List Page
 *
 * Displays all topics grouped by category with resource counts
 * Allows filtering and navigation to individual topic review pages
 */
export default function TopicsListPage() {
  const [data, setData] = useState<TopicsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/topics/list');
      if (!response.ok) throw new Error('Failed to fetch topics');

      const result: TopicsListResponse = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  // Filter topics
  const filteredCategories = data?.categories.map(category => ({
    ...category,
    topics: category.topics.filter(topic => {
      const matchesSearch = topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || category.slug === categoryFilter;
      const matchesLevel = levelFilter === 'all' || topic.level === levelFilter;

      return matchesSearch && matchesCategory && matchesLevel;
    }),
  })).filter(category => category.topics.length > 0) || [];

  const totalFilteredTopics = filteredCategories.reduce((sum, cat) => sum + cat.topics.length, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading topics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={fetchTopics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Review by Topics</h1>
              <p className="mt-1 text-sm text-gray-600">
                Browse and review resources organized by topic
              </p>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Topics</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data?.totalTopics || 0}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Resources</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data?.totalResources || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data?.categories.length || 0}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters and View Toggle */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {data?.categories.map(cat => (
                <option key={cat.slug} value={cat.slug}>{cat.name}</option>
              ))}
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {totalFilteredTopics} of {data?.totalTopics || 0} topics
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <ListIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Topics by Category */}
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No topics found matching your filters</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCategories.map(category => (
              <div key={category.slug} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">{category.count} topics</p>
                </div>

                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4'
                  : 'divide-y divide-gray-200'
                }>
                  {category.topics.map(topic => (
                    <Link
                      key={topic.slug}
                      href={`/admin/topics/${topic.slug}`}
                      className={viewMode === 'grid'
                        ? 'block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all'
                        : 'block p-4 hover:bg-gray-50 transition-colors'
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{topic.name}</h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{topic.description}</p>

                          <div className="flex items-center gap-3 mt-3">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                              {topic.level}
                            </span>
                            <span className="text-sm text-gray-500">
                              {topic.resourceCount || 0} resources
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
