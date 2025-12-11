#!/usr/bin/env tsx
/**
 * JSON Resources Integration Script
 *
 * Converts 25 JSON learning resources into markdown format and generates
 * Resource objects (IDs 35-59) for integration into the app.
 *
 * Features:
 * - Reads all JSON files from data/resources/{avanzado,emergency,app-specific}/
 * - Preserves vocabulary with pronunciation
 * - Includes phrases with context
 * - Maintains cultural notes
 * - Captures practical scenarios
 * - Generates properly formatted markdown
 * - Creates Resource objects with appropriate metadata
 * - Handles errors gracefully with detailed logging
 */

import { promises as fs } from 'fs'
import path from 'path'

// Type definitions matching the JSON structure
interface VocabularyItem {
  english: string
  spanish: string
  pronunciation: string
  context: string
}

interface PhraseItem {
  english: string
  spanish: string
  pronunciation: string
  context: string
  priority?: string
}

interface CulturalNote {
  topic: string
  note: string
  colombianComparison?: string
}

interface PracticalScenario {
  situation: string
  spanishResponse: string
  englishTranslation: string
  tips?: string
}

interface JSONResource {
  id: string
  title: string
  description: string
  level: string
  category: string
  subcategory?: string
  targetAudience?: string
  culturalContext?: string
  vocabulary?: VocabularyItem[]
  criticalVocabulary?: VocabularyItem[]
  phrases?: PhraseItem[]
  emergencyPhrases?: PhraseItem[]
  culturalNotes?: CulturalNote[]
  practicalScenarios?: PracticalScenario[]
  platformVocabulary?: VocabularyItem[]
  commonScenarios?: Array<{ title: string; phrases: PhraseItem[] }>
  callScript911?: { steps: Array<{ step: number; action: string; phrase: string }> }
  stepByStepProtocol?: Array<{ step: number; action: string; phrase?: string; spanish?: string; details?: string }>
  medicalConditionsPhrases?: Array<{ condition: string; phrase: string; spanish: string }> | Record<string, { symptoms?: string; spanish?: string; action?: string }>
  [key: string]: unknown
}

interface Resource {
  id: number
  title: string
  description: string
  type: 'pdf' | 'audio' | 'image' | 'video'
  category: 'all' | 'repartidor' | 'conductor'
  level: 'basico' | 'intermedio' | 'avanzado'
  size: string
  downloadUrl: string
  tags: string[]
  offline: boolean
  contentPath: string
}

// Configuration
const RESOURCES_DIR = path.join(process.cwd(), 'data', 'resources')
const OUTPUT_MD_DIR = path.join(process.cwd(), 'docs', 'resources', 'converted')
const OUTPUT_TS_FILE = path.join(process.cwd(), 'scripts', 'generated-resources-output.ts')
const STARTING_ID = 35

// Category folder mapping
const FOLDER_TO_CATEGORY: Record<string, 'all' | 'repartidor' | 'conductor'> = {
  'avanzado': 'all',
  'emergency': 'all',
  'app-specific': 'all'
}

// Level mapping
const LEVEL_MAP: Record<string, 'basico' | 'intermedio' | 'avanzado'> = {
  'Basico': 'basico',
  'Básico': 'basico',
  'Basic': 'basico',
  'Intermedio': 'intermedio',
  'Intermediate': 'intermedio',
  'Intermediate-Avanzado': 'avanzado',
  'Avanzado': 'avanzado',
  'Advanced': 'avanzado',
  'All Levels': 'intermedio'
}

/**
 * Convert JSON resource to markdown format
 */
