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

// Mock jose module for Edge Runtime compatibility
jest.mock('jose', () => {
  const crypto = require('crypto')

  // Token counter for uniqueness within tests
  let tokenNonce = 0

  // Simple JWT mock implementation
  const createMockJWT = (payload, secret, expTime) => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const now = Math.floor(Date.now() / 1000)
    const payloadWithClaims = {
      ...payload,
      iat: now,
      exp: expTime || now + 604800, // Default 7 days
      jti: `${now}-${++tokenNonce}`, // Unique token ID
    }
    const payloadBase64 = Buffer.from(JSON.stringify(payloadWithClaims)).toString('base64url')
    const signature = crypto.createHmac('sha256', secret)
      .update(`${header}.${payloadBase64}`)
      .digest('base64url')
    return `${header}.${payloadBase64}.${signature}`
  }

  const verifyMockJWT = (token, secret) => {
    try {
      const [header, payload, signature] = token.split('.')
      const expectedSig = crypto.createHmac('sha256', secret)
        .update(`${header}.${payload}`)
        .digest('base64url')

      if (signature !== expectedSig) {
        throw new Error('Invalid signature')
      }

      const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString())
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired')
      }
      return decoded
    } catch {
      throw new Error('Invalid token')
    }
  }

  return {
    SignJWT: jest.fn().mockImplementation((payload) => {
      let expTime = null
      const builder = {
        setProtectedHeader: jest.fn().mockImplementation(() => builder),
        setIssuedAt: jest.fn().mockImplementation(() => builder),
        setExpirationTime: jest.fn().mockImplementation((exp) => {
          // exp can be a number (unix timestamp) or string like '30d'
          if (typeof exp === 'number') {
            expTime = exp
          } else if (typeof exp === 'string') {
            const match = exp.match(/^(\d+)([dhms])$/)
            if (match) {
              const value = parseInt(match[1], 10)
              const unit = match[2]
              const now = Math.floor(Date.now() / 1000)
              switch (unit) {
                case 'd': expTime = now + value * 86400; break
                case 'h': expTime = now + value * 3600; break
                case 'm': expTime = now + value * 60; break
                case 's': expTime = now + value; break
              }
            }
          }
          return builder
        }),
        sign: jest.fn().mockImplementation(async () => {
          return createMockJWT(payload, process.env.JWT_SECRET || 'test-secret', expTime)
        }),
      }
      return builder
    }),
    jwtVerify: jest.fn().mockImplementation(async (token, secret) => {
      const payload = verifyMockJWT(token, process.env.JWT_SECRET || 'test-secret')
      return { payload }
    }),
    decodeJwt: jest.fn().mockImplementation((token) => {
      const [, payload] = token.split('.')
      return JSON.parse(Buffer.from(payload, 'base64url').toString())
    }),
  }
})

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

// In-memory database state for testing
const mockDatabaseState = {
  users: new Map(),
  authAuditLog: [],
  userIdCounter: 1,

  reset() {
    this.users.clear()
    this.authAuditLog = []
    this.userIdCounter = 1
  },

  createUser(email, passwordHash, name, role) {
    const id = `user-${this.userIdCounter++}`
    const user = {
      id,
      email,
      password_hash: passwordHash,
      name,
      role,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      last_login: null,
    }
    this.users.set(id, user)
    return user
  },

  getUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user
      }
    }
    return null
  },

  getUserById(id) {
    return this.users.get(id) || null
  },
}

