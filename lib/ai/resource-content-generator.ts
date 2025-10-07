/**
 * AI-Powered Resource Content Generator
 * @fileoverview Uses Claude Sonnet 4.5 to generate actual resource content
 * following templates and content creation guidelines
 */

import Anthropic from '@anthropic-ai/sdk'
import type { Resource } from '@/data/resources'
import { validateResource } from '@/lib/utils/resource-validator'
import { readFileSync } from 'fs'
import { join } from 'path'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
})

/**
 * Configuration for AI generation
 */
export interface GenerationConfig {
  /** Claude model to use */
  model?: string
  /** Max tokens for generation */
  maxTokens?: number
  /** Temperature (0-1, lower = more focused) */
  temperature?: number
  /** Include detailed explanations */
  verbose?: boolean
}

const DEFAULT_CONFIG: Required<GenerationConfig> = {
  model: 'claude-sonnet-4-5-20250929',
  maxTokens: 8000,
  temperature: 0.7,
  verbose: false
}

/**
 * Generate actual content for a resource using AI
 */
export async function generateResourceContent(
  resource: Partial<Resource>,
  config: GenerationConfig = {}
): Promise<{
  content: string
  metadata: {
    tokensUsed: number
    generationTime: number
    wordCount: number
  }
}> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  const startTime = Date.now()

  // Load content creation guidelines
  const guidelines = await loadContentGuidelines()

  // Create specialized prompt based on resource type
  const prompt = createGenerationPrompt(resource, guidelines)

  // Generate content with Claude
  const response = await anthropic.messages.create({
    model: mergedConfig.model,
    max_tokens: mergedConfig.maxTokens,
    temperature: mergedConfig.temperature,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  })

  const content = extractContent(response)
  const generationTime = Date.now() - startTime

  return {
    content,
    metadata: {
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      generationTime,
      wordCount: content.split(/\s+/).length
    }
  }
}

/**
 * Load content creation guidelines
 */
async function loadContentGuidelines(): Promise<string> {
  try {
    const guidelinesPath = join(process.cwd(), 'docs', 'resources', 'content-creation-guide.md')
    return readFileSync(guidelinesPath, 'utf-8')
  } catch (error) {
    console.warn('Could not load content guidelines, using built-in defaults')
    return getDefaultGuidelines()
  }
}

/**
 * Create specialized prompt based on resource type
 */
