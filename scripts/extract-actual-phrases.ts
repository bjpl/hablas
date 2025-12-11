#!/usr/bin/env node
/**
 * Extract ACTUAL phrases from source markdown files for resources 1-37
 * This replaces placeholder audio with real content from generated resources
 */

import * as fs from 'fs';
import * as path from 'path';

// Import resources data
const resourcesPath = path.join(__dirname, '../data/resources.ts');
const resourcesContent = fs.readFileSync(resourcesPath, 'utf-8');

// Extract resource array from TypeScript file
const resourcesMatch = resourcesContent.match(/export const resources: Resource\[\] = (\[[\s\S]*?\]);/);
if (!resourcesMatch) {
  console.error('Could not find resources array');
  process.exit(1);
}

// Parse resources (simplified parsing)
const resourcesText = resourcesMatch[1];
const resources = eval(resourcesText); // Safe since it's our own file

interface PhraseExtraction {
  english: string;
  spanish: string;
  pronunciation?: string;
}

/**
 * Extract phrases from markdown box format:
 * │ **English**: "phrase" │
 * │ 🗣️ **Español**: traducción │
 */
function extractPhrasesFromMarkdown(content: string): PhraseExtraction[] {
  const phrases: PhraseExtraction[] = [];

  // Match box sections with English and Spanish
  const boxPattern = /│\s*\*\*English\*\*:\s*"([^"]+)"\s*│[\s\S]*?│\s*🗣️\s*\*\*Español\*\*:\s*([^\n│]+)/gi;

  let match;
  while ((match = boxPattern.exec(content)) !== null) {
    const english = match[1].trim();
    const spanish = match[2].trim();

    if (english && spanish) {
      phrases.push({
        english,
        spanish
      });
    }
  }

  // Also extract from "Variaciones" sections
  const variationPattern = /-\s*"([^"]+)"\s*=\s*([^=]+)\s*=/g;
  while ((match = variationPattern.exec(content)) !== null) {
    const english = match[1].trim();
    const spanish = match[2].trim();

    if (english && spanish && !english.includes('[') && !spanish.includes('[')) {
      phrases.push({
        english,
        spanish
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
function createAudioScript(phrases: PhraseExtraction[], maxPhrases: number = 20): string {
  const selectedPhrases = phrases.slice(0, maxPhrases);

  const scriptLines: string[] = [];

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

  const report: Array<{
    resourceId: string;
    title: string;
    status: string;
    error?: string;
    sourcePath?: string;
    phrasesExtracted?: number;
    outputFile?: string;
  }> = [];
  let successCount = 0;
  let errorCount = 0;

  // Process resources 1-37
  for (let i = 0; i < 37 && i < resources.length; i++) {
    const resource = resources[i];
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

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`  ❌ Error: ${errorMessage}`);
      errorCount++;
      report.push({
        resourceId,
        title: resource.title,
        status: 'error',
        error: errorMessage
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
    resource5Report.samplePhrases.forEach((p: string, i: number) => {
      console.log(`  ${i + 1}. "${p}"`);
    });
  }
}

main().catch(console.error);
