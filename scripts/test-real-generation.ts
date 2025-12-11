#!/usr/bin/env tsx
/**
 * Real API Test - Single Resource Generation
 * Tests actual Claude Sonnet 4.5 generation with one resource
 */

import { config } from 'dotenv'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { generateResourceContent } from '../lib/ai/improved-content-generator'
import { validateResource, formatValidationResult } from '../lib/utils/resource-validator'
import { DELIVERY_TEMPLATES } from '../data/templates/resource-templates'

// Load environment variables
config()

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function testRealGeneration() {
  log('\n🤖 Real API Test - Single Resource Generation\n', 'bright')

  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    log('❌ Error: ANTHROPIC_API_KEY not found in environment', 'red')
    log('Make sure .env file exists with your API key\n', 'yellow')
    process.exit(1)
  }

  log('✅ API key found', 'green')
  log(`📝 Model: ${process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929'}`, 'cyan')
  log('\n' + '─'.repeat(60) + '\n')

  // Test with basic delivery phrases (PDF)
  const testResource = {
    ...DELIVERY_TEMPLATES.basic_phrases,
    id: 1 // Fix ID for validation
  }

  log('📄 Generating: ' + testResource.title, 'cyan')
  log(`   Type: ${testResource.type}`, 'cyan')
  log(`   Category: ${testResource.category}`, 'cyan')
  log(`   Level: ${testResource.level}`, 'cyan')
  log('\n⏳ Calling Claude Sonnet 4.5...\n', 'yellow')

  const startTime = Date.now()

  try {
    // Generate content
    const result = await generateResourceContent(testResource, {
      model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929',
      temperature: 0.7,
      maxTokens: 8000,
      includeExamples: true
    })

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)

    log('✅ Generation Complete!\n', 'green')
    log('📊 Metadata:', 'bright')
    log(`   ⏱️  Time: ${duration} seconds`, 'cyan')
    log(`   🎯 Tokens: ${result.metadata.tokensUsed.toLocaleString()}`, 'cyan')
    log(`   📝 Words: ${result.metadata.wordCount.toLocaleString()}`, 'cyan')
    log(`   ⭐ Quality Score: ${result.metadata.qualityScore}/100`, 'cyan')
    log('')

    // Cost estimation
    const estimatedCost = (result.metadata.tokensUsed / 1000000) * 3.0 // $3 per 1M tokens
    log(`   💰 Estimated Cost: $${estimatedCost.toFixed(4)}`, 'yellow')
    log('\n' + '─'.repeat(60) + '\n')

    // Validate
    log('🔍 Validating content...\n', 'bright')
    const validation = validateResource(testResource)
    console.log(formatValidationResult(validation))
    log('')

    // Quality assessment
    if (result.metadata.qualityScore >= 90) {
      log('🌟 Excellent quality!', 'green')
    } else if (result.metadata.qualityScore >= 75) {
      log('✅ Good quality', 'green')
    } else if (result.metadata.qualityScore >= 60) {
      log('⚠️  Acceptable quality', 'yellow')
    } else {
      log('❌ Quality needs improvement', 'red')
    }

    log('\n' + '─'.repeat(60) + '\n')

    // Preview content
    log('📄 Content Preview (first 1000 characters):\n', 'bright')
    console.log(result.content.substring(0, 1000))
    log('\n... [truncated]', 'cyan')
    log(`\nFull content: ${result.content.length} characters\n`, 'cyan')
    log('─'.repeat(60) + '\n')

    // Save to file
    const outputDir = join(process.cwd(), 'generated-resources', 'test')
    mkdirSync(outputDir, { recursive: true })

    const filename = 'frases-esenciales-entregas.md'
    const filepath = join(outputDir, filename)
    writeFileSync(filepath, result.content, 'utf-8')

    log('💾 Content saved to:', 'green')
    log(`   ${filepath}\n`, 'cyan')

    // Analysis
    log('📊 Content Analysis:\n', 'bright')

    const hasSpanish = /[áéíóúñ]/.test(result.content)
    const hasPronunciation = /\[.*\]/.test(result.content)
    const hasBoxes = result.content.includes('┌') || result.content.includes('│')
    const hasTables = result.content.includes('|')
    const hasEmojis = /[🗣️🔊💡✅⚠️]/.test(result.content)
    const headingCount = (result.content.match(/^#{1,3}\s/gm) || []).length

    log(`   ${hasSpanish ? '✅' : '❌'} Spanish characters present`, hasSpanish ? 'green' : 'red')
    log(`   ${hasPronunciation ? '✅' : '❌'} Pronunciation guides`, hasPronunciation ? 'green' : 'red')
    log(`   ${hasBoxes ? '✅' : '❌'} Formatted boxes`, hasBoxes ? 'green' : 'red')
    log(`   ${hasTables ? '✅' : '❌'} Tables included`, hasTables ? 'green' : 'red')
    log(`   ${hasEmojis ? '✅' : '❌'} Visual emojis`, hasEmojis ? 'green' : 'red')
    log(`   ${headingCount >= 5 ? '✅' : '❌'} Structure (${headingCount} headings)`, headingCount >= 5 ? 'green' : 'yellow')

    log('\n' + '─'.repeat(60) + '\n')

    // Recommendations
    log('💡 Next Steps:\n', 'bright')

    if (result.metadata.qualityScore >= 85 && validation.isValid) {
      log('✅ Quality is excellent! Ready to scale up:', 'green')
      log('   1. Review the generated content above', 'cyan')
      log('   2. If satisfied, run: npm run ai:generate-essentials', 'cyan')
      log('   3. Or generate by category: npm run ai:generate-category repartidor', 'cyan')
    } else if (result.metadata.qualityScore >= 70) {
      log('⚠️  Quality is acceptable but could improve:', 'yellow')
      log('   1. Review content for issues', 'cyan')
      log('   2. Adjust prompts in improved-content-generator.ts if needed', 'cyan')
      log('   3. Test again before scaling up', 'cyan')
    } else {
      log('❌ Quality needs improvement:', 'red')
      log('   1. Review generated content carefully', 'cyan')
      log('   2. Check what\'s missing or wrong', 'cyan')
      log('   3. Adjust prompts before continuing', 'cyan')
    }

    log('\n🎉 Test complete!\n', 'bright')

  } catch (error: unknown) {
    const err = error as { message?: string };
    const errorMessage = err.message || String(error);
    log('\n❌ Generation failed!\n', 'red')
    log('Error details:', 'red')
    console.error(errorMessage)

    if (errorMessage.includes('Invalid API key')) {
      log('\n💡 Check your .env file and make sure ANTHROPIC_API_KEY is correct\n', 'yellow')
    } else if (errorMessage.includes('Rate limit')) {
      log('\n💡 Wait a moment and try again\n', 'yellow')
    }

    process.exit(1)
  }
}

// Run test
testRealGeneration()
