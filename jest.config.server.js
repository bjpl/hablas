/**
 * Jest Configuration for Server-Side Tests
 *
 * This configuration is used for:
 * - API routes
 * - Middleware
 * - Server utilities
 * - Database operations
 * - Authentication logic
 */

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  displayName: 'server',
  testEnvironment: '@edge-runtime/jest-environment',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.server.js'],

  // Server test patterns
  testMatch: [
    '**/__tests__/api/**/*.test.[jt]s',
    '**/__tests__/middleware/**/*.test.[jt]s',
    '**/__tests__/auth/**/*.test.[jt]s',
    '**/__tests__/database/**/*.test.[jt]s',
    '**/lib/**/__tests__/**/*.test.[jt]s',
    '!**/__tests__/**/*.client.test.[jt]s?(x)',
    '!**/components/**',
  ],

  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        esModuleInterop: true,
      },
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jose|@supabase)/)',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'app/api/**/*.{js,ts}',
    'lib/**/*.{js,ts}',
    'middleware.ts',
    'database/**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/scripts/**',
  ],

  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
    '/__tests__/utils/',
    '/jest.config.*.js',
    '/jest.setup.*.js',
  ],

  // Test timeout
  testTimeout: 15000,

  // Server-specific settings
  maxWorkers: 1, // Run server tests sequentially to avoid conflicts

  // Globals
  globals: {
    'ts-jest': {
      tsconfig: {
        module: 'commonjs',
      },
    },
  },
}

module.exports = createJestConfig(customJestConfig)
