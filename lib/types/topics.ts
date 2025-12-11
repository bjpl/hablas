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
  level?: 'basico' | 'intermedio' | 'avanzado';
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

export interface TopicCategory {
  name: string;
  slug: string;
  count: number;
  topics: TopicGroup[];
}

export interface TopicsListResponse {
  topics: TopicGroup[];
  totalTopics?: number;
  totalResources?: number;
  categories?: TopicCategory[];
}

export interface Topic {
  id?: string;
  slug: string;
  name: string;
  description: string;
  category: 'all' | 'repartidor' | 'conductor';
  level?: 'basico' | 'intermedio' | 'avanzado';
  resourceIds: number[];
  resourceCount?: number;
}

export interface TopicResource {
  id: number;
  resourceId?: number;
  title: string;
  description?: string;
  content: string;
  hasEdit?: boolean;
  editStatus?: 'pending' | 'approved' | 'rejected';
}

export interface TopicWithResources extends Topic {
  resources: TopicResource[];
}

export interface TopicReviewResponse {
  name?: string;
  level?: 'basico' | 'intermedio' | 'avanzado';
  category?: 'all' | 'repartidor' | 'conductor';
  description?: string;
  topic: TopicGroup;
  resources: TopicResourceWithContent[];
  metadata?: {
    totalEdits: number;
    pendingEdits: number;
    approvedEdits: number;
    rejectedEdits: number;
  };
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
