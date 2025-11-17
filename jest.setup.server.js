/**
 * Jest Setup for Server-Side Tests
 *
 * Configures testing environment for API routes, middleware, and server utilities
 */

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-32-characters-long'
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-32-chars'
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret-key-for-testing'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.REDIS_URL = 'redis://localhost:6379'

// Mock crypto for Edge Runtime if needed
if (typeof globalThis.crypto === 'undefined') {
  const { webcrypto } = require('crypto')
  globalThis.crypto = webcrypto
}

// Mock TextEncoder/TextDecoder for Node environments
if (typeof globalThis.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util')
  globalThis.TextEncoder = TextEncoder
  globalThis.TextDecoder = TextDecoder
}

// Mock database pool to prevent real connections during tests
jest.mock('@/lib/db/pool', () => ({
  query: jest.fn(),
  connect: jest.fn().mockResolvedValue({
    query: jest.fn(),
    release: jest.fn(),
  }),
  end: jest.fn(),
}))

// Mock Redis client
jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    incr: jest.fn().mockResolvedValue(1),
    on: jest.fn(),
  }),
}))

// Mock session management functions
jest.mock('@/lib/auth/session', () => ({
  addToBlacklist: jest.fn().mockResolvedValue(undefined),
  isTokenBlacklisted: jest.fn().mockResolvedValue(false),
  createSession: jest.fn().mockResolvedValue({
    id: 'test-session-id',
    userId: 'test-user-id',
    expiresAt: new Date(Date.now() + 86400000),
  }),
  deleteSession: jest.fn().mockResolvedValue(undefined),
}))

// Mock file system operations if needed
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  mkdir: jest.fn(),
  stat: jest.fn(),
}))

// Suppress server-specific console output during tests
const originalLog = console.log
const originalError = console.error

beforeAll(() => {
  console.log = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Listening on') ||
       args[0].includes('Ready in'))
    ) {
      return
    }
    originalLog.call(console, ...args)
  }

  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('ECONNREFUSED') ||
       args[0].includes('Connection terminated'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.log = originalLog
  console.error = originalError
})

// Clean up mocks after each test
afterEach(() => {
  jest.clearAllMocks()
})

// Global test utilities for server tests
global.createMockRequest = (options = {}) => {
  const {
    method = 'GET',
    url = 'http://localhost:3000',
    headers = {},
    body = null,
  } = options

  return new Request(url, {
    method,
    headers: new Headers(headers),
    body: body ? JSON.stringify(body) : null,
  })
}

global.createMockResponse = (data, status = 200, headers = {}) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: new Headers(headers),
  })
}
