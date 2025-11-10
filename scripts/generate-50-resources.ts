#!/usr/bin/env tsx
/**
 * Generate 50 Resources Script
 * Strategically generates 50 high-quality resources across all types
 */

import { config } from 'dotenv'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { generateResourceContent } from '../lib/ai/improved-content-generator'
import { validateResources, suggestNextId } from '../lib/utils/resource-validator'
import { getAllTemplatesArray } from '../data/templates/resource-templates'
import { resources as existingResources } from '../data/resources'

config()

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Strategic distribution: 50 resources
const RESOURCE_PLAN = {
  // Batch 1: Delivery Básico (10 resources)
  batch1: [
    'basic_phrases',           // PDF
    'basic_audio',            // Audio
    'basic_visual',           // Image
    'basic_phrases',          // PDF variation
    'intermediate_situations', // PDF (preview)
    'basic_phrases',          // PDF variation
    'basic_audio',            // Audio variation
    'basic_visual',           // Image variation
    'basic_phrases',          // PDF variation
    'basic_audio'             // Audio variation
  ],

  // Batch 2: Rideshare Básico (10 resources)
  batch2: [
    'basic_greetings',             // PDF
    'basic_directions',            // PDF
    'basic_audio_navigation',      // Audio
    'basic_greetings',             // PDF variation
    'basic_directions',            // PDF variation
    'intermediate_smalltalk',      // PDF (preview)
    'basic_greetings',             // PDF variation
    'basic_audio_navigation',      // Audio variation
    'basic_directions',            // PDF variation
    'basic_greetings'              // PDF variation
  ],

  // Batch 3: Universal Básico/Intermedio (10 resources)
  batch3: [
    'basic_greetings_all',           // Audio
    'basic_numbers',                 // PDF
    'basic_time',                    // PDF
    'basic_app_vocabulary',          // Image
    'intermediate_customer_service', // PDF
    'intermediate_complaints',       // PDF
    'emergency_phrases',             // PDF (CRITICAL)
    'basic_greetings_all',           // Audio variation
    'basic_numbers',                 // PDF variation
    'basic_app_vocabulary'           // Image variation
  ],

  // Batch 4: Intermedio Level (10 resources)
  batch4: [
    'intermediate_situations',           // PDF
    'intermediate_conversations',        // Audio
    'intermediate_smalltalk',            // PDF
    'intermediate_audio_conversations',  // Audio
    'intermediate_problems',             // PDF
    'intermediate_customer_service',     // PDF variation
    'intermediate_complaints',           // PDF variation
    'intermediate_audio_scenarios',      // Audio
    'intermediate_weather_traffic',      // PDF
    'intermediate_situations'            // PDF variation
  ],

  // Batch 5: Avanzado Level (10 resources)
  batch5: [
    'advanced_professional',             // PDF
    'advanced_video',                    // Video script
    'advanced_professional_service',     // PDF
    'advanced_cultural',                 // PDF
    'advanced_video_training',           // Video script
    'advanced_business_english',         // PDF
    'advanced_idioms_slang',             // PDF
    'advanced_accent_reduction',         // Audio
    'advanced_video_comprehensive',      // Video script
    'advanced_professional'              // PDF variation
  ]
}

interface GenerationResult {
  batchNumber: number
  resourceNumber: number
  template: string
  title: string
  success: boolean
  qualityScore?: number
  tokens?: number
  cost?: number
  time?: number
  error?: string
  filepath?: string
}

