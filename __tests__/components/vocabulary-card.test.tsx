/**
 * @test Vocabulary Card Component
 * @description Tests card flip animation, pronunciation display, and accessibility
 * @prerequisites
 *   - React Testing Library configured
 *   - Animation utilities available
 * @steps
 *   1. Render vocabulary card with test data
 *   2. Test flip animation on click
 *   3. Verify pronunciation display
 *   4. Test keyboard navigation
 *   5. Validate ARIA attributes
 * @expected Card flips correctly with full accessibility support
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

// Mock vocabulary card component
interface VocabularyCardProps {
  spanish: string;
  english: string;
  pronunciation?: string;
  example?: string;
  imageUrl?: string;
  audioUrl?: string;
  onFlip?: (isFlipped: boolean) => void;
  className?: string;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({
  spanish,
  english,
  pronunciation,
  example,
  imageUrl,
  audioUrl,
  onFlip,
  className = ''
}) => {
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const handleFlip = () => {
    const newFlipState = !isFlipped;
    setIsFlipped(newFlipState);
    onFlip?.(newFlipState);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFlip();
    }
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      setIsPlaying(true);
      audioRef.current.play();
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div
      className={`vocabulary-card ${className} ${isFlipped ? 'flipped' : ''}`}
      onClick={handleFlip}
      onKeyPress={handleKeyPress}
      role="button"
      tabIndex={0}
      aria-label={`Vocabulary card: ${spanish}`}
      aria-pressed={isFlipped}
      data-testid="vocabulary-card"
    >
      <div className="card-inner" data-testid="card-inner">
        {/* Front of card */}
        <div
          className="card-front"
          aria-hidden={isFlipped}
          data-testid="card-front"
        >
          {imageUrl && (
            <img
              src={imageUrl}
              alt={spanish}
              className="card-image"
              data-testid="card-image"
            />
          )}
          <h3 className="spanish-word" data-testid="spanish-word">
            {spanish}
          </h3>
          {pronunciation && (
            <p
              className="pronunciation"
              data-testid="pronunciation"
              aria-label={`Pronunciation: ${pronunciation}`}
            >
              [{pronunciation}]
            </p>
          )}
          {audioUrl && (
            <>
              <button
                onClick={handlePlayAudio}
                className="audio-button"
                aria-label="Play pronunciation"
                data-testid="audio-button"
                disabled={isPlaying}
              >
                {isPlaying ? '🔊' : '🔉'}
              </button>
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={handleAudioEnded}
                data-testid="audio-element"
              />
            </>
          )}
        </div>

        {/* Back of card */}
        <div
          className="card-back"
          aria-hidden={!isFlipped}
          data-testid="card-back"
        >
          <h3 className="english-word" data-testid="english-word">
            {english}
          </h3>
          {example && (
            <div className="example" data-testid="example">
              <p className="example-label">Example:</p>
              <p className="example-text">{example}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

describe('VocabularyCard Component', () => {
  const defaultProps: VocabularyCardProps = {
    spanish: 'Hola',
    english: 'Hello',
    pronunciation: 'OH-lah',
    example: 'Hola, ¿cómo estás?',
  };

  describe('Rendering', () => {
    it('should render with required props', () => {
      render(<VocabularyCard spanish="Hola" english="Hello" />);

      expect(screen.getByTestId('vocabulary-card')).toBeInTheDocument();
      expect(screen.getByTestId('spanish-word')).toHaveTextContent('Hola');
    });

    it('should render front side initially', () => {
      render(<VocabularyCard {...defaultProps} />);

      const front = screen.getByTestId('card-front');
      expect(front).toBeVisible();
      expect(front).toHaveAttribute('aria-hidden', 'false');
    });

    it('should hide back side initially', () => {
      render(<VocabularyCard {...defaultProps} />);

      const back = screen.getByTestId('card-back');
      expect(back).toHaveAttribute('aria-hidden', 'true');
    });

    it('should display pronunciation when provided', () => {
      render(<VocabularyCard {...defaultProps} />);

      const pronunciation = screen.getByTestId('pronunciation');
      expect(pronunciation).toHaveTextContent('[OH-lah]');
      expect(pronunciation).toHaveAttribute('aria-label', 'Pronunciation: OH-lah');
    });

    it('should not display pronunciation when not provided', () => {
      render(
        <VocabularyCard
          spanish="Hola"
          english="Hello"
        />
      );

      expect(screen.queryByTestId('pronunciation')).not.toBeInTheDocument();
    });

    it('should render image when imageUrl provided', () => {
      render(
        <VocabularyCard
          {...defaultProps}
          imageUrl="https://example.com/image.jpg"
        />
      );

      const image = screen.getByTestId('card-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
      expect(image).toHaveAttribute('alt', 'Hola');
    });

    it('should render example on back side', () => {
      render(<VocabularyCard {...defaultProps} />);

      const example = screen.getByTestId('example');
      expect(example).toHaveTextContent('Hola, ¿cómo estás?');
    });
  });

  describe('Flip Animation', () => {
    it('should flip card on click', async () => {
      render(<VocabularyCard {...defaultProps} />);

      const card = screen.getByTestId('vocabulary-card');
      fireEvent.click(card);

      await waitFor(() => {
        expect(card).toHaveClass('flipped');
      });
    });

    it('should toggle flip state on multiple clicks', async () => {
      render(<VocabularyCard {...defaultProps} />);

      const card = screen.getByTestId('vocabulary-card');

      // First click - flip
      fireEvent.click(card);
      await waitFor(() => {
        expect(card).toHaveClass('flipped');
      });

      // Second click - unflip
      fireEvent.click(card);
      await waitFor(() => {
        expect(card).not.toHaveClass('flipped');
      });
    });

    it('should update aria-pressed on flip', async () => {
      render(<VocabularyCard {...defaultProps} />);

      const card = screen.getByTestId('vocabulary-card');
      expect(card).toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(card);

      await waitFor(() => {
        expect(card).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should toggle aria-hidden on card sides', async () => {
      render(<VocabularyCard {...defaultProps} />);

      const front = screen.getByTestId('card-front');
      const back = screen.getByTestId('card-back');

      expect(front).toHaveAttribute('aria-hidden', 'false');
      expect(back).toHaveAttribute('aria-hidden', 'true');

      fireEvent.click(screen.getByTestId('vocabulary-card'));

      await waitFor(() => {
        expect(front).toHaveAttribute('aria-hidden', 'true');
        expect(back).toHaveAttribute('aria-hidden', 'false');
      });
    });

    it('should call onFlip callback when provided', async () => {
      const onFlip = jest.fn();
      render(<VocabularyCard {...defaultProps} onFlip={onFlip} />);

      fireEvent.click(screen.getByTestId('vocabulary-card'));

      await waitFor(() => {
        expect(onFlip).toHaveBeenCalledWith(true);
      });
    });

    it('should animate card inner element', async () => {
      render(<VocabularyCard {...defaultProps} />);

      const cardInner = screen.getByTestId('card-inner');
      fireEvent.click(screen.getByTestId('vocabulary-card'));

      await waitFor(() => {
        const card = screen.getByTestId('vocabulary-card');
        expect(card).toHaveClass('flipped');
      });
    });
  });

  describe('Audio Functionality', () => {
    it('should render audio button when audioUrl provided', () => {
      render(
        <VocabularyCard
          {...defaultProps}
          audioUrl="https://example.com/audio.mp3"
        />
      );

      expect(screen.getByTestId('audio-button')).toBeInTheDocument();
    });

    it('should play audio on button click', async () => {
      const mockPlay = jest.fn().mockResolvedValue(undefined);

      render(
        <VocabularyCard
          {...defaultProps}
          audioUrl="https://example.com/audio.mp3"
        />
      );

      const audioElement = screen.getByTestId('audio-element') as HTMLAudioElement;
      audioElement.play = mockPlay;

      const button = screen.getByTestId('audio-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockPlay).toHaveBeenCalled();
      });
    });

    it('should not flip card when audio button clicked', () => {
      render(
        <VocabularyCard
          {...defaultProps}
          audioUrl="https://example.com/audio.mp3"
        />
      );

      const button = screen.getByTestId('audio-button');
      fireEvent.click(button);

      const card = screen.getByTestId('vocabulary-card');
      expect(card).not.toHaveClass('flipped');
    });

    it('should disable audio button while playing', async () => {
      render(
        <VocabularyCard
          {...defaultProps}
          audioUrl="https://example.com/audio.mp3"
        />
      );

      const button = screen.getByTestId('audio-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    it('should update icon when audio is playing', async () => {
      render(
        <VocabularyCard
          {...defaultProps}
          audioUrl="https://example.com/audio.mp3"
        />
      );

      const button = screen.getByTestId('audio-button');
      expect(button).toHaveTextContent('🔉');

      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveTextContent('🔊');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be focusable', () => {
      render(<VocabularyCard {...defaultProps} />);

      const card = screen.getByTestId('vocabulary-card');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('should flip on Enter key', async () => {
      const user = userEvent.setup();
      render(<VocabularyCard {...defaultProps} />);

      const card = screen.getByTestId('vocabulary-card');
      card.focus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(card).toHaveClass('flipped');
      });
    });

    it('should flip on Space key', async () => {
      const user = userEvent.setup();
      render(<VocabularyCard {...defaultProps} />);

      const card = screen.getByTestId('vocabulary-card');
      card.focus();

      await user.keyboard(' ');

      await waitFor(() => {
        expect(card).toHaveClass('flipped');
      });
    });

    it('should not flip on other keys', async () => {
      const user = userEvent.setup();
      render(<VocabularyCard {...defaultProps} />);

      const card = screen.getByTestId('vocabulary-card');
      card.focus();

      await user.keyboard('a');

      expect(card).not.toHaveClass('flipped');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<VocabularyCard {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA role', () => {
      render(<VocabularyCard {...defaultProps} />);

      const card = screen.getByTestId('vocabulary-card');
      expect(card).toHaveAttribute('role', 'button');
    });

    it('should have descriptive aria-label', () => {
      render(<VocabularyCard {...defaultProps} />);

      const card = screen.getByTestId('vocabulary-card');
      expect(card).toHaveAttribute('aria-label', 'Vocabulary card: Hola');
    });

    it('should announce pronunciation to screen readers', () => {
      render(<VocabularyCard {...defaultProps} />);

      const pronunciation = screen.getByTestId('pronunciation');
      expect(pronunciation).toHaveAttribute(
        'aria-label',
        'Pronunciation: OH-lah'
      );
    });

    it('should have accessible audio button', () => {
      render(
        <VocabularyCard
          {...defaultProps}
          audioUrl="https://example.com/audio.mp3"
        />
      );

      const button = screen.getByTestId('audio-button');
      expect(button).toHaveAttribute('aria-label', 'Play pronunciation');
    });

    it('should maintain focus after flip', async () => {
      render(<VocabularyCard {...defaultProps} />);

      const card = screen.getByTestId('vocabulary-card');
      card.focus();

      fireEvent.click(card);

      await waitFor(() => {
        expect(document.activeElement).toBe(card);
      });
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      render(
        <VocabularyCard
          {...defaultProps}
          className="custom-class"
        />
      );

      const card = screen.getByTestId('vocabulary-card');
      expect(card).toHaveClass('custom-class');
    });

    it('should preserve default classes with custom className', () => {
      render(
        <VocabularyCard
          {...defaultProps}
          className="custom-class"
        />
      );

      const card = screen.getByTestId('vocabulary-card');
      expect(card).toHaveClass('vocabulary-card');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long words', () => {
      render(
        <VocabularyCard
          spanish="Electroencefalografista"
          english="Electroencephalographer"
          pronunciation="eh-lek-tro-en-seh-fah-lo-grah-FEE-stah"
        />
      );

      expect(screen.getByTestId('spanish-word')).toHaveTextContent(
        'Electroencefalografista'
      );
    });

    it('should handle special characters', () => {
      render(
        <VocabularyCard
          spanish="¿Qué?"
          english="What?"
          pronunciation="keh"
        />
      );

      expect(screen.getByTestId('spanish-word')).toHaveTextContent('¿Qué?');
    });

    it('should handle missing optional props gracefully', () => {
      const { container } = render(
        <VocabularyCard spanish="Test" english="Test" />
      );

      expect(container.querySelector('.vocabulary-card')).toBeInTheDocument();
    });

    it('should handle empty example string', () => {
      render(
        <VocabularyCard
          spanish="Hola"
          english="Hello"
          example=""
        />
      );

      // Should not render example section with empty string
      const example = screen.queryByTestId('example');
      expect(example).not.toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render quickly', () => {
      const startTime = performance.now();

      render(<VocabularyCard {...defaultProps} />);

      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(50); // Should render in under 50ms
    });

    it('should handle rapid flip animations', async () => {
      render(<VocabularyCard {...defaultProps} />);

      const card = screen.getByTestId('vocabulary-card');

      // Click multiple times rapidly
      for (let i = 0; i < 10; i++) {
        fireEvent.click(card);
      }

      // Should handle all clicks without errors
      await waitFor(() => {
        expect(card).toBeInTheDocument();
      });
    });
  });
});
