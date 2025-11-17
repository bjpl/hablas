import { renderHook, act } from '@testing-library/react';
import { useContentManager, ContentItem } from '@/components/content-review/hooks/useContentManager';

describe('useContentManager', () => {
  const mockContent: ContentItem = {
    id: 'test-1',
    original: 'Original content',
    edited: 'Edited content',
    metadata: {
      title: 'Test Document',
      category: 'Test',
      lastModified: '2025-01-01T00:00:00.000Z',
    },
  };

  describe('Initialization', () => {
    it('should initialize with provided content', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      expect(result.current.content).toEqual(mockContent);
      expect(result.current.isDirty).toBe(false);
    });

    it('should initialize with null when no content provided', () => {
      const { result } = renderHook(() => useContentManager());

      expect(result.current.content).toBeNull();
      expect(result.current.isDirty).toBe(false);
    });

    it('should initialize with undefined metadata', () => {
      const contentWithoutMetadata: ContentItem = {
        id: 'test-2',
        original: 'Original',
        edited: 'Edited',
      };

      const { result } = renderHook(() => useContentManager(contentWithoutMetadata));

      expect(result.current.content).toEqual(contentWithoutMetadata);
    });
  });

  describe('updateContent', () => {
    it('should update edited content', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      act(() => {
        result.current.updateContent({ edited: 'New edited content' });
      });

      expect(result.current.content?.edited).toBe('New edited content');
    });

    it('should mark as dirty when edited content changes', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      act(() => {
        result.current.updateContent({ edited: 'Modified' });
      });

      expect(result.current.isDirty).toBe(true);
    });

    it('should update lastModified timestamp on edit', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      const originalTimestamp = result.current.content?.metadata?.lastModified;

      act(() => {
        result.current.updateContent({ edited: 'New content' });
      });

      const newTimestamp = result.current.content?.metadata?.lastModified;
      expect(newTimestamp).not.toBe(originalTimestamp);
      expect(new Date(newTimestamp!).getTime()).toBeGreaterThan(
        new Date(originalTimestamp!).getTime()
      );
    });

    it('should merge metadata when updating', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      act(() => {
        result.current.updateContent({
          metadata: { category: 'New Category' },
        });
      });

      expect(result.current.content?.metadata?.category).toBe('New Category');
      expect(result.current.content?.metadata?.title).toBe('Test Document');
    });

    it('should handle partial updates', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      const originalContent = result.current.content?.original;

      act(() => {
        result.current.updateContent({ edited: 'Only edited changed' });
      });

      expect(result.current.content?.original).toBe(originalContent);
      expect(result.current.content?.edited).toBe('Only edited changed');
    });

    it('should not update when content is null', () => {
      const { result } = renderHook(() => useContentManager());

      act(() => {
        result.current.updateContent({ edited: 'New content' });
      });

      expect(result.current.content).toBeNull();
    });

    it('should not mark as dirty for non-edited updates', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      act(() => {
        result.current.updateContent({
          metadata: { category: 'New Category' },
        });
      });

      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('resetContent', () => {
    it('should reset content to new value', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      const newContent: ContentItem = {
        id: 'new-id',
        original: 'New original',
        edited: 'New edited',
      };

      act(() => {
        result.current.resetContent(newContent);
      });

      expect(result.current.content).toEqual(newContent);
    });

    it('should clear dirty flag when resetting', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      // Make it dirty
      act(() => {
        result.current.updateContent({ edited: 'Modified' });
      });

      expect(result.current.isDirty).toBe(true);

      // Reset content
      act(() => {
        result.current.resetContent(mockContent);
      });

      expect(result.current.isDirty).toBe(false);
    });

    it('should update initial content reference', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      const newContent: ContentItem = {
        id: 'new-id',
        original: 'New original',
        edited: 'New edited',
      };

      act(() => {
        result.current.resetContent(newContent);
        result.current.updateContent({ edited: 'Modified after reset' });
      });

      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('resetDirty', () => {
    it('should clear dirty flag', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      act(() => {
        result.current.updateContent({ edited: 'Modified' });
      });

      expect(result.current.isDirty).toBe(true);

      act(() => {
        result.current.resetDirty();
      });

      expect(result.current.isDirty).toBe(false);
    });

    it('should update initial content reference', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      act(() => {
        result.current.updateContent({ edited: 'Modified once' });
        result.current.resetDirty();
        result.current.updateContent({ edited: 'Modified twice' });
      });

      expect(result.current.isDirty).toBe(true);
    });

    it('should handle being called when not dirty', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      act(() => {
        result.current.resetDirty();
      });

      expect(result.current.isDirty).toBe(false);
    });

    it('should handle null content gracefully', () => {
      const { result } = renderHook(() => useContentManager());

      act(() => {
        result.current.resetDirty();
      });

      expect(result.current.isDirty).toBe(false);
      expect(result.current.content).toBeNull();
    });
  });

  describe('Complex Workflows', () => {
    it('should handle multiple sequential updates', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      act(() => {
        result.current.updateContent({ edited: 'First update' });
        result.current.updateContent({ edited: 'Second update' });
        result.current.updateContent({ edited: 'Third update' });
      });

      expect(result.current.content?.edited).toBe('Third update');
      expect(result.current.isDirty).toBe(true);
    });

    it('should handle update, save, and edit again workflow', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      // Edit content
      act(() => {
        result.current.updateContent({ edited: 'First edit' });
      });

      expect(result.current.isDirty).toBe(true);

      // Simulate save
      act(() => {
        result.current.resetDirty();
      });

      expect(result.current.isDirty).toBe(false);

      // Edit again
      act(() => {
        result.current.updateContent({ edited: 'Second edit' });
      });

      expect(result.current.isDirty).toBe(true);
    });

    it('should maintain metadata through updates', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      const originalTitle = result.current.content?.metadata?.title;

      act(() => {
        result.current.updateContent({ edited: 'Update 1' });
        result.current.updateContent({ edited: 'Update 2' });
        result.current.updateContent({ metadata: { category: 'New' } });
      });

      expect(result.current.content?.metadata?.title).toBe(originalTitle);
      expect(result.current.content?.metadata?.category).toBe('New');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string updates', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      act(() => {
        result.current.updateContent({ edited: '' });
      });

      expect(result.current.content?.edited).toBe('');
      expect(result.current.isDirty).toBe(true);
    });

    it('should handle very long content', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      const longContent = 'a'.repeat(100000);

      act(() => {
        result.current.updateContent({ edited: longContent });
      });

      expect(result.current.content?.edited).toBe(longContent);
    });

    it('should handle special characters', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      const specialContent = '<script>alert("xss")</script> & special chars 你好';

      act(() => {
        result.current.updateContent({ edited: specialContent });
      });

      expect(result.current.content?.edited).toBe(specialContent);
    });

    it('should preserve id through updates', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      const originalId = result.current.content?.id;

      act(() => {
        result.current.updateContent({ edited: 'New content' });
        result.current.updateContent({ original: 'New original' });
      });

      expect(result.current.content?.id).toBe(originalId);
    });

    it('should handle rapid updates', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.updateContent({ edited: `Update ${i}` });
        }
      });

      expect(result.current.content?.edited).toBe('Update 99');
      expect(result.current.isDirty).toBe(true);
    });

    it('should handle metadata with undefined values', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      act(() => {
        result.current.updateContent({
          metadata: { title: undefined },
        });
      });

      expect(result.current.content?.metadata?.title).toBeUndefined();
    });
  });

  describe('State Consistency', () => {
    it('should maintain consistent state across multiple operations', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      act(() => {
        result.current.updateContent({ edited: 'Edit 1' });
        result.current.resetDirty();
        result.current.updateContent({ edited: 'Edit 2' });
      });

      expect(result.current.content?.edited).toBe('Edit 2');
      expect(result.current.isDirty).toBe(true);
    });

    it('should handle reset followed by updates', () => {
      const { result } = renderHook(() => useContentManager(mockContent));

      const newContent: ContentItem = {
        id: 'new',
        original: 'New original',
        edited: 'New edited',
      };

      act(() => {
        result.current.resetContent(newContent);
        result.current.updateContent({ edited: 'Modified after reset' });
      });

      expect(result.current.content?.id).toBe('new');
      expect(result.current.content?.edited).toBe('Modified after reset');
      expect(result.current.isDirty).toBe(true);
    });
  });
});
