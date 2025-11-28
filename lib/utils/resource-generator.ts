/**
 * Resource Generator Utility
 * @fileoverview Helper functions to generate new resources from templates
 */

import type { Resource } from '@/data/resources'
import { ALL_TEMPLATES } from '@/data/templates/resource-templates'
import { validateResource, suggestNextId } from './resource-validator'

/**
 * Generate a new resource from a template
 */
export function generateFromTemplate(
  templateName: string,
  overrides: Partial<Resource> = {},
  existingResources: Resource[] = []
): Resource {
  // Find template
  const template = findTemplate(templateName)
  if (!template) {
    throw new Error(`Template '${templateName}' not found`)
  }

  // Generate new ID
  const newId = overrides.id ?? suggestNextId(existingResources)

  // Merge template with overrides
  const newResource: Resource = {
    ...template,
    ...overrides,
    id: newId
  } as Resource

  // Validate
  const validation = validateResource(newResource)
  if (!validation.isValid) {
    console.warn('Generated resource has validation errors:', validation.errors)
  }

  return newResource
}

/**
 * Find a template by name
 */
function findTemplate(name: string): Partial<Resource> | null {
  // Search through all template categories
  for (const category of Object.values(ALL_TEMPLATES)) {
    const template = category[name as keyof typeof category]
    if (template) {
      return template as Partial<Resource>
    }
  }
  return null
}

/**
 * List all available templates
 */
export function listTemplates(): string[] {
  const names: string[] = []

  for (const category of Object.values(ALL_TEMPLATES)) {
    names.push(...Object.keys(category))
  }

  return names
}

/**
 * List templates by category
 */
export function listTemplatesByCategory(): Record<string, string[]> {
  return {
    delivery: Object.keys(ALL_TEMPLATES.delivery),
    rideshare: Object.keys(ALL_TEMPLATES.rideshare),
    universal: Object.keys(ALL_TEMPLATES.universal),
    emergency: Object.keys(ALL_TEMPLATES.emergency),
    appSpecific: Object.keys(ALL_TEMPLATES.appSpecific)
  }
}

/**
 * Generate multiple resources from templates
 */
export function generateBatch(
  templateNames: string[],
  existingResources: Resource[] = []
): Resource[] {
  const resources: Resource[] = []
  let currentMaxId = suggestNextId(existingResources) - 1

  for (const templateName of templateNames) {
    currentMaxId++
    const resource = generateFromTemplate(
      templateName,
      { id: currentMaxId },
      existingResources
    )
    resources.push(resource)
  }

  return resources
}

/**
 * Generate a resource with custom values
 */
export function createCustomResource(
  baseTemplate: string,
  customizations: Partial<Resource>,
  existingResources: Resource[] = []
): Resource {
  return generateFromTemplate(baseTemplate, customizations, existingResources)
}

/**
 * Clone an existing resource with modifications
 */
export function cloneResource(
  original: Resource,
  modifications: Partial<Resource>,
  existingResources: Resource[] = []
): Resource {
  const newId = modifications.id ?? suggestNextId(existingResources)

  return {
    ...original,
    ...modifications,
    id: newId
  }
}

/**
 * Generate a complete resource set for a new category
 */
export function generateResourceSet(config: {
  category: Resource['category']
  baseTitle: string
  basePath: string
  existingResources?: Resource[]
}): Resource[] {
  const { category, baseTitle, basePath, existingResources = [] } = config
  let currentId = suggestNextId(existingResources) - 1

  const resources: Resource[] = []

  // Basic level resources
  resources.push({
    id: ++currentId,
    title: `${baseTitle} - Básico (PDF)`,
    description: `Guía básica de ${baseTitle.toLowerCase()} con frases esenciales`,
    type: 'pdf',
    category,
    level: 'basico',
    size: '1.5 MB',
    downloadUrl: `${basePath}/basic-guide.pdf`,
    tags: ['Básico', category === 'repartidor' ? 'Entregas' : 'Conductor'],
    offline: true
  })

  resources.push({
    id: ++currentId,
    title: `${baseTitle} - Básico (Audio)`,
    description: `Pronunciación de frases básicas de ${baseTitle.toLowerCase()}`,
    type: 'audio',
    category,
    level: 'basico',
    size: '3.2 MB',
    downloadUrl: `${basePath}/basic-audio.mp3`,
    tags: ['Básico', 'Audio', 'Pronunciación'],
    offline: true
  })

  // Intermediate level
  resources.push({
    id: ++currentId,
    title: `${baseTitle} - Intermedio`,
    description: `Conversaciones y situaciones complejas de ${baseTitle.toLowerCase()}`,
    type: 'pdf',
    category,
    level: 'intermedio',
    size: '2.1 MB',
    downloadUrl: `${basePath}/intermediate-guide.pdf`,
    tags: ['Intermedio', 'Conversación'],
    offline: true
  })

  // Advanced level
  resources.push({
    id: ++currentId,
    title: `${baseTitle} - Avanzado`,
    description: `Comunicación profesional avanzada en ${baseTitle.toLowerCase()}`,
    type: 'pdf',
    category,
    level: 'avanzado',
    size: '2.8 MB',
    downloadUrl: `${basePath}/advanced-guide.pdf`,
    tags: ['Avanzado', 'Profesional'],
    offline: true
  })

  return resources
}

