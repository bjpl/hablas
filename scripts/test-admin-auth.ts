#!/usr/bin/env tsx

/**
 * Admin Authentication Testing Script
 * Comprehensive test suite for admin login, JWT tokens, and protected endpoints
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration?: number;
  details?: Record<string, unknown>;
}

const results: TestResult[] = [];
let accessToken = '';
let refreshToken = '';

// Force localhost for testing during development
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@hablas.co';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

/**
 * Utility function to make HTTP requests
 */
async function makeRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ response: Response; data: unknown; duration: number }> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    const duration = Date.now() - startTime;
    return { response, data, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    throw { error, duration };
  }
}

/**
 * Test 1: Login with valid admin credentials
 */
async function testValidLogin() {
  const testName = 'Valid Admin Login';

  try {
    const { response, data, duration } = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        rememberMe: false,
      }),
    });

    if (response.status === 200 && data.success) {
      accessToken = data.tokens.accessToken;
      refreshToken = data.tokens.refreshToken;

      results.push({
        name: testName,
        status: 'PASS',
        message: 'Successfully logged in with admin credentials',
        duration,
        details: {
          userId: data.user.id,
          email: data.user.email,
          role: data.user.role,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
        },
      });
    } else {
      results.push({
        name: testName,
        status: 'FAIL',
        message: `Login failed: ${data.error || 'Unknown error'}`,
        duration,
        details: data,
      });
    }
  } catch (error: unknown) {
    results.push({
      name: testName,
      status: 'FAIL',
      message: `Request failed: ${error.message}`,
      duration: error.duration,
    });
  }
}

/**
 * Test 2: Login with invalid credentials
 */
async function testInvalidLogin() {
  const testName = 'Invalid Login Credentials';

  try {
    const { response, data, duration } = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: 'wrongpassword123',
      }),
    });

    if (response.status === 401 && !data.success) {
      results.push({
        name: testName,
        status: 'PASS',
        message: 'Correctly rejected invalid credentials',
        duration,
        details: { error: data.error },
      });
    } else {
      results.push({
        name: testName,
        status: 'FAIL',
        message: 'Should have rejected invalid credentials',
        duration,
        details: data,
      });
    }
  } catch (error: unknown) {
    results.push({
      name: testName,
      status: 'FAIL',
      message: `Request failed: ${error.message}`,
      duration: error.duration,
    });
  }
}

/**
 * Test 3: Login with missing fields
 */
async function testMissingFields() {
  const testName = 'Login with Missing Fields';

  try {
    const { response, data, duration } = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        // password missing
      }),
    });

    if (response.status === 400 && !data.success) {
      results.push({
        name: testName,
        status: 'PASS',
        message: 'Correctly rejected request with missing password',
        duration,
        details: { error: data.error },
      });
    } else {
      results.push({
        name: testName,
        status: 'FAIL',
        message: 'Should have rejected request with missing fields',
        duration,
        details: data,
      });
    }
  } catch (error: unknown) {
    results.push({
      name: testName,
      status: 'FAIL',
      message: `Request failed: ${error.message}`,
      duration: error.duration,
    });
  }
}

/**
 * Test 4: Rate limiting on login attempts
 */
async function testRateLimiting() {
  const testName = 'Rate Limiting on Login';

  try {
    const attempts = [];
    const maxAttempts = 6; // Exceed the limit (usually 5)

    for (let i = 0; i < maxAttempts; i++) {
      const { response, data, duration } = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: `test${i}@example.com`,
          password: 'wrongpassword',
        }),
      });

      attempts.push({ status: response.status, data, duration });
    }

    const rateLimited = attempts.some(a => a.status === 429);

    if (rateLimited) {
      results.push({
        name: testName,
        status: 'PASS',
        message: 'Rate limiting is working correctly',
        duration: attempts.reduce((sum, a) => sum + a.duration, 0),
        details: {
          totalAttempts: attempts.length,
          rateLimitedAfter: attempts.findIndex(a => a.status === 429) + 1,
        },
      });
    } else {
      results.push({
        name: testName,
        status: 'FAIL',
        message: 'Rate limiting did not trigger after multiple attempts',
        duration: attempts.reduce((sum, a) => sum + a.duration, 0),
        details: { attempts: attempts.map(a => a.status) },
      });
    }
  } catch (error: unknown) {
    results.push({
      name: testName,
      status: 'FAIL',
      message: `Request failed: ${error.message}`,
      duration: error.duration,
    });
  }
}

