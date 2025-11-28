/**
 * Resource Validator Utility
 * @fileoverview Validates resource objects to ensure they meet platform standards
 * before being added to the resource library
 */

import type { Resource } from '@/data/resources'

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  metadata: {
    fieldsChecked: number
    criticalErrors: number
    minorIssues: number
  }
}

/**
 * Validation rules configuration
 */
const VALIDATION_RULES = {
  title: {
    minLength: 5,
    maxLength: 100,
    required: true
  },
  description: {
    minLength: 20,
    maxLength: 200,
    required: true
  },
  size: {
    pdf: { maxMB: 5, warningMB: 3 },
    audio: { maxMB: 15, warningMB: 10 },
    image: { maxMB: 8, warningMB: 5 },
    video: { maxMB: 150, warningMB: 100 }
  },
  tags: {
    minCount: 2,
    maxCount: 8,
    required: true
  },
  downloadUrl: {
    required: true,
    pattern: /^\/resources\//
  }
} as const

/**
 * Valid enum values
 */
const VALID_VALUES = {
  type: ['pdf', 'audio', 'image', 'video'],
  category: ['all', 'repartidor', 'conductor'],
  level: ['basico', 'intermedio', 'avanzado']
} as const

/**
 * Recommended tags by category
 */
const RECOMMENDED_TAGS = {
  repartidor: ['Rappi', 'Entregas', 'DoorDash', 'Uber Eats', 'Postmates'],
  conductor: ['Uber', 'DiDi', 'Lyft', 'Taxi', 'Pasajeros'],
  all: ['Básico', 'Intermedio', 'Avanzado', 'Audio', 'Visual', 'Pronunciación']
}

/**
 * Main validation function
 */
