#!/usr/bin/env node

/**
 * Design System Documentation Sync Script
 *
 * Automatically copies design system files from docs/design-system/
 * to public/docs/design-system/ during the build process.
 *
 * Features:
 * - Creates target directory if it doesn't exist
 * - Copies all files and preserves directory structure
 * - Shows detailed console output of what was synced
 * - Handles errors gracefully
 * - Cleans target directory before copying to avoid stale files
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_DIR = path.join(__dirname, '..', 'docs', 'design-system');
const TARGET_DIR = path.join(__dirname, '..', 'public', 'docs', 'design-system');

/**
 * Recursively copy files and directories
 * @param {string} src - Source directory path
 * @param {string} dest - Destination directory path
 * @returns {Array<string>} - Array of copied files
 */
function copyRecursive(src, dest) {
  const copiedFiles = [];

  try {
    // Check if source exists
    if (!fs.existsSync(src)) {
      console.warn(`⚠️  Source directory not found: ${src}`);
      return copiedFiles;
    }

    // Create destination directory if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
      console.log(`📁 Created directory: ${dest}`);
    }

    // Read source directory
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        // Recursively copy subdirectories
        const subdirFiles = copyRecursive(srcPath, destPath);
        copiedFiles.push(...subdirFiles);
      } else {
        // Copy file
        fs.copyFileSync(srcPath, destPath);
        copiedFiles.push(destPath);

        // Get file size for reporting
        const stats = fs.statSync(srcPath);
        const sizeKB = (stats.size / 1024).toFixed(1);
        console.log(`📄 Copied: ${entry.name} (${sizeKB}KB)`);
      }
    }
  } catch (error) {
    console.error(`❌ Error copying from ${src} to ${dest}:`, error.message);
    throw error;
  }

  return copiedFiles;
}

/**
 * Clean target directory by removing all files
 * @param {string} dir - Directory to clean
 */
function cleanDirectory(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Recursively remove subdirectory
        fs.rmSync(entryPath, { recursive: true, force: true });
      } else {
        // Remove file
        fs.unlinkSync(entryPath);
      }
    }

    console.log(`🧹 Cleaned target directory: ${dir}`);
  } catch (error) {
    console.error(`❌ Error cleaning directory ${dir}:`, error.message);
    throw error;
  }
}

/**
 * Main sync function
 */
function syncDesignSystemDocs() {
  const startTime = Date.now();

  console.log('\n🚀 Starting Design System Documentation Sync');
  console.log('================================================');
  console.log(`📂 Source: ${SOURCE_DIR}`);
  console.log(`📂 Target: ${TARGET_DIR}`);
  console.log('');

  try {
    // Clean target directory first
    if (fs.existsSync(TARGET_DIR)) {
      cleanDirectory(TARGET_DIR);
    }

    // Copy files from source to target
    const copiedFiles = copyRecursive(SOURCE_DIR, TARGET_DIR);

    // Report results
    const duration = Date.now() - startTime;
    console.log('');
    console.log('✅ Sync completed successfully!');
    console.log(`📊 Files synced: ${copiedFiles.length}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log('');

    // List all synced files for verification
    if (copiedFiles.length > 0) {
      console.log('📋 Synced files:');
      copiedFiles.forEach(file => {
        const relativePath = path.relative(TARGET_DIR, file);
        console.log(`   • ${relativePath}`);
      });
      console.log('');
    }

    // Verify target directory structure
    if (fs.existsSync(TARGET_DIR)) {
      const targetFiles = fs.readdirSync(TARGET_DIR);
      console.log('🔍 Target directory contents:');
      targetFiles.forEach(file => {
        const filePath = path.join(TARGET_DIR, file);
        const stats = fs.statSync(filePath);
        const type = stats.isDirectory() ? '📁' : '📄';
        const size = stats.isFile() ? ` (${(stats.size / 1024).toFixed(1)}KB)` : '';
        console.log(`   ${type} ${file}${size}`);
      });
    }

  } catch (error) {
    console.error('\n❌ Sync failed!');
    console.error('Error:', error.message);
    console.error('');
    process.exit(1);
  }

  console.log('================================================');
  console.log('🎉 Design System Documentation Sync Complete\n');
}

// Run the sync if this script is executed directly
if (require.main === module) {
  syncDesignSystemDocs();
}

// Export for potential use by other scripts
module.exports = {
  syncDesignSystemDocs,
  copyRecursive,
  cleanDirectory,
  SOURCE_DIR,
  TARGET_DIR
};