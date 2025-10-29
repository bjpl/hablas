#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// Phase 1 audio mappings
const audioMappings = {
  1: '/audio/frases-esenciales-var1-es.mp3',
  4: '/audio/frases-esenciales-var2-es.mp3',
  6: '/audio/frases-esenciales-var3-es.mp3',
  11: '/audio/saludos-var1-en.mp3',
  14: '/audio/saludos-var2-en.mp3',
  17: '/audio/saludos-var3-en.mp3',
  22: '/audio/numeros-direcciones-var1-es.mp3',
  23: '/audio/tiempo-var1-es.mp3',
  27: '/audio/emergencia-var1-es.mp3',
  29: '/audio/numeros-direcciones-var2-es.mp3',
  48: '/audio/emergency-var1-en.mp3',
  50: '/audio/emergency-var2-en.mp3'
}

const resourcesPath = join(process.cwd(), 'data/resources.ts')
let content = readFileSync(resourcesPath, 'utf-8')

let updatedCount = 0

// Update each resource
Object.entries(audioMappings).forEach(([id, audioUrl]) => {
  const idNum = parseInt(id)

  // Find the resource and add audioUrl if not already present
  const resourcePattern = new RegExp(`("id":\\s*${idNum},(?:(?!"id":)[\\s\\S])*?)("offline":\\s*true)`, 'g')

  const replacement = content.replace(resourcePattern, (match, before, offline) => {
    if (match.includes('"audioUrl"')) {
      console.log(`  Resource ${id}: Already has audioUrl, skipping`)
      return match
    }
    updatedCount++
    console.log(`  Resource ${id}: Adding audioUrl: ${audioUrl}`)
    return `${before}${offline},\n    "audioUrl": "${audioUrl}"`
  })

  if (replacement !== content) {
    content = replacement
  }
})

writeFileSync(resourcesPath, content, 'utf-8')
console.log(`\n✅ Updated ${updatedCount} resources with audio URLs`)
console.log(`📁 Updated: ${resourcesPath}`)
