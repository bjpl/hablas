#!/usr/bin/env node
/**
 * Resource Reference Validator
 * Validates all resource references in data/resources.ts
 * Usage: node scripts/validate-resource-references.js
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function checkFileExists(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  return fs.existsSync(fullPath);
}

async function validateResources() {
  log('\n=== Resource Reference Validator ===\n', 'blue');

  // Load resources
  const resourcesPath = path.join(__dirname, '../data/resources.ts');
  const resourcesContent = fs.readFileSync(resourcesPath, 'utf8');

  // Parse resources (basic extraction)
  const resourceMatches = resourcesContent.match(/{\s*"id":\s*\d+,[\s\S]*?}/g) || [];

  let issues = [];
  let warnings = [];

  log(`Found ${resourceMatches.length} resources to validate\n`, 'blue');

  resourceMatches.forEach((resourceText, index) => {
    try {
      // Extract key fields using regex
      const idMatch = resourceText.match(/"id":\s*(\d+)/);
      const downloadUrlMatch = resourceText.match(/"downloadUrl":\s*"([^"]+)"/);
      const audioUrlMatch = resourceText.match(/"audioUrl":\s*"([^"]+)"/);
      const contentPathMatch = resourceText.match(/"contentPath":\s*"([^"]+)"/);

      if (!idMatch) {
        issues.push(`Resource ${index + 1}: Missing ID`);
        return;
      }

      const id = idMatch[1];
      const downloadUrl = downloadUrlMatch?.[1];
      const audioUrl = audioUrlMatch?.[1];
      const contentPath = contentPathMatch?.[1];

      // Check downloadUrl
      if (downloadUrl) {
        // Check for broken /audio-scripts/ references
        if (downloadUrl.includes('/audio-scripts/')) {
          issues.push(`Resource ${id}: downloadUrl references non-existent /audio-scripts/ directory`);
        }

        // Verify file exists (skip external URLs)
        if (downloadUrl.startsWith('/') && !downloadUrl.startsWith('http')) {
          const filePath = downloadUrl.replace(/^\//, '');
          if (!checkFileExists(filePath)) {
            issues.push(`Resource ${id}: downloadUrl file not found: ${downloadUrl}`);
          }
        }
      }

      // Check audioUrl
      if (audioUrl) {
        // Check for broken /audio-scripts/ references
        if (audioUrl.includes('/audio-scripts/')) {
          issues.push(`Resource ${id}: audioUrl references non-existent /audio-scripts/ directory`);
        }

        // Check for .txt files (should be .mp3)
        if (audioUrl.endsWith('.txt')) {
          issues.push(`Resource ${id}: audioUrl points to .txt file, should be .mp3: ${audioUrl}`);
        }

        // Verify audio file exists (skip external URLs)
        if (audioUrl.startsWith('/audio/') && !audioUrl.startsWith('http')) {
          const filePath = audioUrl.replace(/^\//, 'public/');
          if (!checkFileExists(filePath)) {
            warnings.push(`Resource ${id}: Audio file not found (may be pending generation): ${audioUrl}`);
          }
        }
      }

      // Check contentPath (informational only)
      if (contentPath && contentPath.includes('C:\\\\')) {
        // Windows path - informational only
        // Not an error since contentPath is optional metadata
      }

    } catch (error) {
      issues.push(`Resource ${index + 1}: Parse error - ${error.message}`);
    }
  });

  // Report results
  log('\n=== Validation Results ===\n', 'blue');

  if (issues.length === 0) {
    log('✅ No critical issues found!', 'green');
  } else {
    log(`❌ Found ${issues.length} critical issue(s):\n`, 'red');
    issues.forEach(issue => log(`  ${issue}`, 'red'));
  }

  if (warnings.length > 0) {
    log(`\n⚠️  Found ${warnings.length} warning(s):\n`, 'yellow');
    warnings.forEach(warning => log(`  ${warning}`, 'yellow'));
  } else {
    log('\n✅ No warnings', 'green');
  }

  // Summary
  log('\n=== Summary ===', 'blue');
  log(`Total resources: ${resourceMatches.length}`);
  log(`Critical issues: ${issues.length}`);
  log(`Warnings: ${warnings.length}`);

  // Exit code
  const exitCode = issues.length > 0 ? 1 : 0;
  log(`\nExit code: ${exitCode}\n`, exitCode === 0 ? 'green' : 'red');

  process.exit(exitCode);
}

// Run validation
validateResources().catch(error => {
  log(`\n❌ Fatal error: ${error.message}\n`, 'red');
  console.error(error);
  process.exit(1);
});
