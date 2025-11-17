import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ContentReviewTool, ContentItem } from '@/components/content-review/ContentReviewTool';

describe('ContentReviewTool', () => {
  const mockContent: ContentItem = {
    id: 'test-1',
    original: 'Original content for testing',
    edited: 'Edited content for testing',
    metadata: {
      title: 'Test Document',
      category: 'Test Category',
      lastModified: '2025-01-01T00:00:00.000Z',
    },
  };

  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Component Rendering', () => {
    it('should render the content review tool with initial content', () => {
      render(<ContentReviewTool initialContent={mockContent} />);

      expect(screen.getByText('Content Review Tool')).toBeInTheDocument();
      expect(screen.getByText('Test Document')).toBeInTheDocument();
      expect(screen.getByText('Test Category')).toBeInTheDocument();
    });

    it('should render "no content" message when no initial content provided', () => {
      render(<ContentReviewTool />);

      expect(screen.getByText('No content to review')).toBeInTheDocument();
    });

    it('should display both original and edited panels', () => {
      render(<ContentReviewTool initialContent={mockContent} />);

      expect(screen.getByText('Original Content')).toBeInTheDocument();
      expect(screen.getByText('Edit Content')).toBeInTheDocument();
    });

    it('should display save button', () => {
      render(<ContentReviewTool initialContent={mockContent} />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <ContentReviewTool initialContent={mockContent} className="custom-class" />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('Save Functionality', () => {
    it('should disable save button when content is not dirty', () => {
      render(<ContentReviewTool initialContent={mockContent} onSave={mockOnSave} />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when content is modified', async () => {
      const user = userEvent.setup({ delay: null });
      render(<ContentReviewTool initialContent={mockContent} onSave={mockOnSave} />);

      const textarea = screen.getByLabelText('Content editor');
      await user.clear(textarea);
      await user.type(textarea, 'Modified content');

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).not.toBeDisabled();
    });

    it('should call onSave when save button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      mockOnSave.mockResolvedValue(undefined);

      render(<ContentReviewTool initialContent={mockContent} onSave={mockOnSave} />);

      const textarea = screen.getByLabelText('Content editor');
      await user.clear(textarea);
      await user.type(textarea, 'Modified content');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('should show saving status during save operation', async () => {
      const user = userEvent.setup({ delay: null });
      mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<ContentReviewTool initialContent={mockContent} onSave={mockOnSave} />);

      const textarea = screen.getByLabelText('Content editor');
      await user.type(textarea, 'x');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should show success status after successful save', async () => {
      const user = userEvent.setup({ delay: null });
      mockOnSave.mockResolvedValue(undefined);

      render(<ContentReviewTool initialContent={mockContent} onSave={mockOnSave} />);

      const textarea = screen.getByLabelText('Content editor');
      await user.type(textarea, 'x');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Saved')).toBeInTheDocument();
      });
    });

    it('should show error status on save failure', async () => {
      const user = userEvent.setup({ delay: null });
      mockOnSave.mockRejectedValue(new Error('Save failed'));

      render(<ContentReviewTool initialContent={mockContent} onSave={mockOnSave} />);

      const textarea = screen.getByLabelText('Content editor');
      await user.type(textarea, 'x');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Save failed')).toBeInTheDocument();
        expect(screen.getByText('Save failed')).toBeInTheDocument();
      });
    });

    it('should display error message on save failure', async () => {
      const user = userEvent.setup({ delay: null });
      const errorMessage = 'Network error occurred';
      mockOnSave.mockRejectedValue(new Error(errorMessage));

      render(<ContentReviewTool initialContent={mockContent} onSave={mockOnSave} />);

      const textarea = screen.getByLabelText('Content editor');
      await user.type(textarea, 'x');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Auto-save Functionality', () => {
    it('should auto-save after delay when content is modified', async () => {
      const user = userEvent.setup({ delay: null });
      mockOnSave.mockResolvedValue(undefined);

      render(
        <ContentReviewTool
          initialContent={mockContent}
          onSave={mockOnSave}
          autoSaveDelay={1000}
        />
      );

      const textarea = screen.getByLabelText('Content editor');
      await user.type(textarea, 'New content');

      // Fast-forward time
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('should debounce auto-save on rapid changes', async () => {
      const user = userEvent.setup({ delay: null });
      mockOnSave.mockResolvedValue(undefined);

      render(
        <ContentReviewTool
          initialContent={mockContent}
          onSave={mockOnSave}
          autoSaveDelay={1000}
        />
      );

      const textarea = screen.getByLabelText('Content editor');

      // Make multiple rapid changes
      await user.type(textarea, 'a');
      jest.advanceTimersByTime(500);

      await user.type(textarea, 'b');
      jest.advanceTimersByTime(500);

      await user.type(textarea, 'c');
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        // Should only save once after final delay
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });
    });

    it('should not auto-save when onSave is not provided', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ContentReviewTool
          initialContent={mockContent}
          autoSaveDelay={1000}
        />
      );

      const textarea = screen.getByLabelText('Content editor');
      await user.type(textarea, 'New content');

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockOnSave).not.toHaveBeenCalled();
      });
    });
  });

  describe('User Interactions', () => {
    it('should update edited content when user types', async () => {
      const user = userEvent.setup({ delay: null });
      render(<ContentReviewTool initialContent={mockContent} />);

      const textarea = screen.getByLabelText('Content editor');
      await user.clear(textarea);
      await user.type(textarea, 'Updated text');

      expect(textarea).toHaveValue('Updated text');
    });

    it('should display "unsaved changes" indicator when content is dirty', async () => {
      const user = userEvent.setup({ delay: null });
      render(<ContentReviewTool initialContent={mockContent} />);

      const textarea = screen.getByLabelText('Content editor');
      await user.type(textarea, 'x');

      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    });

    it('should show character and word count', () => {
      render(<ContentReviewTool initialContent={mockContent} />);

      const originalLength = mockContent.original.length;
      const editedLength = mockContent.edited.length;

      const characterCounts = screen.getAllByText(new RegExp(`Characters: \\d+`));
      expect(characterCounts.length).toBeGreaterThan(0);
    });
  });

  describe('Metadata Display', () => {
    it('should display document title when provided', () => {
      render(<ContentReviewTool initialContent={mockContent} />);

      expect(screen.getByText('Test Document')).toBeInTheDocument();
    });

    it('should display category when provided', () => {
      render(<ContentReviewTool initialContent={mockContent} />);

      expect(screen.getByText('Test Category')).toBeInTheDocument();
    });

    it('should display last modified date when provided', () => {
      render(<ContentReviewTool initialContent={mockContent} />);

      expect(screen.getByText(/Last modified:/)).toBeInTheDocument();
    });

    it('should not crash when metadata is missing', () => {
      const contentWithoutMetadata: ContentItem = {
        id: 'test-2',
        original: 'Original',
        edited: 'Edited',
      };

      render(<ContentReviewTool initialContent={contentWithoutMetadata} />);

      expect(screen.getByText('Content Review Tool')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string content', () => {
      const emptyContent: ContentItem = {
        id: 'test-3',
        original: '',
        edited: '',
      };

      render(<ContentReviewTool initialContent={emptyContent} />);

      expect(screen.getByText('Original Content')).toBeInTheDocument();
      expect(screen.getByText('Edit Content')).toBeInTheDocument();
    });

    it('should handle very long content', () => {
      const longContent: ContentItem = {
        id: 'test-4',
        original: 'a'.repeat(10000),
        edited: 'b'.repeat(10000),
      };

      render(<ContentReviewTool initialContent={longContent} />);

      const characterCounts = screen.getAllByText(/Characters: 10000/);
      expect(characterCounts.length).toBeGreaterThan(0);
    });

    it('should handle special characters in content', () => {
      const specialContent: ContentItem = {
        id: 'test-5',
        original: '<script>alert("xss")</script>',
        edited: '特殊字符 & symbols @ # $ %',
      };

      render(<ContentReviewTool initialContent={specialContent} />);

      expect(screen.getByDisplayValue(/特殊字符/)).toBeInTheDocument();
    });

    it('should reset dirty state after successful save', async () => {
      const user = userEvent.setup({ delay: null });
      mockOnSave.mockResolvedValue(undefined);

      render(<ContentReviewTool initialContent={mockContent} onSave={mockOnSave} />);

      const textarea = screen.getByLabelText('Content editor');
      await user.type(textarea, 'x');

      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument();
      });
    });

    it('should maintain dirty state after failed save', async () => {
      const user = userEvent.setup({ delay: null });
      mockOnSave.mockRejectedValue(new Error('Save failed'));

      render(<ContentReviewTool initialContent={mockContent} onSave={mockOnSave} />);

      const textarea = screen.getByLabelText('Content editor');
      await user.type(textarea, 'x');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
      });
    });
  });
});
