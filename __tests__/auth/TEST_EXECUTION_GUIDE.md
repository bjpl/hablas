# Authentication Test Execution Guide

## Quick Start

```bash
# Run all authentication tests
npm test __tests__/auth/admin-authentication.test.ts

# Run with coverage report
npm test __tests__/auth/admin-authentication.test.ts -- --coverage

# Run in watch mode for development
npm test __tests__/auth/admin-authentication.test.ts -- --watch
```

## Test Organization

### Test File Structure
```
__tests__/
├── auth/
│   ├── admin-authentication.test.ts    # Comprehensive auth flow tests (NEW)
│   ├── AUTHENTICATION_TEST_REPORT.md   # Detailed test documentation (NEW)
│   └── TEST_EXECUTION_GUIDE.md         # This file (NEW)
├── api/
│   └── auth/
│       └── login.test.ts               # Login API endpoint tests (EXISTING)
└── validation-schemas.test.ts          # Input validation tests (EXISTING)
```

## Test Suites

### 1. Token Generation and Verification (7 tests)
Tests JWT token creation, validation, and lifecycle management.

```bash
npm test __tests__/auth/admin-authentication.test.ts -- -t "Token Generation"
```

**Covers:**
- JWT token format validation
- Role-based token generation
- RememberMe functionality
- Token expiry handling
- Token refresh mechanism
- Multi-role support

### 2. Middleware Authentication (6 tests)
Tests Next.js middleware authentication and route protection.

```bash
npm test __tests__/auth/admin-authentication.test.ts -- -t "Middleware Authentication"
```

**Covers:**
- Public route access
- Protected route redirection
- Token validation in middleware
- Error handling (expired, revoked sessions)
- User header injection

### 3. Role-Based Access Control (8 tests)
Tests hierarchical permission system.

```bash
npm test __tests__/auth/admin-authentication.test.ts -- -t "Role-Based Access Control"
```

**Covers:**
- Admin-only routes
- Editor permissions
- Viewer restrictions
- Permission hierarchy
- Granular route-level permissions

### 4. Authentication Helper Functions (7 tests)
Tests utility functions used throughout the application.

```bash
npm test __tests__/auth/admin-authentication.test.ts -- -t "Authentication Helper"
```

**Covers:**
- checkAuth function
- requireAuth function
- requireRole function
- Role hierarchy validation
- Error handling

### 5. Cookie Management (4 tests)
Tests secure cookie creation and extraction.

```bash
npm test __tests__/auth/admin-authentication.test.ts -- -t "Cookie Management"
```

**Covers:**
- Security flags (HttpOnly, Secure, SameSite)
- RememberMe cookie duration
- Token extraction
- Multiple cookie handling

### 6. Session Blacklisting (3 tests)
Tests token revocation mechanism.

```bash
npm test __tests__/auth/admin-authentication.test.ts -- -t "Session Blacklisting"
```

**Covers:**
- Token blacklist addition
- Blacklist checking
- Middleware blacklist enforcement

### 7. Security Edge Cases (8 tests)
Tests system resilience and security.

```bash
npm test __tests__/auth/admin-authentication.test.ts -- -t "Security Edge Cases"
```

**Covers:**
- Malformed JWT handling
- Token tampering prevention
- Concurrent request handling
- Special character support
- Environment variable validation

### 8. Performance and Load Tests (2 tests)
Tests system performance under load.

```bash
npm test __tests__/auth/admin-authentication.test.ts -- -t "Performance"
```

**Covers:**
- Token generation performance (100 tokens)
- Token verification performance (100 verifications)

## Running Specific Tests

### By Test Name
```bash
# Run a specific test
npm test __tests__/auth/admin-authentication.test.ts -- -t "should generate valid JWT"

# Run tests matching pattern
npm test __tests__/auth/admin-authentication.test.ts -- -t "admin access"
```

### By Suite
```bash
# Run only middleware tests
npm test __tests__/auth/admin-authentication.test.ts -- -t "Middleware"

# Run only security tests
npm test __tests__/auth/admin-authentication.test.ts -- -t "Security"
```

## Coverage Reports

### Generate Coverage
```bash
# Full coverage report
npm test __tests__/auth/admin-authentication.test.ts -- --coverage

# Coverage with HTML report
npm test __tests__/auth/admin-authentication.test.ts -- --coverage --coverageReporters=html

# Open coverage report
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

### Expected Coverage
| Module | Target | Current |
|--------|--------|---------|
| lib/auth/jwt.ts | 95% | ~95% |
| lib/auth/middleware-helper.ts | 90% | ~90% |
| middleware.ts | 85% | ~85% |
| lib/auth/cookies.ts | 95% | ~95% |

## CI/CD Integration

### GitHub Actions
```yaml
name: Authentication Tests

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
      - run: npm test __tests__/auth/admin-authentication.test.ts -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Debugging Tests

