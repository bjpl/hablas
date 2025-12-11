#!/usr/bin/env ts-node
/**
 * Redis Verification Script
 * Tests Redis connection and functionality
 *
 * Usage:
 *   npm run verify:redis
 *   ts-node scripts/verify-redis.ts
 */

import { config } from 'dotenv';
import { createClient, RedisClientType } from 'redis';

// Load environment variables
config({ path: '.env.local' });

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration?: number;
}

class RedisVerifier {
  private client: RedisClientType | null = null;
  private results: TestResult[] = [];

  async run(): Promise<void> {
    console.log('🔍 Redis Production Setup Verification\n');
    console.log('=' .repeat(50));

    // Check environment
    await this.checkEnvironment();

    if (!this.results.some(r => !r.passed)) {
      // Only proceed if environment is configured
      await this.testConnection();
      await this.testCommands();
      await this.testRateLimiting();
      await this.testPerformance();
      await this.cleanup();
    }

    // Print summary
    this.printSummary();
  }

  private async checkEnvironment(): Promise<void> {
    console.log('\n📋 Environment Configuration\n');

    const redisUrl = process.env.REDIS_URL;
    const redisHost = process.env.REDIS_HOST;

    if (!redisUrl && !redisHost) {
      this.results.push({
        name: 'Environment Configuration',
        passed: false,
        message: 'REDIS_URL not configured. Please set up Upstash Redis first.',
      });
      console.log('❌ REDIS_URL not found in environment variables');
      console.log('\n📖 Setup Instructions:');
      console.log('   1. Create Upstash account at https://upstash.com');
      console.log('   2. Create a Redis database');
      console.log('   3. Copy the connection URL');
      console.log('   4. Add to .env.local: REDIS_URL=redis://...');
      console.log('   5. For production: Add to Vercel env vars');
      return;
    }

    this.results.push({
      name: 'Environment Configuration',
      passed: true,
      message: 'REDIS_URL configured',
    });

    console.log('✅ REDIS_URL found');
    if (redisUrl) {
      // Mask password in URL for display
      const maskedUrl = redisUrl.replace(/:([^@]+)@/, ':****@');
      console.log(`   URL: ${maskedUrl}`);
    }
  }

  private async testConnection(): Promise<void> {
    console.log('\n🔌 Connection Test\n');

    const start = Date.now();

    try {
      const config = this.getRedisConfig();
      this.client = createClient(config) as RedisClientType;

      // Set up event handlers
      this.client.on('error', (err) => {
        console.error('❌ Redis Client Error:', err.message);
      });

      // Connect with timeout
      await Promise.race([
        this.client.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout (5s)')), 5000)
        ),
      ]);

      const duration = Date.now() - start;

      this.results.push({
        name: 'Connection',
        passed: true,
        message: 'Connected successfully',
        duration,
      });

      console.log(`✅ Connected to Redis (${duration}ms)`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.push({
        name: 'Connection',
        passed: false,
        message: errorMessage,
      });

      console.log(`❌ Connection failed: ${errorMessage}`);
      console.log('\n🔧 Troubleshooting:');
      console.log('   1. Check REDIS_URL format: redis://default:[password]@[endpoint]:6379');
      console.log('   2. Verify Upstash database is active');
      console.log('   3. Check network connectivity');
    }
  }

  private async testCommands(): Promise<void> {
    if (!this.client) return;

    console.log('\n⚙️  Basic Commands Test\n');

    const tests = [
      { name: 'PING', command: () => this.client!.ping() },
      { name: 'SET', command: () => this.client!.set('test:key', 'test-value') },
      { name: 'GET', command: () => this.client!.get('test:key') },
      { name: 'EXISTS', command: () => this.client!.exists('test:key') },
      { name: 'DEL', command: () => this.client!.del('test:key') },
    ];

    for (const test of tests) {
      try {
        const start = Date.now();
        await test.command();
        const duration = Date.now() - start;

        this.results.push({
          name: `Command: ${test.name}`,
          passed: true,
          message: 'Success',
          duration,
        });

        console.log(`✅ ${test.name} (${duration}ms)`);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.results.push({
          name: `Command: ${test.name}`,
          passed: false,
          message: errorMessage,
        });

        console.log(`❌ ${test.name} failed: ${errorMessage}`);
      }
    }
  }