function convertToMarkdown(json: JSONResource): string {
  const lines: string[] = []

  // Header
  lines.push(`# ${json.title}`)
  lines.push('')
  lines.push(`**Level:** ${json.level}`)
  lines.push(`**Category:** ${json.category}`)
  if (json.subcategory) lines.push(`**Subcategory:** ${json.subcategory}`)
  if (json.targetAudience) lines.push(`**Target Audience:** ${json.targetAudience}`)
  if (json.culturalContext) lines.push(`**Cultural Context:** ${json.culturalContext}`)
  lines.push('')
  lines.push(`## Description`)
  lines.push('')
  lines.push(json.description)
  lines.push('')

  // Vocabulary Section
  const vocabItems = json.vocabulary || json.criticalVocabulary || json.platformVocabulary
  if (vocabItems && vocabItems.length > 0) {
    lines.push(`## Vocabulary`)
    lines.push('')
    lines.push('| English | Spanish | Pronunciation | Context |')
    lines.push('|---------|---------|---------------|---------|')
    vocabItems.forEach(item => {
      lines.push(`| ${item.english} | ${item.spanish} | *${item.pronunciation}* | ${item.context} |`)
    })
    lines.push('')
  }

  // Phrases Section
  const phraseItems = json.phrases || json.emergencyPhrases
  if (phraseItems && phraseItems.length > 0) {
    lines.push(`## Essential Phrases`)
    lines.push('')
    phraseItems.forEach((phrase, idx) => {
      lines.push(`### ${idx + 1}. ${phrase.english}`)
      lines.push('')
      lines.push(`**Spanish:** ${phrase.spanish}`)
      lines.push('')
      lines.push(`**Pronunciation:** *${phrase.pronunciation}*`)
      lines.push('')
      lines.push(`**Context:** ${phrase.context}`)
      if (phrase.priority) lines.push(`**Priority:** ${phrase.priority}`)
      lines.push('')
    })
  }

  // Cultural Notes
  if (json.culturalNotes && json.culturalNotes.length > 0) {
    lines.push(`## Cultural Notes`)
    lines.push('')
    json.culturalNotes.forEach(note => {
      lines.push(`### ${note.topic}`)
      lines.push('')
      lines.push(note.note)
      lines.push('')
      if (note.colombianComparison) {
        lines.push(`**Colombian Comparison:** ${note.colombianComparison}`)
        lines.push('')
      }
    })
  }

  // Practical Scenarios
  if (json.practicalScenarios && json.practicalScenarios.length > 0) {
    lines.push(`## Practical Scenarios`)
    lines.push('')
    json.practicalScenarios.forEach((scenario, idx) => {
      lines.push(`### Scenario ${idx + 1}: ${scenario.situation}`)
      lines.push('')
      lines.push(`**Spanish Response:**`)
      lines.push(`> ${scenario.spanishResponse}`)
      lines.push('')
      lines.push(`**English Translation:**`)
      lines.push(`> ${scenario.englishTranslation}`)
      lines.push('')
      if (scenario.tips) {
        lines.push(`**Tips:** ${scenario.tips}`)
        lines.push('')
      }
    })
  }

  // Common Scenarios (for app-specific resources)
  if (json.commonScenarios) {
    lines.push(`## Common Scenarios`)
    lines.push('')
    lines.push('This resource includes detailed scenarios for:')
    lines.push('')
    Object.keys(json.commonScenarios).forEach(key => {
      lines.push(`- **${key}**: Comprehensive phrases and tips`)
    })
    lines.push('')
  }

  // 911 Call Script (for emergency resources)
  if (json.callScript911) {
    lines.push(`## Emergency 911 Call Script`)
    lines.push('')
    lines.push('### English:')
    lines.push('')
    json.callScript911.english.forEach((line: string) => {
      lines.push(`- ${line}`)
    })
    lines.push('')
    lines.push('### Spanish:')
    lines.push('')
    json.callScript911.spanish.forEach((line: string) => {
      lines.push(`- ${line}`)
    })
    lines.push('')
  }

  // Step-by-Step Protocol (for emergency resources)
  if (json.stepByStepProtocol) {
    lines.push(`## Step-by-Step Protocol`)
    lines.push('')
    json.stepByStepProtocol.forEach((step) => {
      lines.push(`### Step ${step.step}: ${step.action}`)
      lines.push('')
      if ('spanish' in step && step.spanish) {
        lines.push(`**Spanish:** ${step.spanish}`)
        lines.push('')
      }
      if ('details' in step && step.details) {
        lines.push(`**Details:** ${step.details}`)
        lines.push('')
      }
      if (step.phrase) {
        lines.push(`**Phrase:** ${step.phrase}`)
        lines.push('')
      }
    })
  }

  // Medical Conditions (for medical emergency resources)
  if (json.medicalConditionsPhrases) {
    lines.push(`## Medical Conditions Reference`)
    lines.push('')
    if (Array.isArray(json.medicalConditionsPhrases)) {
      json.medicalConditionsPhrases.forEach((item) => {
        lines.push(`### ${item.condition}`)
        lines.push('')
        lines.push(`**English:** ${item.phrase}`)
        lines.push('')
        lines.push(`**Spanish:** ${item.spanish}`)
        lines.push('')
      })
    } else {
      Object.entries(json.medicalConditionsPhrases).forEach(([condition, data]) => {
        lines.push(`### ${condition.charAt(0).toUpperCase() + condition.slice(1).replace(/([A-Z])/g, ' $1')}`)
        lines.push('')
        if (data && typeof data === 'object') {
          const dataObj = data as Record<string, unknown>;
          if ('symptoms' in dataObj) {
            lines.push(`**Symptoms (English):** ${dataObj.symptoms}`)
            lines.push('')
          }
          if ('spanish' in dataObj) {
            lines.push(`**Síntomas (Español):** ${dataObj.spanish}`)
            lines.push('')
          }
          if ('action' in dataObj) {
            lines.push(`**Action:** ${dataObj.action}`)
            lines.push('')
          }
        }
      })
    }
  }

  // Additional sections from other properties
  Object.entries(json).forEach(([key, value]) => {
    const handledKeys = [
      'id', 'title', 'description', 'level', 'category', 'subcategory',
      'targetAudience', 'culturalContext', 'vocabulary', 'criticalVocabulary',
      'platformVocabulary', 'phrases', 'emergencyPhrases', 'culturalNotes',
      'practicalScenarios', 'commonScenarios', 'callScript911',
      'stepByStepProtocol', 'medicalConditionsPhrases'
    ]

    if (!handledKeys.includes(key) && value && typeof value === 'object' && !Array.isArray(value)) {
      lines.push(`## ${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}`)
      lines.push('')
      lines.push('```json')
      lines.push(JSON.stringify(value, null, 2))
      lines.push('```')
      lines.push('')
    }
  })

  // Footer
  lines.push('---')
  lines.push('')
  lines.push(`*Generated from: ${json.id}*`)
  lines.push(`*Source: JSON Resources Integration Script*`)

  return lines.join('\n')
}

