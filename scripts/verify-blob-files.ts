#!/usr/bin/env tsx
/**
 * Verify Blob Storage Files
 * Check if uploaded audio files are accessible via blob storage
 */

import { head, list } from '@vercel/blob';
import * as dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

interface UploadResult {
  filename: string;
  url: string;
  pathname: string;
  size: number;
  success: boolean;
}

async function verifyBlobFiles() {
  console.log('🔍 Verifying Blob Storage Files\n');

  // Check token
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ BLOB_READ_WRITE_TOKEN not configured');
    process.exit(1);
  }

  try {
    // Read upload results
    const resultsPath = resolve(process.cwd(), 'audio-upload-results.json');
    const resultsData = await readFile(resultsPath, 'utf-8');
    const uploadResults: UploadResult[] = JSON.parse(resultsData);

    console.log(`📦 Found ${uploadResults.length} uploaded files in results\n`);

    // List all blobs in storage
    console.log('📋 Listing all blobs in storage...\n');
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      prefix: 'audio/',
    });

    console.log(`✅ Found ${blobs.length} files in blob storage\n`);

    // Verify a few sample files
    console.log('🧪 Testing sample files:\n');
    const samplesToTest = ['resource-1.mp3', 'resource-10.mp3', 'resource-35.mp3'];

    for (const filename of samplesToTest) {
      try {
        const pathname = `audio/${filename}`;
        const blob = await head(pathname, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        console.log(`✅ ${filename}`);
        console.log(`   URL: ${blob.url}`);
        console.log(`   Size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Type: ${blob.contentType}\n`);
      } catch {
        console.log(`❌ ${filename} - Not found or error\n`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   Uploaded: ${uploadResults.length} files`);
    console.log(`   In Storage: ${blobs.length} files`);
    console.log(`   Status: ${blobs.length === uploadResults.length ? '✅ All files present' : '⚠️  Mismatch detected'}`);
    console.log('='.repeat(60));

    console.log('\n✅ Verification complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test audio playback on production site');
    console.log('   2. Verify /api/audio/[id] endpoint resolves blob URLs');
    console.log('   3. Check that resources with audioUrl fields play correctly');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifyBlobFiles();
