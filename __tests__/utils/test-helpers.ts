/**
 * Test Utilities and Helpers
 *
 * Common utilities for testing across the Hablas project
 */

import { Resource } from '@/data/resources'

/**
 * Mock Resource Factory
 */
export function createMockResource(overrides?: Partial<Resource>): Resource {
  return {
    id: 999,
    title: 'Test Resource',
    description: 'A test resource for unit testing',
    type: 'pdf',
    category: 'repartidor',
    level: 'basico',
    tags: ['test', 'mock'],
    size: '1.2 MB',
    downloadUrl: '/test-resource.pdf',
    offline: false,
    ...overrides
  }
}

/**
 * Mock Headers Helper
 */
export function createMockHeaders(headers: Record<string, string> = {}): Headers {
  const mockHeaders = new Headers()
  Object.entries(headers).forEach(([key, value]) => {
    mockHeaders.set(key, value)
  })
  return mockHeaders
}

/**
 * Mock NextRequest Helper
 */
export function createMockRequest(
  url: string = 'http://localhost:3000/api/test',
  options: {
    method?: string
    headers?: Record<string, string>
    body?: any
  } = {}
): any {
  const headers = createMockHeaders(options.headers)

  return {
    url,
    method: options.method || 'GET',
    headers,
    json: async () => options.body || {},
    text: async () => JSON.stringify(options.body || {}),
    clone: function() { return this },
  }
}

/**
 * Wait for async operations
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Mock Analytics Event Factory
 */
export function createMockAnalyticsEvent(overrides?: any) {
  return {
    event: 'resource_view',
    resourceId: 'test-resource-1',
    category: 'repartidor',
    level: 'basico',
    timestamp: new Date().toISOString(),
    ...overrides
  }
}

/**
 * Mock Session for NextAuth
 */
export function createMockSession(overrides?: any) {
  return {
    user: {
      email: 'admin@hablas.test',
      name: 'Test Admin',
      id: 'test-user-1',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...overrides
  }
}

/**
 * Suppress console errors in tests
 */
export function suppressConsoleErrors() {
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalError
  })
}

/**
 * Mock localStorage
 */
export function mockLocalStorage() {
  const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString()
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        store = {}
      }
    }
  })()

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  })

  return localStorageMock
}

/**
 * Mock navigator.share
 */
export function mockNavigatorShare() {
  const shareMock = jest.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'share', {
    value: shareMock,
    writable: true,
    configurable: true
  })
  return shareMock
}
