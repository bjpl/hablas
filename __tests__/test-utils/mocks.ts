/**
 * Test Utilities and Mocks
 * Centralized mocks for external APIs and common test utilities
 */

import { AudioMetadata } from '@/lib/audio/blob-storage';

/**
 * Mock Audio Metadata Factory
 */
export function createMockAudioMetadata(overrides?: Partial<AudioMetadata>): AudioMetadata {
  return {
    url: 'https://blob.storage/audio/test.mp3',
    pathname: 'audio/test.mp3',
    contentType: 'audio/mpeg',
    size: 1024,
    uploadedAt: new Date('2025-01-01T00:00:00Z'),
    ...overrides,
  };
}

/**
 * Mock File Factory
 */
export function createMockFile(
  content: string = 'test content',
  filename: string = 'test.mp3',
  options?: FilePropertyBag
): File {
  return new File([content], filename, {
    type: 'audio/mpeg',
    ...options,
  });
}

/**
 * Mock Fetch Response
 */
export function createMockResponse<T>(
  data: T,
  options?: { ok?: boolean; status?: number }
): Promise<Response> {
  return Promise.resolve({
    ok: options?.ok ?? true,
    status: options?.status ?? 200,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
    redirected: false,
    statusText: 'OK',
    type: 'basic',
    url: '',
    clone: function () {
      return this;
    },
    body: null,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
  } as Response);
}

/**
 * Mock Blob Storage Functions
 */
export const mockBlobStorage = {
  put: jest.fn(),
  del: jest.fn(),
  head: jest.fn(),
  list: jest.fn(),
};

/**
 * Mock Audio Element
 */
export class MockAudioElement {
  src: string = '';
  currentTime: number = 0;
  duration: number = 0;
  paused: boolean = true;
  volume: number = 1;
  muted: boolean = false;
  playbackRate: number = 1;
  autoplay: boolean = false;
  loop: boolean = false;
  preload: string = 'auto';

  private listeners: Map<string, Set<EventListener>> = new Map();

  play = jest.fn(async () => {
    this.paused = false;
    this.dispatchEvent(new Event('play'));
  });

  pause = jest.fn(() => {
    this.paused = true;
    this.dispatchEvent(new Event('pause'));
  });

  load = jest.fn(() => {
    this.dispatchEvent(new Event('loadstart'));
  });

  addEventListener(event: string, listener: EventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  removeEventListener(event: string, listener: EventListener) {
    this.listeners.get(event)?.delete(listener);
  }

  dispatchEvent(event: Event): boolean {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => listener(event));
    }
    return true;
  }

  simulateTimeUpdate(time: number) {
    this.currentTime = time;
    this.dispatchEvent(new Event('timeupdate'));
  }

  simulateDurationChange(duration: number) {
    this.duration = duration;
    this.dispatchEvent(new Event('durationchange'));
  }

  simulateEnd() {
    this.currentTime = 0;
    this.paused = true;
    this.dispatchEvent(new Event('ended'));
  }

  simulateError(message: string = 'Error') {
    const error = new Event('error');
    (error as any).message = message;
    this.dispatchEvent(error);
  }
}

/**
 * Setup Audio Element Mock
 */
export function setupAudioMock(): MockAudioElement {
  const mockAudio = new MockAudioElement();

  // Override HTMLMediaElement prototype
  Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
    value: mockAudio.play,
    writable: true,
  });

  Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
    value: mockAudio.pause,
    writable: true,
  });

  Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
    value: mockAudio.load,
    writable: true,
  });

  return mockAudio;
}

/**
 * Mock Triple Comparison Content
 */
export function createMockTripleContent() {
  return {
    downloadable: 'Downloadable PDF content here...',
    web: 'Web content here...',
    audio: 'Audio transcript here...',
  };
}

/**
 * Mock Content Update Event
 */
export function createMockContentUpdate(
  type: 'downloadable' | 'web' | 'audio',
  content: string
) {
  return {
    type,
    content,
    timestamp: new Date(),
  };
}

/**
 * Wait for async updates
 */
export async function waitForNextUpdate(timeout: number = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

/**
 * Mock localStorage
 */
export class MockStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

/**
 * Setup localStorage mock
 */
export function setupLocalStorageMock(): MockStorage {
  const mockStorage = new MockStorage();
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
  });
  return mockStorage;
}

/**
 * Mock Console Methods (for testing error logging)
 */
export function mockConsole() {
  const originalConsole = { ...console };

  const mocks = {
    log: jest.spyOn(console, 'log').mockImplementation(),
    error: jest.spyOn(console, 'error').mockImplementation(),
    warn: jest.spyOn(console, 'warn').mockImplementation(),
    info: jest.spyOn(console, 'info').mockImplementation(),
  };

  return {
    mocks,
    restore: () => {
      Object.keys(mocks).forEach((key) => {
        mocks[key as keyof typeof mocks].mockRestore();
      });
    },
  };
}

/**
 * Create Mock IntersectionObserver
 */
export class MockIntersectionObserver {
  constructor(
    private callback: IntersectionObserverCallback,
    private options?: IntersectionObserverInit
  ) {}

  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();

  takeRecords = jest.fn(() => []);

  trigger(entries: Partial<IntersectionObserverEntry>[]) {
    this.callback(
      entries as IntersectionObserverEntry[],
      this as unknown as IntersectionObserver
    );
  }
}

/**
 * Setup IntersectionObserver mock
 */
export function setupIntersectionObserverMock(): typeof MockIntersectionObserver {
  window.IntersectionObserver = MockIntersectionObserver as any;
  return MockIntersectionObserver;
}

/**
 * Mock matchMedia
 */
export function setupMatchMediaMock(matches: boolean = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

/**
 * Mock ResizeObserver
 */
export class MockResizeObserver {
  constructor(private callback: ResizeObserverCallback) {}

  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();

  trigger(entries: Partial<ResizeObserverEntry>[]) {
    this.callback(entries as ResizeObserverEntry[], this as unknown as ResizeObserver);
  }
}

/**
 * Setup ResizeObserver mock
 */
export function setupResizeObserverMock() {
  window.ResizeObserver = MockResizeObserver as any;
  return MockResizeObserver;
}

/**
 * Retry utility for flaky tests
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 100
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryAsync(fn, retries - 1, delay);
  }
}

/**
 * Mock AbortController for timeout tests
 */
export function createMockAbortController() {
  const controller = new AbortController();
  const abortSpy = jest.spyOn(controller, 'abort');
  return { controller, abortSpy };
}
