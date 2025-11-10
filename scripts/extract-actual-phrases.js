#!/usr/bin/env node
/**
 * Extract ACTUAL phrases from source markdown files for resources 1-37
 * This replaces placeholder audio with real content from generated resources
 */

const fs = require('fs');
const path = require('path');

// Read and parse resources.ts
const resourcesPath = path.join(__dirname, '../data/resources.ts');
const resourcesContent = fs.readFileSync(resourcesPath, 'utf-8');

// Extract resource objects using a simpler approach
function parseResources(content) {
  const resources = [];

  // Split by resource object boundaries
  const lines = content.split('\n');
  let currentResource = {};
  let inResource = false;

  for (const line of lines) {
    // Start of a resource object
    if (line.trim() === '{') {
      inResource = true;
      currentResource = {};
    }

    // Extract fields
    if (inResource) {
      const idMatch = line.match(/"id":\s*(\d+)/);
      const titleMatch = line.match(/"title":\s*"([^"]+)"/);
      const downloadMatch = line.match(/"downloadUrl":\s*"([^"]+)"/);

      if (idMatch) currentResource.id = parseInt(idMatch[1]);
      if (titleMatch) currentResource.title = titleMatch[1];
      if (downloadMatch) currentResource.downloadUrl = downloadMatch[1];
    }

    // End of resource object
    if (line.trim().startsWith('}')) {
      if (currentResource.id && currentResource.downloadUrl) {
        resources.push({ ...currentResource });
      }
      inResource = false;
      currentResource = {};
    }
  }

  return resources.sort((a, b) => a.id - b.id);
}

const resources = parseResources(resourcesContent);
console.log(`Found ${resources.length} resources\n`);

/**
 * Clean box formatting and normalize phrases
 */
function cleanPhrase(text) {
  return text
    .replace(/[│┌┐└┘─]/g, '') // Remove box characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\s*\|\s*/g, ' ') // Remove any remaining pipe characters
    .replace(/\[item\]/gi, 'item') // Clean placeholder brackets
    .replace(/\[ingredient\]/gi, 'ingredient')
    .replace(/\[Name\]/gi, 'Name')
    .replace(/\[street name\]/gi, 'street')
    .trim();
}

/**
 * Extract phrases from markdown box format:
 * │ **English**: "phrase" │
 * │ 🗣️ **Español**: traducción │
 */
function extractPhrasesFromMarkdown(content) {
  const phrases = [];

  // Match box sections with English and Spanish - improved pattern
  // Matches phrases inside quotes OR after colon
  const boxPattern = /\*\*English\*\*:\s*"([^"]+)"|│\s*\*\*English\*\*:\s*"([^"]+)"/gi;
  const spanishPattern = /🗣️\s*\*\*Español\*\*:\s*([^│\n]+)/gi;

  // Extract all English phrases
  const englishPhrases = [];
  let match;
  while ((match = boxPattern.exec(content)) !== null) {
    const phrase = (match[1] || match[2] || '').trim();
    if (phrase && phrase.length > 5) {
      englishPhrases.push(cleanPhrase(phrase));
    }
  }

  // Extract all Spanish translations
  const spanishPhrases = [];
  while ((match = spanishPattern.exec(content)) !== null) {
    const phrase = match[1].trim();
    if (phrase && phrase.length > 3) {
      spanishPhrases.push(cleanPhrase(phrase));
    }
  }

  // Pair them up (they should be in order)
  const minLength = Math.min(englishPhrases.length, spanishPhrases.length);
  for (let i = 0; i < minLength; i++) {
    phrases.push({
      english: englishPhrases[i],
      spanish: spanishPhrases[i]
    });
  }

  // Also extract from "Variaciones" sections
  const variationPattern = /-\s*"([^"]+)"\s*=\s*([^=]+)\s*=/g;
  while ((match = variationPattern.exec(content)) !== null) {
    const english = match[1].trim();
    const spanish = match[2].trim();

    if (english && spanish && english.length > 5 && !english.includes('[instruction]')) {
      phrases.push({
        english: cleanPhrase(english),
        spanish: cleanPhrase(spanish)
      });
    }
  }

  return phrases;
}

/**
 * Create audio script in the correct format:
 * English phrase
 *
 * English phrase
 *
 * Spanish translation
 *
 *
 */
