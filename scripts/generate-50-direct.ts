#!/usr/bin/env tsx
/**
 * Generate 50 Resources - Direct Template Approach
 * Uses actual template objects directly for reliable generation
 */

import { config } from 'dotenv'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { generateResourceContent } from '../lib/ai/improved-content-generator'
import { suggestNextId } from '../lib/utils/resource-validator'
import {
  DELIVERY_TEMPLATES,
  RIDESHARE_TEMPLATES,
  UNIVERSAL_TEMPLATES,
  EMERGENCY_TEMPLATES,
  APP_SPECIFIC_TEMPLATES
} from '../data/templates/resource-templates'
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

// Direct template list with actual objects
const RESOURCE_LIST = [
  // Batch 1: Delivery Básico (10)
  { name: 'basic_phrases_1', template: DELIVERY_TEMPLATES.basic_phrases },
  { name: 'basic_audio_1', template: DELIVERY_TEMPLATES.basic_audio },
  { name: 'basic_visual_1', template: DELIVERY_TEMPLATES.basic_visual },
  { name: 'basic_phrases_2', template: DELIVERY_TEMPLATES.basic_phrases },
  { name: 'intermediate_situations_1', template: DELIVERY_TEMPLATES.intermediate_situations },
  { name: 'basic_phrases_3', template: DELIVERY_TEMPLATES.basic_phrases },
  { name: 'basic_audio_2', template: DELIVERY_TEMPLATES.basic_audio },
  { name: 'basic_visual_2', template: DELIVERY_TEMPLATES.basic_visual },
  { name: 'basic_phrases_4', template: DELIVERY_TEMPLATES.basic_phrases },
  { name: 'intermediate_conversations_1', template: DELIVERY_TEMPLATES.intermediate_conversations },

  // Batch 2: Rideshare Básico (10)
  { name: 'basic_greetings_1', template: RIDESHARE_TEMPLATES.basic_greetings },
  { name: 'basic_directions_1', template: RIDESHARE_TEMPLATES.basic_directions },
  { name: 'basic_audio_navigation_1', template: RIDESHARE_TEMPLATES.basic_audio_navigation },
  { name: 'basic_greetings_2', template: RIDESHARE_TEMPLATES.basic_greetings },
  { name: 'basic_directions_2', template: RIDESHARE_TEMPLATES.basic_directions },
  { name: 'intermediate_smalltalk_1', template: RIDESHARE_TEMPLATES.intermediate_smalltalk },
  { name: 'basic_greetings_3', template: RIDESHARE_TEMPLATES.basic_greetings },
  { name: 'basic_audio_navigation_2', template: RIDESHARE_TEMPLATES.basic_audio_navigation },
  { name: 'basic_directions_3', template: RIDESHARE_TEMPLATES.basic_directions },
  { name: 'intermediate_problems_1', template: RIDESHARE_TEMPLATES.intermediate_problems },

  // Batch 3: Universal Básico/Intermedio (10)
  { name: 'basic_greetings_all_1', template: UNIVERSAL_TEMPLATES.basic_greetings_all },
  { name: 'basic_numbers_1', template: UNIVERSAL_TEMPLATES.basic_numbers },
  { name: 'basic_time_1', template: UNIVERSAL_TEMPLATES.basic_time },
  { name: 'basic_app_vocabulary_1', template: UNIVERSAL_TEMPLATES.basic_app_vocabulary },
  { name: 'intermediate_customer_service_1', template: UNIVERSAL_TEMPLATES.intermediate_customer_service },
  { name: 'intermediate_complaints_1', template: UNIVERSAL_TEMPLATES.intermediate_complaints },
  { name: 'emergency_phrases_1', template: EMERGENCY_TEMPLATES.emergency_phrases },
  { name: 'basic_greetings_all_2', template: UNIVERSAL_TEMPLATES.basic_greetings_all },
  { name: 'basic_numbers_2', template: UNIVERSAL_TEMPLATES.basic_numbers },
  { name: 'safety_protocols_1', template: EMERGENCY_TEMPLATES.safety_protocols },

  // Batch 4: Intermedio Level (10)
  { name: 'intermediate_situations_2', template: DELIVERY_TEMPLATES.intermediate_situations },
  { name: 'intermediate_conversations_2', template: DELIVERY_TEMPLATES.intermediate_conversations },
  { name: 'intermediate_smalltalk_2', template: RIDESHARE_TEMPLATES.intermediate_smalltalk },
  { name: 'intermediate_audio_conversations_1', template: RIDESHARE_TEMPLATES.intermediate_audio_conversations },
  { name: 'intermediate_problems_2', template: RIDESHARE_TEMPLATES.intermediate_problems },
  { name: 'intermediate_customer_service_2', template: UNIVERSAL_TEMPLATES.intermediate_customer_service },
  { name: 'intermediate_complaints_2', template: UNIVERSAL_TEMPLATES.intermediate_complaints },
  { name: 'intermediate_audio_scenarios_1', template: UNIVERSAL_TEMPLATES.intermediate_audio_scenarios },
  { name: 'intermediate_weather_traffic_1', template: UNIVERSAL_TEMPLATES.intermediate_weather_traffic },
  { name: 'uber_guide_1', template: APP_SPECIFIC_TEMPLATES.uber_guide },

  // Batch 5: Avanzado Level (10)
  { name: 'advanced_professional_1', template: DELIVERY_TEMPLATES.advanced_professional },
  { name: 'advanced_video_1', template: DELIVERY_TEMPLATES.advanced_video },
  { name: 'advanced_professional_service_1', template: RIDESHARE_TEMPLATES.advanced_professional_service },
  { name: 'advanced_cultural_1', template: RIDESHARE_TEMPLATES.advanced_cultural },
  { name: 'advanced_video_training_1', template: RIDESHARE_TEMPLATES.advanced_video_training },
  { name: 'advanced_business_english_1', template: UNIVERSAL_TEMPLATES.advanced_business_english },
  { name: 'advanced_idioms_slang_1', template: UNIVERSAL_TEMPLATES.advanced_idioms_slang },
  { name: 'advanced_accent_reduction_1', template: UNIVERSAL_TEMPLATES.advanced_accent_reduction },
  { name: 'advanced_video_comprehensive_1', template: UNIVERSAL_TEMPLATES.advanced_video_comprehensive },
  { name: 'rappi_guide_1', template: APP_SPECIFIC_TEMPLATES.rappi_guide }
]

