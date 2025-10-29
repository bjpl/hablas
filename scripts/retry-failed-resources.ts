#!/usr/bin/env tsx
/**
 * Retry Failed Resources Script
 * Reads report.json, identifies 16 failed resources, and retries generation
 * Generates resources IDs 60-75 (filling gaps from failed batch)
 */

import { config } from 'dotenv'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { generateResourceContent } from '../lib/ai/resource-content-generator'
import { getAllTemplatesArray } from '../data/templates/resource-templates'

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

interface FailedResource {
  number: number
  name: string
  title: string
  success: false
  error: string
}

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

interface Report {
  timestamp: string
  total: number
  successful: number
  failed: number
  avgQuality: number
  totalCost: number
  totalTime: number
  results: Array<GenerationResult | FailedResource>
}

// Template mapping for failed resources (from original script)
const TEMPLATE_MAPPING: Record<string, string> = {
  'intermediate_problems_2': 'intermediate_problems',
  'intermediate_customer_service_2': 'intermediate_customer_service',
  'intermediate_complaints_2': 'intermediate_complaints',
  'intermediate_audio_scenarios_1': 'intermediate_conversations', // Audio type
  'intermediate_weather_traffic_1': 'intermediate_situations',
  'uber_guide_1': 'basic_app_vocabulary', // Image type
  'advanced_professional_1': 'intermediate_customer_service',
  'advanced_video_1': 'intermediate_conversations', // Video type
  'advanced_professional_service_1': 'intermediate_customer_service',
  'advanced_cultural_1': 'intermediate_situations',
  'advanced_video_training_1': 'intermediate_audio_conversations', // Video type
  'advanced_business_english_1': 'intermediate_customer_service',
  'advanced_idioms_slang_1': 'intermediate_situations',
  'advanced_accent_reduction_1': 'basic_audio', // Audio type
  'advanced_video_comprehensive_1': 'intermediate_audio_conversations', // Video type
  'rappi_guide_1': 'basic_app_vocabulary' // Image type
}

// Category mapping based on original resource names
const CATEGORY_MAPPING: Record<string, 'repartidor' | 'conductor' | 'all'> = {
  'intermediate_problems_2': 'conductor',
  'intermediate_customer_service_2': 'all',
  'intermediate_complaints_2': 'all',
  'intermediate_audio_scenarios_1': 'repartidor',
  'intermediate_weather_traffic_1': 'conductor',
  'uber_guide_1': 'conductor',
  'advanced_professional_1': 'all',
  'advanced_video_1': 'all',
  'advanced_professional_service_1': 'all',
  'advanced_cultural_1': 'all',
  'advanced_video_training_1': 'conductor',
  'advanced_business_english_1': 'all',
  'advanced_idioms_slang_1': 'all',
  'advanced_accent_reduction_1': 'all',
  'advanced_video_comprehensive_1': 'all',
  'rappi_guide_1': 'repartidor'
}

// Title mapping for better resource names
const TITLE_MAPPING: Record<string, string> = {
  'intermediate_problems_2': 'Manejo de Situaciones Difíciles - Var 2',
  'intermediate_customer_service_2': 'Servicio al Cliente en Inglés - Var 2',
  'intermediate_complaints_2': 'Manejo de Quejas y Problemas - Var 2',
  'intermediate_audio_scenarios_1': 'Escenarios de Entrega en Audio - Var 1',
  'intermediate_weather_traffic_1': 'Clima y Tráfico - Conversaciones',
  'uber_guide_1': 'Guía Visual: Uber Driver App',
  'advanced_professional_1': 'Comunicación Profesional Avanzada',
  'advanced_video_1': 'Video Tutorial: Excelencia en Servicio',
  'advanced_professional_service_1': 'Servicio Premium al Cliente',
  'advanced_cultural_1': 'Contexto Cultural Estadounidense',
  'advanced_video_training_1': 'Video: Entrenamiento Completo',
  'advanced_business_english_1': 'Inglés Profesional para Conductores',
  'advanced_idioms_slang_1': 'Modismos y Slang Americano',
  'advanced_accent_reduction_1': 'Reducción de Acento - Audio',
  'advanced_video_comprehensive_1': 'Video: Maestría Completa',
  'rappi_guide_1': 'Guía Visual: Rappi App'
}

