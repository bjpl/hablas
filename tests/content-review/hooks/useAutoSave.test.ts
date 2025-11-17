import { renderHook, waitFor } from '@testing-library/react';
import { useAutoSave } from '@/components/content-review/hooks/useAutoSave';

describe('useAutoSave', () => {
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('should not save immediately when content is provided', () => {
      renderHook(() =>
        useAutoSave({
          content: 'test content',
          onSave: mockOnSave,
          delay: 1000,
          enabled: true,
        })
      );

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should save after delay when content changes', async () => {
      mockOnSave.mockResolvedValue(undefined);

      const { rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave: mockOnSave,
            delay: 1000,
            enabled: true,
          }),
        { initialProps: { content: 'initial' } }
      );

      // Change content
      rerender({ content: 'updated' });

      // Fast-forward time
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('updated');
      });
    });

    it('should use default delay of 2000ms', async () => {
      mockOnSave.mockResolvedValue(undefined);

      const { rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave: mockOnSave,
            enabled: true,
          }),
        { initialProps: { content: 'initial' } }
      );

      rerender({ content: 'updated' });

      // Should not save before 2000ms
      jest.advanceTimersByTime(1999);
      expect(mockOnSave).not.toHaveBeenCalled();

      // Should save after 2000ms
      jest.advanceTimersByTime(1);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });
  });

  describe('Debouncing', () => {
    it('should debounce multiple rapid changes', async () => {
      mockOnSave.mockResolvedValue(undefined);

      const { rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave: mockOnSave,
            delay: 1000,
            enabled: true,
          }),
        { initialProps: { content: 'v1' } }
      );

      // Make multiple rapid changes
      rerender({ content: 'v2' });
      jest.advanceTimersByTime(500);

      rerender({ content: 'v3' });
      jest.advanceTimersByTime(500);

      rerender({ content: 'v4' });
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        // Should only save once with the final value
        expect(mockOnSave).toHaveBeenCalledTimes(1);
        expect(mockOnSave).toHaveBeenCalledWith('v4');
      });
    });

    it('should cancel pending save when content changes', async () => {
      mockOnSave.mockResolvedValue(undefined);

      const { rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave: mockOnSave,
            delay: 1000,
            enabled: true,
          }),
        { initialProps: { content: 'v1' } }
      );

      rerender({ content: 'v2' });
      jest.advanceTimersByTime(900);

      // Change before timer completes
      rerender({ content: 'v3' });
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
        expect(mockOnSave).toHaveBeenCalledWith('v3');
      });
    });
  });

  describe('Enabled/Disabled State', () => {
    it('should not save when enabled is false', () => {
      const { rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave: mockOnSave,
            delay: 1000,
            enabled: false,
          }),
        { initialProps: { content: 'initial' } }
      );

      rerender({ content: 'updated' });
      jest.advanceTimersByTime(1000);

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should save when enabled changes from false to true', async () => {
      mockOnSave.mockResolvedValue(undefined);

      const { rerender } = renderHook(
        ({ content, enabled }) =>
          useAutoSave({
            content,
            onSave: mockOnSave,
            delay: 1000,
            enabled,
          }),
        { initialProps: { content: 'test', enabled: false } }
      );

      // Content changes while disabled
      rerender({ content: 'updated', enabled: false });
      jest.advanceTimersByTime(1000);
      expect(mockOnSave).not.toHaveBeenCalled();

      // Enable auto-save with new content
      rerender({ content: 'final', enabled: true });
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('final');
      });
    });

    it('should be enabled by default', async () => {
      mockOnSave.mockResolvedValue(undefined);

      const { rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave: mockOnSave,
            delay: 1000,
          }),
        { initialProps: { content: 'initial' } }
      );

      rerender({ content: 'updated' });
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });
  });

  describe('Content Validation', () => {
    it('should not save when content is null', () => {
      const { rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave: mockOnSave,
            delay: 1000,
            enabled: true,
          }),
        { initialProps: { content: 'initial' } }
      );

      rerender({ content: null });
      jest.advanceTimersByTime(1000);

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should not save when content has not changed', () => {
      const { rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave: mockOnSave,
            delay: 1000,
            enabled: true,
          }),
        { initialProps: { content: 'same' } }
      );

      // Re-render with same content
      rerender({ content: 'same' });
      jest.advanceTimersByTime(1000);

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should save when content changes from empty to non-empty', async () => {
      mockOnSave.mockResolvedValue(undefined);

      const { rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave: mockOnSave,
            delay: 1000,
            enabled: true,
          }),
        { initialProps: { content: '' } }
      );

      rerender({ content: 'new content' });
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('new content');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle save errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockOnSave.mockRejectedValue(new Error('Save failed'));

      const { rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave: mockOnSave,
            delay: 1000,
            enabled: true,
          }),
        { initialProps: { content: 'initial' } }
      );

      rerender({ content: 'updated' });
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Auto-save failed:', expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
    });

    it('should continue working after save error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockOnSave.mockRejectedValueOnce(new Error('First save failed'))
                 .mockResolvedValueOnce(undefined);

      const { rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave: mockOnSave,
            delay: 1000,
            enabled: true,
          }),
        { initialProps: { content: 'v1' } }
      );

      // First save fails
      rerender({ content: 'v2' });
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('v2');
      });

      // Second save succeeds
      rerender({ content: 'v3' });
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('v3');
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Cleanup', () => {
    it('should clear timeout on unmount', () => {
      const { unmount } = renderHook(() =>
        useAutoSave({
          content: 'test',
          onSave: mockOnSave,
          delay: 1000,
          enabled: true,
        })
      );

      unmount();
      jest.advanceTimersByTime(1000);

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should clear timeout when delay changes', async () => {
      mockOnSave.mockResolvedValue(undefined);

      const { rerender } = renderHook(
        ({ content, delay }) =>
          useAutoSave({
            content,
            onSave: mockOnSave,
            delay,
            enabled: true,
          }),
        { initialProps: { content: 'test', delay: 1000 } }
      );

      rerender({ content: 'updated', delay: 500 });
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle rapid enable/disable toggling', () => {
      const { rerender } = renderHook(
        ({ enabled }) =>
          useAutoSave({
            content: 'test',
            onSave: mockOnSave,
            delay: 1000,
            enabled,
          }),
        { initialProps: { enabled: true } }
      );

      rerender({ enabled: false });
      rerender({ enabled: true });
      rerender({ enabled: false });

      jest.advanceTimersByTime(1000);

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should save only once with multiple simultaneous changes', async () => {
      mockOnSave.mockResolvedValue(undefined);

      const { rerender } = renderHook(
        ({ content, delay, enabled }) =>
          useAutoSave({
            content,
            onSave: mockOnSave,
            delay,
            enabled,
          }),
        { initialProps: { content: 'v1', delay: 1000, enabled: true } }
      );

      // Change multiple props simultaneously
      rerender({ content: 'v2', delay: 500, enabled: true });
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
        expect(mockOnSave).toHaveBeenCalledWith('v2');
      });
    });
  });
});
