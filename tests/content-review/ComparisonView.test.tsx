import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ComparisonView } from '@/components/content-review/ComparisonView';

describe('ComparisonView', () => {
  const defaultProps = {
    title: 'Test Title',
    content: 'This is test content for the comparison view',
  };

  describe('Component Rendering', () => {
    it('should render with title and content', () => {
      render(<ComparisonView {...defaultProps} />);

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('This is test content for the comparison view')).toBeInTheDocument();
    });

    it('should display FileText icon', () => {
      const { container } = render(<ComparisonView {...defaultProps} />);

      // Icon is rendered as SVG
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <ComparisonView {...defaultProps} className="custom-class" />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('Read-only Badge', () => {
    it('should show "Read-only" badge when isOriginal is true', () => {
      render(<ComparisonView {...defaultProps} isOriginal={true} />);

      expect(screen.getByText('Read-only')).toBeInTheDocument();
    });

    it('should not show "Read-only" badge when isOriginal is false', () => {
      render(<ComparisonView {...defaultProps} isOriginal={false} />);

      expect(screen.queryByText('Read-only')).not.toBeInTheDocument();
    });

    it('should not show "Read-only" badge by default', () => {
      render(<ComparisonView {...defaultProps} />);

      expect(screen.queryByText('Read-only')).not.toBeInTheDocument();
    });
  });

  describe('Content Display', () => {
    it('should display content with proper whitespace', () => {
      const multilineContent = 'Line 1\nLine 2\nLine 3';
      render(<ComparisonView title="Test" content={multilineContent} />);

      expect(screen.getByText(multilineContent)).toBeInTheDocument();
    });

    it('should show "No content available" when content is empty', () => {
      render(<ComparisonView title="Test" content="" />);

      expect(screen.getByText('No content available')).toBeInTheDocument();
    });

    it('should handle very long content', () => {
      const longContent = 'a'.repeat(5000);
      render(<ComparisonView title="Test" content={longContent} />);

      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      const specialContent = 'Content with <tags> & symbols @ # $ %';
      render(<ComparisonView title="Test" content={specialContent} />);

      expect(screen.getByText(specialContent)).toBeInTheDocument();
    });
  });

  describe('Character and Word Count', () => {
    it('should display correct character count', () => {
      const content = 'Hello World';
      render(<ComparisonView title="Test" content={content} />);

      expect(screen.getByText(/Characters: 11/)).toBeInTheDocument();
    });

    it('should display correct word count', () => {
      const content = 'This is a test';
      render(<ComparisonView title="Test" content={content} />);

      expect(screen.getByText(/Words: 4/)).toBeInTheDocument();
    });

    it('should show 0 for empty content', () => {
      render(<ComparisonView title="Test" content="" />);

      expect(screen.getByText(/Characters: 0/)).toBeInTheDocument();
      expect(screen.getByText(/Words: 0/)).toBeInTheDocument();
    });

    it('should count words correctly with multiple spaces', () => {
      const content = 'Multiple    spaces    between    words';
      render(<ComparisonView title="Test" content={content} />);

      expect(screen.getByText(/Words: 4/)).toBeInTheDocument();
    });

    it('should handle content with only whitespace', () => {
      const content = '   \n\t  ';
      render(<ComparisonView title="Test" content={content} />);

      expect(screen.getByText(/Words: 0/)).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should have proper minimum height', () => {
      const { container } = render(<ComparisonView {...defaultProps} />);

      const contentDiv = container.querySelector('[style*="minHeight"]');
      expect(contentDiv).toBeInTheDocument();
    });

    it('should have scrollable content area', () => {
      const { container } = render(<ComparisonView {...defaultProps} />);

      const contentDiv = container.querySelector('[style*="overflowY"]');
      expect(contentDiv).toBeInTheDocument();
    });

    it('should apply prose styling to content', () => {
      const { container } = render(<ComparisonView {...defaultProps} />);

      const proseDiv = container.querySelector('.prose');
      expect(proseDiv).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined content gracefully', () => {
      // @ts-expect-error Testing edge case
      render(<ComparisonView title="Test" content={undefined} />);

      expect(screen.getByText('No content available')).toBeInTheDocument();
    });

    it('should handle null title', () => {
      // @ts-expect-error Testing edge case
      render(<ComparisonView title={null} content="test" />);

      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('should render with all props combined', () => {
      render(
        <ComparisonView
          title="Complete Test"
          content="Full content test"
          isOriginal={true}
          className="test-class"
        />
      );

      expect(screen.getByText('Complete Test')).toBeInTheDocument();
      expect(screen.getByText('Full content test')).toBeInTheDocument();
      expect(screen.getByText('Read-only')).toBeInTheDocument();
    });

    it('should handle content with unicode characters', () => {
      const unicodeContent = '你好世界 🌍 مرحبا العالم';
      render(<ComparisonView title="Test" content={unicodeContent} />);

      expect(screen.getByText(unicodeContent)).toBeInTheDocument();
    });

    it('should handle content with newlines and tabs', () => {
      const formattedContent = 'Line 1\n\tIndented Line 2\n\t\tDouble Indented Line 3';
      render(<ComparisonView title="Test" content={formattedContent} />);

      expect(screen.getByText(formattedContent)).toBeInTheDocument();
    });
  });
});
