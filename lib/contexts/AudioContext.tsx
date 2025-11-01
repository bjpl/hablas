'use client';

import { createContext, useContext, useRef, ReactNode } from 'react';

/**
 * AudioContext
 *
 * Manages currently playing audio across the application.
 * Ensures only one audio plays at a time by stopping previous audio.
 * Replaces global variable anti-pattern with proper React context.
 */

interface AudioContextType {
  currentAudio: React.MutableRefObject<HTMLAudioElement | null>;
  setCurrentAudio: (audio: HTMLAudioElement | null) => void;
  stopCurrent: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const currentAudio = useRef<HTMLAudioElement | null>(null);

  const setCurrentAudio = (audio: HTMLAudioElement | null) => {
    // Stop previous audio if it exists and is different
    if (currentAudio.current && currentAudio.current !== audio) {
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0;
    }
    currentAudio.current = audio;
  };

  const stopCurrent = () => {
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0;
      currentAudio.current = null;
    }
  };

  return (
    <AudioContext.Provider value={{ currentAudio, setCurrentAudio, stopCurrent }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within AudioProvider');
  }
  return context;
}