/**
 * Test 5: JWT token validation
 */
async function testTokenValidation() {
  const testName = 'JWT Token Validation';

  if (!accessToken) {
    results.push({
      name: testName,
      status: 'SKIP',
      message: 'No access token available from login',
    });
    return;
  }

  try {
    const { response, data, duration } = await makeRequest('/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.status === 200 && data.user) {
      results.push({
        name: testName,
        status: 'PASS',
        message: 'Access token is valid and properly decoded',
        duration,
        details: {
          userId: data.user.id,
          email: data.user.email,
          role: data.user.role,
        },
      });
    } else {
      results.push({
        name: testName,
        status: 'FAIL',
        message: 'Token validation failed',
        duration,
        details: data,
      });
    }
  } catch (error: unknown) {
    results.push({
      name: testName,
      status: 'FAIL',
      message: `Request failed: ${error.message}`,
      duration: error.duration,
    });
  }
}

/**
 * Test 6: Refresh token flow
 */
async function testRefreshToken() {
  const testName = 'Refresh Token Flow';

  if (!refreshToken) {
    results.push({
      name: testName,
      status: 'SKIP',
      message: 'No refresh token available from login',
    });
    return;
  }

  try {
    const { response, data, duration } = await makeRequest('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({
        refreshToken,
      }),
    });

    if (response.status === 200 && data.success && data.tokens) {
      const newAccessToken = data.tokens.accessToken;
      const newRefreshToken = data.tokens.refreshToken;

      results.push({
        name: testName,
        status: 'PASS',
        message: 'Successfully refreshed tokens',
        duration,
        details: {
          hasNewAccessToken: !!newAccessToken,
          hasNewRefreshToken: !!newRefreshToken,
          tokensRotated: newRefreshToken !== refreshToken,
        },
      });

      // Update tokens for subsequent tests
      accessToken = newAccessToken;
      refreshToken = newRefreshToken;
    } else {
      results.push({
        name: testName,
        status: 'FAIL',
        message: 'Token refresh failed',
        duration,
        details: data,
      });
    }
  } catch (error: unknown) {
    results.push({
      name: testName,
      status: 'FAIL',
      message: `Request failed: ${error.message}`,
      duration: error.duration,
    });
  }
}

/**
 * Test 7: Access protected endpoint without token
 */
async function testProtectedEndpointNoAuth() {
  const testName = 'Protected Endpoint - No Auth';

  try {
    const { response, data, duration } = await makeRequest('/api/auth/me', {
      method: 'GET',
    });

    if (response.status === 401) {
      results.push({
        name: testName,
        status: 'PASS',
        message: 'Correctly rejected request without authentication',
        duration,
        details: { error: data.error },
      });
    } else {
      results.push({
        name: testName,
        status: 'FAIL',
        message: 'Should have rejected unauthenticated request',
        duration,
        details: data,
      });
    }
  } catch (error: unknown) {
    results.push({
      name: testName,
      status: 'FAIL',
      message: `Request failed: ${error.message}`,
      duration: error.duration,
    });
  }
}

/**
 * Test 8: Access protected endpoint with invalid token
 */
async function testProtectedEndpointInvalidToken() {
  const testName = 'Protected Endpoint - Invalid Token';

  try {
    const { response, data, duration } = await makeRequest('/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid.token.here',
      },
    });

    if (response.status === 401) {
      results.push({
        name: testName,
        status: 'PASS',
        message: 'Correctly rejected request with invalid token',
        duration,
        details: { error: data.error },
      });
    } else {
      results.push({
        name: testName,
        status: 'FAIL',
        message: 'Should have rejected invalid token',
        duration,
        details: data,
      });
    }
  } catch (error: unknown) {
    results.push({
      name: testName,
      status: 'FAIL',
      message: `Request failed: ${error.message}`,
      duration: error.duration,
    });
  }
}