/**
 * Export resources to JSON format
 */
export function exportToJSON(resources: Resource[]): string {
  return JSON.stringify(resources, null, 2)
}

/**
 * Export resources to TypeScript array format
 */
export function exportToTypeScript(resources: Resource[]): string {
  const lines = [
    'import type { Resource } from \'./resources\'',
    '',
    'export const resources: Resource[] = ['
  ]

  resources.forEach((resource, index) => {
    lines.push('  {')
    lines.push(`    id: ${resource.id},`)
    lines.push(`    title: '${resource.title}',`)
    lines.push(`    description: '${resource.description}',`)
    lines.push(`    type: '${resource.type}',`)
    lines.push(`    category: '${resource.category}',`)
    lines.push(`    level: '${resource.level}',`)
    lines.push(`    size: '${resource.size}',`)
    lines.push(`    downloadUrl: '${resource.downloadUrl}',`)
    lines.push(`    tags: [${resource.tags.map(t => `'${t}'`).join(', ')}],`)
    lines.push(`    offline: ${resource.offline}`)
    lines.push(`  }${index < resources.length - 1 ? ',' : ''}`)
  })

  lines.push(']')
  return lines.join('\n')
}

/**
 * Generate markdown documentation for resources
 */
export function generateMarkdownDocs(resources: Resource[]): string {
  const lines = [
    '# Resource Library',
    '',
    `Total Resources: ${resources.length}`,
    ''
  ]

  // Group by category
  const byCategory = groupBy(resources, 'category')

  for (const [category, categoryResources] of Object.entries(byCategory)) {
    lines.push(`## ${category.charAt(0).toUpperCase() + category.slice(1)}`)
    lines.push('')

    // Group by level within category
    const byLevel = groupBy(categoryResources, 'level')

    for (const [level, levelResources] of Object.entries(byLevel)) {
      lines.push(`### ${level.charAt(0).toUpperCase() + level.slice(1)}`)
      lines.push('')

      levelResources.forEach(resource => {
        lines.push(`#### ${resource.title}`)
        lines.push('')
        lines.push(resource.description)
        lines.push('')
        lines.push(`- **Type**: ${resource.type}`)
        lines.push(`- **Size**: ${resource.size}`)
        lines.push(`- **Offline**: ${resource.offline ? 'Yes' : 'No'}`)
        lines.push(`- **Tags**: ${resource.tags.join(', ')}`)
        lines.push(`- **Download**: [${resource.downloadUrl}](${resource.downloadUrl})`)
        lines.push('')
      })
    }
  }

  return lines.join('\n')
}

/**
 * Helper: Group array by key
 */
function groupBy<T extends Record<string, unknown>>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

/**
 * Interactive CLI for resource generation
 */
export const cli = {
  /**
   * List all available templates
   */
  list(): void {
    console.log('📚 Available Templates:\n')
    const byCategory = listTemplatesByCategory()

    for (const [category, templates] of Object.entries(byCategory)) {
      console.log(`\n${category.toUpperCase()}:`)
      templates.forEach(template => {
        console.log(`  - ${template}`)
      })
    }
  },

  /**
   * Show template details
   */
  show(templateName: string): void {
    const template = findTemplate(templateName)
    if (!template) {
      console.error(`❌ Template '${templateName}' not found`)
      return
    }

    console.log(`\n📄 Template: ${templateName}\n`)
    console.log(JSON.stringify(template, null, 2))
  },

  /**
   * Generate a resource from template
   */
  generate(templateName: string, overrides: Partial<Resource> = {}): void {
    try {
      const resource = generateFromTemplate(templateName, overrides)
      console.log('\n✅ Resource generated:\n')
      console.log(JSON.stringify(resource, null, 2))
    } catch (error) {
      console.error('❌ Generation failed:', error)
    }
  }
}

const resourceGenerator = {
  generateFromTemplate,
  listTemplates,
  listTemplatesByCategory,
  generateBatch,
  createCustomResource,
  cloneResource,
  generateResourceSet,
  exportToJSON,
  exportToTypeScript,
  generateMarkdownDocs,
  cli
}

export default resourceGenerator
