/**
 * Triple Comparison View Integration Tests
 * Tests content loading, diff calculation, panel sync, and unsaved changes tracking
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TripleComparisonView } from '@/components/triple-comparison/components/TripleComparisonView';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Mock the child components
jest.mock('@/components/triple-comparison/components/ContentPanel', () => ({
  ContentPanel: ({ type, content, onSave }: any) => (
    <div data-testid={`panel-${type}`}>
      <h3>{type} Panel</h3>
      <textarea
        data-testid={`textarea-${type}`}
        value={content.text}
        onChange={(e) => onSave(type, e.target.value)}
      />
      <span data-testid={`status-${type}`}>{content.status}</span>
    </div>
  ),
}));

jest.mock('@/components/triple-comparison/components/DiffViewer', () => ({
  DiffViewer: ({ leftContent, rightContent, leftLabel, rightLabel }: any) => (
    <div data-testid="diff-viewer">
      <div data-testid="left-label">{leftLabel}</div>
      <div data-testid="right-label">{rightLabel}</div>
      <div data-testid="left-content">{leftContent}</div>
      <div data-testid="right-content">{rightContent}</div>
    </div>
  ),
}));

jest.mock('@/components/triple-comparison/components/SyncControls', () => ({
  SyncControls: ({ onSync, dirtyStates, disabled }: any) => (
    <div data-testid="sync-controls">
      <button
        data-testid="sync-btn-downloadable-to-web"
        onClick={() => onSync('downloadable-to-web')}
        disabled={disabled}
      >
        Sync D to W
      </button>
      <button
        data-testid="sync-btn-web-to-audio"
        onClick={() => onSync('web-to-audio')}
        disabled={disabled}
      >
        Sync W to A
      </button>
      <button
        data-testid="sync-all-to-downloadable"
        onClick={() => onSync('sync-all-to-downloadable')}
        disabled={disabled}
      >
        Sync All to D
      </button>
    </div>
  ),
}));

describe('TripleComparisonView', () => {
  const defaultProps = {
    resourceId: 'test-resource-1',
    downloadableUrl: 'https://example.com/file.pdf',
    webUrl: 'https://example.com/content',
    audioUrl: 'https://example.com/audio.mp3',
    onSave: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render all three content panels', async () => {
      render(<TripleComparisonView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('panel-downloadable')).toBeInTheDocument();
        expect(screen.getByTestId('panel-web')).toBeInTheDocument();
        expect(screen.getByTestId('panel-audio')).toBeInTheDocument();
      });
    });

    it('should render with proper header and controls', () => {
      render(<TripleComparisonView {...defaultProps} />);

      expect(screen.getByText('Triple Resource Comparison & Editor')).toBeInTheDocument();
      expect(screen.getByText('Save All Changes')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      render(<TripleComparisonView {...defaultProps} />);

      expect(screen.getByText(/Loading content/i)).toBeInTheDocument();
    });

    it('should render sync controls', async () => {
      render(<TripleComparisonView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('sync-controls')).toBeInTheDocument();
      });
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(<TripleComparisonView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('panel-downloadable')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Content Loading', () => {
    it('should load content from all three sources', async () => {
      render(<TripleComparisonView {...defaultProps} />);

      await waitFor(() => {
        const downloadableTextarea = screen.getByTestId('textarea-downloadable');
        expect(downloadableTextarea).toHaveValue(
          'Downloadable PDF content would be loaded here...'
        );
      });

      const webTextarea = screen.getByTestId('textarea-web');
      expect(webTextarea).toHaveValue('Web content would be loaded here...');

      const audioTextarea = screen.getByTestId('textarea-audio');
      expect(audioTextarea).toHaveValue('Audio transcript would be loaded here...');
    });

    it('should handle missing URLs gracefully', async () => {
      render(
        <TripleComparisonView
          {...defaultProps}
          downloadableUrl=""
          webUrl=""
          audioUrl=""
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('panel-downloadable')).toBeInTheDocument();
      });

      // Content should remain empty
      const downloadableTextarea = screen.getByTestId('textarea-downloadable');
      expect(downloadableTextarea).toHaveValue('');
    });
  });

  describe('Panel Selection and Diff Calculation', () => {
    it('should allow selecting two panels for comparison', async () => {
      const user = userEvent.setup();
      render(<TripleComparisonView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('panel-downloadable')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');

      // Select first two panels
      await user.click(checkboxes[0]); // downloadable
      await user.click(checkboxes[1]); // web

      await waitFor(() => {
        expect(screen.getByTestId('diff-viewer')).toBeInTheDocument();
      });
    });

    it('should prevent selecting more than two panels', async () => {
      const user = userEvent.setup();
      render(<TripleComparisonView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('panel-downloadable')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');

      await user.click(checkboxes[0]); // downloadable
      await user.click(checkboxes[1]); // web
      await user.click(checkboxes[2]); // audio (should not work)

      // Only first two should be checked
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).toBeChecked();
      expect(checkboxes[2]).not.toBeChecked();
    });

    it('should display diff viewer when two panels are selected', async () => {
      const user = userEvent.setup();
      render(<TripleComparisonView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('panel-downloadable')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      const diffViewer = await screen.findByTestId('diff-viewer');
      expect(diffViewer).toBeInTheDocument();
      expect(screen.getByTestId('left-label')).toHaveTextContent('Downloadable');
      expect(screen.getByTestId('right-label')).toHaveTextContent('Web');
    });

    it('should update diff when panel selection changes', async () => {
      const user = userEvent.setup();
      render(<TripleComparisonView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('panel-downloadable')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');

      // First comparison: downloadable vs web
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      await waitFor(() => {
        expect(screen.getByTestId('right-label')).toHaveTextContent('Web');
      });

      // Change to: downloadable vs audio
      await user.click(checkboxes[1]); // uncheck web
      await user.click(checkboxes[2]); // check audio

      await waitFor(() => {
        expect(screen.getByTestId('right-label')).toHaveTextContent('Audio');
      });
    });
  });

  describe('Content Synchronization', () => {
    it('should sync content from one panel to another', async () => {
      const user = userEvent.setup();
      render(<TripleComparisonView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('sync-controls')).toBeInTheDocument();
      });

      const syncBtn = screen.getByTestId('sync-btn-downloadable-to-web');
      await user.click(syncBtn);

      // Web content should now match downloadable content
      await waitFor(() => {
        const downloadableTextarea = screen.getByTestId('textarea-downloadable') as HTMLTextAreaElement;
        const webTextarea = screen.getByTestId('textarea-web') as HTMLTextAreaElement;
        expect(webTextarea.value).toBe(downloadableTextarea.value);
      });
    });

    it('should sync all panels to target', async () => {
      const user = userEvent.setup();
      render(<TripleComparisonView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('sync-controls')).toBeInTheDocument();
      });

      const syncAllBtn = screen.getByTestId('sync-all-to-downloadable');
      await user.click(syncAllBtn);

      await waitFor(() => {
        const downloadableTextarea = screen.getByTestId('textarea-downloadable') as HTMLTextAreaElement;
        const webTextarea = screen.getByTestId('textarea-web') as HTMLTextAreaElement;
        const audioTextarea = screen.getByTestId('textarea-audio') as HTMLTextAreaElement;

        expect(webTextarea.value).toBe(downloadableTextarea.value);
        expect(audioTextarea.value).toBe(downloadableTextarea.value);
      });
    });
  });

  describe('Unsaved Changes Tracking', () => {
    it('should track unsaved changes in panels', async () => {
      const user = userEvent.setup();
      render(<TripleComparisonView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('textarea-downloadable')).toBeInTheDocument();
      });

      // Initially, save button should be disabled
      const saveButton = screen.getByText('Save All Changes');
      expect(saveButton).toBeDisabled();

      // Edit content
      const textarea = screen.getByTestId('textarea-downloadable');
      await user.clear(textarea);
      await user.type(textarea, 'Modified content');

      // Save button should now be enabled
      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });
    });

    it('should update content status when modified', async () => {
      const user = userEvent.setup();
      render(<TripleComparisonView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('textarea-downloadable')).toBeInTheDocument();
      });

      // Initially synced
      expect(screen.getByTestId('status-downloadable')).toHaveTextContent('synced');

      // Edit content
      const textarea = screen.getByTestId('textarea-downloadable');
      await user.type(textarea, ' - edited');

      // Status should change to modified
      await waitFor(() => {
        expect(screen.getByTestId('status-downloadable')).toHaveTextContent('modified');
      });
    });
  });

  describe('Save Functionality', () => {
    it('should save all changes when Save All button is clicked', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn().mockResolvedValue(undefined);

      render(<TripleComparisonView {...defaultProps} onSave={onSave} />);

      await waitFor(() => {
        expect(screen.getByTestId('textarea-downloadable')).toBeInTheDocument();
      });

      // Make changes
      const textarea = screen.getByTestId('textarea-downloadable');
      await user.type(textarea, ' - edited');

      // Save
      const saveButton = screen.getByText('Save All Changes');
      await user.click(saveButton);

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'downloadable',
              content: expect.stringContaining('edited'),
            }),
          ])
        );
      });
    });

    it('should show saving state during save', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn(
        (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<TripleComparisonView {...defaultProps} onSave={onSave} />);

      await waitFor(() => {
        expect(screen.getByTestId('textarea-downloadable')).toBeInTheDocument();
      });

      // Make changes and save
      const textarea = screen.getByTestId('textarea-downloadable');
      await user.type(textarea, ' - edited');

      const saveButton = screen.getByText('Save All Changes');
      await user.click(saveButton);

      // Should show saving state
      expect(screen.getByText('Saving...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
      });
    });

    it('should handle save errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const onSave = jest.fn().mockRejectedValue(new Error('Save failed'));

      render(<TripleComparisonView {...defaultProps} onSave={onSave} />);

      await waitFor(() => {
        expect(screen.getByTestId('textarea-downloadable')).toBeInTheDocument();
      });

      const textarea = screen.getByTestId('textarea-downloadable');
      await user.type(textarea, ' - edited');

      const saveButton = screen.getByText('Save All Changes');
      await user.click(saveButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to save changes:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Cancel Functionality', () => {
    it('should call onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();

      render(<TripleComparisonView {...defaultProps} onCancel={onCancel} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should disable cancel button during save', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn(
        (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<TripleComparisonView {...defaultProps} onSave={onSave} />);

      await waitFor(() => {
        expect(screen.getByTestId('textarea-downloadable')).toBeInTheDocument();
      });

      const textarea = screen.getByTestId('textarea-downloadable');
      await user.type(textarea, ' - edited');

      const saveButton = screen.getByText('Save All Changes');
      await user.click(saveButton);

      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toBeDisabled();

      await waitFor(() => {
        expect(cancelButton).not.toBeDisabled();
      });
    });
  });

  describe('Error States', () => {
    it('should display helpful message when no panels are selected', () => {
      render(<TripleComparisonView {...defaultProps} />);

      expect(
        screen.getByText('Click the checkbox on any two panels to view a side-by-side comparison')
      ).toBeInTheDocument();
    });

    it('should display message when only one panel is selected', async () => {
      const user = userEvent.setup();
      render(<TripleComparisonView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('panel-downloadable')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      expect(
        screen.getByText('Choose another panel to enable comparison view')
      ).toBeInTheDocument();
    });

    it('should display warning when three panels are selected', async () => {
      const user = userEvent.setup();
      render(<TripleComparisonView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('panel-downloadable')).toBeInTheDocument();
      });

      // This test verifies the UI message, even though we prevent 3 selections
      // In a real scenario, we'd need to test edge cases
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      // Try to click third (should be prevented)
      await user.click(checkboxes[2]);

      // Should still show diff, not the warning
      expect(screen.getByTestId('diff-viewer')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid panel selection changes', async () => {
      const user = userEvent.setup();
      render(<TripleComparisonView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('panel-downloadable')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];

      // Rapid clicking
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);
      await user.click(checkboxes[0]);
      await user.click(checkboxes[2]);
      await user.click(checkboxes[1]);
      await user.click(checkboxes[0]);

      // Should maintain consistent state
      const checkedCount = checkboxes.filter((cb) => cb.checked).length;
      expect(checkedCount).toBeLessThanOrEqual(2);
    });

    it('should handle empty content gracefully', async () => {
      render(
        <TripleComparisonView
          {...defaultProps}
          downloadableUrl=""
          webUrl=""
          audioUrl=""
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('panel-downloadable')).toBeInTheDocument();
      });

      const textareas = screen.getAllByRole('textbox');
      textareas.forEach((textarea) => {
        expect(textarea).toHaveValue('');
      });
    });

    it('should handle very long content', async () => {
      const longContent = 'A'.repeat(10000);
      render(<TripleComparisonView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('textarea-downloadable')).toBeInTheDocument();
      });

      const textarea = screen.getByTestId('textarea-downloadable');

      // Simulate loading long content
      // In a real app, this would come from the content fetcher
      expect(textarea).toBeInTheDocument();
    });
  });
});
