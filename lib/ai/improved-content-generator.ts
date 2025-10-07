/**
 * Improved AI Content Generator
 * @fileoverview Enhanced version with better prompts, error handling, and formatting
 */

import Anthropic from '@anthropic-ai/sdk'
import type { Resource } from '@/data/resources'
import { validateResource } from '@/lib/utils/resource-validator'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
})

export interface GenerationConfig {
  model?: string
  maxTokens?: number
  temperature?: number
  verbose?: boolean
  includeExamples?: boolean
}

const DEFAULT_CONFIG: Required<GenerationConfig> = {
  model: 'claude-sonnet-4-5-20250929',
  maxTokens: 8000,
  temperature: 0.7,
  verbose: false,
  includeExamples: true
}

/**
 * IMPROVED: Enhanced generation with better prompts and error handling
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
    qualityScore: number
  }
}> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  const startTime = Date.now()

  // Validate resource before generation
  const validation = validateResource(resource as Resource)
  if (!validation.isValid && validation.errors.length > 0) {
    throw new Error(`Resource validation failed: ${validation.errors.join(', ')}`)
  }

  // Create enhanced prompt
  const prompt = createEnhancedPrompt(resource, mergedConfig)

  try {
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

    // Calculate quality score
    const qualityScore = assessContentQuality(content, resource)

    return {
      content,
      metadata: {
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        generationTime,
        wordCount: content.split(/\s+/).length,
        qualityScore
      }
    }
  } catch (error: any) {
    // Improved error handling
    if (error.status === 401) {
      throw new Error('Invalid API key. Please check ANTHROPIC_API_KEY environment variable.')
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.')
    } else if (error.status === 500) {
      throw new Error('Anthropic API error. Please try again later.')
    } else {
      throw new Error(`Generation failed: ${error.message}`)
    }
  }
}

/**
 * IMPROVED: Enhanced prompt with better structure and examples
 */
function createEnhancedPrompt(
  resource: Partial<Resource>,
  config: Required<GenerationConfig>
): string {
  const baseContext = `You are an expert educational content creator for the Hablas platform - an English learning system for Spanish-speaking gig economy workers.

# TARGET AUDIENCE
- **Delivery drivers** (repartidores): Rappi, Uber Eats, DoorDash workers
- **Rideshare drivers** (conductores): Uber, Lyft, DiDi drivers
- **Language level**: Beginner to advanced Spanish speakers learning English
- **Age range**: 20-55 years old
- **Context**: Working in US or English-speaking markets, need practical English immediately

# YOUR TASK
Create ${resource.type?.toUpperCase()} content for:

**Title**: ${resource.title || 'Untitled'}
**Description**: ${resource.description || 'No description'}
**Category**: ${getCategoryDescription(resource.category)}
**Level**: ${getLevelDescription(resource.level)}
**Type**: ${resource.type}

# CORE REQUIREMENTS
✅ **100% Practical**: Every phrase must solve a real problem drivers face
✅ **Bilingual**: All English with Spanish translations
✅ **Pronunciation**: Include phonetic guides [like this]
✅ **Context**: Explain when/how to use each phrase
✅ **Real Scenarios**: Based on actual driver situations
✅ **Mobile-Optimized**: Easy to read on phone screens
✅ **Offline-Ready**: Works without internet connection`

  // Add type-specific instructions
  let typeInstructions = ''

  switch (resource.type) {
    case 'pdf':
      typeInstructions = getPDFInstructions(resource, config.includeExamples)
      break
    case 'audio':
      typeInstructions = getAudioInstructions(resource, config.includeExamples)
      break
    case 'image':
      typeInstructions = getImageInstructions(resource, config.includeExamples)
      break
    case 'video':
      typeInstructions = getVideoInstructions(resource, config.includeExamples)
      break
  }

  return `${baseContext}\n\n${typeInstructions}\n\n🚀 Generate the complete, professional content now!`
}

/**
 * IMPROVED: Enhanced PDF instructions with better formatting
 */