function createAudioScript(phrases, maxPhrases = 20) {
  const selectedPhrases = phrases.slice(0, maxPhrases);

  const scriptLines = [];

  for (const phrase of selectedPhrases) {
    // English twice, then Spanish, with proper spacing
    scriptLines.push(phrase.english);
    scriptLines.push('');
    scriptLines.push(phrase.english);
    scriptLines.push('');
    scriptLines.push(phrase.spanish);
    scriptLines.push('');
    scriptLines.push('');
  }

  return scriptLines.join('\n');
}

async function main() {
  console.log('Starting phrase extraction for resources 1-37...\n');

  const outputDir = path.join(__dirname, 'final-phrases-only');
  const backupDir = path.join(__dirname, 'final-phrases-only-backup');

  // Create backup
  if (fs.existsSync(outputDir)) {
    console.log('Creating backup of existing phrase files...');
    if (fs.existsSync(backupDir)) {
      fs.rmSync(backupDir, { recursive: true });
    }
    fs.cpSync(outputDir, backupDir, { recursive: true });
    console.log('Backup created at:', backupDir, '\n');
  }

  const report = [];
  let successCount = 0;
  let errorCount = 0;

  // Process resources 1-37
  const targetResources = resources.filter(r => r.id >= 1 && r.id <= 37);

  for (const resource of targetResources) {
    const resourceId = resource.id;

    console.log(`Processing Resource ${resourceId}: ${resource.title}`);

    try {
      // Get the source file path
      let sourcePath = resource.downloadUrl;
      if (sourcePath.startsWith('/generated-resources/')) {
        sourcePath = sourcePath.replace('/generated-resources/', '');
      }

      const fullSourcePath = path.join(__dirname, '../generated-resources', sourcePath);

      if (!fs.existsSync(fullSourcePath)) {
        console.log(`  ❌ Source file not found: ${fullSourcePath}`);
        errorCount++;
        report.push({
          resourceId,
          title: resource.title,
          status: 'error',
          error: 'Source file not found',
          sourcePath: fullSourcePath
        });
        continue;
      }

      const content = fs.readFileSync(fullSourcePath, 'utf-8');
      const phrases = extractPhrasesFromMarkdown(content);

      if (phrases.length === 0) {
        console.log(`  ⚠️  No phrases extracted from ${path.basename(fullSourcePath)}`);
        errorCount++;
        report.push({
          resourceId,
          title: resource.title,
          status: 'warning',
          phrasesFound: 0,
          sourcePath: fullSourcePath
        });
        continue;
      }

      // Create audio script
      const audioScript = createAudioScript(phrases, 20);

      // Write to output file
      const outputPath = path.join(outputDir, `resource-${resourceId}.txt`);
      fs.writeFileSync(outputPath, audioScript, 'utf-8');

      // Sample phrases for report
      const samplePhrases = phrases.slice(0, 3).map(p => p.english);

      console.log(`  ✅ Extracted ${phrases.length} phrases (using first 20)`);
      console.log(`  📝 Sample: "${samplePhrases[0]}"`);

      successCount++;
      report.push({
        resourceId,
        title: resource.title,
        status: 'success',
        phrasesFound: phrases.length,
        phrasesUsed: Math.min(phrases.length, 20),
        samplePhrases: samplePhrases,
        sourcePath: fullSourcePath
      });

    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      errorCount++;
      report.push({
        resourceId,
        title: resource.title,
        status: 'error',
        error: error.message
      });
    }

    console.log('');
  }

  // Write report
  const reportPath = path.join(__dirname, 'phrase-extraction-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  // Summary
  console.log('\n=== EXTRACTION SUMMARY ===');
  console.log(`Total resources processed: ${successCount + errorCount}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Errors/Warnings: ${errorCount}`);
  console.log(`\n📊 Report saved to: ${reportPath}`);
  console.log(`💾 Backup saved to: ${backupDir}`);
  console.log(`\n📁 Output directory: ${outputDir}`);

  // Show sample from Resource 5 (the example mentioned)
  const resource5Report = report.find(r => r.resourceId === 5);
  if (resource5Report && resource5Report.status === 'success') {
    console.log('\n=== RESOURCE 5 VERIFICATION ===');
    console.log('Title:', resource5Report.title);
    console.log('Phrases found:', resource5Report.phrasesFound);
    console.log('Sample phrases:');
    resource5Report.samplePhrases.forEach((p, i) => {
      console.log(`  ${i + 1}. "${p}"`);
    });
  }
}

main().catch(console.error);