/**
 * Generate tags from JSON content
 */
function generateTags(json: JSONResource, folderName: string): string[] {
  const tags: string[] = []

  // Add category tags
  tags.push(folderName)
  if (json.subcategory) tags.push(json.subcategory)
  if (json.category && json.category !== folderName) tags.push(json.category)

  // Add target audience
  if (json.targetAudience) {
    tags.push(json.targetAudience)
  }

  // Add level
  const level = LEVEL_MAP[json.level] || 'intermedio'
  tags.push(level)

  // Add specific tags based on content
  if (json.emergencyPhrases || json.callScript911) tags.push('emergency', 'safety')
  if (json.platformVocabulary) tags.push('platform-specific')
  if (json.title.toLowerCase().includes('medical')) tags.push('medical', 'health')
  if (json.title.toLowerCase().includes('uber')) tags.push('uber', 'rideshare')
  if (json.title.toLowerCase().includes('lyft')) tags.push('lyft', 'rideshare')
  if (json.title.toLowerCase().includes('doordash')) tags.push('doordash', 'delivery')
  if (json.title.toLowerCase().includes('driver')) tags.push('conductor')
  if (json.title.toLowerCase().includes('delivery')) tags.push('repartidor', 'delivery')
  if (json.title.toLowerCase().includes('professional')) tags.push('professional', 'business')
  if (json.title.toLowerCase().includes('customer')) tags.push('customer-service')
  if (json.title.toLowerCase().includes('conflict')) tags.push('conflict-resolution')
  if (json.title.toLowerCase().includes('negotiation')) tags.push('negotiation')

  // Always add resource type
  tags.push('pdf')

  // Remove duplicates and return
  return [...new Set(tags)]
}

/**
 * Determine category from folder and content
 */
function determineCategory(folderName: string, json: JSONResource): 'all' | 'repartidor' | 'conductor' {
  // Check content for specific indicators
  if (json.targetAudience?.includes('driver') || json.title.toLowerCase().includes('driver')) {
    return 'conductor'
  }
  if (json.targetAudience?.includes('delivery') || json.title.toLowerCase().includes('delivery')) {
    return 'repartidor'
  }

  // Default to folder mapping
  return FOLDER_TO_CATEGORY[folderName] || 'all'
}

/**
 * Process a single JSON file
 */
async function processJSONFile(
  filePath: string,
  folderName: string,
  resourceId: number
): Promise<Resource> {
  try {
    // Read JSON file
    const content = await fs.readFile(filePath, 'utf-8')
    const json: JSONResource = JSON.parse(content)

    // Convert to markdown
    const markdown = convertToMarkdown(json)

    // Generate output filename
    const baseName = path.basename(filePath, '.json')
    const mdFileName = `${baseName}.md`
    const mdFilePath = path.join(OUTPUT_MD_DIR, folderName, mdFileName)

    // Ensure output directory exists
    await fs.mkdir(path.dirname(mdFilePath), { recursive: true })

    // Write markdown file
    await fs.writeFile(mdFilePath, markdown, 'utf-8')

    // Calculate file size
    const stats = await fs.stat(mdFilePath)
    const sizeKB = (stats.size / 1024).toFixed(1)

    // Generate Resource object
    const resource: Resource = {
      id: resourceId,
      title: json.title,
      description: json.description,
      type: 'pdf',
      category: determineCategory(folderName, json),
      level: LEVEL_MAP[json.level] || 'intermedio',
      size: `${sizeKB} KB`,
      downloadUrl: `/docs/resources/converted/${folderName}/${mdFileName}`,
      tags: generateTags(json, folderName),
      offline: true,
      contentPath: mdFilePath
    }

    console.log(`✓ Processed: ${json.title} (ID: ${resourceId})`)
    return resource

  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error)
    throw error
  }
}