function getPDFInstructions(resource: Partial<Resource>, includeExamples: boolean): string {
  const level = resource.level || 'basico'
  const phraseCount = level === 'basico' ? 30 : level === 'intermedio' ? 40 : 50

  return `# PDF CONTENT STRUCTURE

## FORMAT REQUIREMENTS
Create a complete, ready-to-format PDF in Markdown with:

### 1. COVER PAGE (Page 1)
\`\`\`markdown
# ${resource.title || 'Title in Spanish'}

**Nivel**: ${level.toUpperCase()}
**Para**: ${getCategoryDescription(resource.category)}

### ¿Qué aprenderás?
[2-3 sentence description in Spanish]

### Lo que necesitas saber:
✅ No necesitas experiencia previa
✅ ${phraseCount} frases prácticas
✅ Ejemplos de situaciones reales
✅ Pronunciación incluida
\`\`\`

### 2. TABLE OF CONTENTS (Page 2)
Number and organize by topic (5-8 main sections)

### 3. MAIN CONTENT (Pages 3-N)
**CRITICAL**: Use this EXACT format for EVERY phrase:

\`\`\`markdown
## [Section Number]. [Section Title in Spanish]

### Frase [Number]: [Spanish description of situation]

┌─────────────────────────────────────────────────────────┐
│ **English**: "[Exact phrase in English]"                │
│                                                          │
│ 🗣️ **Español**: [Spanish translation]                   │
│ 🔊 **Pronunciación**: [phonetic guide in brackets]      │
│                                                          │
│ **Usa cuando**: [When to use this phrase]               │
│ **Ejemplo real**: [Specific realistic example]          │
│                                                          │
│ 💡 **TIP**: [Helpful cultural or practical tip]         │
└─────────────────────────────────────────────────────────┘

[Optional: Variations section if applicable]
**Variaciones**:
- "[Alternative phrase]" = [Spanish] = [pronunciation]
\`\`\`

### 4. QUICK REFERENCE CARD (Last Page)
Create a table with ALL key phrases:

\`\`\`markdown
| Situación | English | Español | Pronunciación |
|-----------|---------|---------|---------------|
| [Context] | "[phrase]" | [translation] | [phonetic] |
\`\`\`

## QUALITY STANDARDS
- ✅ Natural, conversational English (what natives actually say)
- ✅ Latin American Spanish (neutral, no regional slang)
- ✅ Clear phonetic guides using standard pronunciation notation
- ✅ Realistic scenarios from actual driver experiences
- ✅ Cultural notes when relevant (tipping, greetings, etc.)
- ✅ Professional but friendly tone
- ✅ ${phraseCount}+ unique, practical phrases

## LEVEL-SPECIFIC GUIDANCE
${getLevelGuidance(level)}

${includeExamples ? getExamplePDFPhrase() : ''}`
}

/**
 * IMPROVED: Enhanced audio instructions
 */
function getAudioInstructions(resource: Partial<Resource>, includeExamples: boolean): string {
  return `# AUDIO SCRIPT STRUCTURE

## FORMAT REQUIREMENTS
Create a complete audio script (5-8 minutes) with precise timing:

### SCRIPT FORMAT
\`\`\`
[MM:SS] - [SECTION NAME]
[Tone: description]
[Speaker: Spanish/English narrator]

"[Exact words to be spoken]"

[Action/Pause instructions]
\`\`\`

### STRUCTURE

**1. INTRODUCTION (00:00 - 00:45)** - Spanish
- Friendly welcome
- What they will learn
- How to use this audio
- Encouragement

**2. MAIN CONTENT (00:45 - 05:30)**
For EACH phrase (repeat this pattern):
\`\`\`
[MM:SS] PHRASE [NUMBER]
[Spanish] "[Context: when to use this]"

[English - Native speaker, 80% speed]
"[Exact English phrase]"

[PAUSE: 3 seconds]

[English - Repeat for reinforcement]
"[Same phrase again]"

[Spanish] "[Translation]"

[PAUSE: 2 seconds]
---
\`\`\`

**3. PRACTICE DRILL (05:30 - 06:30)**
- Quick repetition of all phrases
- Faster pace (normal speed)
- 1 second pause between
- Encouraging feedback

**4. CONCLUSION (06:30 - 07:00)**
- Summary of what was learned
- Next steps (download PDF, practice daily)
- Motivational closing

## AUDIO-SPECIFIC REQUIREMENTS
- ✅ Exact timing markers [MM:SS]
- ✅ Clear speaker instructions
- ✅ Tone/emotion notes
- ✅ Precise pause durations
- ✅ Repetition for retention
- ✅ Natural, clear pronunciation at 80% normal speed
- ✅ Total duration: 6-8 minutes

${includeExamples ? getExampleAudioScript() : ''}`
}

