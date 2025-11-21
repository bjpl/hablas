/**
 * Custom Hook for Keyboard Shortcuts
 * Provides accessible keyboard controls for audio player
 */

'use client';

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcutConfig {
  key: string;
  action: () => void;
  description: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

export interface AudioKeyboardShortcuts {
  playPause: () => void;
  skipForward: () => void;
  skipBackward: () => void;
  volumeUp: () => void;
  volumeDown: () => void;
  toggleMute: () => void;
  speedUp: () => void;
  speedDown: () => void;
}

export function useAudioKeyboardShortcuts(
  shortcuts: AudioKeyboardShortcuts,
  enabled: boolean = true
) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (event.key) {
        case ' ':
        case 'k':
          event.preventDefault();
          shortcuts.playPause();
          break;
        case 'ArrowRight':
        case 'l':
          event.preventDefault();
          shortcuts.skipForward();
          break;
        case 'ArrowLeft':
        case 'j':
          event.preventDefault();
          shortcuts.skipBackward();
          break;
        case 'ArrowUp':
          event.preventDefault();
          shortcuts.volumeUp();
          break;
        case 'ArrowDown':
          event.preventDefault();
          shortcuts.volumeDown();
          break;
        case 'm':
          event.preventDefault();
          shortcuts.toggleMute();
          break;
        case '>':
        case '.':
          if (event.shiftKey) {
            event.preventDefault();
            shortcuts.speedUp();
          }
          break;
        case '<':
        case ',':
          if (event.shiftKey) {
            event.preventDefault();
            shortcuts.speedDown();
          }
          break;
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress, enabled]);

  return {
    shortcuts: [
      { key: 'Space / K', description: 'Reproducir/Pausar' },
      { key: 'J / ←', description: 'Retroceder 10 segundos' },
      { key: 'L / →', description: 'Adelantar 10 segundos' },
      { key: '↑', description: 'Subir volumen' },
      { key: '↓', description: 'Bajar volumen' },
      { key: 'M', description: 'Silenciar/Activar sonido' },
      { key: 'Shift + >', description: 'Aumentar velocidad' },
      { key: 'Shift + <', description: 'Disminuir velocidad' },
    ],
  };
}