/**
 * Main integration function
 */
async function integrateJSONResources(): Promise<void> {
  console.log('Starting JSON Resources Integration...\n')

  try {
    const resources: Resource[] = []
    let currentId = STARTING_ID

    // Process each folder
    const folders = ['avanzado', 'emergency', 'app-specific']

    for (const folderName of folders) {
      const folderPath = path.join(RESOURCES_DIR, folderName)
      console.log(`\nProcessing folder: ${folderName}`)
      console.log('='.repeat(50))

      // Read all JSON files in folder
      const files = await fs.readdir(folderPath)
      const jsonFiles = files.filter(f => f.endsWith('.json'))

      console.log(`Found ${jsonFiles.length} JSON files\n`)

      // Process each file
      for (const fileName of jsonFiles) {
        const filePath = path.join(folderPath, fileName)
        const resource = await processJSONFile(filePath, folderName, currentId)
        resources.push(resource)
        currentId++
      }
    }

    // Generate TypeScript output
    console.log('\n' + '='.repeat(50))
    console.log('Generating TypeScript output...')

    const tsContent = `/**
 * Generated Resources - JSON Integration
 * Auto-generated from JSON learning materials
 * Generated: ${new Date().toISOString()}
 * Total Resources: ${resources.length}
 * IDs: ${STARTING_ID}-${currentId - 1}
 */

export interface Resource {
  id: number
  title: string
  description: string
  type: 'pdf' | 'audio' | 'image' | 'video'
  category: 'all' | 'repartidor' | 'conductor'
  level: 'basico' | 'intermedio' | 'avanzado'
  size: string
  downloadUrl: string
  tags: readonly string[] | string[]
  offline: boolean
  contentPath?: string
}

export const jsonResources: Resource[] = ${JSON.stringify(resources, null, 2)}

// Summary Statistics
export const summary = {
  totalResources: ${resources.length},
  idRange: { start: ${STARTING_ID}, end: ${currentId - 1} },
  byCategory: {
    all: ${resources.filter(r => r.category === 'all').length},
    repartidor: ${resources.filter(r => r.category === 'repartidor').length},
    conductor: ${resources.filter(r => r.category === 'conductor').length}
  },
  byLevel: {
    basico: ${resources.filter(r => r.level === 'basico').length},
    intermedio: ${resources.filter(r => r.level === 'intermedio').length},
    avanzado: ${resources.filter(r => r.level === 'avanzado').length}
  },
  byFolder: {
    avanzado: ${resources.filter(r => r.tags.includes('avanzado')).length},
    emergency: ${resources.filter(r => r.tags.includes('emergency')).length},
    appSpecific: ${resources.filter(r => r.tags.includes('app-specific')).length}
  }
}
`

    await fs.writeFile(OUTPUT_TS_FILE, tsContent, 'utf-8')
    console.log(`✓ TypeScript file generated: ${OUTPUT_TS_FILE}`)

    // Print summary
    console.log('\n' + '='.repeat(50))
    console.log('Integration Complete!')
    console.log('='.repeat(50))
    console.log(`Total resources processed: ${resources.length}`)
    console.log(`ID range: ${STARTING_ID}-${currentId - 1}`)
    console.log(`\nBy category:`)
    console.log(`  - All: ${resources.filter(r => r.category === 'all').length}`)
    console.log(`  - Repartidor: ${resources.filter(r => r.category === 'repartidor').length}`)
    console.log(`  - Conductor: ${resources.filter(r => r.category === 'conductor').length}`)
    console.log(`\nBy level:`)
    console.log(`  - Básico: ${resources.filter(r => r.level === 'basico').length}`)
    console.log(`  - Intermedio: ${resources.filter(r => r.level === 'intermedio').length}`)
    console.log(`  - Avanzado: ${resources.filter(r => r.level === 'avanzado').length}`)
    console.log(`\nMarkdown files: ${OUTPUT_MD_DIR}`)
    console.log(`TypeScript output: ${OUTPUT_TS_FILE}`)
    console.log('\n✓ All files generated successfully!')

  } catch (error) {
    console.error('\n✗ Integration failed:', error)
    process.exit(1)
  }
}

// Run the integration
if (require.main === module) {
  integrateJSONResources()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

export { integrateJSONResources }