/**
 * Test 9: Logout functionality
 */
async function testLogout() {
  const testName = 'Logout Functionality';

  if (!accessToken) {
    results.push({
      name: testName,
      status: 'SKIP',
      message: 'No access token available',
    });
    return;
  }

  try {
    const { response, data, duration } = await makeRequest('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        refreshToken,
      }),
    });

    if (response.status === 200 && data.success) {
      results.push({
        name: testName,
        status: 'PASS',
        message: 'Successfully logged out',
        duration,
        details: { message: data.message },
      });
    } else {
      results.push({
        name: testName,
        status: 'FAIL',
        message: 'Logout failed',
        duration,
        details: data,
      });
    }
  } catch (error: unknown) {
    results.push({
      name: testName,
      status: 'FAIL',
      message: `Request failed: ${error.message}`,
      duration: error.duration,
    });
  }
}

/**
 * Test 10: Access after logout
 */
async function testAccessAfterLogout() {
  const testName = 'Access After Logout';

  try {
    const { response, data, duration } = await makeRequest('/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      results.push({
        name: testName,
        status: 'PASS',
        message: 'Correctly blocked access after logout',
        duration,
        details: { error: data.error },
      });
    } else {
      results.push({
        name: testName,
        status: 'FAIL',
        message: 'Should have blocked access with logged-out token',
        duration,
        details: data,
      });
    }
  } catch (error: unknown) {
    results.push({
      name: testName,
      status: 'FAIL',
      message: `Request failed: ${error.message}`,
      duration: error.duration,
    });
  }
}

/**
 * Generate test report
 */