// Smart query mock that handles different SQL patterns
const createSmartQueryMock = () => {
  return jest.fn().mockImplementation(async (sql, params = []) => {
    const sqlLower = sql.toLowerCase()

    // Handle invalid SQL first - throw error for clearly invalid SQL
    if (sqlLower === 'invalid sql' || sqlLower.startsWith('invalid ')) {
      throw new Error('syntax error at or near "INVALID"')
    }

    // Handle parameterized SELECT with type casting (e.g., SELECT $1::text as value)
    const paramSelectMatch = sql.match(/SELECT\s+\$(\d+)(?:::\w+)?\s+as\s+(\w+)/i)
    if (paramSelectMatch) {
      const paramIndex = parseInt(paramSelectMatch[1], 10) - 1
      const columnName = paramSelectMatch[2]
      const value = params[paramIndex] !== undefined ? params[paramIndex] : null
      return { rows: [{ [columnName]: value }], rowCount: 1 }
    }

    // SELECT 1 or health checks
    if (sqlLower.includes('select 1') || sqlLower.includes('select now()')) {
      return { rows: [{ test: 1, health: 1 }], rowCount: 1 }
    }

    // COUNT queries
    if (sqlLower.includes('select count(*)')) {
      // Handle COUNT with role filter
      if (sqlLower.includes('where role =') && params[0]) {
        const roleFilter = params[0]
        const count = Array.from(mockDatabaseState.users.values())
          .filter(u => u.role === roleFilter).length
        return { rows: [{ count: count.toString() }], rowCount: 1 }
      }
      return { rows: [{ count: mockDatabaseState.users.size.toString() }], rowCount: 1 }
    }

    // INSERT INTO users
    if (sqlLower.includes('insert into users')) {
      const [email, passwordHash, name, role] = params
      const existingUser = mockDatabaseState.getUserByEmail(email)
      if (existingUser) {
        const error = new Error('Duplicate email')
        error.code = '23505'
        throw error
      }
      const user = mockDatabaseState.createUser(email, passwordHash, name, role)
      return { rows: [user], rowCount: 1 }
    }

    // SELECT * FROM users WHERE id
    if (sqlLower.includes('from users where id')) {
      const user = mockDatabaseState.getUserById(params[0])
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 }
    }

    // SELECT * FROM users WHERE email
    if (sqlLower.includes('from users where') && sqlLower.includes('email')) {
      const user = mockDatabaseState.getUserByEmail(params[0])
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 }
    }

    // SELECT * FROM users (list) - with optional role filter
    if (sqlLower.includes('select * from users') && sqlLower.includes('order by')) {
      let users = Array.from(mockDatabaseState.users.values())

      // Handle role filter: WHERE role = $1 ... LIMIT $2 OFFSET $3
      if (sqlLower.includes('where role =')) {
        const roleFilter = params[0]
        users = users.filter(u => u.role === roleFilter)
        const limit = params[1] || 50
        const offset = params[2] || 0
        return { rows: users.slice(offset, offset + limit), rowCount: users.length }
      }

      // No role filter: LIMIT $1 OFFSET $2
      const limit = params[params.length - 2] || 50
      const offset = params[params.length - 1] || 0
      return { rows: users.slice(offset, offset + limit), rowCount: users.length }
    }

    // UPDATE users
    if (sqlLower.includes('update users')) {
      const userId = params[params.length - 1]
      const user = mockDatabaseState.getUserById(userId)
      if (user) {
        // Parse SET clause to apply updates in order
        let paramIndex = 0

        // Handle name update
        if (sqlLower.includes('name =')) {
          user.name = params[paramIndex++]
        }
        // Handle email update
        if (sqlLower.includes('email =')) {
          user.email = params[paramIndex++]
        }
        // Handle role update
        if (sqlLower.includes('role =')) {
          user.role = params[paramIndex++]
        }
        // Handle password_hash update
        if (sqlLower.includes('password_hash =')) {
          user.password_hash = params[paramIndex++]
        }
        // Handle is_active update (for soft delete: SET is_active = false)
        if (sqlLower.includes('is_active =')) {
          // Check if it's a direct "is_active = false" or parameterized
          if (sqlLower.includes('is_active = false')) {
            user.is_active = false
          } else {
            user.is_active = params[paramIndex++]
          }
        }
        // Handle last_login update
        if (sqlLower.includes('last_login')) {
          user.last_login = new Date()
        }
        user.updated_at = new Date()
        return { rows: [user], rowCount: 1 }
      }
      return { rows: [], rowCount: 0 }
    }

    // DELETE FROM users
    if (sqlLower.includes('delete from users')) {
      if (sqlLower.includes("like '%@test.com'")) {
        // Clean up test users
        for (const [id, user] of mockDatabaseState.users.entries()) {
          if (user.email.includes('@test.com')) {
            mockDatabaseState.users.delete(id)
          }
        }
        return { rows: [], rowCount: 0 }
      }
      return { rows: [], rowCount: 0 }
    }

    // INSERT INTO auth_audit_log
    if (sqlLower.includes('insert into auth_audit_log')) {
      const log = {
        id: mockDatabaseState.authAuditLog.length + 1,
        user_id: params[0],
        event_type: params[1],
        success: params[2],
        error_message: params[3],
        ip_address: params[4],
        user_agent: params[5],
        created_at: new Date(),
      }
      mockDatabaseState.authAuditLog.push(log)
      return { rows: [log], rowCount: 1 }
    }

    // SELECT from auth_audit_log
    if (sqlLower.includes('from auth_audit_log')) {
      const logs = mockDatabaseState.authAuditLog.filter(log =>
        !params[0] || log.event_type === params[0] || sqlLower.includes(log.event_type)
      )
      return { rows: logs.slice(-1), rowCount: logs.length }
    }

    // Default
    return { rows: [], rowCount: 0 }
  })
}

const smartQueryMock = createSmartQueryMock()

const mockPoolClient = {
  query: smartQueryMock,
  release: jest.fn(),
}

const mockDb = {
  initialize: jest.fn().mockResolvedValue(undefined),
  getPool: jest.fn().mockResolvedValue({
    connect: jest.fn().mockResolvedValue(mockPoolClient),
    query: smartQueryMock,
    end: jest.fn().mockResolvedValue(undefined),
    totalCount: 10,
    idleCount: 5,
    waitingCount: 0,
  }),
  query: smartQueryMock,
  transaction: jest.fn().mockImplementation(async (callback) => {
    return callback(mockPoolClient)
  }),
  getClient: jest.fn().mockResolvedValue(mockPoolClient),
  healthCheck: jest.fn().mockResolvedValue(true),
  getStats: jest.fn().mockReturnValue({
    totalCount: 10,
    idleCount: 5,
    waitingCount: 0,
  }),
  close: jest.fn().mockResolvedValue(undefined),
}

// Reset database state before each test
beforeEach(() => {
  mockDatabaseState.reset()
})

jest.mock('@/lib/db/pool', () => ({
  db: mockDb,
  query: smartQueryMock,
  transaction: mockDb.transaction,
  getClient: mockDb.getClient,
  healthCheck: mockDb.healthCheck,
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
  blacklistToken: jest.fn().mockResolvedValue(undefined),
  isTokenBlacklisted: jest.fn().mockResolvedValue(false),
  createSession: jest.fn().mockResolvedValue({
    refreshToken: 'test-refresh-token',
    sessionId: 'test-session-id',
  }),
  generateRefreshToken: jest.fn().mockResolvedValue('mock-refresh-token'),
  verifyRefreshToken: jest.fn().mockResolvedValue({ userId: 'test-user-id', email: 'test@test.com', role: 'admin' }),
  storeSession: jest.fn().mockResolvedValue(undefined),
  revokeRefreshToken: jest.fn().mockResolvedValue(undefined),
  revokeSession: jest.fn().mockResolvedValue(undefined),
  getUserSessions: jest.fn().mockResolvedValue([]),
  revokeAllUserSessions: jest.fn().mockResolvedValue(undefined),
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
