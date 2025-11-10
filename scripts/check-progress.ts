#!/usr/bin/env tsx
/**
 * Progress Checker
 * Quick script to check generation progress
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
}

function log(msg: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`)
}

function checkProgress() {
  const logPath = join(process.cwd(), 'generated-resources', 'generation-50-log.txt')
  const reportPath = join(process.cwd(), 'generated-resources', '50-batch', 'report.json')

  log('\n' + '='.repeat(60), 'bright')
  log('📊 GENERATION PROGRESS CHECK', 'bright')
  log('='.repeat(60) + '\n', 'bright')

  // Check if generation is running
  if (!existsSync(logPath)) {
    log('❌ No generation in progress', 'yellow')
    return
  }

  const logContent = readFileSync(logPath, 'utf-8')
  const lines = logContent.split('\n')

  // Count successes
  const successLines = lines.filter(l => l.includes('✅ Success!'))
  const failedLines = lines.filter(l => l.includes('❌ Failed:'))
  const currentLine = lines.filter(l => l.includes('⏳ Generating...')).pop()

  log(`✅ Completed: ${successLines.length}/50`, 'green')
  if (failedLines.length > 0) {
    log(`❌ Failed: ${failedLines.length}`, 'yellow')
  }

  if (currentLine) {
    const match = currentLine.match(/\[(\d+)\/50\]/)
    if (match) {
      log(`⏳ In Progress: Resource ${match[1]}/50`, 'yellow')
    }
  }

  // Parse quality scores and costs
  if (successLines.length > 0) {
    const qualities: number[] = []
    const costs: number[] = []

    successLines.forEach(line => {
      const qualityMatch = line.match(/Quality: (\d+)\/100/)
      const costMatch = line.match(/Cost: \$([0-9.]+)/)

      if (qualityMatch) qualities.push(parseInt(qualityMatch[1]))
      if (costMatch) costs.push(parseFloat(costMatch[1]))
    })

    if (qualities.length > 0) {
      const avgQuality = qualities.reduce((a, b) => a + b, 0) / qualities.length
      const totalCost = costs.reduce((a, b) => a + b, 0)

      log(`\n📈 Metrics So Far:`, 'cyan')
      log(`   Avg Quality: ${avgQuality.toFixed(1)}/100`, 'cyan')
      log(`   Total Cost: $${totalCost.toFixed(2)}`, 'cyan')
      log(`   Projected Total: $${(totalCost / successLines.length * 50).toFixed(2)}`, 'cyan')
    }
  }

  // Check checkpoint messages
  const checkpoints = lines.filter(l => l.includes('Checkpoint:'))
  if (checkpoints.length > 0) {
    log(`\n📍 Last Checkpoint:`, 'cyan')
    log(`   ${checkpoints[checkpoints.length - 1].trim()}`, 'cyan')
  }

  // Est time remaining
  if (successLines.length > 0 && successLines.length < 50) {
    const avgTimePerResource = 120 // 2 minutes avg
    const remaining = 50 - successLines.length
    const estimatedMinutes = (remaining * avgTimePerResource) / 60

    log(`\n⏱️  Estimated Time Remaining: ${estimatedMinutes.toFixed(0)} minutes`, 'yellow')
  }

  // Check if complete
  if (existsSync(reportPath)) {
    log(`\n🎉 Generation Complete! Report available at:`, 'green')
    log(`   ${reportPath}`, 'cyan')

    try {
      const report = JSON.parse(readFileSync(reportPath, 'utf-8'))
      log(`\n📊 Final Summary:`, 'bright')
      log(`   Success: ${report.successful}/${report.total}`, 'green')
      log(`   Avg Quality: ${report.avgQuality?.toFixed(1)}/100`, 'cyan')
      log(`   Total Cost: $${report.totalCost?.toFixed(2)}`, 'cyan')
      log(`   Total Time: ${report.totalTime?.toFixed(1)} min`, 'cyan')
    } catch (e) {
      // Ignore parse errors
    }
  }

  log('\n' + '='.repeat(60) + '\n', 'bright')
}

checkProgress()