export function validateResource(resource: Partial<Resource>): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  let fieldsChecked = 0

  // Validate ID
  fieldsChecked++
  if (resource.id === undefined || resource.id === null) {
    errors.push('Resource ID is required')
  } else if (typeof resource.id !== 'number') {
    errors.push('Resource ID must be a number')
  } else if (resource.id < 1) {
    errors.push('Resource ID must be greater than 0')
  }

  // Validate Title
  fieldsChecked++
  if (!resource.title) {
    errors.push('Title is required')
  } else {
    if (resource.title.length < VALIDATION_RULES.title.minLength) {
      errors.push(`Title must be at least ${VALIDATION_RULES.title.minLength} characters`)
    }
    if (resource.title.length > VALIDATION_RULES.title.maxLength) {
      errors.push(`Title must not exceed ${VALIDATION_RULES.title.maxLength} characters`)
    }
    // Check for Spanish characters (expected for this platform)
    if (!/[áéíóúñ¿¡]/i.test(resource.title)) {
      warnings.push('Title does not contain Spanish characters - verify this is intentional')
    }
  }

  // Validate Description
  fieldsChecked++
  if (!resource.description) {
    errors.push('Description is required')
  } else {
    if (resource.description.length < VALIDATION_RULES.description.minLength) {
      errors.push(`Description must be at least ${VALIDATION_RULES.description.minLength} characters`)
    }
    if (resource.description.length > VALIDATION_RULES.description.maxLength) {
      errors.push(`Description must not exceed ${VALIDATION_RULES.description.maxLength} characters`)
    }
    if (resource.description === resource.title) {
      warnings.push('Description is identical to title - consider adding more detail')
    }
  }

  // Validate Type
  fieldsChecked++
  if (!resource.type) {
    errors.push('Type is required')
  } else if (!VALID_VALUES.type.includes(resource.type)) {
    errors.push(`Type must be one of: ${VALID_VALUES.type.join(', ')}`)
  }

  // Validate Category
  fieldsChecked++
  if (!resource.category) {
    errors.push('Category is required')
  } else if (!VALID_VALUES.category.includes(resource.category)) {
    errors.push(`Category must be one of: ${VALID_VALUES.category.join(', ')}`)
  }

  // Validate Level
  fieldsChecked++
  if (!resource.level) {
    errors.push('Level is required')
  } else if (!VALID_VALUES.level.includes(resource.level)) {
    errors.push(`Level must be one of: ${VALID_VALUES.level.join(', ')}`)
  }

  // Validate Size
  fieldsChecked++
  if (!resource.size) {
    errors.push('Size is required')
  } else {
    const sizeValidation = validateSize(resource.size, resource.type)
    errors.push(...sizeValidation.errors)
    warnings.push(...sizeValidation.warnings)
  }

  // Validate Download URL
  fieldsChecked++
  if (!resource.downloadUrl) {
    errors.push('Download URL is required')
  } else {
    if (!VALIDATION_RULES.downloadUrl.pattern.test(resource.downloadUrl)) {
      errors.push('Download URL must start with /resources/')
    }
    // Check file extension matches type
    if (resource.type) {
      const expectedExtensions = getExpectedExtensions(resource.type)
      const hasValidExtension = expectedExtensions.some(ext =>
        resource.downloadUrl?.toLowerCase().endsWith(ext)
      )
      if (!hasValidExtension) {
        errors.push(`Download URL should end with one of: ${expectedExtensions.join(', ')} for type '${resource.type}'`)
      }
    }
    // Check URL structure
    if (resource.category && !resource.downloadUrl.includes(`/resources/`)) {
      warnings.push('Download URL should include category path (e.g., /resources/delivery/)')
    }
  }

  // Validate Tags
  fieldsChecked++
  if (!resource.tags || !Array.isArray(resource.tags)) {
    errors.push('Tags array is required')
  } else {
    if (resource.tags.length < VALIDATION_RULES.tags.minCount) {
      errors.push(`At least ${VALIDATION_RULES.tags.minCount} tags are required`)
    }
    if (resource.tags.length > VALIDATION_RULES.tags.maxCount) {
      warnings.push(`Consider reducing tags to ${VALIDATION_RULES.tags.maxCount} or fewer for better organization`)
    }
    // Check for empty tags
    if (resource.tags.some(tag => !tag || tag.trim() === '')) {
      errors.push('Tags cannot be empty strings')
    }
    // Check for recommended tags
    if (resource.category) {
      const categoryTags = RECOMMENDED_TAGS[resource.category] || []
      const hasRecommendedTag = resource.tags.some(tag =>
        categoryTags.some(recTag => recTag.toLowerCase() === tag.toLowerCase())
      )
      if (!hasRecommendedTag && categoryTags.length > 0) {
        warnings.push(`Consider adding at least one recommended tag: ${categoryTags.slice(0, 3).join(', ')}`)
      }
    }
  }

  // Validate Offline
  fieldsChecked++
  if (typeof resource.offline !== 'boolean') {
    errors.push('Offline flag must be a boolean (true/false)')
  } else {
    // Check if large files are marked offline=false
    if (resource.offline && resource.size && resource.type) {
      const sizeMB = parseSizeToMB(resource.size)
      const rule = VALIDATION_RULES.size[resource.type]
      if (sizeMB && rule && sizeMB > rule.warningMB) {
        warnings.push(`Large ${resource.type} files (>${rule.warningMB}MB) should typically be marked offline: false`)
      }
    }
  }

  // Cross-field validations
  if (resource.type === 'video' && resource.offline === true) {
    warnings.push('Videos marked as offline=true should be under 50MB for practical storage')
  }

  if (resource.level === 'basico' && resource.type === 'video') {
    warnings.push('Basic level content is often better as PDF or audio for accessibility')
  }

  // Tag-category consistency
  if (resource.category === 'repartidor' && resource.tags) {
    const hasDeliveryTag = resource.tags.some(tag =>
      ['rappi', 'entregas', 'delivery', 'doordash'].includes(tag.toLowerCase())
    )
    if (!hasDeliveryTag) {
      warnings.push('Delivery resources should include delivery-related tags (Rappi, Entregas, etc.)')
    }
  }

  if (resource.category === 'conductor' && resource.tags) {
    const hasRideshareTag = resource.tags.some(tag =>
      ['uber', 'didi', 'lyft', 'conductor', 'pasajeros'].includes(tag.toLowerCase())
    )
    if (!hasRideshareTag) {
      warnings.push('Rideshare resources should include rideshare-related tags (Uber, DiDi, etc.)')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      fieldsChecked,
      criticalErrors: errors.length,
      minorIssues: warnings.length
    }
  }
}

/**
 * Validate file size format and limits
 */
function validateSize(
  size: string,
  type?: Resource['type']
): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  // Check format (should be like "1.2 MB" or "500 KB")
  const sizePattern = /^(\d+(?:\.\d+)?)\s*(KB|MB|GB)$/i
  if (!sizePattern.test(size)) {
    errors.push('Size must be in format "X.X MB" or "XXX KB"')
    return { errors, warnings }
  }

  // Parse size to MB for comparison
  const sizeMB = parseSizeToMB(size)
  if (sizeMB === null) {
    errors.push('Unable to parse size value')
    return { errors, warnings }
  }

  // Check against type-specific limits
  if (type && VALIDATION_RULES.size[type]) {
    const rule = VALIDATION_RULES.size[type]

    if (sizeMB > rule.maxMB) {
      errors.push(`${type.toUpperCase()} files must be under ${rule.maxMB}MB (current: ${sizeMB.toFixed(1)}MB)`)
    } else if (sizeMB > rule.warningMB) {
      warnings.push(`${type.toUpperCase()} file is large (${sizeMB.toFixed(1)}MB). Consider optimizing or marking as online-only.`)
    }
  }

  return { errors, warnings }
}