/**
 * IMPROVED: Enhanced image instructions
 */
function getImageInstructions(resource: Partial<Resource>, includeExamples: boolean): string {
  return `# VISUAL GUIDE SPECIFICATIONS

## FORMAT REQUIREMENTS
Create detailed specifications for a visual learning resource (8-12 pages):

### OVERALL DESIGN SPECS
\`\`\`
Layout: Mobile Portrait 1080x1920px
Style: Clean, modern, high contrast
Color Scheme: [Primary app colors]
Typography:
  - Headers: Arial Bold 24pt
  - Body: Arial Regular 18pt (minimum for outdoor visibility)
  - Annotations: 16pt minimum
Background: Light (#F5F5F5) for low eye strain
\`\`\`

### PAGE STRUCTURE (Repeat for each page)

\`\`\`markdown
## PAGE [N]: [Page Title in Spanish]

### Image Description
[Detailed description of screenshot or graphic to create]

### Visual Elements Layout
[Describe layout using tree structure:]
**Top Section** (Color highlight)
├─ Element 1: [description]
├─ Element 2: [description]
└─ Element 3: [description]

### Annotations (numbered)
1. Arrow → "[English UI text]"
   📱 Label: "[Spanish translation]"
   🎨 Highlight: [Color] box/circle/arrow
   📝 Note: "[Additional explanation if needed]"

2. [Continue for all UI elements on page...]

### Context Box
┌────────────────────────────────────┐
│ 💡 IMPORTANTE:                     │
│ [Key insight in Spanish]           │
│ [Practical tip or warning]         │
└────────────────────────────────────┘
\`\`\`

## COLOR CODING SYSTEM
- 🟢 Green: Positive actions (Accept, Confirm, Start)
- 🔴 Red: Negative actions (Decline, Cancel, Stop)
- 🔵 Blue: Information (View details, Help)
- 🟡 Yellow: Warnings (Time limits, Important notices)

## CONTENT REQUIREMENTS
- ✅ Real app interfaces (Uber, Rappi, DiDi, etc.)
- ✅ Actual screenshots (specify exactly what to capture)
- ✅ Clear, large annotations readable outdoors
- ✅ Every English word translated to Spanish
- ✅ Visual hierarchy (most important info first)
- ✅ High contrast for outdoor visibility
- ✅ Mobile-optimized (portrait orientation)

${includeExamples ? getExampleImageSpec() : ''}`
}

/**
 * IMPROVED: Enhanced video instructions
 */
function getVideoInstructions(resource: Partial<Resource>, includeExamples: boolean): string {
  return `# VIDEO TUTORIAL SCRIPT

## FORMAT REQUIREMENTS
Create a complete video script (10-15 minutes) with scene-by-scene breakdown:

### SCENE STRUCTURE
\`\`\`markdown
## SCENE [N]: [Scene Title]
Duration: MM:SS
Setting: [Location/environment description]

[VISUAL]
- Camera angle: [description]
- On-screen elements: [list]
- Text overlays: [exact text]
- Graphics/animations: [description]
- B-roll footage: [if applicable]

[AUDIO - Language]
"[Exact dialogue or narration]"

[SUBTITLES - Spanish]
"[Exact subtitle text]"

[NOTES]
- [Production notes]
- [Timing considerations]
- [Special effects needed]
\`\`\`

### VIDEO STRUCTURE

**INTRO (1:00)**
- Host introduction
- Course overview
- Learning objectives
- Engagement hook

**MAIN CONTENT (8-10 minutes)**
Divide into 4-5 modules, each with:
1. **Spanish explanation** (30 sec)
2. **English demonstration** (roleplay, 1-2 min)
3. **Pronunciation practice** (30 sec)
4. **Common mistakes** (30 sec)

**PRACTICE/QUIZ (2-3 minutes)**
- Interactive scenarios
- Multiple choice questions
- Correct answer reveals

**CONCLUSION (1:00)**
- Recap key points
- Next steps
- Download materials
- Motivation

## PRODUCTION REQUIREMENTS
- ✅ Professional host (friendly delivery/rideshare driver)
- ✅ Real-world locations (actual deliveries when possible)
- ✅ Roleplay with actors (show correct AND incorrect examples)
- ✅ Spanish subtitles burned-in or SRT file
- ✅ Chapter markers for easy navigation
- ✅ Clear audio (no background noise)
- ✅ Good lighting (outdoor and indoor scenes)
- ✅ Mobile-friendly framing (vertical or square)

${includeExamples ? getExampleVideoScene() : ''}`
}