function createGenerationPrompt(
  resource: Partial<Resource>,
  guidelines: string
): string {
  const basePrompt = `You are an expert content creator for the Hablas English learning platform, which provides English language resources specifically for Spanish-speaking gig economy workers (delivery drivers and rideshare drivers).

# Target Audience
- Delivery drivers (repartidores): Rappi, Uber Eats, DoorDash, Postmates
- Rideshare drivers (conductores): Uber, Lyft, DiDi
- Spanish speakers learning English
- Ages 20-55, working in US or English-speaking markets
- Need practical, immediately applicable phrases and vocabulary

# Your Task
Generate comprehensive, professional content for the following resource:

**Title**: ${resource.title || 'Untitled Resource'}
**Description**: ${resource.description || 'No description provided'}
**Category**: ${resource.category || 'all'} (repartidor = delivery, conductor = rideshare, all = universal)
**Level**: ${resource.level || 'basico'} (basico = beginner, intermedio = intermediate, avanzado = advanced)
**Type**: ${resource.type || 'pdf'}

# Content Creation Guidelines
${guidelines}

# Specific Requirements for This Resource Type`

  // Add type-specific requirements
  switch (resource.type) {
    case 'pdf':
      return basePrompt + `

## PDF Content Structure
Create a complete, ready-to-format PDF document with:

1. **Cover Page**
   - Title in Spanish
   - Level indicator (BÁSICO/INTERMEDIO/AVANZADO)
   - Visual icon description
   - Brief introduction

2. **Table of Contents** (if more than 5 sections)

3. **Main Content** (8-15 pages)
   - One topic per page
   - Each phrase must include:
     * English phrase
     * Spanish translation
     * Phonetic pronunciation guide
     * Usage context ("Usa cuando...")
     * Example situation
   - Use clear formatting with boxes/tables
   - Include visual cues (icons, colors)

4. **Quick Reference Card** (last page)
   - All key phrases in table format
   - Easy to scan and reference quickly

## Format Guidelines
- Use markdown formatting
- Include [ICON: description] for where images should go
- Mark sections clearly with headers
- Use tables for phrase lists
- Include pronunciation guides: [phonetic spelling]
- Add context boxes: "💡 TIP:" or "⚠️ WARNING:" or "✅ BEST PRACTICE:"

## Language Requirements
- All English phrases must be natural and commonly used
- Spanish translations must be clear and use Latin American Spanish
- Include cultural notes where relevant
- Avoid overly formal language
- Focus on practical, real-world usage

Generate the complete PDF content now:`

    case 'audio':
      return basePrompt + `

## Audio Script Structure
Create a complete audio script for a ${resource.level} level learning audio:

1. **Introduction** (30-45 seconds, in Spanish)
   - Welcome message
   - What they will learn
   - How to use this audio

2. **Main Content** (3-7 minutes)
   For EACH phrase/section:
   - State the context (Spanish)
   - Say the English phrase clearly
   - Provide Spanish translation
   - Repeat English phrase
   - [3 second pause] for listener repetition
   - (Optional) Second repetition for critical phrases

3. **Practice Section** (1-2 minutes)
   - Quick review of key phrases
   - Faster repetition drill
   - Encouragement

4. **Closing** (30 seconds, in Spanish)
   - Summary of what was learned
   - Next steps
   - Motivational message

## Script Format
\`\`\`
[INTRO - SPANISH]
[Speaker tone: friendly, encouraging]
"Bienvenido a..."

[PHRASE 1 - CONTEXT]
[Spanish] "Cuando llegas a la puerta del cliente..."

[PHRASE 1 - ENGLISH]
[English, clear, slow] "Here is your order"

[PHRASE 1 - TRANSLATION]
[Spanish] "Aquí está su pedido"

[PHRASE 1 - REPEAT]
[English, clear, slow] "Here is your order"

[PAUSE: 3 seconds]
...
\`\`\`

## Audio Requirements
- Natural, conversational tone
- Clear pronunciation at 80% normal speed
- Include timing markers [MM:SS]
- Mark pauses: [PAUSE: X seconds]
- Note tone changes: [friendly], [professional], [empathetic]
- Total duration: aim for 5-8 minutes
- Native English speaker quality pronunciation

Generate the complete audio script now:`

    case 'image':
      return basePrompt + `

## Visual Guide Content
Create detailed specifications for an image-based learning resource:

1. **Overall Design**
   - Layout: Mobile-first (1080x1920 or landscape 1920x1080)
   - Style: Clean, modern, high contrast
   - Color scheme: Professional but friendly
   - Typography: Large, readable fonts (18pt minimum)

2. **Content Pages** (5-10 pages/slides)
   For each visual:
   - **Screenshot/Image**: Detailed description of what to show
   - **Annotations**: Spanish labels with arrows pointing to UI elements
   - **Translations**: English term = Spanish translation
   - **Color Coding**:
     * Green = positive/confirm actions
     * Red = warning/cancel actions
     * Blue = informational
     * Yellow = important/attention

3. **Visual Elements**
   - Icons and their meanings
   - Button labels translated
   - Common symbols explained
   - Real-world context photos

## Output Format
For each page/visual, provide:

\`\`\`
[PAGE 1]
Title: [Title in Spanish]

[IMAGE DESCRIPTION]
[Detailed description of screenshot or graphic to create]

[ANNOTATIONS]
1. Arrow → "Accept" = "Aceptar" (Green highlight)
2. Arrow → "Decline" = "Rechazar" (Red highlight)
...

[CONTEXT NOTE]
[When/how to use this screen]
\`\`\`

## Requirements
- Focus on actual app interfaces (Uber, Rappi, DiDi, etc.)
- Use real-world scenarios
- Make annotations clear and unambiguous
- Include visual hierarchy (most important items first)
- Consider outdoor visibility (high contrast)

Generate complete visual guide specifications now:`

    case 'video':
      return basePrompt + `

## Video Tutorial Script
Create a comprehensive video script with visual and audio components:

1. **Video Structure** (10-15 minutes)
   - Introduction (1 min)
   - Main content divided into 3-5 modules (2-3 min each)
   - Practice scenarios (2-3 min)
   - Conclusion and next steps (1 min)

2. **Script Format**
For each scene:
\`\`\`
[SCENE 1 - INTRO]
Duration: 01:00
Setting: [Description of visual setting]

[VISUAL]
- Show: [What appears on screen]
- Text overlay: [Any text to display]
- B-roll: [Supporting footage]

[AUDIO - SPANISH]
[Narrator script in Spanish]

[ENGLISH DEMONSTRATION]
[English phrases to be demonstrated]

[SPANISH SUBTITLES]
[What subtitles should say]
---
\`\`\`

3. **Content Requirements**
   - Include roleplay demonstrations
   - Show real-world situations
   - Use professional actors or realistic scenarios
   - Include both correct and incorrect examples
   - Add visual cues and graphics
   - Ensure high production value feel

4. **Educational Elements**
   - Learning objectives at start
   - Progress indicators
   - Review sections
   - Practice opportunities
   - Certification/completion message

5. **Technical Specs**
   - Scene descriptions
   - Camera angles
   - Transitions
   - Graphics/overlays
   - Music cues
   - Subtitle timing

Generate complete video script with all scenes now:`

    default:
      return basePrompt + '\n\nGenerate comprehensive, practical content for this resource type.'
  }
}

/**
 * Extract content from Claude's response
 */
function extractContent(response: Anthropic.Message): string {
  const textBlocks = response.content.filter(block => block.type === 'text')
  return textBlocks.map(block => 'text' in block ? block.text : '').join('\n\n')
}

