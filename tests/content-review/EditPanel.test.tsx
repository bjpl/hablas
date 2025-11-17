import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { EditPanel } from '@/components/content-review/EditPanel';

describe('EditPanel', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the edit panel', () => {
      render(<EditPanel content="Test content" onChange={mockOnChange} />);

      expect(screen.getByText('Edit Content')).toBeInTheDocument();
      expect(screen.getByLabelText('Content editor')).toBeInTheDocument();
    });

    it('should display initial content in textarea', () => {
      const content = 'Initial test content';
      render(<EditPanel content={content} onChange={mockOnChange} />);

      const textarea = screen.getByLabelText('Content editor');
      expect(textarea).toHaveValue(content);
    });

    it('should apply custom className', () => {
      const { container } = render(
        <EditPanel content="test" onChange={mockOnChange} className="custom-class" />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should display Edit icon', () => {
      const { container } = render(<EditPanel content="test" onChange={mockOnChange} />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when user types', async () => {
      const user = userEvent.setup();
      render(<EditPanel content="" onChange={mockOnChange} />);

      const textarea = screen.getByLabelText('Content editor');
      await user.type(textarea, 'New text');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });

    it('should update textarea value when content prop changes', () => {
      const { rerender } = render(<EditPanel content="Initial" onChange={mockOnChange} />);

      let textarea = screen.getByLabelText('Content editor');
      expect(textarea).toHaveValue('Initial');

      rerender(<EditPanel content="Updated" onChange={mockOnChange} />);

      textarea = screen.getByLabelText('Content editor');
      expect(textarea).toHaveValue('Updated');
    });

    it('should handle rapid typing', async () => {
      const user = userEvent.setup({ delay: null });
      render(<EditPanel content="" onChange={mockOnChange} />);

      const textarea = screen.getByLabelText('Content editor');
      await user.type(textarea, 'Quick typing test');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should handle clearing content', async () => {
      const user = userEvent.setup();
      render(<EditPanel content="Initial content" onChange={mockOnChange} />);

      const textarea = screen.getByLabelText('Content editor');
      await user.clear(textarea);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
          target: expect.objectContaining({ value: '' })
        }));
      });
    });

    it('should allow pasting content', async () => {
      const user = userEvent.setup();
      render(<EditPanel content="" onChange={mockOnChange} />);

      const textarea = screen.getByLabelText('Content editor');
      await user.click(textarea);
      await user.paste('Pasted content');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });
  });

  describe('Dirty State Indicator', () => {
    it('should show "Unsaved changes" badge when isDirty is true', () => {
      render(<EditPanel content="test" onChange={mockOnChange} isDirty={true} />);

      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    });

    it('should not show badge when isDirty is false', () => {
      render(<EditPanel content="test" onChange={mockOnChange} isDirty={false} />);

      expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument();
    });

    it('should show "Auto-saving..." in footer when dirty', () => {
      render(<EditPanel content="test" onChange={mockOnChange} isDirty={true} />);

      expect(screen.getByText('Auto-saving...')).toBeInTheDocument();
    });

    it('should not show auto-saving text when not dirty', () => {
      render(<EditPanel content="test" onChange={mockOnChange} isDirty={false} />);

      expect(screen.queryByText('Auto-saving...')).not.toBeInTheDocument();
    });
  });

  describe('Character and Word Count', () => {
    it('should display correct character count', () => {
      const content = 'Hello World';
      render(<EditPanel content={content} onChange={mockOnChange} />);

      expect(screen.getByText(/Characters: 11/)).toBeInTheDocument();
    });

    it('should display correct word count', () => {
      const content = 'This is a test';
      render(<EditPanel content={content} onChange={mockOnChange} />);

      expect(screen.getByText(/Words: 4/)).toBeInTheDocument();
    });

    it('should update counts when content changes', () => {
      const { rerender } = render(<EditPanel content="Short" onChange={mockOnChange} />);

      expect(screen.getByText(/Characters: 5/)).toBeInTheDocument();
      expect(screen.getByText(/Words: 1/)).toBeInTheDocument();

      rerender(<EditPanel content="Much longer content" onChange={mockOnChange} />);

      expect(screen.getByText(/Characters: 19/)).toBeInTheDocument();
      expect(screen.getByText(/Words: 3/)).toBeInTheDocument();
    });

    it('should show 0 for empty content', () => {
      render(<EditPanel content="" onChange={mockOnChange} />);

      expect(screen.getByText(/Characters: 0/)).toBeInTheDocument();
      expect(screen.getByText(/Words: 0/)).toBeInTheDocument();
    });

    it('should handle content with multiple spaces correctly', () => {
      const content = 'Word1    Word2    Word3';
      render(<EditPanel content={content} onChange={mockOnChange} />);

      expect(screen.getByText(/Words: 3/)).toBeInTheDocument();
    });
  });

  describe('Textarea Auto-resize', () => {
    it('should have minimum height', () => {
      const { container } = render(<EditPanel content="test" onChange={mockOnChange} />);

      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveStyle({ minHeight: '400px' });
    });

    it('should have maximum height', () => {
      const { container } = render(<EditPanel content="test" onChange={mockOnChange} />);

      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveStyle({ maxHeight: '600px' });
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label', () => {
      render(<EditPanel content="test" onChange={mockOnChange} />);

      const textarea = screen.getByLabelText('Content editor');
      expect(textarea).toBeInTheDocument();
    });

    it('should have placeholder text', () => {
      render(<EditPanel content="" onChange={mockOnChange} />);

      const textarea = screen.getByPlaceholderText('Enter your content here...');
      expect(textarea).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<EditPanel content="" onChange={mockOnChange} />);

      const textarea = screen.getByLabelText('Content editor');

      await user.tab();
      expect(textarea).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long content', () => {
      const longContent = 'a'.repeat(10000);
      render(<EditPanel content={longContent} onChange={mockOnChange} />);

      const textarea = screen.getByLabelText('Content editor');
      expect(textarea).toHaveValue(longContent);
      expect(screen.getByText(/Characters: 10000/)).toBeInTheDocument();
    });

    it('should handle special characters', async () => {
      const user = userEvent.setup();
      render(<EditPanel content="" onChange={mockOnChange} />);

      const textarea = screen.getByLabelText('Content editor');
      await user.type(textarea, '<script>alert("test")</script>');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });

    it('should handle unicode characters', async () => {
      const user = userEvent.setup();
      render(<EditPanel content="" onChange={mockOnChange} />);

      const textarea = screen.getByLabelText('Content editor');
      await user.type(textarea, '你好 🌍 مرحبا');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });

    it('should handle line breaks', () => {
      const content = 'Line 1\nLine 2\nLine 3';
      render(<EditPanel content={content} onChange={mockOnChange} />);

      const textarea = screen.getByLabelText('Content editor');
      expect(textarea).toHaveValue(content);
    });

    it('should handle tabs and special whitespace', () => {
      const content = 'Text\twith\ttabs\nAnd\nnewlines';
      render(<EditPanel content={content} onChange={mockOnChange} />);

      const textarea = screen.getByLabelText('Content editor');
      expect(textarea).toHaveValue(content);
    });

    it('should maintain content when isDirty changes', () => {
      const content = 'Test content';
      const { rerender } = render(
        <EditPanel content={content} onChange={mockOnChange} isDirty={false} />
      );

      rerender(<EditPanel content={content} onChange={mockOnChange} isDirty={true} />);

      const textarea = screen.getByLabelText('Content editor');
      expect(textarea).toHaveValue(content);
    });
  });
});