/**
 * Parse size string to MB number
 */
function parseSizeToMB(size: string): number | null {
  const match = size.match(/^(\d+(?:\.\d+)?)\s*(KB|MB|GB)$/i)
  if (!match) return null

  const value = parseFloat(match[1])
  const unit = match[2].toUpperCase()

  switch (unit) {
    case 'KB':
      return value / 1024
    case 'MB':
      return value
    case 'GB':
      return value * 1024
    default:
      return null
  }
}

/**
 * Get expected file extensions for a resource type
 */
function getExpectedExtensions(type: Resource['type']): string[] {
  const extensions: Record<Resource['type'], string[]> = {
    pdf: ['.pdf'],
    audio: ['.mp3', '.m4a', '.ogg', '.wav'],
    image: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'], // PDF can contain images
    video: ['.mp4', '.webm', '.mov']
  }
  return extensions[type] || []
}

/**
 * Batch validate multiple resources
 */
export function validateResources(resources: Partial<Resource>[]): {
  results: Array<ValidationResult & { resource: Partial<Resource> }>
  summary: {
    total: number
    valid: number
    invalid: number
    totalErrors: number
    totalWarnings: number
  }
} {
  const results = resources.map(resource => ({
    resource,
    ...validateResource(resource)
  }))

  const summary = {
    total: resources.length,
    valid: results.filter(r => r.isValid).length,
    invalid: results.filter(r => !r.isValid).length,
    totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
    totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0)
  }

  return { results, summary }
}

/**
 * Check for duplicate resources
 */
export function checkDuplicates(resources: Partial<Resource>[]): {
  duplicateIds: number[]
  duplicateTitles: string[]
  duplicateUrls: string[]
} {
  const ids = new Set<number>()
  const titles = new Set<string>()
  const urls = new Set<string>()

  const duplicateIds: number[] = []
  const duplicateTitles: string[] = []
  const duplicateUrls: string[] = []

  resources.forEach(resource => {
    if (resource.id && ids.has(resource.id)) {
      duplicateIds.push(resource.id)
    } else if (resource.id) {
      ids.add(resource.id)
    }

    if (resource.title) {
      const normalizedTitle = resource.title.toLowerCase().trim()
      if (titles.has(normalizedTitle)) {
        duplicateTitles.push(resource.title)
      } else {
        titles.add(normalizedTitle)
      }
    }

    if (resource.downloadUrl && urls.has(resource.downloadUrl)) {
      duplicateUrls.push(resource.downloadUrl)
    } else if (resource.downloadUrl) {
      urls.add(resource.downloadUrl)
    }
  })

  return { duplicateIds, duplicateTitles, duplicateUrls }
}

/**
 * Suggest next available ID
 */
export function suggestNextId(existingResources: Partial<Resource>[]): number {
  const ids = existingResources
    .map(r => r.id)
    .filter((id): id is number => typeof id === 'number')

  if (ids.length === 0) return 1

  return Math.max(...ids) + 1
}

/**
 * Format validation result as readable text
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = []

  lines.push('=== Validation Result ===')
  lines.push(`Status: ${result.isValid ? '✅ VALID' : '❌ INVALID'}`)
  lines.push(`Fields Checked: ${result.metadata.fieldsChecked}`)
  lines.push('')

  if (result.errors.length > 0) {
    lines.push('🚨 ERRORS:')
    result.errors.forEach((error, i) => {
      lines.push(`  ${i + 1}. ${error}`)
    })
    lines.push('')
  }

  if (result.warnings.length > 0) {
    lines.push('⚠️  WARNINGS:')
    result.warnings.forEach((warning, i) => {
      lines.push(`  ${i + 1}. ${warning}`)
    })
    lines.push('')
  }

  if (result.isValid && result.warnings.length === 0) {
    lines.push('✨ No issues found! Resource is ready to use.')
  }

  return lines.join('\n')
}

const resourceValidator = {
  validateResource,
  validateResources,
  checkDuplicates,
  suggestNextId,
  formatValidationResult
}

export default resourceValidator