/**
 * Get default guidelines if file not found
 */
function getDefaultGuidelines(): string {
  return `
# Core Guidelines

## Target Audience
- Spanish-speaking gig economy workers
- Delivery drivers and rideshare drivers
- Learning practical English for their jobs

## Content Principles
1. Practical First: Every phrase must be immediately useful
2. Bilingual: Always include Spanish translations
3. Phonetic Help: Provide pronunciation guides
4. Cultural Context: Explain American customs when relevant
5. Real Scenarios: Use actual situations drivers face

## Quality Standards
- Natural, conversational English
- Clear Spanish translations (Latin American)
- Professional but friendly tone
- Mobile-friendly formatting
- Offline-capable when possible
`
}

/**
 * Generate multiple resources in batch
 */
export async function generateResourceBatch(
  resources: Partial<Resource>[],
  config: GenerationConfig = {}
): Promise<Array<{
  resource: Partial<Resource>
  content: string
  metadata: any
  validation: any
}>> {
  const results = []

  for (const resource of resources) {
    console.log(`Generating content for: ${resource.title}`)

    try {
      // Generate content
      const { content, metadata } = await generateResourceContent(resource, config)

      // Validate resource
      const validation = validateResource(resource as Resource)

      results.push({
        resource,
        content,
        metadata,
        validation
      })

      console.log(`✅ Generated (${metadata.wordCount} words, ${metadata.tokensUsed} tokens)`)

      // Rate limiting: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.error(`❌ Failed to generate ${resource.title}:`, error)
      results.push({
        resource,
        content: '',
        metadata: { error: String(error) },
        validation: { isValid: false, errors: [String(error)] }
      })
    }
  }

  return results
}

/**
 * Generate a complete resource set for a topic
 */
export async function generateCompleteResourceSet(
  topic: string,
  category: Resource['category'],
  config: GenerationConfig = {}
): Promise<any[]> {
  console.log(`\n🚀 Generating complete resource set for: ${topic}\n`)

  // Define the set: Basic PDF + Audio, Intermediate PDF, Advanced PDF
  const resourceSet: Partial<Resource>[] = [
    {
      title: `${topic} - Guía Básica`,
      description: `Frases y vocabulario esencial de ${topic} para principiantes`,
      type: 'pdf',
      category,
      level: 'basico',
      size: '1.5 MB',
      downloadUrl: `/resources/${category}/${topic.toLowerCase().replace(/\s+/g, '-')}-basic.pdf`,
      tags: ['Básico', topic],
      offline: true
    },
    {
      title: `${topic} - Audio de Pronunciación`,
      description: `Pronunciación de frases clave de ${topic}`,
      type: 'audio',
      category,
      level: 'basico',
      size: '3.5 MB',
      downloadUrl: `/resources/${category}/${topic.toLowerCase().replace(/\s+/g, '-')}-audio.mp3`,
      tags: ['Básico', 'Audio', topic],
      offline: true
    },
    {
      title: `${topic} - Nivel Intermedio`,
      description: `Conversaciones y situaciones complejas de ${topic}`,
      type: 'pdf',
      category,
      level: 'intermedio',
      size: '2.2 MB',
      downloadUrl: `/resources/${category}/${topic.toLowerCase().replace(/\s+/g, '-')}-intermediate.pdf`,
      tags: ['Intermedio', topic],
      offline: true
    },
    {
      title: `${topic} - Nivel Avanzado`,
      description: `Dominio profesional de ${topic} para situaciones complejas`,
      type: 'pdf',
      category,
      level: 'avanzado',
      size: '2.8 MB',
      downloadUrl: `/resources/${category}/${topic.toLowerCase().replace(/\s+/g, '-')}-advanced.pdf`,
      tags: ['Avanzado', topic, 'Profesional'],
      offline: true
    }
  ]

  return generateResourceBatch(resourceSet, config)
}

/**
 * Save generated content to files
 */
export async function saveGeneratedContent(
  results: Array<{ resource: Partial<Resource>; content: string }>,
  outputDir: string
): Promise<void> {
  const fs = await import('fs/promises')
  const path = await import('path')

  for (const result of results) {
    if (!result.content) continue

    const filename = result.resource.title
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const extension = getFileExtension(result.resource.type)
    const filepath = path.join(outputDir, `${filename}${extension}`)

    await fs.writeFile(filepath, result.content, 'utf-8')
    console.log(`💾 Saved: ${filepath}`)
  }
}

/**
 * Get appropriate file extension for resource type
 */
function getFileExtension(type?: Resource['type']): string {
  switch (type) {
    case 'pdf':
      return '.md' // Markdown that can be converted to PDF
    case 'audio':
      return '-script.txt' // Audio script
    case 'image':
      return '-spec.md' // Visual specifications
    case 'video':
      return '-script.md' // Video script
    default:
      return '.txt'
  }
}

export default {
  generateResourceContent,
  generateResourceBatch,
  generateCompleteResourceSet,
  saveGeneratedContent
}
