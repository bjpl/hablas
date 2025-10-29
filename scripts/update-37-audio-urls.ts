#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'fs'

const file = 'data/resources.ts'
let content = readFileSync(file, 'utf-8')

// Add audioUrl to resources 1-37
for (let id = 1; id <= 37; id++) {
  const regex = new RegExp(`("id":\s*${id},.*?"offline":\s*true,)`, 's')
  const match = content.match(regex)

  if (match && !content.includes(`"id": ${id},.*"audioUrl":`)) {
    content = content.replace(
      regex,
      `$1\n    "audioUrl": "/audio/resource-${id}.mp3",`
    )
    console.log(`✓ Added audioUrl to resource ${id}`)
  }
}

writeFileSync(file, content)
console.log('\n✅ Updated 37 resources with audio URLs')
