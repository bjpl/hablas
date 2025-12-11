/**
 * Performance Testing Suite
 * Comprehensive performance testing for Hablas production deployment
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface PerformanceMetrics {
  timestamp: number;
  testType: string;
  metrics: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    p50: number;
    p95: number;
    p99: number;
  };
  details?: Record<string, unknown>;
}

interface LighthouseResults {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  tti: number; // Time to Interactive
  tbt: number; // Total Blocking Time
  cls: number; // Cumulative Layout Shift
}

class PerformanceTestSuite {
  private baseUrl: string;
  private resultsDir: string;
  private results: PerformanceMetrics[] = [];

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.resultsDir = path.join(process.cwd(), 'docs', 'performance');
  }

  /**
   * Initialize test suite
   */
  async init(): Promise<void> {
    console.log('🚀 Initializing Performance Test Suite...\n');

    // Create results directory
    await fs.mkdir(this.resultsDir, { recursive: true });

    console.log(`Testing: ${this.baseUrl}`);
    console.log(`Results: ${this.resultsDir}\n`);
  }

  /**
   * Test API endpoint performance
   */
  async testApiEndpoint(
    endpoint: string,
    method: string = 'GET',
    body?: Record<string, unknown>,
    iterations: number = 100
  ): Promise<PerformanceMetrics> {
    console.log(`Testing API: ${method} ${endpoint}`);

    const times: number[] = [];
    let errors = 0;

    for (let i = 0; i < iterations; i++) {
      const start = Date.now();

      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
          errors++;
        }
      } catch (error) {
        errors++;
      }

      const duration = Date.now() - start;
      times.push(duration);
    }

    times.sort((a, b) => a - b);

    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      testType: `API-${method}-${endpoint}`,
      metrics: {
        responseTime: times.reduce((a, b) => a + b, 0) / times.length,
        throughput: 1000 / (times.reduce((a, b) => a + b, 0) / times.length),
        errorRate: (errors / iterations) * 100,
        p50: times[Math.floor(times.length * 0.5)],
        p95: times[Math.floor(times.length * 0.95)],
        p99: times[Math.floor(times.length * 0.99)],
      },
    };

    console.log(`  ✓ Avg: ${metrics.metrics.responseTime.toFixed(2)}ms`);
    console.log(`  ✓ P95: ${metrics.metrics.p95}ms`);
    console.log(`  ✓ P99: ${metrics.metrics.p99}ms`);
    console.log(`  ✓ Throughput: ${metrics.metrics.throughput.toFixed(2)} req/s`);
    console.log(`  ✓ Error rate: ${metrics.metrics.errorRate.toFixed(2)}%\n`);

    this.results.push(metrics);
    return metrics;
  }

  /**
   * Test database query performance
   */
  async testDatabaseQueries(): Promise<void> {
    console.log('Testing Database Query Performance...');

    const queries = [
      { name: 'topics-list', endpoint: '/api/topics/list' },
      { name: 'content-list', endpoint: '/api/content/list' },
      { name: 'auth-me', endpoint: '/api/auth/me' },
    ];

    for (const query of queries) {
      await this.testApiEndpoint(query.endpoint, 'GET', undefined, 50);
    }
  }

  /**
   * Test rate limiter performance
   */
  async testRateLimiter(): Promise<void> {
    console.log('Testing Rate Limiter Performance...');

    const endpoint = '/api/topics/list';
    const concurrentRequests = 10;
    const totalRequests = 100;

    const start = Date.now();
    let successful = 0;
    let rateLimited = 0;

    for (let i = 0; i < totalRequests / concurrentRequests; i++) {
      const batch = Array(concurrentRequests).fill(null).map(() =>
        fetch(`${this.baseUrl}${endpoint}`)
          .then(res => {
            if (res.status === 429) {
              rateLimited++;
            } else if (res.ok) {
              successful++;
            }
            return res;
          })
          .catch(() => {})
      );

      await Promise.all(batch);
    }

    const duration = Date.now() - start;

    console.log(`  ✓ Total requests: ${totalRequests}`);
    console.log(`  ✓ Successful: ${successful}`);
    console.log(`  ✓ Rate limited: ${rateLimited}`);
    console.log(`  ✓ Duration: ${duration}ms`);
    console.log(`  ✓ Throughput: ${(totalRequests / duration * 1000).toFixed(2)} req/s\n`);
  }

  /**
   * Run Lighthouse audit
   */
  async runLighthouseAudit(url: string = this.baseUrl): Promise<LighthouseResults | null> {
    console.log('Running Lighthouse Audit...');

    try {
      const outputPath = path.join(this.resultsDir, 'lighthouse-report.json');

      // Run Lighthouse CLI
      await execAsync(
        `npx lighthouse ${url} --output=json --output-path=${outputPath} --chrome-flags="--headless" --quiet`
      );

      // Read and parse results
      const report = JSON.parse(await fs.readFile(outputPath, 'utf-8'));

      const results: LighthouseResults = {
        performance: report.categories.performance.score * 100,
        accessibility: report.categories.accessibility.score * 100,
        bestPractices: report.categories['best-practices'].score * 100,
        seo: report.categories.seo.score * 100,
        fcp: report.audits['first-contentful-paint'].numericValue,
        lcp: report.audits['largest-contentful-paint'].numericValue,
        tti: report.audits['interactive'].numericValue,
        tbt: report.audits['total-blocking-time'].numericValue,
        cls: report.audits['cumulative-layout-shift'].numericValue,
      };

      console.log(`  ✓ Performance: ${results.performance.toFixed(1)}`);
      console.log(`  ✓ Accessibility: ${results.accessibility.toFixed(1)}`);
      console.log(`  ✓ Best Practices: ${results.bestPractices.toFixed(1)}`);
      console.log(`  ✓ SEO: ${results.seo.toFixed(1)}`);
      console.log(`  ✓ FCP: ${results.fcp.toFixed(0)}ms`);
      console.log(`  ✓ LCP: ${results.lcp.toFixed(0)}ms`);
      console.log(`  ✓ TTI: ${results.tti.toFixed(0)}ms`);
      console.log(`  ✓ TBT: ${results.tbt.toFixed(0)}ms`);
      console.log(`  ✓ CLS: ${results.cls.toFixed(3)}\n`);

      return results;
    } catch (error) {
      console.error('Lighthouse audit failed:', error);
      return null;
    }
  }

  /**
   * Generate k6 load test script
   */
  async generateK6Script(): Promise<void> {
    const script = `
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up
    { duration: '1m', target: 50 },   // Sustained load
    { duration: '30s', target: 100 }, // Peak load
    { duration: '1m', target: 50 },   // Scale down
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.1'],
    errors: ['rate<0.1'],
  },
};

const BASE_URL = '${this.baseUrl}';

export default function () {
  // Test homepage
  let res = http.get(BASE_URL);
  check(res, {
    'homepage status 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // Test API endpoints
  res = http.get(\`\${BASE_URL}/api/topics/list\`);
  check(res, {
    'topics list status 200': (r) => r.status === 200,
    'topics list response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  res = http.get(\`\${BASE_URL}/api/content/list\`);
  check(res, {
    'content list status 200': (r) => r.status === 200,
    'content list response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);
}
`;

    const scriptPath = path.join(this.resultsDir, 'load-test.js');
    await fs.writeFile(scriptPath, script.trim());

    console.log(`✓ k6 load test script generated: ${scriptPath}\n`);
  }

  /**
   * Save results to file
   */
  async saveResults(): Promise<void> {
    const resultsPath = path.join(this.resultsDir, `results-${Date.now()}.json`);

    await fs.writeFile(
      resultsPath,
      JSON.stringify(
        {
          timestamp: Date.now(),
          baseUrl: this.baseUrl,
          results: this.results,
        },
        null,
        2
      )
    );

    console.log(`\n✅ Results saved to: ${resultsPath}`);
  }

  /**
   * Generate performance report
   */
  async generateReport(): Promise<void> {
    const report = `
# Performance Test Results
**Generated:** ${new Date().toISOString()}
**Base URL:** ${this.baseUrl}

## Summary

| Metric | Value |
|--------|-------|
${this.results.map(r =>
  `| ${r.testType} | Avg: ${r.metrics.responseTime.toFixed(2)}ms, P95: ${r.metrics.p95}ms |`
).join('\n')}

## Detailed Metrics

${this.results.map(r => `
### ${r.testType}

- **Average Response Time:** ${r.metrics.responseTime.toFixed(2)}ms
- **P50 (Median):** ${r.metrics.p50}ms
- **P95:** ${r.metrics.p95}ms
- **P99:** ${r.metrics.p99}ms
- **Throughput:** ${r.metrics.throughput.toFixed(2)} req/s
- **Error Rate:** ${r.metrics.errorRate.toFixed(2)}%
`).join('\n')}

## Recommendations

### Database Optimization
- Enable connection pooling (current max: 20)
- Implement query result caching
- Add database indexes for frequently queried fields
- Consider read replicas for scaling

### API Performance
- Implement response caching headers
- Enable compression (gzip/brotli)
- Add CDN for static assets
- Optimize payload sizes

### Rate Limiting
- Consider Redis for distributed rate limiting
- Implement sliding window algorithm
- Add rate limit headers for API consumers

### Frontend Performance
- Implement code splitting
- Optimize bundle size
- Add service worker for caching
- Lazy load non-critical components
`;

    const reportPath = path.join(this.resultsDir, 'PERFORMANCE_REPORT.md');
    await fs.writeFile(reportPath, report.trim());

    console.log(`✓ Performance report generated: ${reportPath}\n`);
  }

  /**
   * Run complete test suite
   */
  async runAll(): Promise<void> {
    await this.init();

    // Test API endpoints
    console.log('📊 Running API Performance Tests...\n');
    await this.testDatabaseQueries();

    // Test rate limiter
    console.log('🛡️  Testing Rate Limiter...\n');
    await this.testRateLimiter();

    // Generate k6 script
    console.log('📝 Generating Load Test Script...\n');
    await this.generateK6Script();

    // Run Lighthouse (if possible)
    console.log('🔦 Running Lighthouse Audit...\n');
    await this.runLighthouseAudit();

    // Save results
    await this.saveResults();
    await this.generateReport();

    console.log('\n✅ Performance testing complete!');
    console.log('\n📋 Next steps:');
    console.log('  1. Review the performance report');
    console.log('  2. Run k6 load test: k6 run docs/performance/load-test.js');
    console.log('  3. Implement recommended optimizations');
    console.log('  4. Re-run tests to measure improvements');
  }
}

// Run tests if executed directly
if (require.main === module) {
  const baseUrl = process.env.TEST_URL || 'http://localhost:3000';
  const suite = new PerformanceTestSuite(baseUrl);

  suite.runAll().catch(console.error);
}

export default PerformanceTestSuite;
