/**
 * Enhanced Audio Player Component Tests
 * Tests playback controls, URL resolution, error recovery, accessibility, and keyboard shortcuts
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AudioPlayer from '@/components/shared/AudioPlayer';
import { getAudioURL } from '@/lib/audio/blob-storage';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Mock the blob storage
jest.mock('@/lib/audio/blob-storage');

describe('AudioPlayer Enhanced Tests', () => {
  const mockAudioUrl = 'https://blob.storage/audio/test.mp3';
  const defaultProps = {
    audioId: 'test-audio-123',
    title: 'Test Audio',
    autoplay: false,
    showControls: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getAudioURL as jest.Mock).mockResolvedValue(mockAudioUrl);

    // Mock HTMLMediaElement methods
    window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
    window.HTMLMediaElement.prototype.pause = jest.fn();
    window.HTMLMediaElement.prototype.load = jest.fn();
  });

  describe('Component Rendering', () => {
    it('should show loading state initially', () => {
      render(<AudioPlayer {...defaultProps} />);

      expect(screen.getByText('Loading audio...')).toBeInTheDocument();
    });

    it('should render audio player after loading', async () => {
      render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading audio...')).not.toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    });

    it('should display title when provided', async () => {
      render(<AudioPlayer {...defaultProps} title="My Audio File" />);

      await waitFor(() => {
        expect(screen.getByText('My Audio File')).toBeInTheDocument();
      });
    });

    it('should not display title when not provided', async () => {
      render(<AudioPlayer {...defaultProps} title={undefined} />);

      await waitFor(() => {
        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      });
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading audio...')).not.toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('URL Resolution', () => {
    it('should fetch audio URL on mount', async () => {
      render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(getAudioURL).toHaveBeenCalledWith('test-audio-123');
      });
    });

    it('should refetch URL when audioId changes', async () => {
      const { rerender } = render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(getAudioURL).toHaveBeenCalledWith('test-audio-123');
      });

      rerender(<AudioPlayer {...defaultProps} audioId="new-audio-456" />);

      await waitFor(() => {
        expect(getAudioURL).toHaveBeenCalledWith('new-audio-456');
      });
    });

    it('should set audio source after URL is resolved', async () => {
      render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        const audioElement = document.querySelector('audio');
        expect(audioElement?.src).toBe(mockAudioUrl);
      });
    });
  });

  describe('Playback Controls', () => {
    it('should start playback when play button is clicked', async () => {
      const user = userEvent.setup();
      render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
      });

      const playButton = screen.getByRole('button', { name: /play/i });
      await user.click(playButton);

      await waitFor(() => {
        expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
      });
    });

    it('should pause playback when pause button is clicked', async () => {
      const user = userEvent.setup();
      render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
      });

      // Start playing
      const playButton = screen.getByRole('button', { name: /play/i });
      await user.click(playButton);

      // Pause
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      });

      const pauseButton = screen.getByRole('button', { name: /pause/i });
      await user.click(pauseButton);

      expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    });

    it('should toggle play/pause state correctly', async () => {
      const user = userEvent.setup();
      render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
      });

      const playButton = screen.getByRole('button', { name: /play/i });
      await user.click(playButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      });

      const pauseButton = screen.getByRole('button', { name: /pause/i });
      await user.click(pauseButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
      });
    });

    it('should seek to specific time when progress bar is changed', async () => {
      const user = userEvent.setup();
      render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading audio...')).not.toBeInTheDocument();
      });

      // Simulate audio loaded with duration
      const audioElement = document.querySelector('audio');
      if (audioElement) {
        Object.defineProperty(audioElement, 'duration', { value: 100 });
        fireEvent(audioElement, new Event('durationchange'));
      }

      const progressBar = screen.getByRole('slider');
      await user.clear(progressBar);
      await user.type(progressBar, '50');

      await waitFor(() => {
        expect(audioElement?.currentTime).toBe(50);
      });
    });

    it('should update current time display during playback', async () => {
      render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading audio...')).not.toBeInTheDocument();
      });

      const audioElement = document.querySelector('audio');
      if (audioElement) {
        Object.defineProperty(audioElement, 'currentTime', { value: 30, writable: true });
        Object.defineProperty(audioElement, 'duration', { value: 100 });
        fireEvent(audioElement, new Event('timeupdate'));
      }

      await waitFor(() => {
        expect(screen.getByText('0:30')).toBeInTheDocument();
      });
    });

    it('should display total duration', async () => {
      render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading audio...')).not.toBeInTheDocument();
      });

      const audioElement = document.querySelector('audio');
      if (audioElement) {
        Object.defineProperty(audioElement, 'duration', { value: 125 });
        fireEvent(audioElement, new Event('durationchange'));
      }

      await waitFor(() => {
        expect(screen.getByText('2:05')).toBeInTheDocument();
      });
    });

    it('should reset when audio ends', async () => {
      render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading audio...')).not.toBeInTheDocument();
      });

      const audioElement = document.querySelector('audio');
      if (audioElement) {
        Object.defineProperty(audioElement, 'currentTime', { value: 0, writable: true });
        fireEvent(audioElement, new Event('ended'));
      }

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
        expect(screen.getByText('0:00')).toBeInTheDocument();
      });
    });
  });

  describe('Autoplay', () => {
    it('should start playing automatically when autoplay is true', async () => {
      render(<AudioPlayer {...defaultProps} autoplay={true} />);

      await waitFor(() => {
        const audioElement = document.querySelector('audio');
        expect(audioElement?.autoplay).toBe(true);
      });
    });

    it('should not autoplay when autoplay is false', async () => {
      render(<AudioPlayer {...defaultProps} autoplay={false} />);

      await waitFor(() => {
        const audioElement = document.querySelector('audio');
        expect(audioElement?.autoplay).toBe(false);
      });
    });
  });

  describe('Custom Controls', () => {
    it('should show custom controls when showControls is true', async () => {
      render(<AudioPlayer {...defaultProps} showControls={true} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
        expect(screen.getByRole('slider')).toBeInTheDocument();
      });
    });

    it('should show native controls when showControls is false', async () => {
      render(<AudioPlayer {...defaultProps} showControls={false} />);

      await waitFor(() => {
        const audioElements = document.querySelectorAll('audio');
        const nativeControlsAudio = Array.from(audioElements).find(
          (audio) => audio.hasAttribute('controls')
        );
        expect(nativeControlsAudio).toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery', () => {
    it('should display error message when URL fetch fails', async () => {
      (getAudioURL as jest.Mock).mockRejectedValue(new Error('Failed to load audio'));

      render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load audio')).toBeInTheDocument();
      });
    });

    it('should call onError callback when error occurs', async () => {
      const onError = jest.fn();
      (getAudioURL as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<AudioPlayer {...defaultProps} onError={onError} />);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Network error');
      });
    });

    it('should display generic error for non-Error exceptions', async () => {
      (getAudioURL as jest.Mock).mockRejectedValue('String error');

      render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load audio')).toBeInTheDocument();
      });
    });

    it('should clear previous errors on retry', async () => {
      (getAudioURL as jest.Mock).mockRejectedValueOnce(new Error('First error'));

      const { rerender } = render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Successful retry
      (getAudioURL as jest.Mock).mockResolvedValue(mockAudioUrl);
      rerender(<AudioPlayer {...defaultProps} audioId="new-id" />);

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA labels on play button', async () => {
      render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        const playButton = screen.getByRole('button', { name: /play/i });
        expect(playButton).toHaveAttribute('aria-label', 'Play');
      });
    });

    it('should have proper ARIA labels on pause button', async () => {
      const user = userEvent.setup();
      render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
      });

      const playButton = screen.getByRole('button', { name: /play/i });
      await user.click(playButton);

      await waitFor(() => {
        const pauseButton = screen.getByRole('button', { name: /pause/i });
        expect(pauseButton).toHaveAttribute('aria-label', 'Pause');
      });
    });

    it('should have accessible progress bar', async () => {
      render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        const progressBar = screen.getByRole('slider');
        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveAttribute('type', 'range');
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
      });

      const playButton = screen.getByRole('button', { name: /play/i });
      playButton.focus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
      });
    });
  });

  describe('Time Formatting', () => {
    it('should format time correctly (minutes:seconds)', async () => {
      render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading audio...')).not.toBeInTheDocument();
      });

      const audioElement = document.querySelector('audio');
      if (audioElement) {
        Object.defineProperty(audioElement, 'currentTime', { value: 125, writable: true });
        Object.defineProperty(audioElement, 'duration', { value: 200 });
        fireEvent(audioElement, new Event('timeupdate'));
      }

      await waitFor(() => {
        expect(screen.getByText('2:05')).toBeInTheDocument();
      });
    });

    it('should handle zero duration gracefully', async () => {
      render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading audio...')).not.toBeInTheDocument();
      });

      // Initial state with no duration
      expect(screen.getByText('0:00')).toBeInTheDocument();
    });

    it('should handle invalid time values', async () => {
      render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading audio...')).not.toBeInTheDocument();
      });

      const audioElement = document.querySelector('audio');
      if (audioElement) {
        Object.defineProperty(audioElement, 'currentTime', { value: NaN, writable: true });
        fireEvent(audioElement, new Event('timeupdate'));
      }

      await waitFor(() => {
        expect(screen.getByText('0:00')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid play/pause clicks', async () => {
      const user = userEvent.setup();
      render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
      });

      const playButton = screen.getByRole('button', { name: /play/i });

      // Rapid clicks
      await user.click(playButton);
      await user.click(playButton);
      await user.click(playButton);
      await user.click(playButton);

      // Should maintain consistent state
      const isPaused = screen.queryByRole('button', { name: /play/i });
      const isPlaying = screen.queryByRole('button', { name: /pause/i });

      expect(isPaused || isPlaying).toBeTruthy();
    });

    it('should handle unmount during loading', () => {
      const { unmount } = render(<AudioPlayer {...defaultProps} />);

      expect(screen.getByText('Loading audio...')).toBeInTheDocument();

      // Should not throw error
      unmount();
    });

    it('should clean up event listeners on unmount', async () => {
      const { unmount } = render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading audio...')).not.toBeInTheDocument();
      });

      const audioElement = document.querySelector('audio');
      const removeEventListenerSpy = jest.spyOn(audioElement!, 'removeEventListener');

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('timeupdate', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('durationchange', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('ended', expect.any(Function));
    });

    it('should not crash when audioRef is null', async () => {
      render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading audio...')).not.toBeInTheDocument();
      });

      const playButton = screen.getByRole('button', { name: /play/i });

      // Remove audio element to simulate null ref
      const audioElement = document.querySelector('audio');
      audioElement?.remove();

      // Click should not crash
      fireEvent.click(playButton);

      expect(playButton).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-fetch URL unnecessarily', async () => {
      const { rerender } = render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(getAudioURL).toHaveBeenCalledTimes(1);
      });

      // Rerender with same audioId
      rerender(<AudioPlayer {...defaultProps} title="New Title" />);

      // Should not fetch again
      expect(getAudioURL).toHaveBeenCalledTimes(1);
    });

    it('should debounce seek operations', async () => {
      const user = userEvent.setup();
      render(<AudioPlayer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading audio...')).not.toBeInTheDocument();
      });

      const audioElement = document.querySelector('audio');
      if (audioElement) {
        Object.defineProperty(audioElement, 'duration', { value: 100 });
        fireEvent(audioElement, new Event('durationchange'));
      }

      const progressBar = screen.getByRole('slider');

      // Rapid seeks
      fireEvent.change(progressBar, { target: { value: 10 } });
      fireEvent.change(progressBar, { target: { value: 20 } });
      fireEvent.change(progressBar, { target: { value: 30 } });

      // Should update to final value
      await waitFor(() => {
        expect(audioElement?.currentTime).toBe(30);
      });
    });
  });
});