// Level mapping (most failed were intermediate/advanced)
const LEVEL_MAPPING: Record<string, 'basico' | 'intermedio' | 'avanzado'> = {
  'intermediate_problems_2': 'intermedio',
  'intermediate_customer_service_2': 'intermedio',
  'intermediate_complaints_2': 'intermedio',
  'intermediate_audio_scenarios_1': 'intermedio',
  'intermediate_weather_traffic_1': 'intermedio',
  'uber_guide_1': 'basico',
  'advanced_professional_1': 'avanzado',
  'advanced_video_1': 'avanzado',
  'advanced_professional_service_1': 'avanzado',
  'advanced_cultural_1': 'avanzado',
  'advanced_video_training_1': 'avanzado',
  'advanced_business_english_1': 'avanzado',
  'advanced_idioms_slang_1': 'avanzado',
  'advanced_accent_reduction_1': 'avanzado',
  'advanced_video_comprehensive_1': 'avanzado',
  'rappi_guide_1': 'basico'
}

function getFileExtension(type?: string): string {
  switch (type) {
    case 'pdf': return '.md'
    case 'audio': return '-audio-script.txt'
    case 'image': return '-image-spec.md'
    case 'video': return '-video-script.md'
    default: return '.txt'
  }
}

async function loadReport(): Promise<Report> {
  const reportPath = join(process.cwd(), 'generated-resources', '50-batch', 'report.json')

  if (!existsSync(reportPath)) {
    throw new Error('Report file not found. Please run generate-50-resources.ts first.')
  }

  const reportContent = readFileSync(reportPath, 'utf-8')
  return JSON.parse(reportContent)
}

async function retryFailedResource(
  failedResource: FailedResource,
  newId: number
): Promise<GenerationResult> {
  const allTemplates = getAllTemplatesArray()
  const templateName = TEMPLATE_MAPPING[failedResource.name]

  if (!templateName) {
    throw new Error(`No template mapping found for ${failedResource.name}`)
  }

  log(`\n[${newId - 59}/16] Retrying: ${failedResource.name} (ID: ${newId})`, 'cyan')
  log(`   Original error: ${failedResource.error.substring(0, 100)}...`, 'yellow')
  log(`   Using template: ${templateName}`, 'cyan')

  try {
    // Find template
    const template = allTemplates.find(t =>
      JSON.stringify(t).toLowerCase().includes(templateName.toLowerCase())
    )

    if (!template) {
      throw new Error(`Template ${templateName} not found`)
    }

    // Create custom resource with proper metadata
    const resource = {
      id: newId,
      title: TITLE_MAPPING[failedResource.name] || template.title,
      description: template.description,
      type: template.type,
      category: CATEGORY_MAPPING[failedResource.name] || template.category || 'all',
      level: LEVEL_MAPPING[failedResource.name] || template.level || 'intermedio',
      size: template.size || '2.0 MB',
      tags: template.tags || [],
      offline: true
    }

    log(`   Title: ${resource.title}`, 'yellow')
    log(`   Type: ${resource.type} | Category: ${resource.category} | Level: ${resource.level}`, 'yellow')
    log(`   ⏳ Generating...`, 'yellow')

    const startTime = Date.now()

    // Generate content
    const result = await generateResourceContent(resource, {
      model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929',
      temperature: 0.7,
      maxTokens: 8000
    })

    const duration = (Date.now() - startTime) / 1000
    const estimatedCost = (result.metadata.tokensUsed / 1000000) * 3.0

    // Calculate quality score
    const qualityScore = calculateQualityScore(result.content, resource.type)

    // Save to file
    const outputDir = join(
      process.cwd(),
      'generated-resources',
      '50-batch',
      resource.category || 'general'
    )
    mkdirSync(outputDir, { recursive: true })

    const filename = failedResource.name
    const extension = getFileExtension(resource.type)
    const filepath = join(outputDir, `${filename}${extension}`)

    writeFileSync(filepath, result.content, 'utf-8')

    // Log success
    log(`   ✅ Success!`, 'green')
    log(`      Time: ${duration.toFixed(1)}s | Tokens: ${result.metadata.tokensUsed} | Quality: ${qualityScore}/100`, 'green')
    log(`      Cost: $${estimatedCost.toFixed(4)} | Words: ${result.metadata.wordCount}`, 'green')
    log(`      Saved: ${filepath}`, 'green')

    return {
      number: newId,
      name: failedResource.name,
      title: resource.title,
      success: true,
      qualityScore,
      tokens: result.metadata.tokensUsed,
      cost: estimatedCost,
      time: duration,
      filepath
    }

  } catch (error: any) {
    log(`   ❌ Retry Failed: ${error.message}`, 'red')

    return {
      number: newId,
      name: failedResource.name,
      title: TITLE_MAPPING[failedResource.name] || 'Failed',
      success: false,
      error: `Retry failed: ${error.message}`
    }
  }
}

