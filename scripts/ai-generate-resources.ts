#!/usr/bin/env tsx
/**
 * AI-Powered Resource Generation Script
 * @fileoverview Batch generate resources using Claude Sonnet 4.5
 *
 * Usage:
 *   npm run ai:generate-all      # Generate complete resource library
 *   npm run ai:generate-topic <topic> <category>
 *   npm run ai:generate-custom <template>
 */

import {
  generateResourceContent,
  generateResourceBatch,
  generateCompleteResourceSet,
  saveGeneratedContent
} from '../lib/ai/resource-content-generator'
import { resources as existingResources } from '../data/resources'
import { ALL_TEMPLATES, getAllTemplatesArray } from '../data/templates/resource-templates'
import { writeFileSync } from 'fs'
import { join } from 'path'

// Color output
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

/**
 * Generate all resources from templates
 */
async function generateAll() {
  log('\n🤖 AI Resource Generation - Complete Library\n', 'bright')
  log('This will generate content for ALL templates using Claude Sonnet 4.5', 'cyan')
  log('Estimated time: 10-15 minutes', 'yellow')
  log('Estimated cost: $2-5 (depends on content length)\n', 'yellow')

  // Get all templates
  const templates = getAllTemplatesArray()
  log(`Found ${templates.length} templates to generate\n`, 'green')

  // Confirm
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...')
  await new Promise(resolve => setTimeout(resolve, 5000))

  log('\n🚀 Starting generation...\n', 'bright')

  // Generate in batches of 5 to avoid rate limits
  const batchSize = 5
  const allResults = []

  for (let i = 0; i < templates.length; i += batchSize) {
    const batch = templates.slice(i, i + batchSize)
    log(`\nBatch ${Math.floor(i / batchSize) + 1}/${Math.ceil(templates.length / batchSize)}`, 'cyan')

    const results = await generateResourceBatch(batch, {
      model: 'claude-sonnet-4-5-20250929',
      temperature: 0.7,
      maxTokens: 8000
    })

    allResults.push(...results)

    // Progress
    const completed = i + batch.length
    const percent = Math.round((completed / templates.length) * 100)
    log(`Progress: ${completed}/${templates.length} (${percent}%)`, 'green')

    // Wait between batches
    if (i + batchSize < templates.length) {
      log('Waiting 5 seconds before next batch...', 'yellow')
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }

  // Summary
  log('\n📊 Generation Summary\n', 'bright')
  const successful = allResults.filter(r => r.validation.isValid).length
  const failed = allResults.length - successful
  const totalWords = allResults.reduce((sum, r) => sum + (r.metadata.wordCount || 0), 0)
  const totalTokens = allResults.reduce((sum, r) => sum + (r.metadata.tokensUsed || 0), 0)

  log(`✅ Successful: ${successful}`, 'green')
  if (failed > 0) {
    log(`❌ Failed: ${failed}`, 'red')
  }
  log(`📝 Total words generated: ${totalWords.toLocaleString()}`, 'cyan')
  log(`🎯 Total tokens used: ${totalTokens.toLocaleString()}`, 'cyan')

  // Save results
  const outputDir = join(process.cwd(), 'generated-resources')
  await saveGeneratedContent(allResults, outputDir)

  log(`\n💾 All content saved to: ${outputDir}`, 'green')
  log('\n✨ Generation complete!', 'bright')
}

/**
 * Generate resources for a specific topic
 */
async function generateTopic(topic: string, category: 'repartidor' | 'conductor' | 'all') {
  log(`\n🤖 Generating complete resource set for: ${topic}\n`, 'bright')

  const results = await generateCompleteResourceSet(topic, category, {
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.7
  })

  // Save
  const outputDir = join(process.cwd(), 'generated-resources', topic.toLowerCase().replace(/\s+/g, '-'))
  await saveGeneratedContent(results, outputDir)

  log(`\n✅ Generated ${results.length} resources for ${topic}`, 'green')
  log(`💾 Saved to: ${outputDir}\n`, 'cyan')
}

/**
 * Generate from specific template
 */
async function generateFromTemplate(templateName: string) {
  log(`\n🤖 Generating content from template: ${templateName}\n`, 'bright')

  // Find template
  const templates = getAllTemplatesArray()
  const template = templates.find(t => t.title?.toLowerCase().includes(templateName.toLowerCase()))

  if (!template) {
    log(`❌ Template not found: ${templateName}`, 'red')
    log('Available templates:', 'yellow')
    templates.forEach(t => log(`  - ${t.title}`, 'cyan'))
    return
  }

  // Generate
  const { content, metadata } = await generateResourceContent(template, {
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.7
  })

  // Save
  const outputDir = join(process.cwd(), 'generated-resources')
  const filename = template.title
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'resource'

  const filepath = join(outputDir, `${filename}.md`)
  writeFileSync(filepath, content, 'utf-8')

  log(`\n✅ Generated successfully!`, 'green')
  log(`📝 Words: ${metadata.wordCount}`, 'cyan')
  log(`🎯 Tokens: ${metadata.tokensUsed}`, 'cyan')
  log(`💾 Saved to: ${filepath}\n`, 'cyan')
}

/**
 * Generate curated essential set (most important resources)
 */
async function generateEssentials() {
  log('\n🤖 Generating Essential Resource Set\n', 'bright')
  log('This will generate 20 most important resources for quick start\n', 'cyan')

  const essentialTemplates = [
    // Delivery - Basic
    ALL_TEMPLATES.delivery.basic_phrases,
    ALL_TEMPLATES.delivery.basic_audio,
    ALL_TEMPLATES.delivery.basic_visual,

    // Delivery - Intermediate
    ALL_TEMPLATES.delivery.intermediate_situations,

    // Rideshare - Basic
    ALL_TEMPLATES.rideshare.basic_greetings,
    ALL_TEMPLATES.rideshare.basic_directions,
    ALL_TEMPLATES.rideshare.basic_audio_navigation,

    // Rideshare - Intermediate
    ALL_TEMPLATES.rideshare.intermediate_smalltalk,
    ALL_TEMPLATES.rideshare.intermediate_problems,

    // Universal - Basic
    ALL_TEMPLATES.universal.basic_greetings_all,
    ALL_TEMPLATES.universal.basic_numbers,
    ALL_TEMPLATES.universal.basic_time,
    ALL_TEMPLATES.universal.basic_app_vocabulary,

    // Universal - Intermediate
    ALL_TEMPLATES.universal.intermediate_customer_service,
    ALL_TEMPLATES.universal.intermediate_complaints,

    // Emergency
    ALL_TEMPLATES.emergency.emergency_phrases,
    ALL_TEMPLATES.emergency.safety_protocols,

    // App-Specific
    ALL_TEMPLATES.appSpecific.uber_guide,
    ALL_TEMPLATES.appSpecific.rappi_guide,
    ALL_TEMPLATES.appSpecific.didi_guide
  ]

  log(`Generating ${essentialTemplates.length} essential resources...\n`, 'green')

  const results = await generateResourceBatch(essentialTemplates, {
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.7
  })

  // Save
  const outputDir = join(process.cwd(), 'generated-resources', 'essentials')
  await saveGeneratedContent(results, outputDir)

  // Summary
  const successful = results.filter(r => r.validation.isValid).length
  log(`\n✅ Generated ${successful}/${results.length} resources`, 'green')
  log(`💾 Saved to: ${outputDir}\n`, 'cyan')
}

/**
 * Generate resources by category
 */
async function generateByCategory(category: 'repartidor' | 'conductor' | 'all') {
  log(`\n🤖 Generating all resources for category: ${category}\n`, 'bright')

  const templates = getAllTemplatesArray().filter(t => t.category === category)
  log(`Found ${templates.length} templates for ${category}\n`, 'green')

  const results = await generateResourceBatch(templates, {
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.7
  })

  // Save
  const outputDir = join(process.cwd(), 'generated-resources', category)
  await saveGeneratedContent(results, outputDir)

  log(`\n✅ Generated ${results.length} resources`, 'green')
  log(`💾 Saved to: ${outputDir}\n`, 'cyan')
}

/**
 * Generate resources by level
 */
async function generateByLevel(level: 'basico' | 'intermedio' | 'avanzado') {
  log(`\n🤖 Generating all ${level} level resources\n`, 'bright')

  const templates = getAllTemplatesArray().filter(t => t.level === level)
  log(`Found ${templates.length} templates at ${level} level\n`, 'green')

  const results = await generateResourceBatch(templates, {
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.7
  })

  // Save
  const outputDir = join(process.cwd(), 'generated-resources', level)
  await saveGeneratedContent(results, outputDir)

  log(`\n✅ Generated ${results.length} resources`, 'green')
  log(`💾 Saved to: ${outputDir}\n`, 'cyan')
}

// Command routing
const command = process.argv[2]
const args = process.argv.slice(3)

async function main() {
  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    log('❌ Error: ANTHROPIC_API_KEY environment variable not set', 'red')
    log('Set it with: export ANTHROPIC_API_KEY=your-key-here', 'yellow')
    process.exit(1)
  }

  try {
    switch (command) {
      case 'all':
        await generateAll()
        break

      case 'essentials':
        await generateEssentials()
        break

      case 'topic':
        if (args.length < 2) {
          log('❌ Usage: npm run ai:generate-topic <topic> <category>', 'red')
          log('Example: npm run ai:generate-topic "Airport Trips" conductor', 'yellow')
          process.exit(1)
        }
        await generateTopic(args[0], args[1] as any)
        break

      case 'template':
        if (args.length < 1) {
          log('❌ Usage: npm run ai:generate-template <template-name>', 'red')
          process.exit(1)
        }
        await generateFromTemplate(args[0])
        break

      case 'category':
        if (args.length < 1 || !['repartidor', 'conductor', 'all'].includes(args[0])) {
          log('❌ Usage: npm run ai:generate-category <repartidor|conductor|all>', 'red')
          process.exit(1)
        }
        await generateByCategory(args[0] as any)
        break

      case 'level':
        if (args.length < 1 || !['basico', 'intermedio', 'avanzado'].includes(args[0])) {
          log('❌ Usage: npm run ai:generate-level <basico|intermedio|avanzado>', 'red')
          process.exit(1)
        }
        await generateByLevel(args[0] as any)
        break

      case 'help':
      default:
        log('\n🤖 AI Resource Generator - Help\n', 'bright')
        log('Available commands:\n', 'cyan')
        log('  all           Generate ALL resources from templates (slow, ~15 min)', 'yellow')
        log('  essentials    Generate 20 most important resources', 'yellow')
        log('  topic         Generate complete set for a topic', 'yellow')
        log('                Usage: npm run ai:generate topic "Topic Name" <category>', 'cyan')
        log('  template      Generate from specific template', 'yellow')
        log('                Usage: npm run ai:generate template <name>', 'cyan')
        log('  category      Generate all resources for a category', 'yellow')
        log('                Usage: npm run ai:generate category <repartidor|conductor|all>', 'cyan')
        log('  level         Generate all resources for a level', 'yellow')
        log('                Usage: npm run ai:generate level <basico|intermedio|avanzado>', 'cyan')
        log('\nExamples:', 'green')
        log('  npm run ai:generate essentials', 'cyan')
        log('  npm run ai:generate topic "Restaurant Delivery" repartidor', 'cyan')
        log('  npm run ai:generate category conductor', 'cyan')
        log('  npm run ai:generate level basico\n', 'cyan')
        break
    }
  } catch (error) {
    log(`\n❌ Error: ${error}`, 'red')
    process.exit(1)
  }
}

main()
