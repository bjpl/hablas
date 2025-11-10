# AI Resource Generation Guide

**Using Claude Sonnet 4.5 to generate high-quality learning resources at scale**

## Overview

The AI Resource Generator uses Claude Sonnet 4.5 to automatically create comprehensive, professionally-written content for all resource templates. This allows rapid development of a complete resource library while maintaining consistent quality and adherence to content guidelines.

## Prerequisites

### 1. Get Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key (starts with `sk-ant-...`)

### 2. Set Environment Variable

```bash
# Linux/Mac
export ANTHROPIC_API_KEY="sk-ant-your-key-here"

# Windows (PowerShell)
$env:ANTHROPIC_API_KEY="sk-ant-your-key-here"

# Or create .env file
cp .env.example .env
# Edit .env and add your key
```

### 3. Install Dependencies

```bash
npm install @anthropic-ai/sdk
npm install tsx  # For running TypeScript scripts
```

## Quick Start

### Generate Essential Resources (Recommended First Step)

```bash
npm run ai:generate essentials
```

**What it does**:
- Generates 20 most important resources
- Covers all categories and levels
- Takes ~10-15 minutes
- Cost: ~$1-2

**Output**: `generated-resources/essentials/`

---

## Generation Commands

### 1. Generate All Resources

```bash
npm run ai:generate all
```

**Description**: Generates content for ALL templates (~40+ resources)

**Time**: 15-20 minutes
**Cost**: $2-5
**Output**: All resources organized by category

**When to use**: Building complete initial library

---

### 2. Generate by Category

```bash
# Delivery driver resources only
npm run ai:generate category repartidor

# Rideshare driver resources only
npm run ai:generate category conductor

# Universal resources (for all drivers)
npm run ai:generate category all
```

**Time**: 5-10 minutes per category
**Cost**: $0.50-$2 per category

---

### 3. Generate by Level

```bash
# Basic level resources
npm run ai:generate level basico

# Intermediate level
npm run ai:generate level intermedio

# Advanced level
npm run ai:generate level avanzado
```

**When to use**: Building out specific difficulty levels

---

### 4. Generate Complete Topic Set

```bash
npm run ai:generate topic "Restaurant Delivery" repartidor
npm run ai:generate topic "Airport Trips" conductor
npm run ai:generate topic "Weekend Conversations" all
```

**What it creates**: 4 resources for the topic:
1. Basic PDF guide
2. Basic audio pronunciation
3. Intermediate PDF
4. Advanced PDF

**Time**: 3-5 minutes
**Cost**: $0.30-$0.75

---

### 5. Generate from Specific Template

```bash
npm run ai:generate template "basic_phrases"
npm run ai:generate template "uber_guide"
```

**When to use**: Testing generation or creating single resource

---

## What Gets Generated

### For PDF Resources

```markdown
# Complete PDF Content

## Cover Page
- Title (Spanish)
- Level indicator
- Visual icon description
- Introduction

## Table of Contents
- All sections listed

## Main Content (8-15 pages)
Each phrase includes:
- English phrase
- Spanish translation
- Phonetic pronunciation: [example]
- Usage context: "Usa cuando..."
- Example situation
- Visual formatting

## Quick Reference Card
- Table with all key phrases
- Easy-to-scan format
```

### For Audio Resources

```
# Complete Audio Script

[00:00] Introduction (Spanish)
- Welcome and overview

[00:30] Main Content
For each phrase:
- Context explanation (Spanish)
- English phrase (clear, slow)
- Spanish translation
- English phrase repeated
- [3 second pause] for practice

[05:00] Practice Section
- Quick review
- Repetition drill

[06:30] Conclusion
- Summary
- Next steps
- Motivation
```

### For Image/Visual Resources

```markdown
# Visual Specifications

[PAGE 1]
Title: [Spanish title]

[IMAGE DESCRIPTION]
Detailed description of screenshot or graphic

[ANNOTATIONS]
1. Arrow → "Button" = "Botón" (Color coding)
2. Arrow → "Next" = "Siguiente"

[CONTEXT NOTE]
When to use this screen
```

