/**
 * Topic Type Definitions
 *
 * Defines the structure for topic-based grouping of resources
 */

import type { Resource } from '@/data/resources';

export interface TopicGroup {
  slug: string;
  name: string;
  description: string;
  category: 'all' | 'repartidor' | 'conductor';
  resourceIds: number[];
  resourceCount?: number;
}

export interface TopicResourceWithContent {
  resource: Resource;
  content: string;
  audioUrl?: string;
  hasEdit?: boolean;
  lastEditDate?: string;
  editStatus?: 'pending' | 'approved' | 'rejected';
}

export interface TopicDetailsResponse {
  topic: TopicGroup;
  resources: TopicResourceWithContent[];
}

export interface TopicsListResponse {
  topics: TopicGroup[];
}

export interface BatchSaveRequest {
  updates: Array<{
    resourceId: number;
    editedContent: string;
  }>;
}

export interface BatchSaveResponse {
  success: boolean;
  saved: number;
  editIds: string[];
  errors?: Array<{
    resourceId: number;
    error: string;
  }>;
}
