#!/usr/bin/env node
/**
 * Add audioUrl field to all resources that have audio files
 * Scans public/audio/ and updates data/resources.ts
 */

const fs = require('fs');
const path = require('path');

// Get list of audio files
const audioDir = path.join(process.cwd(), 'public', 'audio');
const audioFiles = fs.readdirSync(audioDir)
  .filter(f => f.startsWith('resource-') && f.endsWith('.mp3'))
  .map(f => {
    const match = f.match(/resource-(\d+)\.mp3/);
    return match ? parseInt(match[1]) : null;
  })
  .filter(id => id !== null)
  .sort((a, b) => a - b);

console.log(`\n📂 Found ${audioFiles.length} audio files for resources:`, audioFiles.join(', '));

// Read resources.ts
const resourcesPath = path.join(process.cwd(), 'data', 'resources.ts');
let content = fs.readFileSync(resourcesPath, 'utf8');

let updatedCount = 0;
let alreadyHasCount = 0;

// Process each audio file
audioFiles.forEach(resourceId => {
  const audioUrl = `/audio/resource-${resourceId}.mp3`;

  // Look for this resource's object
  const resourceRegex = new RegExp(
    `(\\{[^}]*"id":\\s*${resourceId},.*?)("offline":\\s*(?:true|false))(.*?)(,?\\s*"contentPath")`,
    'gs'
  );

  const match = content.match(resourceRegex);

  if (match) {
    // Check if audioUrl already exists for this resource
    const hasAudioUrl = match[0].includes('"audioUrl"');

    if (hasAudioUrl) {
      console.log(`  ✓ Resource ${resourceId}: audioUrl already exists`);
      alreadyHasCount++;
    } else {
      // Add audioUrl after offline field
      content = content.replace(
        resourceRegex,
        `$1$2,\n    "audioUrl": "${audioUrl}"$3$4`
      );
      console.log(`  + Resource ${resourceId}: Added audioUrl`);
      updatedCount++;
    }
  } else {
    console.log(`  ⚠ Resource ${resourceId}: Could not find resource object`);
  }
});

// Write updated file
fs.writeFileSync(resourcesPath, content, 'utf8');

console.log(`\n✅ Complete!`);
console.log(`   Added: ${updatedCount} new audioUrl fields`);
console.log(`   Already had: ${alreadyHasCount} audioUrl fields`);
console.log(`   Total resources with audio: ${audioFiles.length}`);
console.log(`\n📝 Updated: ${resourcesPath}`);