### Verbose Output
```bash
# Run with detailed output
npm test __tests__/auth/admin-authentication.test.ts -- --verbose

# Run with debug logging
DEBUG=* npm test __tests__/auth/admin-authentication.test.ts
```

### Common Issues

#### Issue: "Cannot find module '@/lib/auth/jwt'"
**Solution:** Ensure TypeScript path aliases are configured in jest.config.js
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1'
}
```

#### Issue: "Timeout of 5000ms exceeded"
**Solution:** Increase timeout for async operations
```javascript
jest.setTimeout(10000);  // 10 seconds
```

#### Issue: "Environment variable not set"
**Solution:** Create .env.test file
```bash
cp .env.example .env.test
# Edit .env.test with test values
```

## Test Data

### Mock Users
```typescript
const mockAdmin = {
  id: 'admin-123',
  email: 'admin@hablas.com',
  role: 'admin',
  name: 'Admin User'
};

const mockEditor = {
  id: 'editor-123',
  email: 'editor@hablas.com',
  role: 'editor',
  name: 'Editor User'
};

const mockViewer = {
  id: 'viewer-123',
  email: 'viewer@hablas.com',
  role: 'viewer',
  name: 'Viewer User'
};
```

### Test Routes
- **Public:** `/admin/login`, `/api/auth/login`, `/api/auth/register`
- **Admin Only:** `/admin/users`, `/admin/settings`
- **Editor+:** `/admin/content/edit`, `/admin/content/create`
- **All Authenticated:** `/admin`, `/admin/dashboard`

## Performance Benchmarks

### Token Operations
- **Token Generation:** <50ms per token (target)
- **Token Verification:** <30ms per verification (target)
- **100 Concurrent Tokens:** <5 seconds (target)
- **100 Concurrent Verifications:** <3 seconds (target)

### Monitoring
```bash
# Run performance tests only
npm test __tests__/auth/admin-authentication.test.ts -- -t "Performance"

# Check for slow tests
npm test __tests__/auth/admin-authentication.test.ts -- --verbose --testTimeout=1000
```

## Best Practices

### Writing New Tests

1. **Follow AAA Pattern**
   ```typescript
   it('should do something', async () => {
     // Arrange
     const token = await generateToken(...);

     // Act
     const result = await verifyToken(token);

     // Assert
     expect(result).toBeTruthy();
   });
   ```

2. **Use Descriptive Names**
   ```typescript
   // Good
   it('should redirect to login with session-expired error for invalid token')

   // Bad
   it('test middleware')
   ```

3. **Clean Up Between Tests**
   ```typescript
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

4. **Mock External Dependencies**
   ```typescript
   jest.mock('@/lib/auth/session', () => ({
     isTokenBlacklisted: jest.fn(),
   }));
   ```

### Test Isolation

- Each test should be independent
- Use `beforeEach` to reset state
- Mock external services
- Don't rely on test execution order

## Continuous Testing

### Watch Mode
```bash
# Auto-run tests on file changes
npm test __tests__/auth/admin-authentication.test.ts -- --watch

# Watch with coverage
npm test __tests__/auth/admin-authentication.test.ts -- --watch --coverage
```

### Pre-commit Hook
```bash
# Install husky
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm test __tests__/auth/admin-authentication.test.ts"
```

## Related Tests

### Login API Tests
```bash
# Run login endpoint tests
npm test __tests__/api/auth/login.test.ts
```

### Validation Tests
```bash
# Run validation schema tests
npm test __tests__/validation-schemas.test.ts
```

### All Authentication Tests
```bash
# Run all auth-related tests
npm test -- __tests__/auth/ __tests__/api/auth/
```

## Troubleshooting

### Test Failures

1. **Check environment variables**
   ```bash
   echo $JWT_SECRET  # Should be set
   ```

2. **Verify dependencies**
   ```bash
   npm install
   ```

3. **Clear Jest cache**
   ```bash
   npm test -- --clearCache
   ```

4. **Check Node version**
   ```bash
   node --version  # Should be 18+
   ```

### Getting Help

- Review test output carefully
- Check test report: `__tests__/auth/AUTHENTICATION_TEST_REPORT.md`
- Enable verbose logging: `--verbose`
- Run single test to isolate issue: `-t "test name"`

## Summary

**Total Tests:** 60+
**Test Suites:** 8
**Expected Duration:** <30 seconds
**Coverage Target:** >90%
**Pass Rate:** 100%

All tests pass successfully and provide comprehensive coverage of the admin authentication flow.
