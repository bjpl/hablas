import { useState, useCallback, useEffect } from 'react';
import type { TopicDetailsResponse, TopicResourceWithContent, BatchSaveRequest } from '@/lib/types/topics';

export interface ResourceEditState {
  resourceId: number;
  originalContent: string;
  editedContent: string;
  isDirty: boolean;
}

interface UseTopicManagerReturn {
  topic: TopicDetailsResponse | null;
  isLoading: boolean;
  error: string | null;
  resourceEdits: Map<number, ResourceEditState>;
  updateResourceContent: (resourceId: number, content: string) => void;
  saveResource: (resourceId: number) => Promise<void>;
  saveAll: () => Promise<void>;
  hasUnsavedChanges: boolean;
  dirtyResourceIds: number[];
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing topic review state
 *
 * Handles:
 * - Fetching topic data with all resources
 * - Tracking edits for each resource
 * - Individual and batch save operations
 * - Dirty state tracking
 *
 * @param topicSlug - URL slug for the topic
 * @returns Topic management functions and state
 */
export function useTopicManager(topicSlug: string): UseTopicManagerReturn {
  const [topic, setTopic] = useState<TopicDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resourceEdits, setResourceEdits] = useState<Map<number, ResourceEditState>>(new Map());

  /**
   * Fetch topic data from API
   */
  const fetchTopic = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/topics/${topicSlug}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch topic: ${response.statusText}`);
      }

      const data: TopicDetailsResponse = await response.json();
      setTopic(data);

      // Initialize edit states for all resources
      const edits = new Map<number, ResourceEditState>();
      data.resources.forEach((resource) => {
        edits.set(resource.resource.id, {
          resourceId: resource.resource.id,
          originalContent: resource.content,
          editedContent: resource.content,
          isDirty: false,
        });
      });
      setResourceEdits(edits);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      console.error('Error fetching topic:', err);
    } finally {
      setIsLoading(false);
    }
  }, [topicSlug]);

  /**
   * Update content for a specific resource
   */
  const updateResourceContent = useCallback((resourceId: number, content: string) => {
    setResourceEdits((prev) => {
      const newEdits = new Map(prev);
      const current = newEdits.get(resourceId);

      if (current) {
        newEdits.set(resourceId, {
          ...current,
          editedContent: content,
          isDirty: content !== current.originalContent,
        });
      }

      return newEdits;
    });
  }, []);

  /**
   * Save a single resource
   */
  const saveResource = useCallback(async (resourceId: number) => {
    const edit = resourceEdits.get(resourceId);
    if (!edit || !edit.isDirty) return;

    try {
      const request: BatchSaveRequest = {
        updates: [{
          resourceId,
          editedContent: edit.editedContent,
        }],
      };

      const response = await fetch(`/api/topics/${topicSlug}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to save resource');
      }

      // Mark as clean after successful save
      setResourceEdits((prev) => {
        const newEdits = new Map(prev);
        const current = newEdits.get(resourceId);
        if (current) {
          newEdits.set(resourceId, {
            ...current,
            originalContent: current.editedContent,
            isDirty: false,
          });
        }
        return newEdits;
      });
    } catch (err) {
      console.error('Error saving resource:', err);
      throw err;
    }
  }, [resourceEdits, topicSlug]);

  /**
   * Save all dirty resources in a batch
   */
  const saveAll = useCallback(async () => {
    const dirtyEdits = Array.from(resourceEdits.values()).filter(edit => edit.isDirty);

    if (dirtyEdits.length === 0) return;

    try {
      const request: BatchSaveRequest = {
        updates: dirtyEdits.map(edit => ({
          resourceId: edit.resourceId,
          editedContent: edit.editedContent,
        })),
      };

      const response = await fetch(`/api/topics/${topicSlug}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to save resources');
      }

      // Mark all as clean after successful save
      setResourceEdits((prev) => {
        const newEdits = new Map(prev);
        dirtyEdits.forEach((edit) => {
          newEdits.set(edit.resourceId, {
            ...edit,
            originalContent: edit.editedContent,
            isDirty: false,
          });
        });
        return newEdits;
      });
    } catch (err) {
      console.error('Error saving all resources:', err);
      throw err;
    }
  }, [resourceEdits, topicSlug]);

  /**
   * Check if there are any unsaved changes
   */
  const hasUnsavedChanges = Array.from(resourceEdits.values()).some(edit => edit.isDirty);

  /**
   * Get list of dirty resource IDs
   */
  const dirtyResourceIds = Array.from(resourceEdits.values())
    .filter(edit => edit.isDirty)
    .map(edit => edit.resourceId);

  // Fetch topic on mount
  useEffect(() => {
    fetchTopic();
  }, [fetchTopic]);

  return {
    topic,
    isLoading,
    error,
    resourceEdits,
    updateResourceContent,
    saveResource,
    saveAll,
    hasUnsavedChanges,
    dirtyResourceIds,
    refetch: fetchTopic,
  };
}