async function generateBatch(
  batchNumber: number,
  templates: string[],
  startId: number
): Promise<GenerationResult[]> {
  const results: GenerationResult[] = []
  const allTemplates = getAllTemplatesArray()

  log(`\n${'='.repeat(70)}`, 'cyan')
  log(`🚀 BATCH ${batchNumber}: Generating ${templates.length} resources`, 'bright')
  log('='.repeat(70) + '\n', 'cyan')

  for (let i = 0; i < templates.length; i++) {
    const templateName = templates[i]
    const resourceNumber = (batchNumber - 1) * 10 + i + 1
    const currentId = startId + i

    log(`\n[${resourceNumber}/50] Generating from template: ${templateName}`, 'cyan')
    log(`   Resource ID: ${currentId}`, 'cyan')

    try {
      // Find template
      const template = allTemplates.find(t =>
        JSON.stringify(t).toLowerCase().includes(templateName.toLowerCase())
      )

      if (!template) {
        throw new Error(`Template ${templateName} not found`)
      }

      const resource = {
        ...template,
        id: currentId,
        // Add variation suffix if duplicate in batch
        title: template.title + (templates.slice(0, i).filter(t => t === templateName).length > 0
          ? ` - Variación ${templates.slice(0, i).filter(t => t === templateName).length + 1}`
          : '')
      }

      log(`   Title: ${resource.title}`, 'yellow')
      log(`   Type: ${resource.type} | Category: ${resource.category} | Level: ${resource.level}`, 'yellow')
      log(`   ⏳ Generating...`, 'yellow')

      const startTime = Date.now()

      // Generate content
      const result = await generateResourceContent(resource, {
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929',
        temperature: 0.7,
        maxTokens: 8000,
        includeExamples: true
      })

      const duration = (Date.now() - startTime) / 1000
      const estimatedCost = (result.metadata.tokensUsed / 1000000) * 3.0

      // Save to file
      const outputDir = join(
        process.cwd(),
        'generated-resources',
        `batch-${batchNumber}`,
        resource.category || 'general'
      )
      mkdirSync(outputDir, { recursive: true })

      const filename = resource.title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `resource-${currentId}`

      const extension = getFileExtension(resource.type)
      const filepath = join(outputDir, `${filename}${extension}`)

      writeFileSync(filepath, result.content, 'utf-8')

      // Log success
      log(`   ✅ Success!`, 'green')
      log(`      Time: ${duration.toFixed(1)}s | Tokens: ${result.metadata.tokensUsed} | Quality: ${result.metadata.qualityScore}/100`, 'green')
      log(`      Cost: $${estimatedCost.toFixed(4)} | Words: ${result.metadata.wordCount}`, 'green')
      log(`      Saved: ${filepath}`, 'green')

      results.push({
        batchNumber,
        resourceNumber,
        template: templateName,
        title: resource.title || 'Untitled',
        success: true,
        qualityScore: result.metadata.qualityScore,
        tokens: result.metadata.tokensUsed,
        cost: estimatedCost,
        time: duration,
        filepath
      })

      // Rate limiting: wait 2 seconds between requests
      if (i < templates.length - 1) {
        log(`   💤 Waiting 2 seconds (rate limiting)...`, 'yellow')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

    } catch (error: any) {
      log(`   ❌ Failed: ${error.message}`, 'red')

      results.push({
        batchNumber,
        resourceNumber,
        template: templateName,
        title: 'Failed',
        success: false,
        error: error.message
      })
    }
  }

  return results
}

function getFileExtension(type?: string): string {
  switch (type) {
    case 'pdf': return '.md'
    case 'audio': return '-script.txt'
    case 'image': return '-spec.md'
    case 'video': return '-script.md'
    default: return '.txt'
  }
}

function printBatchSummary(results: GenerationResult[]) {
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  log(`\n${'='.repeat(70)}`, 'cyan')
  log(`📊 BATCH ${results[0]?.batchNumber} SUMMARY`, 'bright')
  log('='.repeat(70) + '\n', 'cyan')

  log(`✅ Successful: ${successful.length}/${results.length}`, 'green')
  if (failed.length > 0) {
    log(`❌ Failed: ${failed.length}/${results.length}`, 'red')
  }

  if (successful.length > 0) {
    const avgQuality = successful.reduce((sum, r) => sum + (r.qualityScore || 0), 0) / successful.length
    const totalTokens = successful.reduce((sum, r) => sum + (r.tokens || 0), 0)
    const totalCost = successful.reduce((sum, r) => sum + (r.cost || 0), 0)
    const totalTime = successful.reduce((sum, r) => sum + (r.time || 0), 0)

    log(`\n📈 Quality Metrics:`, 'cyan')
    log(`   Average Quality Score: ${avgQuality.toFixed(1)}/100`, 'cyan')
    log(`   Total Tokens: ${totalTokens.toLocaleString()}`, 'cyan')
    log(`   Total Cost: $${totalCost.toFixed(4)}`, 'cyan')
    log(`   Total Time: ${totalTime.toFixed(1)}s (${(totalTime / 60).toFixed(1)} min)`, 'cyan')
    log(`   Avg Time per Resource: ${(totalTime / successful.length).toFixed(1)}s`, 'cyan')
  }

  if (failed.length > 0) {
    log(`\n❌ Failed Resources:`, 'red')
    failed.forEach(r => {
      log(`   ${r.resourceNumber}. ${r.template}: ${r.error}`, 'red')
    })
  }

  log('')
}

async function main() {
  log('\n' + '='.repeat(70), 'bright')
  log('🤖 GENERATING 50 RESOURCES - STRATEGIC BATCH PROCESS', 'bright')
  log('='.repeat(70) + '\n', 'bright')

  if (!process.env.ANTHROPIC_API_KEY) {
    log('❌ Error: ANTHROPIC_API_KEY not found', 'red')
    process.exit(1)
  }

  const startId = suggestNextId(existingResources)
  log(`📝 Starting ID: ${startId}`, 'cyan')
  log(`💰 Estimated Total Cost: $1.50 - $2.00`, 'yellow')
  log(`⏱️  Estimated Total Time: 80-100 minutes`, 'yellow')
  log(`\n⚠️  This will make 50 API calls. Press Ctrl+C to cancel...\n`, 'yellow')

  await new Promise(resolve => setTimeout(resolve, 5000))

  const allResults: GenerationResult[] = []
  let currentId = startId

  // Generate all 5 batches
  for (const [batchKey, templates] of Object.entries(RESOURCE_PLAN)) {
    const batchNum = parseInt(batchKey.replace('batch', ''))
    const results = await generateBatch(batchNum, templates, currentId)
    allResults.push(...results)
    currentId += templates.length

    printBatchSummary(results)

    // Wait between batches
    if (batchNum < 5) {
      log(`\n💤 Waiting 5 seconds before next batch...\n`, 'yellow')
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }

  // Final Summary
  log('\n' + '='.repeat(70), 'magenta')
  log('🎉 FINAL SUMMARY - 50 RESOURCES GENERATED', 'bright')
  log('='.repeat(70) + '\n', 'magenta')

  const successful = allResults.filter(r => r.success)
  const failed = allResults.filter(r => !r.success)

  log(`✅ Total Successful: ${successful.length}/50`, 'green')
  if (failed.length > 0) {
    log(`❌ Total Failed: ${failed.length}/50`, 'red')
  }

  const avgQuality = successful.reduce((sum, r) => sum + (r.qualityScore || 0), 0) / successful.length
  const totalTokens = successful.reduce((sum, r) => sum + (r.tokens || 0), 0)
  const totalCost = successful.reduce((sum, r) => sum + (r.cost || 0), 0)
  const totalTime = successful.reduce((sum, r) => sum + (r.time || 0), 0)

  log(`\n📊 Overall Metrics:`, 'cyan')
  log(`   Average Quality: ${avgQuality.toFixed(1)}/100`, 'cyan')
  log(`   Total Tokens: ${totalTokens.toLocaleString()}`, 'cyan')
  log(`   Total Cost: $${totalCost.toFixed(2)}`, 'cyan')
  log(`   Total Time: ${(totalTime / 60).toFixed(1)} minutes`, 'cyan')

  // Quality distribution
  const excellent = successful.filter(r => (r.qualityScore || 0) >= 85).length
  const good = successful.filter(r => (r.qualityScore || 0) >= 70 && (r.qualityScore || 0) < 85).length
  const acceptable = successful.filter(r => (r.qualityScore || 0) >= 60 && (r.qualityScore || 0) < 70).length
  const poor = successful.filter(r => (r.qualityScore || 0) < 60).length

  log(`\n⭐ Quality Distribution:`, 'cyan')
  log(`   Excellent (85-100): ${excellent}`, 'green')
  log(`   Good (70-84): ${good}`, 'green')
  log(`   Acceptable (60-69): ${acceptable}`, 'yellow')
  log(`   Needs Improvement (<60): ${poor}`, 'red')

  // Save summary report
  const reportPath = join(process.cwd(), 'generated-resources', 'generation-report.json')
  writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalResources: 50,
    successful: successful.length,
    failed: failed.length,
    metrics: {
      avgQuality,
      totalTokens,
      totalCost,
      totalTime: totalTime / 60
    },
    qualityDistribution: { excellent, good, acceptable, poor },
    results: allResults
  }, null, 2))

  log(`\n📄 Detailed report saved: ${reportPath}`, 'cyan')
  log(`\n🎊 Generation complete!\n`, 'bright')
}

main().catch(console.error)