  private async testRateLimiting(): Promise<void> {
    if (!this.client) return;

    console.log('\n🚦 Rate Limiting Test\n');

    const key = 'test:ratelimit:user123';
    const maxAttempts = 5;
    const windowMs = 60000; // 1 minute

    try {
      // Clean up any existing test data
      await this.client.del(key);

      // Simulate rate limit checks
      for (let i = 1; i <= maxAttempts + 2; i++) {
        const count = await this.client.incr(key);

        if (i === 1) {
          // Set expiration on first request
          await this.client.pExpire(key, windowMs);
        }

        const allowed = count <= maxAttempts;
        const remaining = Math.max(0, maxAttempts - count);

        console.log(
          `   Request ${i}: ${allowed ? '✅' : '❌'} Count=${count}, Remaining=${remaining}`
        );

        if (i <= maxAttempts && !allowed) {
          throw new Error('Rate limit triggered too early');
        }
        if (i > maxAttempts && allowed) {
          throw new Error('Rate limit not enforced');
        }
      }

      // Check TTL
      const ttl = await this.client.pTTL(key);
      console.log(`   TTL: ${ttl}ms (${Math.round(ttl / 1000)}s remaining)`);

      // Cleanup
      await this.client.del(key);

      this.results.push({
        name: 'Rate Limiting',
        passed: true,
        message: 'Rate limiting working correctly',
      });

      console.log('✅ Rate limiting test passed');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.push({
        name: 'Rate Limiting',
        passed: false,
        message: errorMessage,
      });

      console.log(`❌ Rate limiting test failed: ${errorMessage}`);
    }
  }

  private async testPerformance(): Promise<void> {
    if (!this.client) return;

    console.log('\n⚡ Performance Test\n');

    const iterations = 100;
    const start = Date.now();

    try {
      // Run multiple operations
      const promises = [];
      for (let i = 0; i < iterations; i++) {
        promises.push(this.client.ping());
      }

      await Promise.all(promises);

      const duration = Date.now() - start;
      const avgLatency = duration / iterations;

      this.results.push({
        name: 'Performance',
        passed: avgLatency < 100, // Should be under 100ms average
        message: `${iterations} operations in ${duration}ms (avg: ${avgLatency.toFixed(2)}ms)`,
        duration,
      });

      console.log(`✅ ${iterations} PING commands in ${duration}ms`);
      console.log(`   Average latency: ${avgLatency.toFixed(2)}ms`);

      if (avgLatency > 100) {
        console.log('⚠️  High latency detected. Consider:');
        console.log('   1. Choosing Upstash region closer to Vercel');
        console.log('   2. Upgrading to Global database for multi-region');
        console.log('   3. Checking network connectivity');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.push({
        name: 'Performance',
        passed: false,
        message: errorMessage,
      });

      console.log(`❌ Performance test failed: ${errorMessage}`);
    }
  }

  private async cleanup(): Promise<void> {
    if (!this.client) return;

    console.log('\n🧹 Cleanup\n');

    try {
      await this.client.quit();
      console.log('✅ Connection closed gracefully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`⚠️  Cleanup warning: ${errorMessage}`);
    }
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(50));
    console.log('\n📊 Test Summary\n');

    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:\n');
      this.results
        .filter((r) => !r.passed)
        .forEach((r) => {
          console.log(`   ${r.name}: ${r.message}`);
        });
    }

    console.log('\n' + '='.repeat(50));

    if (failed === 0) {
      console.log('\n🎉 All tests passed! Redis is ready for production.\n');
      console.log('Next steps:');
      console.log('   1. Deploy to Vercel with REDIS_URL environment variable');
      console.log('   2. Test rate limiting in production');
      console.log('   3. Monitor Redis usage in Upstash dashboard');
      console.log('   4. Set up alerts for high usage or errors');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the errors above.\n');
      process.exit(1);
    }
  }

  private getRedisConfig() {
    const url = process.env.REDIS_URL;

    if (url) {
      return { url };
    }

    // Fallback to individual parameters
    return {
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
      password: process.env.REDIS_PASSWORD,
    };
  }
}

// Run verification
const verifier = new RedisVerifier();
verifier.run().catch((error) => {
  console.error('\n💥 Verification failed:', error);
  process.exit(1);
});
