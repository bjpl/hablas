#!/usr/bin/env tsx
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

// Get all actual audio files
const audioDir = join(process.cwd(), 'public/audio')
const audioFiles = readdirSync(audioDir)
  .filter(f => f.startsWith('resource-') && f.endsWith('.mp3'))
  .map(f => parseInt(f.replace('resource-', '').replace('.mp3', '')))
  .filter(id => !isNaN(id))

console.log(`Found ${audioFiles.length} audio files for resources:`, audioFiles.sort((a,b) => a-b))

const resourcesPath = join(process.cwd(), 'data/resources.ts')
let content = readFileSync(resourcesPath, 'utf-8')

let updated = 0

audioFiles.forEach(id => {
  const resourcePattern = new RegExp(`("id":\\s*${id},(?:(?!"id":)[\\s\\S])*?)("offline":\\s*true)`, 'g')

  const replacement = content.replace(resourcePattern, (match, before, offline) => {
    if (match.includes('"audioUrl"')) {
      return match
    }
    updated++
    console.log(`  ✅ Resource ${id}: Added audioUrl`)
    return `${before}${offline},\n    "audioUrl": "/audio/resource-${id}.mp3"`
  })

  if (replacement !== content) {
    content = replacement
  }
})

writeFileSync(resourcesPath, content, 'utf-8')
console.log(`\n✅ Updated ${updated} resources with audio URLs`)
