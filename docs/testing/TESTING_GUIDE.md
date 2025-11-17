# Jest Testing Framework Guide

## Overview

The Hablas project uses **Jest** as its primary testing framework with separate configurations for client-side and server-side tests. This guide covers setup, best practices, and testing patterns.

## Table of Contents

- [Test Architecture](#test-architecture)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Utilities](#test-utilities)
- [Coverage Goals](#coverage-goals)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Test Architecture

### Dual Configuration System

We use separate Jest configurations to handle the different runtime environments:

#### **Client Tests** (`jest.config.client.js`)
- **Environment**: jsdom (browser simulation)
- **Tests**: React components, hooks, client-side utilities
- **Location**: `components/**/__tests__`, `hooks/**/__tests__`

#### **Server Tests** (`jest.config.server.js`)
- **Environment**: @edge-runtime/jest-environment
- **Tests**: API routes, middleware, server utilities
- **Location**: `__tests__/api/**`, `__tests__/middleware/**`, `lib/**`

### Directory Structure

```
hablas/
├── __tests__/
│   ├── api/              # API route tests
│   ├── auth/             # Authentication tests
│   ├── database/         # Database tests
│   ├── middleware/       # Middleware tests
│   ├── integration/      # Integration tests
│   ├── e2e/              # End-to-end tests
│   ├── examples/         # Example test patterns
│   └── utils/            # Test utilities
├── components/
│   └── **/__tests__/     # Component tests
├── jest.config.js        # Main config (legacy)
├── jest.config.client.js # Client test config
├── jest.config.server.js # Server test config
├── jest.setup.client.js  # Client setup
└── jest.setup.server.js  # Server setup
```

## Running Tests

### Basic Commands

```bash
# Run all tests (client + server)
npm test

# Run only client tests
npm run test:client

# Run only server tests
npm run test:server

# Watch mode (all tests)
npm run test:watch

# Watch mode (client only)
npm run test:watch:client

# Watch mode (server only)
npm run test:watch:server

# Generate coverage report
npm run test:coverage

# Client coverage only
npm run test:coverage:client

# Server coverage only
npm run test:coverage:server

# CI mode (for pipelines)
npm run test:ci

# Debug mode
npm run test:debug
```

### Running Specific Tests

```bash
# Run tests matching pattern
npm test -- --testPathPattern=auth

# Run single test file
npm test -- __tests__/auth/jwt.test.ts

# Run tests with specific name
npm test -- -t "should authenticate user"

# Update snapshots
npm test -- -u

# Clear cache and run
npm test -- --clearCache && npm test
```

## Writing Tests

### Test Structure (AAA Pattern)

```typescript
describe('Feature Name', () => {
  describe('specific behavior', () => {
    it('should do something specific', () => {
      // Arrange - Set up test data and mocks
      const input = 'test'

      // Act - Execute the code under test
      const result = someFunction(input)

      // Assert - Verify the results
      expect(result).toBe('expected')
    })
  })
})
```

### API Route Tests

```typescript
import { NextRequest } from 'next/server'
import { createMockRequest, Assertions } from '@/__tests__/utils/test-helpers'

describe('POST /api/auth/login', () => {
  it('should authenticate valid credentials', async () => {
    // Arrange
    const request = createMockRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@hablas.com',
        password: 'securepassword',
      },
    })

    // Act
    const response = await POST(request)

    // Assert
    Assertions.assertSuccess(response)
    const data = await Assertions.assertJSON(response)
    expect(data).toHaveProperty('token')
  })

  it('should reject invalid credentials', async () => {
    const request = createMockRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: {
        email: 'wrong@email.com',
        password: 'wrongpass',
      },
    })

    const response = await POST(request)

    Assertions.assertStatus(response, 401)
  })
})
```

### Component Tests

```typescript
import { screen } from '@testing-library/react'
import { renderWithUserEvent } from '@/__tests__/utils/render-helpers'
import { axe } from 'jest-axe'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    renderWithUserEvent(<MyComponent />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle user interactions', async () => {
    const { user } = renderWithUserEvent(<MyComponent />)
    const button = screen.getByRole('button')

    await user.click(button)

    expect(screen.getByText('Clicked!')).toBeInTheDocument()
  })

  it('should have no accessibility violations', async () => {
    const { container } = renderWithUserEvent(<MyComponent />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

### Async Tests

```typescript
it('should load data asynchronously', async () => {
  // Arrange
  const mockData = { id: '1', name: 'Test' }
  jest.spyOn(global, 'fetch').mockResolvedValue({
    json: async () => mockData,
  } as Response)

  // Act
  renderWithUserEvent(<DataComponent />)

  // Assert
  await waitFor(() => {
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

### Mocking

```typescript
// Mock modules
jest.mock('@/lib/auth/jwt', () => ({
  generateToken: jest.fn().mockResolvedValue('mock-token'),
  verifyToken: jest.fn().mockResolvedValue({ userId: '123' }),
}))

// Mock environment variables
process.env.JWT_SECRET = 'test-secret'

// Mock database
jest.mock('@/lib/db/pool', () => ({
  query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
}))

// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: 'test' }),
})
```

## Test Utilities

### Test Helpers

Located in `__tests__/utils/test-helpers.ts`:

```typescript
import {
  createMockRequest,
  createMockUser,
  createMockAuthToken,
  TestData,
  Assertions,
  MockTimer,
  TestEnv
} from '@/__tests__/utils/test-helpers'

// Create mock request
const request = createMockRequest('http://localhost/api/test', {
  method: 'POST',
  body: { key: 'value' },
  cookies: { auth_token: 'token' },
})

// Generate test data
const email = TestData.email()
const user = createMockUser({ role: 'admin' })

// Assertions
await Assertions.assertJSON(response)
Assertions.assertSuccess(response)
Assertions.assertHasProperties(data, ['id', 'name'])

// Mock timers
const timer = new MockTimer()
timer.advance(1000)
timer.restore()

// Environment variables
const env = new TestEnv()
env.set('API_KEY', 'test-key')
env.restore()
```

### Render Helpers

Located in `__tests__/utils/render-helpers.tsx`:

```typescript
import {
  renderWithUserEvent,
  waitForLoadingToFinish,
  QueryHelpers,
  A11yHelpers,
  FormHelpers,
  MockWindow,
} from '@/__tests__/utils/render-helpers'

// Render with user event
const { user, ...renderResult } = renderWithUserEvent(<Component />)
await user.click(screen.getByRole('button'))

// Wait for loading
await waitForLoadingToFinish()

// Accessibility checks
await A11yHelpers.checkA11y(container)

// Form testing
await FormHelpers.fillFieldByLabel('Email', 'test@example.com')
await FormHelpers.submitForm(container)

// Mock window
const mockWindow = new MockWindow()
mockWindow.mockProperty('location', { href: 'http://test.com' })
mockWindow.restore()
```

## Coverage Goals

### Target Coverage

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

### View Coverage Report

```bash
# Generate coverage
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

### Coverage Configuration

Coverage thresholds are configured in `jest.config.client.js` and `jest.config.server.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 75,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

## Best Practices

### 1. Test Naming

```typescript
// ✅ Good - Descriptive and specific
it('should return 401 when authentication token is missing', () => {})

// ❌ Bad - Vague
it('should work', () => {})
```

### 2. One Assertion Per Test

```typescript
// ✅ Good
it('should return user data', () => {
  expect(result).toHaveProperty('id')
})

it('should return user email', () => {
  expect(result.email).toBe('test@example.com')
})

// ❌ Bad - Multiple unrelated assertions
it('should work', () => {
  expect(result).toHaveProperty('id')
  expect(otherThing).toBe(true)
  expect(yetAnother).toContain('value')
})
```

### 3. Arrange-Act-Assert Pattern

Always structure tests in three clear phases:

```typescript
it('should authenticate user', async () => {
  // Arrange
  const credentials = { email: 'test@example.com', password: 'pass' }

  // Act
  const result = await authenticate(credentials)

  // Assert
  expect(result.success).toBe(true)
})
```

### 4. Test Independence

```typescript
// ✅ Good - Self-contained
describe('User Service', () => {
  beforeEach(() => {
    // Fresh setup for each test
    jest.clearAllMocks()
  })

  it('should create user', async () => {
    const user = await createUser({ email: 'unique@email.com' })
    expect(user).toBeDefined()
  })
})

// ❌ Bad - Tests depend on each other
let sharedUser
it('should create user', () => {
  sharedUser = createUser()
})
it('should update user', () => {
  updateUser(sharedUser) // Depends on previous test
})
```

### 5. Mock External Dependencies

```typescript
// ✅ Good - Mock external services
jest.mock('@/lib/email-service', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}))

// ❌ Bad - Real external calls
it('should send email', async () => {
  await sendEmail('real@email.com') // This makes actual API call!
})
```

### 6. Accessibility Testing

Always include accessibility tests for components:

```typescript
it('should have no accessibility violations', async () => {
  const { container } = render(<Component />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### 7. Error Scenarios

Test both success and failure paths:

```typescript
describe('API Endpoint', () => {
  it('should succeed with valid input', async () => {
    // Test happy path
  })

  it('should fail with invalid input', async () => {
    // Test error handling
  })

  it('should handle network errors', async () => {
    // Test edge cases
  })
})
```

## Troubleshooting

### Tests Hanging

If tests hang indefinitely:

```bash
# Clear Jest cache
npm test -- --clearCache

# Run with force exit
npm test -- --forceExit

# Debug with increased timeout
npm test -- --testTimeout=30000
```

### Module Resolution Errors

```bash
# Check module mapper in jest.config.js
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

### Environment Issues

```bash
# Verify Node version
node --version  # Should be >= 18.0.0

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Coverage Not Updating

```bash
# Clear coverage directory
rm -rf coverage

# Regenerate
npm run test:coverage
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)
- [jest-axe](https://github.com/nickcolley/jest-axe)
- [Next.js Testing](https://nextjs.org/docs/testing)

## Support

For questions or issues:
1. Check this guide
2. Review example tests in `__tests__/examples/`
3. Consult the team's testing documentation
4. Create an issue in the project repository
