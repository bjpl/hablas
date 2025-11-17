/**
 * Tests for TopicReviewTool Component
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopicReviewTool } from '../TopicReviewTool';
import type { TopicDetailsResponse } from '@/lib/types/topics';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockTopicData: TopicDetailsResponse = {
  topic: {
    slug: 'frases-esenciales-entregas',
    name: 'Frases Esenciales para Entregas',
    description: 'Essential delivery phrases',
    category: 'repartidor',
    resourceIds: [1, 2, 3],
  },
  resources: [
    {
      resource: {
        id: 1,
        title: 'Frases Esenciales - Var 1',
        description: 'First variation',
        category: 'repartidor',
        level: 'basico',
        type: 'pdf',
        downloadUrl: '/resources/frases-var1.pdf',
        audioUrl: '/audio/frases-var1.mp3',
        contentPath: '/content/frases-var1.txt',
        tags: ['delivery', 'basics'],
        offline: false,
        size: '1.2 MB',
      },
      content: 'Original content for variation 1',
      audioUrl: '/audio/frases-var1.mp3',
      hasEdit: false,
    },
    {
      resource: {
        id: 2,
        title: 'Frases Esenciales - Var 2',
        description: 'Second variation',
        category: 'repartidor',
        level: 'basico',
        type: 'pdf',
        downloadUrl: '/resources/frases-var2.pdf',
        audioUrl: '/audio/frases-var2.mp3',
        contentPath: '/content/frases-var2.txt',
        tags: ['delivery', 'basics'],
        offline: false,
        size: '1.3 MB',
      },
      content: 'Original content for variation 2',
      audioUrl: '/audio/frases-var2.mp3',
      hasEdit: true,
      lastEditDate: '2025-01-15T10:30:00Z',
      editStatus: 'pending',
    },
  ],
};

describe('TopicReviewTool', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('Loading State', () => {
    it('should display loading indicator while fetching topic', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<TopicReviewTool topicSlug="test-topic" />);

      expect(screen.getByText(/loading topic resources/i)).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<TopicReviewTool topicSlug="test-topic" />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load topic/i)).toBeInTheDocument();
      });
    });

    it('should display error when topic is not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      render(<TopicReviewTool topicSlug="non-existent" />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load topic/i)).toBeInTheDocument();
      });
    });

    it('should call onBack when back button is clicked in error state', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Error'));
      const onBack = jest.fn();

      render(<TopicReviewTool topicSlug="test" onBack={onBack} />);

      await waitFor(() => {
        expect(screen.getByText(/go back/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/go back/i));
      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Successful Load', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockTopicData,
      });
    });

    it('should display topic name and description', async () => {
      render(<TopicReviewTool topicSlug="frases-esenciales-entregas" />);

      await waitFor(() => {
        expect(screen.getByText('Frases Esenciales para Entregas')).toBeInTheDocument();
        expect(screen.getByText(/essential delivery phrases/i)).toBeInTheDocument();
      });
    });

    it('should display all resource tabs', async () => {
      render(<TopicReviewTool topicSlug="frases-esenciales-entregas" />);

      await waitFor(() => {
        expect(screen.getByText('Frases Esenciales - Var 1')).toBeInTheDocument();
        expect(screen.getByText('Frases Esenciales - Var 2')).toBeInTheDocument();
      });
    });

    it('should show "has pending edit" badge for edited resources', async () => {
      render(<TopicReviewTool topicSlug="frases-esenciales-entregas" />);

      await waitFor(() => {
        // Click second tab
        fireEvent.click(screen.getByText('Frases Esenciales - Var 2'));
      });

      await waitFor(() => {
        expect(screen.getByText(/has pending edit/i)).toBeInTheDocument();
      });
    });

    it('should display variation count', async () => {
      render(<TopicReviewTool topicSlug="frases-esenciales-entregas" />);

      await waitFor(() => {
        expect(screen.getByText(/2 variation\(s\)/i)).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockTopicData,
      });
    });

    it('should switch between tabs when clicked', async () => {
      render(<TopicReviewTool topicSlug="frases-esenciales-entregas" />);

      await waitFor(() => {
        expect(screen.getByText('Frases Esenciales - Var 1')).toBeInTheDocument();
      });

      // First tab should be active by default
      expect(screen.getByText('Original content for variation 1')).toBeInTheDocument();

      // Click second tab
      fireEvent.click(screen.getByText('Frases Esenciales - Var 2'));

      await waitFor(() => {
        expect(screen.getByText('Original content for variation 2')).toBeInTheDocument();
      });
    });

    it('should highlight active tab', async () => {
      render(<TopicReviewTool topicSlug="frases-esenciales-entregas" />);

      await waitFor(() => {
        const tab1 = screen.getByText('Frases Esenciales - Var 1').closest('button');
        expect(tab1).toHaveClass('border-blue-600');
      });
    });
  });

  describe('Content Editing', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockTopicData,
      });
    });

    it('should update content when typing in editor', async () => {
      const user = userEvent.setup();
      render(<TopicReviewTool topicSlug="frases-esenciales-entregas" />);

      await waitFor(() => {
        expect(screen.getByText('Original content for variation 1')).toBeInTheDocument();
      });

      const textarea = screen.getByRole('textbox', { name: /content editor/i });
      await user.clear(textarea);
      await user.type(textarea, 'New edited content');

      expect(textarea).toHaveValue('New edited content');
    });

    it('should mark resource as dirty when content changes', async () => {
      const user = userEvent.setup();
      render(<TopicReviewTool topicSlug="frases-esenciales-entregas" />);

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /content editor/i })).toBeInTheDocument();
      });

      const textarea = screen.getByRole('textbox', { name: /content editor/i });
      await user.type(textarea, ' edited');

      await waitFor(() => {
        expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
      });
    });

    it('should show unsaved count badge', async () => {
      const user = userEvent.setup();
      render(<TopicReviewTool topicSlug="frases-esenciales-entregas" />);

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /content editor/i })).toBeInTheDocument();
      });

      const textarea = screen.getByRole('textbox', { name: /content editor/i });
      await user.type(textarea, ' edited');

      await waitFor(() => {
        expect(screen.getByText(/1 unsaved/i)).toBeInTheDocument();
      });
    });
  });

  describe('Save Operations', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockTopicData,
      });
    });

    it('should enable Save All button when there are unsaved changes', async () => {
      const user = userEvent.setup();
      render(<TopicReviewTool topicSlug="frases-esenciales-entregas" />);

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /content editor/i })).toBeInTheDocument();
      });

      const saveAllButton = screen.getByRole('button', { name: /save all/i });
      expect(saveAllButton).toBeDisabled();

      const textarea = screen.getByRole('textbox', { name: /content editor/i });
      await user.type(textarea, ' edited');

      await waitFor(() => {
        expect(saveAllButton).not.toBeDisabled();
      });
    });

    it('should call save API when Save All is clicked', async () => {
      const user = userEvent.setup();
      const saveMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, saved: 1, editIds: ['edit-1'] }),
      });

      mockFetch.mockImplementation((url) => {
        if (url.includes('/save')) {
          return saveMock();
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockTopicData,
        });
      });

      render(<TopicReviewTool topicSlug="frases-esenciales-entregas" />);

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /content editor/i })).toBeInTheDocument();
      });

      const textarea = screen.getByRole('textbox', { name: /content editor/i });
      await user.type(textarea, ' edited');

      const saveAllButton = screen.getByRole('button', { name: /save all/i });
      fireEvent.click(saveAllButton);

      await waitFor(() => {
        expect(saveMock).toHaveBeenCalled();
      });
    });

    it('should show success message after successful save', async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementation((url) => {
        if (url.includes('/save')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true, saved: 1, editIds: ['edit-1'] }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockTopicData,
        });
      });

      render(<TopicReviewTool topicSlug="frases-esenciales-entregas" />);

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /content editor/i })).toBeInTheDocument();
      });

      const textarea = screen.getByRole('textbox', { name: /content editor/i });
      await user.type(textarea, ' edited');

      const saveAllButton = screen.getByRole('button', { name: /save all/i });
      fireEvent.click(saveAllButton);

      await waitFor(() => {
        expect(screen.getByText(/saved 1 resource/i)).toBeInTheDocument();
      });
    });

    it('should call onSave callback after successful save', async () => {
      const onSave = jest.fn();
      const user = userEvent.setup();
      mockFetch.mockImplementation((url) => {
        if (url.includes('/save')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true, saved: 1, editIds: ['edit-1'] }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockTopicData,
        });
      });

      render(<TopicReviewTool topicSlug="frases-esenciales-entregas" onSave={onSave} />);

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /content editor/i })).toBeInTheDocument();
      });

      const textarea = screen.getByRole('textbox', { name: /content editor/i });
      await user.type(textarea, ' edited');

      const saveAllButton = screen.getByRole('button', { name: /save all/i });
      fireEvent.click(saveAllButton);

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Keyboard Shortcuts', () => {
    beforeEach(() => {
      mockFetch.mockImplementation((url) => {
        if (url.includes('/save')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true, saved: 1, editIds: ['edit-1'] }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockTopicData,
        });
      });
    });

    it('should save active resource when Ctrl+S is pressed', async () => {
      const user = userEvent.setup();
      render(<TopicReviewTool topicSlug="frases-esenciales-entregas" />);

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /content editor/i })).toBeInTheDocument();
      });

      const textarea = screen.getByRole('textbox', { name: /content editor/i });
      await user.type(textarea, ' edited');

      // Simulate Ctrl+S
      fireEvent.keyDown(window, { key: 's', ctrlKey: true });

      await waitFor(() => {
        expect(screen.getByText(/saved successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Unsaved Changes Warning', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockTopicData,
      });
    });

    it('should warn before leaving with unsaved changes', async () => {
      const user = userEvent.setup();
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      render(<TopicReviewTool topicSlug="frases-esenciales-entregas" />);

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /content editor/i })).toBeInTheDocument();
      });

      const textarea = screen.getByRole('textbox', { name: /content editor/i });
      await user.type(textarea, ' edited');

      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });
  });
});
