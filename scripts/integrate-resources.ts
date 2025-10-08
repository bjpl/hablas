#!/usr/bin/env tsx
/**
 * Resource Integration Script
 * Parses generated AI resources and creates Resource objects for the app
 */

import { readFileSync, writeFileSync, statSync } from 'fs'
import { join, basename, dirname } from 'path'

interface GeneratedResource {
  number: number
  name: string
  title: string
  success: boolean
  qualityScore?: number
  filepath?: string
  error?: string
}

interface Report {
  timestamp: string
  total: number
  successful: number
  failed: number
  avgQuality: number
  totalCost: number
  results: GeneratedResource[]
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
  contentPath?: string // Path to the actual content file
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function determineResourceType(filepath: string): 'pdf' | 'audio' | 'image' | 'video' {
  const filename = basename(filepath).toLowerCase()

  if (filename.includes('-audio-script')) return 'audio'
  if (filename.includes('-image-spec')) return 'image'
  if (filename.includes('-video-spec')) return 'video'

  // Default: markdown files are PDF-type content
  return 'pdf'
}

function determineCategoryFromPath(filepath: string): 'all' | 'repartidor' | 'conductor' {
  if (filepath.includes('/repartidor/') || filepath.includes('\\repartidor\\')) {
    return 'repartidor'
  }
  if (filepath.includes('/conductor/') || filepath.includes('\\conductor\\')) {
    return 'conductor'
  }
  return 'all'
}

function extractLevelFromContent(filepath: string): 'basico' | 'intermedio' | 'avanzado' {
  try {
    const content = readFileSync(filepath, 'utf-8')
    const firstLines = content.slice(0, 500).toLowerCase()

    if (firstLines.includes('**nivel**: básico') || firstLines.includes('nivel**: basico')) {
      return 'basico'
    }
    if (firstLines.includes('**nivel**: intermedio')) {
      return 'intermedio'
    }
    if (firstLines.includes('**nivel**: avanzado')) {
      return 'avanzado'
    }

    // Default to basico if not specified
    return 'basico'
  } catch (error) {
    return 'basico'
  }
}

function generateDescription(title: string, type: string, category: string): string {
  const typeDescriptions = {
    pdf: 'Guía completa con frases prácticas y ejemplos',
    audio: 'Audio de pronunciación con ejemplos hablados',
    image: 'Guía visual con capturas de pantalla anotadas',
    video: 'Video tutorial con situaciones reales'
  }

  const categoryDescriptions = {
    repartidor: 'para repartidores',
    conductor: 'para conductores',
    all: 'para todos los trabajadores'
  }

  return `${typeDescriptions[type as keyof typeof typeDescriptions]} ${categoryDescriptions[category as keyof typeof categoryDescriptions]}`
}

function generateTags(title: string, type: string, category: string, level: string): string[] {
  const tags: string[] = []

  // Add category tags
  if (category === 'repartidor') {
    tags.push('entregas', 'delivery', 'rappi')
  } else if (category === 'conductor') {
    tags.push('uber', 'didi', 'pasajeros', 'rideshare')
  }

  // Add content type tags
  if (title.toLowerCase().includes('salud')) tags.push('greetings')
  if (title.toLowerCase().includes('direc')) tags.push('direcciones', 'navigation')
  if (title.toLowerCase().includes('número')) tags.push('numbers')
  if (title.toLowerCase().includes('emergencia')) tags.push('emergencia', 'safety')
  if (title.toLowerCase().includes('cliente') || title.toLowerCase().includes('pasajero')) {
    tags.push('customer-service')
  }
  if (title.toLowerCase().includes('problema') || title.toLowerCase().includes('queja')) {
    tags.push('problemas')
  }
  if (title.toLowerCase().includes('app') || title.toLowerCase().includes('vocabulario')) {
    tags.push('app', 'tecnología')
  }

  // Add level tag
  tags.push(level)

  // Add type tag
  tags.push(type === 'audio' ? 'pronunciación' : type)

  return [...new Set(tags)] // Remove duplicates
}

function convertToRelativePath(absolutePath: string): string {
  // Convert Windows absolute path to web-friendly relative path
  const normalized = absolutePath.replace(/\\/g, '/')
  const parts = normalized.split('/')
  const resourcesIndex = parts.findIndex(p => p === 'generated-resources')

  if (resourcesIndex === -1) return absolutePath

  return '/' + parts.slice(resourcesIndex).join('/')
}

async function integrateResources() {
  console.log('🔄 Starting resource integration...\n')

  // Read the report
  const reportPath = join(process.cwd(), 'generated-resources/50-batch/report.json')
  const report: Report = JSON.parse(readFileSync(reportPath, 'utf-8'))

  console.log(`📊 Report Summary:`)
  console.log(`   Total: ${report.total}`)
  console.log(`   Successful: ${report.successful}`)
  console.log(`   Failed: ${report.failed}`)
  console.log(`   Avg Quality: ${report.avgQuality.toFixed(1)}%\n`)

  // Filter successful resources
  const successfulResources = report.results.filter(r => r.success && r.filepath)

  console.log(`✅ Processing ${successfulResources.length} successful resources...\n`)

  // Convert to Resource objects
  const resources: Resource[] = successfulResources.map((genResource, index) => {
    const filepath = genResource.filepath!
    const type = determineResourceType(filepath)
    const category = determineCategoryFromPath(filepath)
    const level = extractLevelFromContent(filepath)

    // Get file size
    let size = '0 KB'
    try {
      const stats = statSync(filepath)
      size = formatFileSize(stats.size)
    } catch (error) {
      console.warn(`⚠️  Could not stat file: ${filepath}`)
    }

    const resource: Resource = {
      id: index + 1,
      title: genResource.title,
      description: generateDescription(genResource.title, type, category),
      type,
      category,
      level,
      size,
      downloadUrl: convertToRelativePath(filepath),
      tags: generateTags(genResource.title, type, category, level),
      offline: true, // All resources are offline-capable
      contentPath: filepath
    }

    console.log(`   ${index + 1}. ${resource.title}`)
    console.log(`      Type: ${resource.type} | Category: ${resource.category} | Level: ${resource.level}`)

    return resource
  })

  console.log(`\n✅ Successfully converted ${resources.length} resources\n`)

  // Generate TypeScript file
  const tsContent = `/**
 * Generated Resources
 * Auto-generated from AI-created learning materials
 * Generated: ${new Date().toISOString()}
 * Total Resources: ${resources.length}
 * Average Quality Score: ${report.avgQuality.toFixed(1)}%
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
}

export const resources: Resource[] = ${JSON.stringify(resources, null, 2)}
`

  // Write to data/resources.ts
  const outputPath = join(process.cwd(), 'data/resources.ts')
  writeFileSync(outputPath, tsContent, 'utf-8')

  console.log(`✅ Written resources to: ${outputPath}`)

  // Statistics
  const typeStats = resources.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const categoryStats = resources.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const levelStats = resources.reduce((acc, r) => {
    acc[r.level] = (acc[r.level] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  console.log('\n📊 Resource Statistics:')
  console.log('\nBy Type:')
  Object.entries(typeStats).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`)
  })

  console.log('\nBy Category:')
  Object.entries(categoryStats).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count}`)
  })

  console.log('\nBy Level:')
  Object.entries(levelStats).forEach(([level, count]) => {
    console.log(`   ${level}: ${count}`)
  })

  console.log('\n🎉 Resource integration complete!\n')
}

// Run the integration
integrateResources().catch(error => {
  console.error('❌ Error integrating resources:', error)
  process.exit(1)
})
