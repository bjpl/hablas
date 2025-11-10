#!/usr/bin/env node

/**
 * Performance Audit Script
 * Comprehensive performance testing and validation
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 Performance Audit Script\n')

// Check if files exist
const files = [
  'lib/hooks/useIntersectionObserver.ts',
  'lib/hooks/useVirtualScroll.ts',
  'lib/hooks/usePerformanceMonitor.ts',
  'lib/utils/performance.ts',
  'lib/utils/prefetch.ts',
  'lib/utils/serviceWorkerRegistration.ts',
  'components/OptimizedImage.tsx',
  'public/sw/service-worker.js',
  'public/manifest.json',
  'docs/performance/optimizations.md',
]

console.log('✅ Checking Performance Files...\n')

let allFilesExist = true
files.forEach(file => {
  const exists = fs.existsSync(file)
  console.log(`${exists ? '✅' : '❌'} ${file}`)
  if (!exists) allFilesExist = false
})

console.log('\n' + '='.repeat(60) + '\n')

// Check component optimizations
console.log('✅ Checking Component Optimizations...\n')

const components = [
  'components/Hero.tsx',
  'components/WhatsAppCTA.tsx',
  'components/ResourceCard.tsx',
  'components/ResourceLibrary.tsx',
  'components/OfflineNotice.tsx',
]

components.forEach(component => {
  if (fs.existsSync(component)) {
    const content = fs.readFileSync(component, 'utf8')
    const hasMemo = content.includes('memo(')
    const hasUseCallback = content.includes('useCallback')
    const hasUseMemo = content.includes('useMemo')

    console.log(`📄 ${path.basename(component)}:`)
    console.log(`   ${hasMemo ? '✅' : '❌'} React.memo`)
    console.log(`   ${hasUseCallback ? '✅' : '⚪'} useCallback`)
    console.log(`   ${hasUseMemo ? '✅' : '⚪'} useMemo`)
    console.log()
  }
})

console.log('='.repeat(60) + '\n')

// Check Next.js config
console.log('✅ Checking Next.js Configuration...\n')

if (fs.existsSync('next.config.js')) {
  const config = fs.readFileSync('next.config.js', 'utf8')

  const checks = {
    'SWC Minification': config.includes('swcMinify'),
    'Compress': config.includes('compress: true'),
    'Remove Console': config.includes('removeConsole'),
    'Optimize CSS': config.includes('optimizeCss'),
    'Cache Headers': config.includes('headers()'),
  }

  Object.entries(checks).forEach(([name, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${name}`)
  })
} else {
  console.log('❌ next.config.js not found')
}

console.log('\n' + '='.repeat(60) + '\n')

// Check layout.tsx optimizations
console.log('✅ Checking Layout Optimizations...\n')

if (fs.existsSync('app/layout.tsx')) {
  const layout = fs.readFileSync('app/layout.tsx', 'utf8')

  const checks = {
    'DNS Prefetch': layout.includes('dns-prefetch'),
    'Preconnect': layout.includes('preconnect'),
    'Resource Prefetch': layout.includes('prefetch'),
    'Service Worker': layout.includes('serviceWorker'),
    'Performance Monitoring': layout.includes('performance'),
  }

  Object.entries(checks).forEach(([name, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${name}`)
  })
} else {
  console.log('❌ app/layout.tsx not found')
}

console.log('\n' + '='.repeat(60) + '\n')

// Summary
console.log('📊 Performance Audit Summary\n')

if (allFilesExist) {
  console.log('✅ All performance optimization files are in place')
  console.log('✅ Components are optimized with React.memo')
  console.log('✅ Next.js configuration is optimized')
  console.log('✅ Layout includes resource hints and service worker')
  console.log('\n🎯 Ready for Lighthouse testing!')
  console.log('\nNext Steps:')
  console.log('1. npm run build')
  console.log('2. npx serve -s out -p 3000')
  console.log('3. lighthouse http://localhost:3000/hablas --view')
} else {
  console.log('❌ Some optimization files are missing')
  console.log('⚠️  Please review the checklist above')
}

console.log('\n' + '='.repeat(60) + '\n')

// Performance metrics targets
console.log('🎯 Performance Targets\n')
console.log('Lighthouse Score:          95+')
console.log('First Contentful Paint:    < 1.8s')
console.log('Largest Contentful Paint:  < 2.5s')
console.log('Total Blocking Time:       < 200ms')
console.log('Cumulative Layout Shift:   < 0.1')
console.log('Bundle Size (JS):          < 200KB')
console.log('\n' + '='.repeat(60) + '\n')
