#!/usr/bin/env tsx
/**
 * Interactive Resource Generator Script
 * @fileoverview CLI tool for creating new resources from templates
 *
 * Usage:
 *   npm run resource:generate
 *   npm run resource:list
 *   npm run resource:validate
 */

import { generateFromTemplate, listTemplatesByCategory, exportToTypeScript } from '../lib/utils/resource-generator'
import { validateResource, formatValidationResult } from '../lib/utils/resource-validator'
import { resources as existingResources } from '../data/resources'
import type { Resource } from '../data/resources'

// Check if running in Node.js environment
const isNode = typeof process !== 'undefined' && process.versions?.node

if (!isNode) {
  console.error('This script must be run with Node.js')
  process.exit(1)
}

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`
}

// Command handlers
const commands = {
  /**
   * List all available templates
   */
  list() {
    console.log(colorize('\n📚 Available Resource Templates\n', 'bright'))

    const templates = listTemplatesByCategory()

    for (const [category, templateNames] of Object.entries(templates)) {
      console.log(colorize(`\n${category.toUpperCase()}:`, 'cyan'))
      templateNames.forEach((name, index) => {
        console.log(`  ${index + 1}. ${name}`)
      })
    }

    console.log(colorize('\n💡 Usage:', 'yellow'))
    console.log('  npm run resource:generate <template-name>\n')
  },

  /**
   * Generate a new resource from template
   */
  generate(templateName?: string) {
    if (!templateName) {
      console.error(colorize('❌ Error: Template name required', 'red'))
      console.log('Usage: npm run resource:generate <template-name>')
      console.log('Run "npm run resource:list" to see available templates')
      process.exit(1)
    }

    console.log(colorize(`\n🔨 Generating resource from template: ${templateName}\n`, 'bright'))

    try {
      // Generate with default values
      const newResource = generateFromTemplate(templateName, {}, existingResources)

      // Validate
      const validation = validateResource(newResource)

      // Show result
      console.log(colorize('Generated Resource:', 'green'))
      console.log(JSON.stringify(newResource, null, 2))
      console.log('')

      // Show validation result
      console.log(formatValidationResult(validation))

      if (validation.isValid) {
        console.log(colorize('\n✅ Resource is valid and ready to use!', 'green'))
        console.log(colorize('\nNext steps:', 'yellow'))
        console.log('1. Create the actual file (PDF/audio/image/video)')
        console.log('2. Upload to: public' + newResource.downloadUrl)
        console.log('3. Copy the JSON above to data/resources.ts')
        console.log('4. Update any customizations needed')
      } else {
        console.log(colorize('\n⚠️  Fix validation errors before using', 'yellow'))
      }

    } catch (error) {
      console.error(colorize('❌ Generation failed:', 'red'), error)
      process.exit(1)
    }
  },

  /**
   * Validate existing resources
   */
  validate() {
    console.log(colorize('\n🔍 Validating all resources...\n', 'bright'))

    let validCount = 0
    let invalidCount = 0
    const issues: Array<{id: number, title: string, errors: string[], warnings: string[]}> = []

    existingResources.forEach(resource => {
      const validation = validateResource(resource)

      if (validation.isValid) {
        validCount++
      } else {
        invalidCount++
      }

      if (validation.errors.length > 0 || validation.warnings.length > 0) {
        issues.push({
          id: resource.id,
          title: resource.title,
          errors: validation.errors,
          warnings: validation.warnings
        })
      }
    })

    // Summary
    console.log(colorize('Validation Summary:', 'bright'))
    console.log(`Total resources: ${existingResources.length}`)
    console.log(colorize(`✅ Valid: ${validCount}`, 'green'))
    if (invalidCount > 0) {
      console.log(colorize(`❌ Invalid: ${invalidCount}`, 'red'))
    }
    console.log('')

    // Show issues
    if (issues.length > 0) {
      console.log(colorize('Issues Found:', 'yellow'))
      issues.forEach(issue => {
        console.log(`\n${colorize(`[${issue.id}]`, 'cyan')} ${issue.title}`)

        if (issue.errors.length > 0) {
          issue.errors.forEach(error => {
            console.log(colorize(`  ❌ ${error}`, 'red'))
          })
        }

        if (issue.warnings.length > 0) {
          issue.warnings.forEach(warning => {
            console.log(colorize(`  ⚠️  ${warning}`, 'yellow'))
          })
        }
      })
    } else {
      console.log(colorize('🎉 All resources passed validation!', 'green'))
    }

    console.log('')
  },

  /**
   * Show statistics about resources
   */
  stats() {
    console.log(colorize('\n📊 Resource Library Statistics\n', 'bright'))

    const stats = {
      total: existingResources.length,
      byCategory: {} as Record<string, number>,
      byLevel: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      offline: 0,
      online: 0,
      totalSize: 0
    }

    existingResources.forEach(resource => {
      // Category
      stats.byCategory[resource.category] = (stats.byCategory[resource.category] || 0) + 1

      // Level
      stats.byLevel[resource.level] = (stats.byLevel[resource.level] || 0) + 1

      // Type
      stats.byType[resource.type] = (stats.byType[resource.type] || 0) + 1

      // Offline
      if (resource.offline) {
        stats.offline++
      } else {
        stats.online++
      }
    })

    console.log(colorize('Total Resources:', 'cyan'), stats.total)
    console.log('')

    console.log(colorize('By Category:', 'cyan'))
    Object.entries(stats.byCategory).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`)
    })
    console.log('')

    console.log(colorize('By Level:', 'cyan'))
    Object.entries(stats.byLevel).forEach(([level, count]) => {
      console.log(`  ${level}: ${count}`)
    })
    console.log('')

    console.log(colorize('By Type:', 'cyan'))
    Object.entries(stats.byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`)
    })
    console.log('')

    console.log(colorize('Availability:', 'cyan'))
    console.log(`  Offline: ${stats.offline}`)
    console.log(`  Online only: ${stats.online}`)
    console.log('')
  },

  /**
   * Search resources
   */
  search(query?: string) {
    if (!query) {
      console.error(colorize('❌ Error: Search query required', 'red'))
      console.log('Usage: npm run resource:search <query>')
      process.exit(1)
    }

    console.log(colorize(`\n🔎 Searching for: "${query}"\n`, 'bright'))

    const lowerQuery = query.toLowerCase()
    const results = existingResources.filter(resource => {
      return (
        resource.title.toLowerCase().includes(lowerQuery) ||
        resource.description.toLowerCase().includes(lowerQuery) ||
        resource.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
    })

    if (results.length === 0) {
      console.log(colorize('No resources found', 'yellow'))
    } else {
      console.log(colorize(`Found ${results.length} resource(s):`, 'green'))
      console.log('')

      results.forEach(resource => {
        console.log(colorize(`[${resource.id}]`, 'cyan'), resource.title)
        console.log(`  ${resource.description}`)
        console.log(colorize(`  ${resource.category} • ${resource.level} • ${resource.type}`, 'yellow'))
        console.log(`  Tags: ${resource.tags.join(', ')}`)
        console.log('')
      })
    }
  },

  /**
   * Export resources
   */
  export(format?: string) {
    const validFormats = ['json', 'ts', 'typescript']

    if (!format || !validFormats.includes(format)) {
      console.error(colorize('❌ Error: Invalid format', 'red'))
      console.log('Usage: npm run resource:export <json|ts>')
      process.exit(1)
    }

    console.log(colorize(`\n📤 Exporting resources as ${format}...\n`, 'bright'))

    if (format === 'json') {
      console.log(JSON.stringify(existingResources, null, 2))
    } else if (format === 'ts' || format === 'typescript') {
      console.log(exportToTypeScript(existingResources))
    }
  },

  /**
   * Show help
   */
  help() {
    console.log(colorize('\n📖 Resource Generator CLI\n', 'bright'))
    console.log('Available commands:\n')
    console.log(colorize('  list', 'cyan'), '          List all available templates')
    console.log(colorize('  generate', 'cyan'), ' <name> Generate resource from template')
    console.log(colorize('  validate', 'cyan'), '       Validate all existing resources')
    console.log(colorize('  stats', 'cyan'), '          Show resource statistics')
    console.log(colorize('  search', 'cyan'), ' <query>  Search resources by keyword')
    console.log(colorize('  export', 'cyan'), ' <format> Export resources (json|ts)')
    console.log(colorize('  help', 'cyan'), '           Show this help message')
    console.log('')
    console.log(colorize('Examples:', 'yellow'))
    console.log('  npm run resource:list')
    console.log('  npm run resource:generate basic_phrases')
    console.log('  npm run resource:validate')
    console.log('  npm run resource:search uber')
    console.log('')
  }
}

// Main execution
const [,, command, ...args] = process.argv

if (!command || command === 'help') {
  commands.help()
} else if (command in commands) {
  (commands as any)[command](...args)
} else {
  console.error(colorize(`❌ Unknown command: ${command}`, 'red'))
  console.log('Run "npm run resource:help" for available commands')
  process.exit(1)
}
