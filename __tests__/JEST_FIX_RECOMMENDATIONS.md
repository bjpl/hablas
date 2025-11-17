# Jest Configuration Fix Recommendations

## Problem Statement

Jest test suite hangs indefinitely during initialization when importing Next.js server-side code. This affects all test execution and prevents coverage analysis.

## Root Cause Analysis

1. **Web API Dependencies**: Next.js server code (API routes, middleware) requires Web APIs (Request, Response, Headers)
2. **Environment Mismatch**: Jest's jsdom environment doesn't fully implement these APIs
3. **Module Resolution**: Next.js imports trigger initialization loops

## Recommended Solutions

### Option 1: Separate Test Configurations (RECOMMENDED)

Create two Jest configurations for different test environments:

#### jest.config.client.js
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

module.exports = createJestConfig({
  displayName: 'client',
  testEnvironment: 'jsdom',
  testMatch: [
    '**/__tests__/**/*.client.test.[jt]s?(x)',
    '**/components/**/*.test.[jt]s?(x)',
    '**/hooks/**/*.test.[jt]s?(x)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.client.js'],
});
```

#### jest.config.server.js
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

module.exports = createJestConfig({
  displayName: 'server',
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/api/**/*.test.[jt]s',
    '**/__tests__/middleware/**/*.test.[jt]s',
    '**/lib/**/*.test.[jt]s',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.server.js'],
});
```

#### Run both:
```bash
npx jest --projects jest.config.client.js jest.config.server.js
```

### Option 2: Use @edge-runtime/jest-environment

Install Edge Runtime environment:
```bash
npm install --save-dev @edge-runtime/jest-environment
```

Update jest.config.js:
```javascript
module.exports = {
  testEnvironment: '@edge-runtime/jest-environment',
  // ... other config
};
```

### Option 3: Mock Next.js Server Dependencies

Create comprehensive mocks in jest.setup.js:

```javascript
// jest.setup.js
import { ReadableStream, WritableStream } from 'stream/web';

// Mock Web Streams API
global.ReadableStream = ReadableStream;
global.WritableStream = WritableStream;

// Mock Next.js Request/Response
global.Request = class Request {
  constructor(input, init = {}) {
    this.url = input;
    this.method = init.method || 'GET';
    this.headers = new Headers(init.headers);
    this.body = init.body;
  }

  async json() {
    return JSON.parse(this.body || '{}');
  }

  async text() {
    return this.body || '';
  }
};

global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.headers = new Headers(init.headers);
  }

  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
  }
};

global.Headers = class Headers {
  constructor(init = {}) {
    this.map = new Map(Object.entries(init));
  }

  get(name) {
    return this.map.get(name.toLowerCase()) || null;
  }

  set(name, value) {
    this.map.set(name.toLowerCase(), value);
  }

  has(name) {
    return this.map.has(name.toLowerCase());
  }
};
```

### Option 4: Add Timeout and Exit Flags

Quick fix for immediate testing:

```json
{
  "scripts": {
    "test": "jest --forceExit --detectOpenHandles",
    "test:timeout": "jest --testTimeout=10000 --forceExit",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  }
}
```

## Immediate Action Plan

### Step 1: Create Separate Setup Files

Create `jest.setup.client.js`:
```javascript
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Client-only mocks
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() { return [] }
  unobserve() {}
};
```

Create `jest.setup.server.js`:
```javascript
// Server-only setup
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';

// Mock Next.js server APIs
jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    constructor(url, init = {}) {
      this.url = url;
      this.method = init.method || 'GET';
      this.headers = new Map(Object.entries(init.headers || {}));
    }
  },
  NextResponse: {
    json: (data, init = {}) => ({
      json: async () => data,
      status: init.status || 200,
      headers: new Map(),
    }),
    redirect: (url) => ({
      headers: new Map([['location', url]]),
      status: 307,
    }),
  },
}));
```

### Step 2: Update package.json

```json
{
  "scripts": {
    "test": "jest --projects jest.config.client.js jest.config.server.js",
    "test:client": "jest --config jest.config.client.js",
    "test:server": "jest --config jest.config.server.js",
    "test:coverage": "jest --projects jest.config.client.js jest.config.server.js --coverage"
  }
}
```

### Step 3: Verify Tests Run

```bash
# Test individual suites first
npm run test:server -- __tests__/auth/jwt.test.ts
npm run test:client -- __tests__/integration/resource-detail-enhanced.test.tsx

# Run full suite
npm test
```

## Alternative: Minimal Fix

If separate configs are too complex, try this minimal change:

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node', // Change from 'jsdom'
  testTimeout: 10000,
  forceExit: true,
  detectOpenHandles: true,
  // ... rest of config
};
```

Then update component tests to use:
```javascript
/**
 * @jest-environment jsdom
 */
// at top of each React component test file
```

## Testing the Fix

### Validation Steps

1. **Run single test file**
   ```bash
   npm test -- __tests__/sanitize.test.ts --verbose
   ```

2. **Check for hangs**
   ```bash
   timeout 30 npm test -- __tests__/validation-schemas.test.ts
   ```

3. **Full suite with coverage**
   ```bash
   npm run test:coverage
   ```

4. **Verify no open handles**
   ```bash
   npm test -- --detectOpenHandles --forceExit
   ```

## Success Criteria

- ✅ All tests complete within 2 minutes
- ✅ No test hangs or timeouts
- ✅ Coverage report generates successfully
- ✅ Both client and server tests run
- ✅ No "open handles" warnings

## Rollback Plan

If changes cause issues:

1. Restore original `jest.config.js`
2. Restore original `jest.setup.js`
3. Run: `npm test -- --clearCache`
4. Document issues encountered

## Additional Resources

- [Next.js Testing Documentation](https://nextjs.org/docs/testing)
- [Jest Configuration](https://jestjs.io/docs/configuration)
- [@edge-runtime/jest-environment](https://github.com/vercel/edge-runtime/tree/main/packages/jest-environment)
- [Testing Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/optimizing/testing#api-routes)

## Next Steps After Fix

1. Run full coverage analysis
2. Identify coverage gaps (<80%)
3. Add missing tests for uncovered paths
4. Increase coverage thresholds in jest.config.js
5. Set up CI/CD test automation
6. Add pre-commit hooks for testing

## Contact

If issues persist, coordinate with:
- Infrastructure team for environment setup
- DevOps for CI/CD integration
- Lead developer for architectural decisions
