#!/usr/bin/env tsx
/**
 * Blob Storage Diagnostic Script
 * Tests connectivity and accessibility of audio files in Vercel Blob Storage
 *
 * Usage:
 *   npx tsx scripts/diagnose-blob-storage.ts
 *   npx tsx scripts/diagnose-blob-storage.ts --verbose
 */

import { head, list } from '@vercel/blob';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const VERBOSE = process.argv.includes('--verbose');

interface DiagnosticResult {
  check: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: unknown;
}

const results: DiagnosticResult[] = [];

function log(result: DiagnosticResult) {
  const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
  console.log(`${icon} ${result.check}: ${result.message}`);
  if (VERBOSE && result.details) {
    console.log('   Details:', JSON.stringify(result.details, null, 2));
  }
  results.push(result);
}

async function runDiagnostics() {
  console.log('\n🔍 Blob Storage Diagnostics for Hablas\n');
  console.log('='.repeat(50));

  // Check 1: Environment variable
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    log({
      check: 'BLOB_READ_WRITE_TOKEN',
      status: 'fail',
      message: 'Environment variable not set',
      details: { hint: 'Add BLOB_READ_WRITE_TOKEN to .env.local or Vercel env vars' }
    });
    console.log('\n❌ Cannot continue without token. Exiting.\n');
    process.exit(1);
  } else {
    log({
      check: 'BLOB_READ_WRITE_TOKEN',
      status: 'pass',
      message: `Token found (${token.substring(0, 20)}...)`,
    });
  }

  // Check 2: List blobs
  try {
    console.log('\n📦 Checking blob storage contents...\n');
    const { blobs } = await list({
      token,
      prefix: 'audio/',
    });

    log({
      check: 'Blob Storage Connection',
      status: 'pass',
      message: `Connected successfully`,
    });

    log({
      check: 'Audio Files in Storage',
      status: blobs.length > 0 ? 'pass' : 'warn',
      message: `Found ${blobs.length} files`,
      details: VERBOSE ? blobs.slice(0, 5).map(b => ({ pathname: b.pathname, size: b.size })) : undefined
    });

    // Check 3: Test specific files
    const testFiles = ['resource-1.mp3', 'resource-10.mp3', 'resource-35.mp3'];
    console.log('\n🧪 Testing sample file access...\n');

    for (const filename of testFiles) {
      try {
        const blob = await head(`audio/${filename}`, { token });
        log({
          check: `File: ${filename}`,
          status: 'pass',
          message: `Accessible (${Math.round(blob.size / 1024)} KB)`,
          details: VERBOSE ? { url: blob.url, contentType: blob.contentType } : undefined
        });
      } catch (error) {
        log({
          check: `File: ${filename}`,
          status: 'fail',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Check 4: Test API endpoint simulation
    console.log('\n🌐 Simulating API endpoint behavior...\n');

    const sampleBlob = await head('audio/resource-1.mp3', { token });
    if (sampleBlob.url) {
      log({
        check: 'Blob URL Generation',
        status: 'pass',
        message: 'URLs are being generated correctly',
        details: VERBOSE ? { sampleUrl: sampleBlob.url } : undefined
      });

      // Test URL accessibility
      try {
        const response = await fetch(sampleBlob.url, { method: 'HEAD' });
        log({
          check: 'Blob URL Accessibility',
          status: response.ok ? 'pass' : 'fail',
          message: response.ok ? `URL accessible (${response.status})` : `HTTP ${response.status}`,
        });
      } catch (error) {
        log({
          check: 'Blob URL Accessibility',
          status: 'fail',
          message: error instanceof Error ? error.message : 'Network error',
        });
      }
    }

  } catch (error) {
    log({
      check: 'Blob Storage Connection',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: { error }
    });
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Diagnostic Summary\n');

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warned = results.filter(r => r.status === 'warn').length;

  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⚠️  Warnings: ${warned}`);

  if (failed === 0) {
    console.log('\n🎉 All checks passed! Blob storage is working correctly.\n');
    console.log('If audio still fails in production, verify:');
    console.log('  1. BLOB_READ_WRITE_TOKEN is set in Vercel → Settings → Environment Variables');
    console.log('  2. Redeploy after adding the token');
    console.log('  3. Check browser console for CORS or network errors\n');
  } else {
    console.log('\n⚠️  Some checks failed. Review the errors above.\n');
  }

  // Return exit code
  process.exit(failed > 0 ? 1 : 0);
}

runDiagnostics().catch(error => {
  console.error('Diagnostic script error:', error);
  process.exit(1);
});