function generateReport(): string {
  const timestamp = new Date().toISOString();
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  const total = results.length;
  const successRate = total > 0 ? ((passed / (total - skipped)) * 100).toFixed(2) : '0';

  let report = `# Admin Authentication Test Report\n\n`;
  report += `**Generated:** ${timestamp}\n`;
  report += `**Test Environment:** ${BASE_URL}\n`;
  report += `**Admin Email:** ${ADMIN_EMAIL}\n\n`;

  report += `## Summary\n\n`;
  report += `- **Total Tests:** ${total}\n`;
  report += `- **Passed:** ${passed} ✅\n`;
  report += `- **Failed:** ${failed} ❌\n`;
  report += `- **Skipped:** ${skipped} ⏭️\n`;
  report += `- **Success Rate:** ${successRate}%\n\n`;

  report += `---\n\n`;
  report += `## Test Results\n\n`;

  results.forEach((result, index) => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
    report += `### ${index + 1}. ${result.name} ${icon}\n\n`;
    report += `- **Status:** ${result.status}\n`;
    report += `- **Message:** ${result.message}\n`;

    if (result.duration !== undefined) {
      report += `- **Duration:** ${result.duration}ms\n`;
    }

    if (result.details) {
      report += `- **Details:**\n\`\`\`json\n${JSON.stringify(result.details, null, 2)}\n\`\`\`\n`;
    }

    report += `\n`;
  });

  report += `---\n\n`;
  report += `## Security Observations\n\n`;

  const observations = [];

  if (results.find(r => r.name === 'Invalid Login Credentials' && r.status === 'PASS')) {
    observations.push('✅ Invalid credentials are correctly rejected');
  }

  if (results.find(r => r.name === 'Rate Limiting on Login' && r.status === 'PASS')) {
    observations.push('✅ Rate limiting is active and working');
  } else {
    observations.push('⚠️ Rate limiting may not be properly configured');
  }

  if (results.find(r => r.name === 'Protected Endpoint - No Auth' && r.status === 'PASS')) {
    observations.push('✅ Protected endpoints require authentication');
  }

  if (results.find(r => r.name === 'Protected Endpoint - Invalid Token' && r.status === 'PASS')) {
    observations.push('✅ Invalid tokens are properly rejected');
  }

  if (results.find(r => r.name === 'Refresh Token Flow' && r.status === 'PASS')) {
    const refreshResult = results.find(r => r.name === 'Refresh Token Flow');
    if (refreshResult?.details?.tokensRotated) {
      observations.push('✅ Refresh tokens are rotated for enhanced security');
    } else {
      observations.push('⚠️ Refresh tokens may not be rotating');
    }
  }

  if (results.find(r => r.name === 'Access After Logout' && r.status === 'PASS')) {
    observations.push('✅ Logged-out tokens are properly invalidated');
  }

  observations.forEach(obs => {
    report += `${obs}\n`;
  });

  report += `\n---\n\n`;
  report += `## Recommendations\n\n`;

  const recommendations = [];

  if (failed > 0) {
    recommendations.push('🔴 **Critical:** Some tests failed. Review the failures above and fix the issues.');
  }

  if (!results.find(r => r.name === 'Rate Limiting on Login' && r.status === 'PASS')) {
    recommendations.push('⚠️ Configure and test rate limiting to prevent brute force attacks');
  }

  if (successRate === '100.00') {
    recommendations.push('✅ All tests passed! Authentication system is working correctly.');
  }

  recommendations.push('🔒 Ensure JWT secrets are rotated regularly in production');
  recommendations.push('🔒 Monitor failed login attempts and implement alerting');
  recommendations.push('🔒 Consider implementing 2FA for admin accounts');
  recommendations.push('🔒 Review and audit access logs regularly');

  recommendations.forEach(rec => {
    report += `${rec}\n`;
  });

  report += `\n---\n\n`;
  report += `## Configuration Verified\n\n`;
  report += `- JWT_SECRET: ${process.env.JWT_SECRET ? 'Configured ✅' : 'Missing ❌'}\n`;
  report += `- REFRESH_TOKEN_SECRET: ${process.env.REFRESH_TOKEN_SECRET ? 'Configured ✅' : 'Missing ❌'}\n`;
  report += `- ADMIN_EMAIL: ${process.env.ADMIN_EMAIL ? 'Configured ✅' : 'Missing ❌'}\n`;
  report += `- ADMIN_PASSWORD: ${process.env.ADMIN_PASSWORD ? 'Configured ✅' : 'Missing ❌'}\n`;
  report += `- DATABASE_URL: ${process.env.DATABASE_URL ? 'Configured ✅' : 'Missing ❌'}\n`;
  report += `- REDIS_URL: ${process.env.REDIS_URL ? 'Configured ✅' : 'Not Configured (using in-memory)'}\n`;

  return report;
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Starting Admin Authentication Tests...\n');
  console.log(`Testing: ${BASE_URL}`);
  console.log(`Admin: ${ADMIN_EMAIL}\n`);

  const tests = [
    { name: 'Valid Admin Login', fn: testValidLogin },
    { name: 'Invalid Login Credentials', fn: testInvalidLogin },
    { name: 'Login with Missing Fields', fn: testMissingFields },
    { name: 'Rate Limiting on Login', fn: testRateLimiting },
    { name: 'JWT Token Validation', fn: testTokenValidation },
    { name: 'Refresh Token Flow', fn: testRefreshToken },
    { name: 'Protected Endpoint - No Auth', fn: testProtectedEndpointNoAuth },
    { name: 'Protected Endpoint - Invalid Token', fn: testProtectedEndpointInvalidToken },
    { name: 'Logout Functionality', fn: testLogout },
    { name: 'Access After Logout', fn: testAccessAfterLogout },
  ];

  for (const test of tests) {
    process.stdout.write(`Running: ${test.name}... `);
    await test.fn();
    const result = results[results.length - 1];
    console.log(result.status === 'PASS' ? '✅' : result.status === 'SKIP' ? '⏭️' : '❌');
  }

  console.log('\n📊 Generating report...\n');
  const report = generateReport();

  // Save report
  const fs = await import('fs/promises');
  const path = await import('path');
  const reportPath = path.resolve(process.cwd(), 'docs/testing/admin-login-tests.md');
  await fs.writeFile(reportPath, report);

  console.log(`✅ Report saved to: ${reportPath}\n`);

  // Print summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;

  console.log('Summary:');
  console.log(`  Passed: ${passed}/${total}`);
  console.log(`  Failed: ${failed}/${total}`);

  if (failed > 0) {
    console.log('\n❌ Some tests failed. Check the report for details.');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