### For Video Resources

```markdown
# Complete Video Script

[SCENE 1 - INTRODUCTION]
Duration: 01:00

[VISUAL]
- Camera angle
- What appears on screen
- Text overlays

[AUDIO - SPANISH]
Narrator script

[ENGLISH DEMONSTRATION]
Phrases to demonstrate

[SUBTITLES]
Spanish subtitles for English phrases
```

---

## Output Structure

```
generated-resources/
├── essentials/                  # 20 core resources
│   ├── frases-para-entregas.md
│   ├── audio-pronunciación.md
│   └── ...
├── repartidor/                  # Delivery driver resources
│   ├── basic/
│   ├── intermediate/
│   └── advanced/
├── conductor/                   # Rideshare driver resources
│   ├── basic/
│   ├── intermediate/
│   └── advanced/
├── all/                         # Universal resources
└── [topic-name]/                # Topic-specific sets
    ├── basic-guide.md
    ├── audio-script.txt
    ├── intermediate-guide.md
    └── advanced-guide.md
```

---

## Quality Assurance

### AI Generation Ensures:

✅ **Practical Content**: All phrases are immediately useful
✅ **Bilingual**: Perfect Spanish translations
✅ **Natural English**: Phrases natives actually use
✅ **Cultural Context**: American customs explained
✅ **Consistent Format**: Follows all content guidelines
✅ **Appropriate Level**: Content matches difficulty level
✅ **Real Scenarios**: Based on actual driver situations

### Automatic Validation

Each generated resource is automatically validated:
- Required fields present
- Correct format and structure
- Appropriate file size estimates
- Tag relevance
- Category/level consistency

---

## Cost Estimation

### Per Resource Type:

| Resource Type | Avg Tokens | Approx Cost |
|---------------|------------|-------------|
| Basic PDF     | 3,000-5,000 | $0.05-$0.08 |
| Audio Script  | 2,000-4,000 | $0.03-$0.06 |
| Visual Guide  | 2,500-4,500 | $0.04-$0.07 |
| Video Script  | 4,000-8,000 | $0.06-$0.12 |

### Batch Operations:

| Operation | Resources | Time | Cost |
|-----------|-----------|------|------|
| Essentials | 20 | 10-15 min | $1-2 |
| Category | 12-15 | 8-12 min | $0.75-$1.50 |
| Level | 10-12 | 6-10 min | $0.60-$1.20 |
| Topic Set | 4 | 3-5 min | $0.30-$0.75 |
| Complete Library | 40+ | 20-30 min | $2-5 |

_Costs based on Claude Sonnet 4.5 pricing (as of Oct 2025)_

---

## Customization

### Override Default Model

```typescript
// In scripts/ai-generate-resources.ts

const results = await generateResourceBatch(templates, {
  model: 'claude-opus-4-5-20250929',  // Use Opus for highest quality
  temperature: 0.8,                    // More creative
  maxTokens: 12000                     // Longer content
})
```

### Adjust Generation Parameters

```typescript
{
  model: 'claude-sonnet-4-5-20250929',
  maxTokens: 8000,        // Length of generation
  temperature: 0.7,       // Creativity (0-1, lower = more focused)
  verbose: true           // Include detailed explanations
}
```

---

## Workflow: From Generation to Deployment

### 1. Generate Content

```bash
npm run ai:generate essentials
```

### 2. Review Generated Files

```bash
ls -la generated-resources/essentials/
```

### 3. Convert to Final Format

**For PDFs**: Convert Markdown to PDF
```bash
# Using pandoc
pandoc frases-para-entregas.md -o frases-para-entregas.pdf \
  --pdf-engine=xelatex \
  --variable mainfont="Arial" \
  --variable fontsize=12pt
```

**For Audio**: Record from script
- Use generated script
- Hire voice actor or use TTS
- Follow timing markers in script

