#!/usr/bin/env tsx
/**
 * Regenerate Incomplete Resources
 * Targets only the 22 incomplete resources identified in audit
 * Uses higher token limits to ensure completion
 */

import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Incomplete resources from audit (22 total)
const INCOMPLETE_RESOURCES = {
  all: [
    'basic_app_vocabulary_1-image-spec.md',
    'basic_numbers_1.md',
    'basic_numbers_2.md',
    'basic_time_1.md',
    'emergency_phrases_1.md',
    'intermediate_complaints_1.md',
    'intermediate_customer_service_1.md',
    'safety_protocols_1.md',
  ],
  conductor: [
    'basic_directions_1.md',
    'basic_directions_2.md',
    'basic_directions_3.md',
    'basic_greetings_1.md',
    'basic_greetings_2.md',
    'basic_greetings_3.md',
    'intermediate_problems_1.md',
    'intermediate_smalltalk_1.md',
    'intermediate_smalltalk_2.md',
  ],
  repartidor: [
    'basic_phrases_1.md',
    'basic_phrases_2.md',
    'basic_phrases_3.md',
    'basic_phrases_4.md',
    'intermediate_situations_1.md',
    'intermediate_situations_2.md',
  ],
};

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function regenerateResource(category: string, filename: string, index: number, total: number) {
  console.log(`\n[${index}/${total}] Regenerating: ${category}/${filename}`);

  const sourcePath = join(process.cwd(), 'public/generated-resources/50-batch', category, filename);

  // Read existing incomplete content
  const existingContent = readFileSync(sourcePath, 'utf-8');
  const existingLines = existingContent.split('\n').length;

  console.log(`  Current: ${existingLines} lines (incomplete)`);

  // Determine resource type from filename
  const isImageSpec = filename.includes('image-spec');
  const isAudioScript = filename.includes('audio-script');
  const topic = filename.replace(/-image-spec|-audio-script|-\d+/, '').replace(/_/g, ' ');

  // Create regeneration prompt
  const prompt = `Create a complete, professional Spanish-English learning resource for Colombian gig economy workers (delivery drivers and rideshare drivers).

**Resource Type**: ${isImageSpec ? 'Image specification guide' : isAudioScript ? 'Audio script' : 'Phrase guide with examples'}
**Topic**: ${topic}
**Category**: ${category === 'all' ? 'All workers' : category === 'conductor' ? 'Rideshare drivers' : 'Delivery drivers'}
**Level**: ${filename.includes('intermediate') ? 'Intermediate' : 'Basic'}

**CRITICAL REQUIREMENTS**:
1. **MUST BE COMPLETE** - End with proper closing (└─────┘ for boxes or complete final paragraph)
2. **30 PHRASES MINIMUM** - Include at least 30 practical phrases
3. **STRUCTURED FORMAT** - Use consistent box formatting:
   ┌─────────────────────────────────────────────────────────┐
   │ **English**: "Phrase in English"                         │
   │                                                          │
   │ 🗣️ **Español**: Frase en español                        │
   │ 🔊 **Pronunciación**: [phonetic pronunciation]          │
   │                                                          │
   │ **Usa cuando**: When to use this phrase                 │
   │ **Ejemplo real**: Real-world example scenario          │
   │                                                          │
   │ 💡 **TIP**: Cultural or practical tip                   │
   └─────────────────────────────────────────────────────────┘

4. **INCLUDE**:
   - Table of Contents with all phrases numbered
   - Introduction explaining what they'll learn
   - Examples for each phrase
   - Cultural tips for US customers
   - Pronunciation guides (phonetic, easy to read)
   - Real-world scenarios

5. **FORMAT**: Markdown with box-drawing characters
6. **TONE**: Encouraging, practical, respectful
7. **LENGTH**: 600-800 lines (ensure completeness!)

Generate the COMPLETE resource. Do not truncate. End properly with all content included.`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 16000, // DOUBLED from 8000
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '';
    const newLines = content.split('\n').length;

    console.log(`  Generated: ${newLines} lines`);
    console.log(`  Tokens used: ${message.usage.output_tokens}`);

    // Validate completion
    const isComplete =
      content.includes('└─────') || // Has closing boxes
      content.match(/\n\s*\n---\s*\n\s*$/); // Or ends with proper divider

    if (isComplete) {
      console.log(`  ✅ COMPLETE - Saving...`);

      // Backup original
      const backupPath = sourcePath.replace('.md', '.md.backup');
      writeFileSync(backupPath, existingContent);

      // Save new content
      writeFileSync(sourcePath, content);
      return { success: true, filename, lines: newLines, tokensUsed: message.usage.output_tokens };
    } else {
      console.log(`  ⚠️ STILL INCOMPLETE - Keeping original`);

      // Save to review folder
      const reviewPath = join(process.cwd(), 'generated-resources/review', category, filename);
      mkdirSync(join(process.cwd(), 'generated-resources/review', category), { recursive: true });
      writeFileSync(reviewPath, content);

      return { success: false, filename, lines: newLines, tokensUsed: message.usage.output_tokens };
    }

  } catch (error: any) {
    console.error(`  ❌ ERROR: ${error.message}`);
    return { success: false, filename, error: error.message };
  }
}