interface GenerationResult {
  number: number
  name: string
  title: string
  success: boolean
  qualityScore?: number
  tokens?: number
  cost?: number
  time?: number
  error?: string
  filepath?: string
}

async function generate50Resources(): Promise<GenerationResult[]> {
  const results: GenerationResult[] = []
  const startId = suggestNextId(existingResources)

  log('\n' + '='.repeat(70), 'bright')
  log('🤖 GENERATING 50 RESOURCES', 'bright')
  log('='.repeat(70) + '\n', 'bright')

  log(`📝 Starting ID: ${startId}`, 'cyan')
  log(`💰 Estimated Cost: $1.50`, 'yellow')
  log(`⏱️  Estimated Time: 90 minutes`, 'yellow')
  log(`\n⚠️  Press Ctrl+C to cancel...\n`, 'yellow')

  await new Promise(resolve => setTimeout(resolve, 3000))

  for (let i = 0; i < RESOURCE_LIST.length; i++) {
    const { name, template } = RESOURCE_LIST[i]
    const currentId = startId + i
    const progress = i + 1

    log(`\n[${ progress}/50] ${name}`, 'cyan')
    log(`   ID: ${currentId} | Type: ${template.type} | Level: ${template.level}`, 'yellow')

    try {
      const resource = {
        ...template,
        id: currentId,
        title: template.title + (name.match(/_(\d+)$/) ? ` - Var ${name.match(/_(\d+)$/)?.[1]}` : '')
      }

      log(`   Title: ${resource.title}`, 'yellow')
      log(`   ⏳ Generating...`, 'yellow')

      const startTime = Date.now()
      const result = await generateResourceContent(resource, {
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929',
        temperature: 0.7,
        maxTokens: 8000
      })

      const duration = (Date.now() - startTime) / 1000
      const cost = (result.metadata.tokensUsed / 1000000) * 3.0

      // Save
      const outputDir = join(process.cwd(), 'generated-resources', '50-batch', resource.category || 'general')
      mkdirSync(outputDir, { recursive: true })

      const filename = name + getExtension(resource.type)
      const filepath = join(outputDir, filename)
      writeFileSync(filepath, result.content, 'utf-8')

      log(`   ✅ Success! Quality: ${result.metadata.qualityScore}/100 | Cost: $${cost.toFixed(4)} | Time: ${duration.toFixed(1)}s`, 'green')

      results.push({
        number: progress,
        name,
        title: resource.title || '',
        success: true,
        qualityScore: result.metadata.qualityScore,
        tokens: result.metadata.tokensUsed,
        cost,
        time: duration,
        filepath
      })

      // Rate limit
      if (i < RESOURCE_LIST.length - 1) {
        log(`   💤 Waiting 2s...`, 'yellow')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      // Progress checkpoint every 10
      if ((i + 1) % 10 === 0) {
        const successful = results.filter(r => r.success).length
        const avgQuality = results.reduce((sum, r) => sum + (r.qualityScore || 0), 0) / successful
        const totalCost = results.reduce((sum, r) => sum + (r.cost || 0), 0)

        log(`\n${'─'.repeat(70)}`, 'cyan')
        log(`📊 Checkpoint: ${i + 1}/50 complete`, 'bright')
        log(`   Success Rate: ${successful}/${i + 1}`, 'green')
        log(`   Avg Quality: ${avgQuality.toFixed(1)}/100`, 'green')
        log(`   Total Cost: $${totalCost.toFixed(2)}`, 'yellow')
        log('─'.repeat(70) + '\n', 'cyan')
      }

    } catch (error: any) {
      log(`   ❌ Failed: ${error.message}`, 'red')
      results.push({
        number: progress,
        name,
        title: 'Failed',
        success: false,
        error: error.message
      })
    }
  }

  return results
}

function getExtension(type?: string): string {
  switch (type) {
    case 'pdf': return '.md'
    case 'audio': return '-audio-script.txt'
    case 'image': return '-image-spec.md'
    case 'video': return '-video-script.md'
    default: return '.txt'
  }
}

async function main() {
  const results = await generate50Resources()

  // Final Summary
  log('\n' + '='.repeat(70), 'magenta')
  log('🎉 FINAL SUMMARY', 'bright')
  log('='.repeat(70) + '\n', 'magenta')

  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  log(`✅ Successful: ${successful.length}/50`, 'green')
  if (failed.length > 0) {
    log(`❌ Failed: ${failed.length}/50\n`, 'red')
    failed.forEach(r => log(`   ${r.number}. ${r.name}: ${r.error}`, 'red'))
  }

  if (successful.length > 0) {
    const avgQuality = successful.reduce((sum, r) => sum + (r.qualityScore || 0), 0) / successful.length
    const totalTokens = successful.reduce((sum, r) => sum + (r.tokens || 0), 0)
    const totalCost = successful.reduce((sum, r) => sum + (r.cost || 0), 0)
    const totalTime = successful.reduce((sum, r) => sum + (r.time || 0), 0)

    log(`\n📊 Metrics:`, 'cyan')
    log(`   Average Quality: ${avgQuality.toFixed(1)}/100`, 'cyan')
    log(`   Total Tokens: ${totalTokens.toLocaleString()}`, 'cyan')
    log(`   Total Cost: $${totalCost.toFixed(2)}`, 'cyan')
    log(`   Total Time: ${(totalTime / 60).toFixed(1)} minutes`, 'cyan')

    // Save report
    const reportPath = join(process.cwd(), 'generated-resources', '50-batch', 'report.json')
    writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      total: 50,
      successful: successful.length,
      failed: failed.length,
      avgQuality,
      totalCost,
      totalTime: totalTime / 60,
      results
    }, null, 2))

    log(`\n📄 Report: ${reportPath}`, 'cyan')
  }

  log(`\n🎊 Complete!\n`, 'bright')
}

main().catch(console.error)
