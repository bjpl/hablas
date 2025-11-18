#!/usr/bin/env tsx
/**
 * Upload Audio Files to Vercel Blob Storage
 *
 * This script uploads all audio files from public/audio/ to Vercel Blob Storage.
 * Required for production deployment since public/audio/ is excluded from Vercel.
 *
 * Usage:
 *   tsx scripts/upload-audio-to-blob.ts
 *
 * Environment:
 *   BLOB_READ_WRITE_TOKEN - Required for blob storage access
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { put } from '@vercel/blob';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

interface UploadResult {
  filename: string;
  url: string;
  pathname: string;
  size: number;
  success: boolean;
  error?: string;
}

async function uploadAudioFiles(): Promise<void> {
  console.log('🎵 Audio File Upload to Vercel Blob Storage\n');

  // Check for blob token
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ Error: BLOB_READ_WRITE_TOKEN not found in environment variables');
    console.error('Please set it in .env.local or .env file');
    process.exit(1);
  }

  const audioDir = join(process.cwd(), 'public', 'audio');
  const results: UploadResult[] = [];

  try {
    // Read all files from audio directory
    const files = await readdir(audioDir);
    const audioFiles = files.filter(f => f.endsWith('.mp3') || f.endsWith('.wav') || f.endsWith('.ogg'));

    console.log(`📁 Found ${audioFiles.length} audio files in public/audio/\n`);

    if (audioFiles.length === 0) {
      console.log('✅ No audio files to upload');
      return;
    }

    // Upload each file
    for (const filename of audioFiles) {
      try {
        console.log(`⬆️  Uploading ${filename}...`);

        const filePath = join(audioDir, filename);
        const fileBuffer = await readFile(filePath);

        // Determine content type
        let contentType = 'audio/mpeg';
        if (filename.endsWith('.wav')) contentType = 'audio/wav';
        if (filename.endsWith('.ogg')) contentType = 'audio/ogg';

        // Upload to blob storage
        const blob = await put(`audio/${filename}`, fileBuffer, {
          access: 'public',
          contentType,
          token: process.env.BLOB_READ_WRITE_TOKEN,
          addRandomSuffix: false, // Keep original filename
        });

        results.push({
          filename,
          url: blob.url,
          pathname: blob.pathname,
          size: fileBuffer.length,
          success: true,
        });

        console.log(`   ✅ Uploaded to: ${blob.url}`);
        console.log(`   📊 Size: ${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB`);
        console.log('');
      } catch (error) {
        results.push({
          filename,
          url: '',
          pathname: '',
          size: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        console.log(`   ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.log('');
      }
    }

    // Summary
    console.log('📊 Upload Summary:');
    console.log(`   Total files: ${audioFiles.length}`);
    console.log(`   Successful: ${results.filter(r => r.success).length}`);
    console.log(`   Failed: ${results.filter(r => !r.success).length}`);
    console.log('');

    // Show failures
    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      console.log('❌ Failed uploads:');
      failures.forEach(f => {
        console.log(`   - ${f.filename}: ${f.error}`);
      });
      console.log('');
    }

    // Save results to JSON
    const resultsPath = join(process.cwd(), 'audio-upload-results.json');
    await import('fs/promises').then(fs =>
      fs.writeFile(resultsPath, JSON.stringify(results, null, 2))
    );
    console.log(`💾 Results saved to: ${resultsPath}`);

    console.log('\n✅ Upload complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Verify files in Vercel dashboard: https://vercel.com/storage/blob');
    console.log('   2. Test audio playback on production site');
    console.log('   3. Update resource URLs if needed');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run upload
uploadAudioFiles().catch(console.error);
