/**
 * Test Utilities and Helpers
 * Shared functionality for test suites
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Mock data generators
export const generateMockResource = (overrides = {}) => ({
  id: 'test-resource-1',
  title: 'Test Resource',
  type: 'lesson',
  difficulty: 'beginner',
  estimatedTime: '10 mins',
  description: 'Test description',
  content: {
    sections: [
      {
        title: 'Test Section',
        content: 'Test content',
        type: 'text'
      }
    ]
  },
  tags: ['test'],
  ...overrides
});

export const generateMockVocabulary = (overrides = {}) => ({
  spanish: 'Hola',
  english: 'Hello',
  pronunciation: 'OH-lah',
  example: 'Hola, ¿cómo estás?',
  ...overrides
});

// Custom render function with providers
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options });
}

// Accessibility testing utilities
export const checkAccessibility = async (container: HTMLElement) => {
  const { axe, toHaveNoViolations } = await import('jest-axe');
  expect.extend(toHaveNoViolations);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

// Animation testing utilities
export const waitForAnimation = () =>
  new Promise(resolve => setTimeout(resolve, 300));

// Audio testing utilities
export const createMockAudio = () => {
  const mockPlay = jest.fn().mockResolvedValue(undefined);
  const mockPause = jest.fn();

  const mockAudio = {
    play: mockPlay,
    pause: mockPause,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };

  return { mockAudio, mockPlay, mockPause };
};

// File system testing utilities
export const createMockFileSystem = () => {
  const files = new Map<string, string>();

  return {
    readFile: (path: string) => files.get(path),
    writeFile: (path: string, content: string) => files.set(path, content),
    exists: (path: string) => files.has(path),
    clear: () => files.clear(),
  };
};

// Performance testing utilities
export const measurePerformance = async (
  operation: () => void | Promise<void>
) => {
  const startTime = performance.now();
  await operation();
  return performance.now() - startTime;
};

// Memory leak detection
export const detectMemoryLeaks = async (
  operation: () => void,
  iterations = 100
) => {
  const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

  for (let i = 0; i < iterations; i++) {
    operation();
  }

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }

  const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
  const memoryIncrease = finalMemory - initialMemory;

  return {
    initialMemory,
    finalMemory,
    memoryIncrease,
    averageIncrease: memoryIncrease / iterations
  };
};

// Snapshot testing utilities
export const createSnapshot = (component: React.ReactElement) => {
  const { container } = render(component);
  return container.innerHTML;
};

// Export all utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