function calculateQualityScore(content: string, type?: string): number {
  let score = 100
  const wordCount = content.split(/\s+/).length

  // Length checks
  if (type === 'pdf') {
    if (wordCount < 800) score -= 20
    else if (wordCount < 1200) score -= 10
  } else if (type === 'audio' || type === 'video') {
    if (wordCount < 400) score -= 20
    else if (wordCount < 600) score -= 10
  }

  // Content quality checks
  if (!content.includes('English') && !content.includes('español')) score -= 15
  if (!content.includes('pronunciation') && !content.includes('pronunciación')) score -= 10
  if (type === 'pdf' && !content.includes('##')) score -= 10
  if (type === 'audio' && !content.includes('[PAUSE')) score -= 10
  if (type === 'image' && !content.includes('[IMAGE')) score -= 10
  if (type === 'video' && !content.includes('[SCENE')) score -= 10

  return Math.max(60, score)
}

function printSummary(results: GenerationResult[]) {
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  log(`\n${'='.repeat(70)}`, 'magenta')
  log(`🎉 RETRY SUMMARY - 16 FAILED RESOURCES`, 'bright')
  log('='.repeat(70) + '\n', 'magenta')

  log(`✅ Successfully Recovered: ${successful.length}/16`, 'green')
  if (failed.length > 0) {
    log(`❌ Still Failed: ${failed.length}/16`, 'red')
  }

  if (successful.length > 0) {
    const avgQuality = successful.reduce((sum, r) => sum + (r.qualityScore || 0), 0) / successful.length
    const totalTokens = successful.reduce((sum, r) => sum + (r.tokens || 0), 0)
    const totalCost = successful.reduce((sum, r) => sum + (r.cost || 0), 0)
    const totalTime = successful.reduce((sum, r) => sum + (r.time || 0), 0)

    log(`\n📊 Metrics:`, 'cyan')
    log(`   Average Quality Score: ${avgQuality.toFixed(1)}/100`, 'cyan')
    log(`   Total Tokens: ${totalTokens.toLocaleString()}`, 'cyan')
    log(`   Total Cost: $${totalCost.toFixed(4)}`, 'cyan')
    log(`   Total Time: ${(totalTime / 60).toFixed(1)} minutes`, 'cyan')
    log(`   Avg Time per Resource: ${(totalTime / successful.length).toFixed(1)}s`, 'cyan')
  }

  if (failed.length > 0) {
    log(`\n❌ Resources Still Failed:`, 'red')
    failed.forEach(r => {
      log(`   ID ${r.number}: ${r.name} - ${r.error}`, 'red')
    })
  }

  log('')
}

