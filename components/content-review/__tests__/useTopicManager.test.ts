/**
 * Tests for useTopicManager Hook
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { useTopicManager } from '../hooks/useTopicManager';
import type { TopicDetailsResponse } from '@/lib/types/topics';

const mockFetch = jest.fn();
global.fetch = mockFetch;

// Suppress console.error during error-handling tests
const originalConsoleError = console.error;
const suppressConsoleError = () => {
  console.error = jest.fn();
};
const restoreConsoleError = () => {
  console.error = originalConsoleError;
};

const mockTopicData: TopicDetailsResponse = {
  topic: {
    slug: 'test-topic',
    name: 'Test Topic',
    description: 'Test description',
    category: 'repartidor',
    resourceIds: [1, 2],
  },
  resources: [
    {
      resource: {
        id: 1,
        title: 'Resource 1',
        description: 'First resource',
        category: 'repartidor',
        level: 'basico',
        type: 'pdf',
        downloadUrl: '/res1.pdf',
        contentPath: '/content1.txt',
        tags: ['test'],
        offline: false,
        size: '1 MB',
      },
      content: 'Original content 1',
    },
    {
      resource: {
        id: 2,
        title: 'Resource 2',
        description: 'Second resource',
        category: 'repartidor',
        level: 'basico',
        type: 'pdf',
        downloadUrl: '/res2.pdf',
        contentPath: '/content2.txt',
        tags: ['test'],
        offline: false,
        size: '1 MB',
      },
      content: 'Original content 2',
    },
  ],
};

describe('useTopicManager', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('Initial fetch', () => {
    it('should fetch topic data on mount', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTopicData,
      });

      const { result } = renderHook(() => useTopicManager('test-topic'));

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.topic).toEqual(mockTopicData);
      expect(result.current.error).toBeNull();
    });

    it('should initialize edit states for all resources', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTopicData,
      });

      const { result } = renderHook(() => useTopicManager('test-topic'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.resourceEdits.size).toBe(2);
      expect(result.current.resourceEdits.get(1)).toEqual({
        resourceId: 1,
        originalContent: 'Original content 1',
        editedContent: 'Original content 1',
        isDirty: false,
      });
    });

    it('should handle fetch errors', async () => {
      suppressConsoleError();
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useTopicManager('test-topic'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.topic).toBeNull();
      restoreConsoleError();
    });

    it('should handle HTTP errors', async () => {
      suppressConsoleError();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      const { result } = renderHook(() => useTopicManager('test-topic'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch topic: Not Found');
      restoreConsoleError();
    });
  });

  describe('updateResourceContent', () => {
    it('should update edited content and mark as dirty', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTopicData,
      });

      const { result } = renderHook(() => useTopicManager('test-topic'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateResourceContent(1, 'New content');
      });

      const editState = result.current.resourceEdits.get(1);
      expect(editState?.editedContent).toBe('New content');
      expect(editState?.isDirty).toBe(true);
    });

    it('should mark as clean when content matches original', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTopicData,
      });

      const { result } = renderHook(() => useTopicManager('test-topic'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // First make it dirty
      act(() => {
        result.current.updateResourceContent(1, 'New content');
      });

      expect(result.current.resourceEdits.get(1)?.isDirty).toBe(true);

      // Then revert to original
      act(() => {
        result.current.updateResourceContent(1, 'Original content 1');
      });

      expect(result.current.resourceEdits.get(1)?.isDirty).toBe(false);
    });

    it('should update hasUnsavedChanges flag', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTopicData,
      });

      const { result } = renderHook(() => useTopicManager('test-topic'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasUnsavedChanges).toBe(false);

      act(() => {
        result.current.updateResourceContent(1, 'New content');
      });

      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('should track dirty resource IDs', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTopicData,
      });

      const { result } = renderHook(() => useTopicManager('test-topic'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateResourceContent(1, 'New content 1');
        result.current.updateResourceContent(2, 'New content 2');
      });

      expect(result.current.dirtyResourceIds).toEqual([1, 2]);
    });
  });

  describe('saveResource', () => {
    beforeEach(() => {
      mockFetch.mockClear();
    });

    it('should save a single resource', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTopicData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, saved: 1, editIds: ['edit-1'] }),
        });

      const { result } = renderHook(() => useTopicManager('test-topic'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateResourceContent(1, 'New content');
      });

      await act(async () => {
        await result.current.saveResource(1);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/topics/test-topic/save',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            updates: [{ resourceId: 1, editedContent: 'New content' }],
          }),
        })
      );
    });

    it('should mark resource as clean after save', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTopicData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, saved: 1, editIds: ['edit-1'] }),
        });

      const { result } = renderHook(() => useTopicManager('test-topic'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateResourceContent(1, 'New content');
      });

      await act(async () => {
        await result.current.saveResource(1);
      });

      const editState = result.current.resourceEdits.get(1);
      expect(editState?.isDirty).toBe(false);
      expect(editState?.originalContent).toBe('New content');
    });

    it('should skip save if resource is not dirty', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTopicData,
      });

      const { result } = renderHook(() => useTopicManager('test-topic'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockFetch.mockClear();

      await act(async () => {
        await result.current.saveResource(1);
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should throw error on save failure', async () => {
      suppressConsoleError();
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTopicData,
        })
        .mockResolvedValueOnce({
          ok: false,
        });

      const { result } = renderHook(() => useTopicManager('test-topic'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateResourceContent(1, 'New content');
      });

      await expect(
        act(async () => {
          await result.current.saveResource(1);
        })
      ).rejects.toThrow('Failed to save resource');
      restoreConsoleError();
    });
  });

  describe('saveAll', () => {
    it('should save all dirty resources', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTopicData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, saved: 2, editIds: ['edit-1', 'edit-2'] }),
        });

      const { result } = renderHook(() => useTopicManager('test-topic'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateResourceContent(1, 'New content 1');
        result.current.updateResourceContent(2, 'New content 2');
      });

      await act(async () => {
        await result.current.saveAll();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/topics/test-topic/save',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            updates: [
              { resourceId: 1, editedContent: 'New content 1' },
              { resourceId: 2, editedContent: 'New content 2' },
            ],
          }),
        })
      );
    });

    it('should mark all resources as clean after batch save', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTopicData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, saved: 2, editIds: ['edit-1', 'edit-2'] }),
        });

      const { result } = renderHook(() => useTopicManager('test-topic'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateResourceContent(1, 'New content 1');
        result.current.updateResourceContent(2, 'New content 2');
      });

      await act(async () => {
        await result.current.saveAll();
      });

      expect(result.current.hasUnsavedChanges).toBe(false);
      expect(result.current.dirtyResourceIds).toEqual([]);
    });

    it('should skip save if no dirty resources', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTopicData,
      });

      const { result } = renderHook(() => useTopicManager('test-topic'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockFetch.mockClear();

      await act(async () => {
        await result.current.saveAll();
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('refetch', () => {
    it('should refetch topic data', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockTopicData,
      });

      const { result } = renderHook(() => useTopicManager('test-topic'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockFetch.mockClear();

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/topics/test-topic');
    });
  });
});