async function main() {
  console.log('🔄 Regenerating Incomplete Resources');
  console.log('=====================================\n');
  console.log('Configuration:');
  console.log(`  Model: claude-sonnet-4-5-20250929`);
  console.log(`  Max Tokens: 16000 (doubled from 8000)`);
  console.log(`  Temperature: 0.7`);
  console.log(`  Resources to regenerate: 22\n`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ERROR: ANTHROPIC_API_KEY not found in environment');
    console.error('   Set it in .env or .env.local file');
    process.exit(1);
  }

  console.log('Starting in 5 seconds... (Ctrl+C to cancel)\n');
  await new Promise(resolve => setTimeout(resolve, 5000));

  const results = [];
  let totalIndex = 0;
  const totalCount = Object.values(INCOMPLETE_RESOURCES).flat().length;

  // Regenerate each category
  for (const [category, files] of Object.entries(INCOMPLETE_RESOURCES)) {
    console.log(`\n📂 Category: ${category} (${files.length} resources)`);

    for (const filename of files) {
      totalIndex++;
      const result = await regenerateResource(category, filename, totalIndex, totalCount);
      results.push(result);

      // Wait between requests to avoid rate limits
      if (totalIndex < totalCount) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  // Final Summary
  console.log('\n\n📊 REGENERATION COMPLETE');
  console.log('========================\n');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalTokens = results.reduce((sum, r) => sum + (r.tokensUsed || 0), 0);
  const avgTokens = Math.round(totalTokens / results.length);

  console.log(`✅ Successfully regenerated: ${successful}/${totalCount}`);
  console.log(`⚠️ Still incomplete: ${failed}/${totalCount}`);
  console.log(`📊 Total tokens used: ${totalTokens.toLocaleString()}`);
  console.log(`📊 Average tokens per resource: ${avgTokens.toLocaleString()}`);
  console.log(`💰 Estimated cost: $${((totalTokens / 1000000) * 15).toFixed(2)}`);

  // List successes
  if (successful > 0) {
    console.log('\n✅ Successfully Completed:');
    results.filter(r => r.success).forEach(r => {
      console.log(`   - ${r.filename} (${r.lines} lines)`);
    });
  }

  // List failures
  if (failed > 0) {
    console.log('\n⚠️ Still Incomplete (review in generated-resources/review/):');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.filename}`);
    });
  }

  console.log('\n✅ Done! Check public/generated-resources/50-batch/ for updated files');
  console.log('📋 Backup files saved as .md.backup\n');
}

main().catch(console.error);