**For Images**: Create visuals from specs
- Use generated descriptions
- Create in Figma/Photoshop
- Follow annotation guidelines

### 4. Add to Resources

```typescript
// In data/resources.ts
import { Resource } from './resources'

export const resources: Resource[] = [
  // ... existing resources
  {
    id: 101,
    title: 'Frases para Entregas',
    description: 'Las 50 frases más importantes para domiciliarios',
    type: 'pdf',
    category: 'repartidor',
    level: 'basico',
    size: '1.2 MB',
    downloadUrl: '/resources/delivery/frases-entregas.pdf',
    tags: ['Rappi', 'Entregas', 'Básico'],
    offline: true
  }
]
```

### 5. Deploy Files

```bash
# Upload to public directory
cp frases-para-entregas.pdf public/resources/delivery/

# Commit to git
git add .
git commit -m "feat: add delivery phrases resource"
git push
```

---

## Advanced Usage

### Generate with Custom Guidelines

```typescript
import { generateResourceContent } from '@/lib/ai/resource-content-generator'

const customGuidelines = `
# Custom Guidelines
- Focus on Texas-specific expressions
- Include Tex-Mex terms
- Add Houston metro area references
`

const result = await generateResourceContent(
  resourceTemplate,
  {
    customGuidelines,
    temperature: 0.8
  }
)
```

### Regenerate with Different Approach

```typescript
// More formal tone
const formal = await generateResourceContent(resource, { temperature: 0.3 })

// More conversational
const casual = await generateResourceContent(resource, { temperature: 0.9 })

// Compare and choose best
```

### Parallel Generation

```typescript
// Generate multiple topics simultaneously
const topics = [
  'Restaurant Delivery',
  'Grocery Delivery',
  'Package Delivery'
]

const promises = topics.map(topic =>
  generateCompleteResourceSet(topic, 'repartidor')
)

const results = await Promise.all(promises)
```

---

## Troubleshooting

### Error: "API Key not set"

```bash
export ANTHROPIC_API_KEY="your-key-here"
# Verify
echo $ANTHROPIC_API_KEY
```

### Error: "Rate limit exceeded"

The script includes automatic rate limiting (1 second between requests). If still hitting limits:

```typescript
// Increase delay in scripts/ai-generate-resources.ts
await new Promise(resolve => setTimeout(resolve, 2000))  // 2 seconds
```

### Error: "Generation timeout"

Increase max tokens or split into smaller batches:

```typescript
const config = {
  maxTokens: 12000,  // Allow longer generation
  temperature: 0.7
}
```

### Generated Content Too Short/Long

Adjust in the prompts within `lib/ai/resource-content-generator.ts`:

```typescript
// For longer content
"Generate comprehensive content with 15-20 pages..."

// For shorter content
"Generate concise content with 5-8 key sections..."
```

---

## Best Practices

### ✅ DO:

- Start with essentials before generating all
- Review generated content before deployment
- Customize prompts for specific needs
- Run validation on all generated resources
- Keep API key secure (never commit to git)
- Monitor costs using Anthropic Console

### ❌ DON'T:

- Don't generate all resources at once initially
- Don't skip validation step
- Don't deploy without reviewing content
- Don't share API keys
- Don't ignore warnings and errors

---

## Next Steps

1. **Generate Essentials** first to test
2. **Review** generated content quality
3. **Customize** prompts if needed
4. **Generate** by category or level
5. **Convert** to final formats (PDF, audio, etc.)
6. **Deploy** to platform

---

## Support

**Issues with generation?**
- Check API key is set correctly
- Verify internet connection
- Review error messages in console
- Check Anthropic API status

**Questions about content?**
- See [Content Creation Guide](./content-creation-guide.md)
- Review generated examples
- Adjust prompts in generator code

**Need help?**
- Open issue in repository
- Check Anthropic documentation
- Review template examples

---

**Last Updated**: October 2025
**AI Model**: Claude Sonnet 4.5
**Version**: 1.0