async function updateReport(originalReport: Report, retryResults: GenerationResult[]) {
  // Update original report with retry results
  const updatedResults = originalReport.results.map(result => {
    if (!result.success) {
      // Find matching retry result
      const retry = retryResults.find(r => r.name === result.name)
      if (retry && retry.success) {
        return retry
      }
    }
    return result
  })

  const successful = updatedResults.filter((r): r is GenerationResult => r.success)
  const failed = updatedResults.filter((r): r is FailedResource => !r.success)

  const avgQuality = successful.length > 0
    ? successful.reduce((sum, r) => sum + (r.qualityScore || 0), 0) / successful.length
    : 0

  const totalCost = successful.reduce((sum, r) => sum + (r.cost || 0), 0)
  const totalTime = successful.reduce((sum, r) => sum + (r.time || 0), 0)

  const updatedReport: Report = {
    timestamp: new Date().toISOString(),
    total: 50,
    successful: successful.length,
    failed: failed.length,
    avgQuality,
    totalCost,
    totalTime,
    results: updatedResults
  }

  // Save updated report
  const reportPath = join(process.cwd(), 'generated-resources', '50-batch', 'report.json')
  writeFileSync(reportPath, JSON.stringify(updatedReport, null, 2), 'utf-8')

  log(`\n📄 Updated report saved: ${reportPath}`, 'cyan')
  log(`📊 New Stats: ${successful.length}/50 successful, ${failed.length}/50 failed`, 'cyan')
}

async function main() {
  log('\n' + '='.repeat(70), 'bright')
  log('🔄 RETRYING FAILED RESOURCES (IDs 60-75)', 'bright')
  log('='.repeat(70) + '\n', 'bright')

  if (!process.env.ANTHROPIC_API_KEY) {
    log('❌ Error: ANTHROPIC_API_KEY not found in environment', 'red')
    log('   Please set your API key in .env file', 'red')
    process.exit(1)
  }

  // Load report
  log('📖 Loading report.json...', 'cyan')
  const report = await loadReport()

  // Extract failed resources
  const failedResources = report.results.filter(
    (r): r is FailedResource => !r.success
  )

  log(`📊 Found ${failedResources.length} failed resources`, 'cyan')
  log(`💰 Estimated Cost: $0.40 - $0.60`, 'yellow')
  log(`⏱️  Estimated Time: 10-15 minutes`, 'yellow')
  log(`\n⚠️  Starting retry in 3 seconds... Press Ctrl+C to cancel\n`, 'yellow')

  await new Promise(resolve => setTimeout(resolve, 3000))

  // Retry each failed resource with new IDs 60-75
  const retryResults: GenerationResult[] = []
  let currentId = 60

  for (const failedResource of failedResources) {
    try {
      const result = await retryFailedResource(failedResource, currentId)
      retryResults.push(result)
      currentId++

      // Rate limiting: wait 2 seconds between requests
      if (currentId <= 75) {
        log(`   💤 Waiting 2 seconds (rate limiting)...`, 'yellow')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

    } catch (error: any) {
      log(`   ❌ Critical error: ${error.message}`, 'red')
      retryResults.push({
        number: currentId,
        name: failedResource.name,
        title: 'Failed',
        success: false,
        error: `Critical error: ${error.message}`
      })
      currentId++
    }
  }

  // Print summary
  printSummary(retryResults)

  // Update original report
  log(`\n📝 Updating report.json...`, 'cyan')
  await updateReport(report, retryResults)

  log(`\n🎊 Retry process complete!\n`, 'bright')
  log(`📁 Check generated-resources/50-batch/ for new files`, 'cyan')
  log(`📊 Check report.json for updated statistics\n`, 'cyan')
}

main().catch(error => {
  log(`\n❌ Fatal Error: ${error.message}`, 'red')
  console.error(error)
  process.exit(1)
})
