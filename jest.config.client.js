/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Jest Configuration for Client-Side Tests
 *
 * This configuration is used for:
 * - React components
 * - Client-side hooks
 * - UI interactions
 * - Browser-specific code
 */

const nextJest = require('next/jest')
const path = require('path')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  displayName: 'client',
  testEnvironment: 'jsdom',
  rootDir: __dirname,
  setupFilesAfterEnv: [path.join(__dirname, 'jest.setup.client.js')],

  // Client test patterns
  testMatch: [
    '**/__tests__/**/*.client.test.[jt]s?(x)',
    '**/components/**/__tests__/**/*.test.[jt]s?(x)',
    '**/hooks/**/__tests__/**/*.test.[jt]s?(x)',
    '**/__tests__/integration/*-enhanced.test.[jt]s?(x)',
    '**/__tests__/integration/json-resources.test.[jt]s?(x)',
  ],

  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
      },
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jose|@supabase)/)',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/out/**',
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
  testTimeout: 10000,
}

module.exports = createJestConfig(customJestConfig)