/**
 * Helper: Get category description
 */
function getCategoryDescription(category?: string): string {
  switch (category) {
    case 'repartidor':
      return 'Domiciliarios y repartidores (Rappi, Uber Eats, DoorDash)'
    case 'conductor':
      return 'Conductores (Uber, DiDi, Lyft)'
    case 'all':
      return 'Todos los trabajadores de gig economy'
    default:
      return 'Gig economy workers'
  }
}

/**
 * Helper: Get level description
 */
function getLevelDescription(level?: string): string {
  switch (level) {
    case 'basico':
      return 'Básico (Principiante, sin experiencia previa)'
    case 'intermedio':
      return 'Intermedio (Alguna experiencia con inglés)'
    case 'avanzado':
      return 'Avanzado (Conversación y situaciones complejas)'
    default:
      return 'General'
  }
}

/**
 * Helper: Get level-specific guidance
 */
function getLevelGuidance(level: string): string {
  switch (level) {
    case 'basico':
      return `**BÁSICO Level Guidelines**:
- Focus on survival phrases and essentials
- Very simple sentence structures
- Heavy emphasis on pronunciation
- Lots of repetition and examples
- Build confidence with easy wins`

    case 'intermedio':
      return `**INTERMEDIO Level Guidelines**:
- More complex sentence structures
- Conversational elements (small talk)
- Problem-solving scenarios
- Cultural nuances introduced
- Encourage longer interactions`

    case 'avanzado':
      return `**AVANZADO Level Guidelines**:
- Professional communication skills
- Handle complex, unexpected situations
- Cultural intelligence and etiquette
- Idioms and colloquial expressions
- Build mastery and confidence`

    default:
      return ''
  }
}

/**
 * Example PDF phrase
 */
function getExamplePDFPhrase(): string {
  return `

## EXAMPLE PHRASE FORMAT:

### Frase 1: Saludo al llegar

┌─────────────────────────────────────────────────────────┐
│ **English**: "Good morning! I have a delivery for you." │
│                                                          │
│ 🗣️ **Español**: Buenos días! Tengo una entrega para ti. │
│ 🔊 **Pronunciación**: [gud MOR-ning! ai hav a           │
│                       di-LIV-er-ee for yoo]              │
│                                                          │
│ **Usa cuando**: Llegas a la puerta del cliente          │
│ **Ejemplo real**: Cliente abre la puerta, tú sonríes    │
│ y dices esta frase mientras muestras la comida          │
│                                                          │
│ 💡 **TIP**: Siempre sonríe y haz contacto visual. Los   │
│ estadounidenses valoran la amabilidad.                   │
└─────────────────────────────────────────────────────────┘

**Variaciones**:
- "Good afternoon!" = Buenas tardes = [gud af-ter-NOON]
- "Hello!" = Hola = [heh-LOH] (más informal)
`
}

/**
 * Example audio script
 */
function getExampleAudioScript(): string {
  return `

## EXAMPLE AUDIO SECTION:

\`\`\`
[01:30] PHRASE 3: CONFIRMING ORDER
[Tone: Professional, clear]

[Spanish]
"Frase 3: Cuando entregas el pedido al cliente."

[English - Slow, clear, native pronunciation]
"Here's your order from McDonald's"

[PAUSE: 3 seconds]

[English - Repeat]
"Here's your order from McDonald's"

[Spanish]
"Aquí está su pedido de McDonald's"

[Pause: 2 seconds]

[Spanish - Tip]
"Nota: Siempre menciona el nombre del restaurante.
Ayuda al cliente a confirmar que es su pedido."

---
\`\`\`
`
}

