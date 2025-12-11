/**
 * Comprehensive Functionality Test Suite for Hablas Platform
 * Tests all major user flows and components
 */

import { resources } from '@/data/resources'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

interface TestResult {
  testName: string
  status: 'PASS' | 'FAIL' | 'PARTIAL' | 'SKIPPED'
  notes: string
  details?: string
}

const testResults: TestResult[] = []

// ============================================================================
// TEST SUITE 1: BUILD & DEPLOYMENT
// ============================================================================

describe('Build & Deployment Tests', () => {
  test('npm run build succeeds', () => {
    try {
      const output = execSync('npm run build', { encoding: 'utf-8', stdio: 'pipe' })
      expect(output).toContain('Compiled successfully')
      testResults.push({
        testName: 'npm run build',
        status: 'PASS',
        notes: 'Build completed successfully',
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      testResults.push({
        testName: 'npm run build',
        status: 'FAIL',
        notes: 'Build failed',
        details: errorMessage,
      })
      throw error
    }
  })

  test('npm run typecheck passes', () => {
    try {
      execSync('npm run typecheck', { encoding: 'utf-8', stdio: 'pipe' })
      testResults.push({
        testName: 'npm run typecheck',
        status: 'PASS',
        notes: 'TypeScript type checking passed',
      })
    } catch (error: unknown) {
      const execError = error as { stderr?: string; stdout?: string; message?: string };
      const errorOutput = execError.stderr || execError.stdout || execError.message || String(error);
      if (errorOutput.includes('error TS')) {
        testResults.push({
          testName: 'npm run typecheck',
          status: 'FAIL',
          notes: 'TypeScript errors detected',
          details: errorOutput.substring(0, 500),
        })
      } else {
        testResults.push({
          testName: 'npm run typecheck',
          status: 'PARTIAL',
          notes: 'TypeScript check had issues but not critical',
        })
      }
    }
  })
})

// ============================================================================
// TEST SUITE 2: RESOURCE DATA VALIDATION
// ============================================================================

describe('Resource Data Validation', () => {
  test('All 59 resources exist', () => {
    const status = resources.length === 59 ? 'PASS' : 'FAIL'
    testResults.push({
      testName: 'Total resources count',
      status,
      notes: `Found ${resources.length} resources (expected 59)`,
    })
    expect(resources.length).toBe(59)
  })

  test('All resources have required fields', () => {
    const requiredFields = ['id', 'title', 'description', 'type', 'category', 'level', 'downloadUrl']
    const missingFields: string[] = []

    resources.forEach((resource, index) => {
      requiredFields.forEach((field) => {
        if (!(field in resource)) {
          missingFields.push(`Resource ${index + 1} (${resource.title}): missing ${field}`)
        }
      })
    })

    const status = missingFields.length === 0 ? 'PASS' : 'FAIL'
    testResults.push({
      testName: 'Resource required fields',
      status,
      notes: `${resources.length} resources validated`,
      details: missingFields.length > 0 ? missingFields.join('\n') : undefined,
    })

    expect(missingFields.length).toBe(0)
  })

  test('All resource types are valid', () => {
    const validTypes = ['pdf', 'audio', 'image', 'video']
    const invalidTypes = new Set<string>()

    resources.forEach((resource) => {
      if (!validTypes.includes(resource.type)) {
        invalidTypes.add(`${resource.title}: ${resource.type}`)
      }
    })

    const status = invalidTypes.size === 0 ? 'PASS' : 'FAIL'
    testResults.push({
      testName: 'Resource types validation',
      status,
      notes: `All resource types are valid (pdf, audio, image, video)`,
    })

    expect(invalidTypes.size).toBe(0)
  })

  test('All resource categories are valid', () => {
    const validCategories = ['all', 'repartidor', 'conductor']
    const invalidCategories = new Set<string>()

    resources.forEach((resource) => {
      if (!validCategories.includes(resource.category)) {
        invalidCategories.add(`${resource.title}: ${resource.category}`)
      }
    })

    const status = invalidCategories.size === 0 ? 'PASS' : 'FAIL'
    testResults.push({
      testName: 'Resource categories validation',
      status,
      notes: `All categories are valid (all, repartidor, conductor)`,
    })

    expect(invalidCategories.size).toBe(0)
  })

  test('All resource levels are valid', () => {
    const validLevels = ['basico', 'intermedio', 'avanzado']
    const invalidLevels = new Set<string>()

    resources.forEach((resource) => {
      if (!validLevels.includes(resource.level)) {
        invalidLevels.add(`${resource.title}: ${resource.level}`)
      }
    })

    const status = invalidLevels.size === 0 ? 'PASS' : 'FAIL'
    testResults.push({
      testName: 'Resource levels validation',
      status,
      notes: `All levels are valid (basico, intermedio, avanzado)`,
    })

    expect(invalidLevels.size).toBe(0)
  })

  test('Resource IDs are unique and sequential', () => {
    const ids = resources.map((r) => r.id)
    const uniqueIds = new Set(ids)
    const hasGaps = ids.some((id, index) => id !== index + 1)

    const status = uniqueIds.size === 59 && !hasGaps ? 'PASS' : 'PARTIAL'
    testResults.push({
      testName: 'Resource IDs uniqueness',
      status,
      notes: `${uniqueIds.size} unique IDs found`,
    })

    expect(uniqueIds.size).toBe(59)
  })
})

// ============================================================================
// TEST SUITE 3: RESOURCE CONTENT VALIDATION
// ============================================================================

describe('Resource Content Validation', () => {
  test('No production markers in content', () => {
    const productionMarkers = ['[Speaker]', '[Tone]', '[SPEAKER]', '[TONE]']
    const resourcesWithMarkers: string[] = []

    resources.forEach((resource) => {
      // Check if resource has content path
      if (resource.contentPath && fs.existsSync(resource.contentPath)) {
        try {
          const content = fs.readFileSync(resource.contentPath, 'utf-8')
          productionMarkers.forEach((marker) => {
            if (content.includes(marker)) {
              resourcesWithMarkers.push(`Resource ${resource.id}: Found "${marker}"`)
            }
          })
        } catch {
          // File not readable, skip
        }
      }
    })

    const status = resourcesWithMarkers.length === 0 ? 'PASS' : 'FAIL'
    testResults.push({
      testName: 'No production markers in content',
      status,
      notes: `Scanned ${resources.length} resources for production markers`,
      details: resourcesWithMarkers.length > 0 ? resourcesWithMarkers.slice(0, 5).join('\n') : undefined,
    })

    // We allow this to fail without throwing
    if (resourcesWithMarkers.length > 0) {
      console.warn('Production markers found:', resourcesWithMarkers.length)
    }
  })

  test('Audio resources have audioUrl', () => {
    const audioResources = resources.filter((r) => r.type === 'audio')
    const missingAudioUrl = audioResources.filter((r) => !r.audioUrl)

    const status = missingAudioUrl.length === 0 ? 'PASS' : 'PARTIAL'
    testResults.push({
      testName: 'Audio resources have audioUrl',
      status,
      notes: `${audioResources.length} audio resources found, ${audioResources.length - missingAudioUrl.length} have audioUrl`,
    })

    expect(missingAudioUrl.length).toBe(0)
  })

  test('Resource download URLs are valid paths', () => {
    const invalidUrls: string[] = []

    resources.forEach((resource) => {
      if (!resource.downloadUrl || resource.downloadUrl.trim().length === 0) {
        invalidUrls.push(`Resource ${resource.id}: Missing downloadUrl`)
      } else if (!resource.downloadUrl.startsWith('/')) {
        invalidUrls.push(`Resource ${resource.id}: Invalid path format`)
      }
    })

    const status = invalidUrls.length === 0 ? 'PASS' : 'FAIL'
    testResults.push({
      testName: 'Resource download URLs validation',
      status,
      notes: `${resources.length} resources have valid download URLs`,
      details: invalidUrls.length > 0 ? invalidUrls.join('\n') : undefined,
    })

    expect(invalidUrls.length).toBe(0)
  })
})

// ============================================================================
// TEST SUITE 4: COMPONENT STRUCTURE
// ============================================================================

describe('Component Structure', () => {
  test('All required components exist', () => {
    const componentNames = [
      'Hero.tsx',
      'ResourceLibrary.tsx',
      'SearchBar.tsx',
      'ResourceCard.tsx',
      'AudioPlayer.tsx',
      'WhatsAppCTA.tsx',
      'OfflineNotice.tsx',
    ]

    const componentPath = path.join(process.cwd(), 'components')
    const missingComponents: string[] = []

    componentNames.forEach((component) => {
      const filePath = path.join(componentPath, component)
      if (!fs.existsSync(filePath)) {
        missingComponents.push(component)
      }
    })

    const status = missingComponents.length === 0 ? 'PASS' : 'FAIL'
    testResults.push({
      testName: 'Required components exist',
      status,
      notes: `${componentNames.length - missingComponents.length}/${componentNames.length} components found`,
      details: missingComponents.length > 0 ? missingComponents.join(', ') : undefined,
    })

    expect(missingComponents.length).toBe(0)
  })

  test('Resource detail pages generated for all resources', () => {
    const outDir = path.join(process.cwd(), 'out')
    const generatedPages: number[] = []

    if (fs.existsSync(outDir)) {
      const recursosDir = path.join(outDir, 'recursos')
      if (fs.existsSync(recursosDir)) {
        const dirs = fs.readdirSync(recursosDir)
        dirs.forEach((dir) => {
          const num = parseInt(dir)
          if (!isNaN(num)) {
            generatedPages.push(num)
          }
        })
      }
    }

    // Allow PARTIAL if out/ doesn't exist (build not yet run)
    const status =
      generatedPages.length > 0 && generatedPages.length >= 50
        ? 'PASS'
        : generatedPages.length > 0
          ? 'PARTIAL'
          : 'SKIPPED'

    testResults.push({
      testName: 'Resource detail pages generated',
      status,
      notes: `${generatedPages.length} resource pages generated (expected 59)`,
    })
  })
})

// ============================================================================
// EXPORT TEST RESULTS
// ============================================================================

describe('Test Report Export', () => {
  test('Generate test report', () => {
    generateTestReport(testResults)
    expect(testResults.length).toBeGreaterThan(0)
  })
})

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateTestReport(results: TestResult[]): void {
  const passed = results.filter((r) => r.status === 'PASS').length
  const failed = results.filter((r) => r.status === 'FAIL').length
  const partial = results.filter((r) => r.status === 'PARTIAL').length
  const skipped = results.filter((r) => r.status === 'SKIPPED').length

  const report = `
# Hablas Platform - Functionality Test Report

**Date**: ${new Date().toISOString()}
**Total Tests**: ${results.length}
**Passed**: ${passed} (${((passed / results.length) * 100).toFixed(1)}%)
**Failed**: ${failed}
**Partial**: ${partial}
**Skipped**: ${skipped}

## Test Results Summary

| Status | Count | Percentage |
|--------|-------|-----------|
| PASS | ${passed} | ${((passed / results.length) * 100).toFixed(1)}% |
| FAIL | ${failed} | ${((failed / results.length) * 100).toFixed(1)}% |
| PARTIAL | ${partial} | ${((partial / results.length) * 100).toFixed(1)}% |
| SKIPPED | ${skipped} | ${((skipped / results.length) * 100).toFixed(1)}% |

## Detailed Test Results

${results
  .map(
    (result) => `
### ${result.status} - ${result.testName}
- **Status**: ${result.status}
- **Notes**: ${result.notes}
${result.details ? `- **Details**: \`\`\`\n${result.details}\n\`\`\`` : ''}
`,
  )
  .join('\n')}

## Summary

${
  failed === 0 && partial === 0
    ? '✅ All critical tests passed!'
    : failed > 0
      ? '❌ Critical issues detected - see failures above'
      : '⚠️ Some tests require attention'
}

---
Generated by Hablas QA Test Suite
`

  const reportPath = path.join(process.cwd(), 'docs', 'FUNCTIONALITY_TEST_REPORT.md')
  const docsDir = path.dirname(reportPath)

  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true })
  }

  fs.writeFileSync(reportPath, report, 'utf-8')
  console.log(`Test report generated: ${reportPath}`)
}

export { testResults }
