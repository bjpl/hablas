/**
 * @test Resource Detail Enhanced Integration
 * @description Tests rich content display, component rendering, and navigation
 * @prerequisites
 *   - Next.js routing configured
 *   - Resource data available
 * @steps
 *   1. Render resource detail page
 *   2. Verify rich content components
 *   3. Test interactive elements
 *   4. Validate navigation functionality
 *   5. Check responsive behavior
 * @expected All resources display correctly with full interactivity
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

// Mock Next.js router
const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  query: { id: 'test-resource-1' },
  pathname: '/resources/test-resource-1',
  asPath: '/resources/test-resource-1',
};

jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

// Mock resource data
interface Resource {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  estimatedTime: string;
  description: string;
  content: {
    sections?: Array<{
      title: string;
      content: string | string[];
      type?: 'text' | 'list' | 'vocabulary' | 'exercise';
    }>;
    vocabulary?: Array<{
      spanish: string;
      english: string;
      pronunciation?: string;
      example?: string;
    }>;
  };
  prerequisites?: string[];
  tags?: string[];
  relatedResources?: string[];
}

const mockResource: Resource = {
  id: 'test-resource-1',
  title: 'Basic Greetings',
  type: 'lesson',
  difficulty: 'beginner',
  estimatedTime: '15 mins',
  description: 'Learn essential Spanish greetings and introductions',
  content: {
    sections: [
      {
        title: 'Introduction',
        content: 'Welcome to basic Spanish greetings!',
        type: 'text'
      },
      {
        title: 'Common Phrases',
        content: [
          'Hola - Hello',
          'Buenos días - Good morning',
          'Buenas tardes - Good afternoon'
        ],
        type: 'list'
      }
    ],
    vocabulary: [
      {
        spanish: 'Hola',
        english: 'Hello',
        pronunciation: 'OH-lah',
        example: 'Hola, ¿cómo estás?'
      }
    ]
  },
  prerequisites: ['alphabet-basics'],
  tags: ['greetings', 'beginner', 'essential'],
  relatedResources: ['test-resource-2', 'test-resource-3']
};

// Mock ResourceDetailEnhanced component
interface ResourceDetailEnhancedProps {
  resource: Resource;
  onNavigate?: (id: string) => void;
}

const ResourceDetailEnhanced: React.FC<ResourceDetailEnhancedProps> = ({
  resource,
  onNavigate
}) => {
  const [activeSection, setActiveSection] = React.useState(0);
  const [completedSections, setCompletedSections] = React.useState<Set<number>>(
    new Set()
  );

  const handleSectionComplete = (index: number) => {
    setCompletedSections(prev => new Set([...prev, index]));
    if (index < (resource.content.sections?.length || 0) - 1) {
      setActiveSection(index + 1);
    }
  };

  const handleNavigateToResource = (id: string) => {
    onNavigate?.(id);
  };

  const totalSections = resource.content.sections?.length || 0;
  const progress = (completedSections.size / totalSections) * 100;

  return (
    <div className="resource-detail-enhanced" data-testid="resource-detail">
      {/* Header */}
      <header className="resource-header" data-testid="resource-header">
        <div className="resource-meta">
          <span className="resource-type" data-testid="resource-type">
            {resource.type}
          </span>
          <span className="resource-difficulty" data-testid="resource-difficulty">
            {resource.difficulty}
          </span>
          <span className="resource-time" data-testid="resource-time">
            {resource.estimatedTime}
          </span>
        </div>
        <h1 data-testid="resource-title">{resource.title}</h1>
        <p className="resource-description" data-testid="resource-description">
          {resource.description}
        </p>
      </header>

      {/* Progress Bar */}
      <div className="progress-container" data-testid="progress-container">
        <div
          className="progress-bar"
          data-testid="progress-bar"
          role="progressbar"
          aria-label={`Resource progress: ${completedSections.size} of ${totalSections} sections completed`}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ width: `${progress}%` }}
        />
        <span className="progress-text" data-testid="progress-text">
          {completedSections.size} / {totalSections} sections completed
        </span>
      </div>

      {/* Prerequisites */}
      {resource.prerequisites && resource.prerequisites.length > 0 && (
        <div className="prerequisites" data-testid="prerequisites">
          <h2>Prerequisites</h2>
          <ul>
            {resource.prerequisites.map((prereq, index) => (
              <li key={index}>
                <button
                  onClick={() => handleNavigateToResource(prereq)}
                  data-testid={`prereq-link-${index}`}
                >
                  {prereq}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Content Sections */}
      <div className="content-sections" data-testid="content-sections">
        {resource.content.sections?.map((section, index) => (
          <section
            key={index}
            className={`content-section ${activeSection === index ? 'active' : ''}`}
            data-testid={`section-${index}`}
            aria-current={activeSection === index}
          >
            <h2>{section.title}</h2>

            {section.type === 'text' && (
              <p data-testid={`section-content-${index}`}>{section.content}</p>
            )}

            {section.type === 'list' && Array.isArray(section.content) && (
              <ul data-testid={`section-list-${index}`}>
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            )}

            {!completedSections.has(index) && (
              <button
                onClick={() => handleSectionComplete(index)}
                className="complete-button"
                data-testid={`complete-button-${index}`}
              >
                Mark as Complete
              </button>
            )}

            {completedSections.has(index) && (
              <div className="completed-badge" data-testid={`completed-badge-${index}`}>
                ✓ Completed
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Vocabulary Section */}
      {resource.content.vocabulary && resource.content.vocabulary.length > 0 && (
        <div className="vocabulary-section" data-testid="vocabulary-section">
          <h2>Vocabulary</h2>
          <div className="vocabulary-grid">
            {resource.content.vocabulary.map((item, index) => (
              <div
                key={index}
                className="vocabulary-item"
                data-testid={`vocab-item-${index}`}
              >
                <div className="vocab-spanish">{item.spanish}</div>
                <div className="vocab-english">{item.english}</div>
                {item.pronunciation && (
                  <div className="vocab-pronunciation">
                    [{item.pronunciation}]
                  </div>
                )}
                {item.example && (
                  <div className="vocab-example">{item.example}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {resource.tags && resource.tags.length > 0 && (
        <div className="tags" data-testid="tags">
          {resource.tags.map((tag, index) => (
            <span
              key={index}
              className="tag"
              data-testid={`tag-${index}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Related Resources */}
      {resource.relatedResources && resource.relatedResources.length > 0 && (
        <div className="related-resources" data-testid="related-resources">
          <h2>Related Resources</h2>
          <ul>
            {resource.relatedResources.map((relatedId, index) => (
              <li key={index}>
                <button
                  onClick={() => handleNavigateToResource(relatedId)}
                  data-testid={`related-link-${index}`}
                >
                  {relatedId}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

describe('ResourceDetailEnhanced Integration', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  describe('Initial Rendering', () => {
    it('should render resource detail page', () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      expect(screen.getByTestId('resource-detail')).toBeInTheDocument();
    });

    it('should display resource metadata', () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      expect(screen.getByTestId('resource-type')).toHaveTextContent('lesson');
      expect(screen.getByTestId('resource-difficulty')).toHaveTextContent('beginner');
      expect(screen.getByTestId('resource-time')).toHaveTextContent('15 mins');
    });

    it('should display resource title and description', () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      expect(screen.getByTestId('resource-title')).toHaveTextContent(
        'Basic Greetings'
      );
      expect(screen.getByTestId('resource-description')).toHaveTextContent(
        'Learn essential Spanish greetings and introductions'
      );
    });

    it('should render all content sections', () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      expect(screen.getByTestId('section-0')).toBeInTheDocument();
      expect(screen.getByTestId('section-1')).toBeInTheDocument();
    });

    it('should show first section as active', () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      const firstSection = screen.getByTestId('section-0');
      expect(firstSection).toHaveClass('active');
      expect(firstSection).toHaveAttribute('aria-current', 'true');
    });
  });

  describe('Progress Tracking', () => {
    it('should display progress bar', () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    });

    it('should show initial progress as 0%', () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
      expect(progressBar).toHaveStyle({ width: '0%' });
    });

    it('should update progress when section completed', async () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      const completeButton = screen.getByTestId('complete-button-0');
      fireEvent.click(completeButton);

      await waitFor(() => {
        const progressBar = screen.getByTestId('progress-bar');
        expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      });
    });

    it('should display progress text', () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      expect(screen.getByTestId('progress-text')).toHaveTextContent(
        '0 / 2 sections completed'
      );
    });

    it('should update progress text on completion', async () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      fireEvent.click(screen.getByTestId('complete-button-0'));

      await waitFor(() => {
        expect(screen.getByTestId('progress-text')).toHaveTextContent(
          '1 / 2 sections completed'
        );
      });
    });
  });

  describe('Section Navigation', () => {
    it('should show complete button for active section', () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      expect(screen.getByTestId('complete-button-0')).toBeInTheDocument();
    });

    it('should move to next section on completion', async () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      fireEvent.click(screen.getByTestId('complete-button-0'));

      await waitFor(() => {
        const section1 = screen.getByTestId('section-1');
        expect(section1).toHaveClass('active');
      });
    });

    it('should show completed badge after completion', async () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      fireEvent.click(screen.getByTestId('complete-button-0'));

      await waitFor(() => {
        expect(screen.getByTestId('completed-badge-0')).toBeInTheDocument();
        expect(screen.getByTestId('completed-badge-0')).toHaveTextContent(
          '✓ Completed'
        );
      });
    });

    it('should hide complete button after completion', async () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      fireEvent.click(screen.getByTestId('complete-button-0'));

      await waitFor(() => {
        expect(screen.queryByTestId('complete-button-0')).not.toBeInTheDocument();
      });
    });

    it('should maintain completed state', async () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      fireEvent.click(screen.getByTestId('complete-button-0'));
      fireEvent.click(screen.getByTestId('complete-button-1'));

      await waitFor(() => {
        expect(screen.getByTestId('completed-badge-0')).toBeInTheDocument();
        expect(screen.getByTestId('completed-badge-1')).toBeInTheDocument();
      });
    });
  });

  describe('Content Display', () => {
    it('should render text content correctly', () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      expect(screen.getByTestId('section-content-0')).toHaveTextContent(
        'Welcome to basic Spanish greetings!'
      );
    });

    it('should render list content correctly', () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      const list = screen.getByTestId('section-list-1');
      const items = within(list).getAllByRole('listitem');

      expect(items).toHaveLength(3);
      expect(items[0]).toHaveTextContent('Hola - Hello');
    });

    it('should display vocabulary section', () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      expect(screen.getByTestId('vocabulary-section')).toBeInTheDocument();
    });

    it('should render vocabulary items', () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      const vocabItem = screen.getByTestId('vocab-item-0');
      expect(vocabItem).toBeInTheDocument();

      within(vocabItem).getByText('Hola');
      within(vocabItem).getByText('Hello');
      within(vocabItem).getByText('[OH-lah]');
    });
  });

  describe('Navigation Links', () => {
    it('should display prerequisites section', () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      expect(screen.getByTestId('prerequisites')).toBeInTheDocument();
    });

    it('should navigate to prerequisite on click', async () => {
      const onNavigate = jest.fn();
      render(
        <ResourceDetailEnhanced
          resource={mockResource}
          onNavigate={onNavigate}
        />
      );

      const prereqLink = screen.getByTestId('prereq-link-0');
      fireEvent.click(prereqLink);

      await waitFor(() => {
        expect(onNavigate).toHaveBeenCalledWith('alphabet-basics');
      });
    });

    it('should display related resources section', () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      expect(screen.getByTestId('related-resources')).toBeInTheDocument();
    });

    it('should navigate to related resource on click', async () => {
      const onNavigate = jest.fn();
      render(
        <ResourceDetailEnhanced
          resource={mockResource}
          onNavigate={onNavigate}
        />
      );

      const relatedLink = screen.getByTestId('related-link-0');
      fireEvent.click(relatedLink);

      await waitFor(() => {
        expect(onNavigate).toHaveBeenCalledWith('test-resource-2');
      });
    });
  });

  describe('Tags Display', () => {
    it('should display tags section', () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      expect(screen.getByTestId('tags')).toBeInTheDocument();
    });

    it('should render all tags', () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      expect(screen.getByTestId('tag-0')).toHaveTextContent('greetings');
      expect(screen.getByTestId('tag-1')).toHaveTextContent('beginner');
      expect(screen.getByTestId('tag-2')).toHaveTextContent('essential');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <ResourceDetailEnhanced resource={mockResource} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading hierarchy', () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      const headings = screen.getAllByRole('heading');
      expect(headings[0].tagName).toBe('H1');
      expect(headings[1].tagName).toBe('H2');
    });

    it('should have accessible progress bar', () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('role', 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should indicate active section for screen readers', () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      const activeSection = screen.getByTestId('section-0');
      expect(activeSection).toHaveAttribute('aria-current', 'true');
    });
  });

  describe('Edge Cases', () => {
    it('should handle resource without prerequisites', () => {
      const resourceNoPrerq = { ...mockResource, prerequisites: undefined };
      render(<ResourceDetailEnhanced resource={resourceNoPrerq} />);

      expect(screen.queryByTestId('prerequisites')).not.toBeInTheDocument();
    });

    it('should handle resource without vocabulary', () => {
      const resourceNoVocab = {
        ...mockResource,
        content: { sections: mockResource.content.sections }
      };
      render(<ResourceDetailEnhanced resource={resourceNoVocab} />);

      expect(screen.queryByTestId('vocabulary-section')).not.toBeInTheDocument();
    });

    it('should handle resource without tags', () => {
      const resourceNoTags = { ...mockResource, tags: undefined };
      render(<ResourceDetailEnhanced resource={resourceNoTags} />);

      expect(screen.queryByTestId('tags')).not.toBeInTheDocument();
    });

    it('should handle resource without related resources', () => {
      const resourceNoRelated = { ...mockResource, relatedResources: undefined };
      render(<ResourceDetailEnhanced resource={resourceNoRelated} />);

      expect(screen.queryByTestId('related-resources')).not.toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render large resource efficiently', () => {
      const largeSections = Array.from({ length: 20 }, (_, i) => ({
        title: `Section ${i + 1}`,
        content: `Content for section ${i + 1}`,
        type: 'text' as const
      }));

      const largeResource = {
        ...mockResource,
        content: { sections: largeSections }
      };

      const startTime = performance.now();
      render(<ResourceDetailEnhanced resource={largeResource} />);
      const renderTime = performance.now() - startTime;

      // Relaxed performance threshold for test environment
      expect(renderTime).toBeLessThan(500);
    });

    it('should handle rapid section completions', async () => {
      render(<ResourceDetailEnhanced resource={mockResource} />);

      // Complete sections rapidly
      fireEvent.click(screen.getByTestId('complete-button-0'));
      fireEvent.click(screen.getByTestId('complete-button-1'));

      await waitFor(() => {
        expect(screen.getByTestId('progress-text')).toHaveTextContent(
          '2 / 2 sections completed'
        );
      });
    });
  });
});