/**
 * Example image spec
 */
function getExampleImageSpec(): string {
  return `

## EXAMPLE PAGE SPECIFICATION:

### PAGE 1: PANTALLA DE ACEPTACIÓN - RAPPI

**Image Description**: Screenshot of Rappi app showing new order notification

**Visual Layout**:
Top Bar (Orange #FF441F)
├─ "NUEVO PEDIDO" text
└─ Timer: "00:28" countdown

Middle Section (White background)
├─ Restaurant: "McDonald's" + icon
├─ Customer: "John Smith"
├─ Distance: "1.2 km"
├─ Payment: "$12.50"
└─ Items: "2 Big Mac, 1 Fries"

Bottom Buttons
├─ Green: "ACEPTAR"
└─ Gray: "RECHAZAR"

**Annotations**:
1. Arrow → "NUEVO PEDIDO"
   📱 Spanish box: "= NEW ORDER"
   🎨 Highlight: Orange circle

2. Arrow → Timer "00:28"
   📱 Spanish box: "Tienes 28 segundos para decidir"
   🎨 Highlight: Yellow pulsing circle

3. Arrow → "ACEPTAR" button
   📱 Spanish box: "ACCEPT = Tomar el pedido"
   🎨 Highlight: Green arrow pointing to button
`
}

/**
 * Example video scene
 */
function getExampleVideoScene(): string {
  return `

## EXAMPLE SCENE:

### SCENE 3: ARRIVAL AT CUSTOMER LOCATION
Duration: 02:00
Setting: Exterior of apartment building, daytime

[VISUAL]
- Camera: Over-the-shoulder following driver
- Close-up: Door number "Apt 5B"
- Split screen: Phone showing delivery app
- Text overlay appears: "Scenario: Arriving at delivery address"

[AUDIO - SPANISH]
"Situación: Has llegado a la dirección. El cliente abre la puerta.
Vamos a ver qué decir paso por paso."

[ROLEPLAY - ENGLISH with Spanish subtitles]
Driver knocks door: *knock knock*
Customer opens: "Hello?"

Driver: "Good afternoon! I have a delivery for Sarah Johnson."
[Subtitle: "Buenas tardes! Tengo una entrega para Sarah Johnson"]

Customer: "That's me!"

Driver: "Great! Here's your order from Chipotle."
[Subtitle: "Genial! Aquí está su pedido de Chipotle"]

[PAUSE - Analysis in Spanish]
"Nota importante: El conductor:
1. Saludó profesionalmente
2. Confirmó el nombre
3. Mencionó el restaurante"

[TEXT OVERLAY - Key phrases highlighted]
✅ "Good afternoon" = Professional greeting
✅ "I have a delivery for..." = Clear purpose
✅ "Here's your order from..." = Confirm restaurant
`
}

/**
 * Extract content from response
 */
function extractContent(response: Anthropic.Message): string {
  const textBlocks = response.content.filter(block => block.type === 'text')
  return textBlocks.map(block => 'text' in block ? block.text : '').join('\n\n')
}

/**
 * Assess content quality
 */
function assessContentQuality(content: string, resource: Partial<Resource>): number {
  let score = 100

  // Check length
  const wordCount = content.split(/\s+/).length
  const minWords = resource.type === 'pdf' ? 1000 : 500
  if (wordCount < minWords) score -= 20

  // Check for Spanish content
  if (!/[áéíóúñ]/i.test(content)) score -= 15

  // Check for pronunciation guides
  if (!/\[.*\]/.test(content)) score -= 10

  // Check for structure (headings)
  if (!(content.match(/^#{1,3}\s/gm)?.length || 0) >= 3) score -= 10

  // Check for examples
  if (!content.includes('ejemplo') && !content.includes('Example')) score -= 10

  // Check for formatting (tables or boxes)
  if (!content.includes('│') && !content.includes('|')) score -= 10

  return Math.max(0, Math.min(100, score))
}

export default {
  generateResourceContent
}
