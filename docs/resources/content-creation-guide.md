# Resource Content Creation Guide

**Comprehensive guide for creating high-quality learning resources for the Hablas platform**

## Table of Contents

1. [Overview](#overview)
2. [Resource Types](#resource-types)
3. [Target Audience](#target-audience)
4. [Content Standards](#content-standards)
5. [Creation Workflow](#creation-workflow)
6. [Quality Checklist](#quality-checklist)
7. [Best Practices](#best-practices)

---

## Overview

### Purpose

This guide helps content creators develop effective English learning materials specifically for Spanish-speaking gig economy workers (delivery drivers and rideshare drivers).

### Core Principles

1. **Practicality First**: Every resource must solve real problems workers face daily
2. **Offline-Ready**: Prioritize resources that work without internet connection
3. **Bilingual Support**: All content includes Spanish explanations
4. **Audio-Visual**: Maximum use of audio, images, and visual aids
5. **Micro-Learning**: Short, focused lessons that can be consumed in 5-10 minutes

---

## Resource Types

### 1. PDF Documents

**Best For:**
- Phrase lists and reference guides
- Step-by-step instructions
- Visual guides with screenshots
- Printable cheat sheets

**Technical Specifications:**
- **Size**: Keep under 3 MB for offline use
- **Format**: PDF/A for maximum compatibility
- **Fonts**: Embed all fonts
- **Images**: Optimize to 72 DPI for mobile screens
- **Pages**: Maximum 20 pages per resource

**Content Structure:**
```
Page 1: Cover + Overview
Page 2-3: Table of Contents
Page 4-N: Main Content (one topic per page)
Last Page: Quick Reference Card
```

**Example Template:**
```
Title: Frases Básicas para Entregas
Subtitle: 30 Essential Delivery Phrases

[Page 1]
- Title in both languages
- Visual icon representing topic
- Level indicator (Básico/Intermedio/Avanzado)

[Page 2]
English Phrase | Spanish Translation | Pronunciation Guide
"Here's your order" | "Aquí está su pedido" | [hirs yor OR-der]
```

### 2. Audio Files

**Best For:**
- Pronunciation practice
- Listening comprehension
- Conversation examples
- Repetition drills

**Technical Specifications:**
- **Format**: MP3, 128 kbps
- **Size**: Keep under 10 MB
- **Duration**: 3-8 minutes optimal
- **Quality**: Clear, professional recording
- **Background**: Minimal noise, no music

**Content Structure:**
```
0:00-0:30 - Introduction (in Spanish)
0:30-5:00 - Main content with English phrases
5:00-6:00 - Repetition exercise
6:00-End - Summary (in Spanish)
```

**Recording Best Practices:**
1. Use native English speaker for pronunciation
2. Speak slowly and clearly (80% of normal speed)
3. Pause 3 seconds after each phrase for repetition
4. Include Spanish translation after each English phrase
5. Repeat critical phrases 2-3 times

**Example Script:**
```
[Spanish] Bienvenido. Vamos a aprender 10 frases para saludar clientes.
[English] Phrase 1: "Good morning, how are you today?"
[Spanish] Buenos días, ¿cómo está hoy?
[3 second pause]
[English, repeat] "Good morning, how are you today?"
[3 second pause]
```

### 3. Images/Visual Guides

**Best For:**
- App interface explanations
- Situation-based learning
- Visual vocabulary
- Infographics

**Technical Specifications:**
- **Format**: PNG or high-quality JPEG
- **Size**: 2-5 MB per image set
- **Resolution**: 1080x1920 (mobile-first)
- **Text**: Large, readable font (minimum 18pt)
- **Colors**: High contrast for outdoor visibility

**Content Guidelines:**
- Use real screenshots from apps (Uber, Rappi, etc.)
- Add Spanish annotations with arrows
- Include English term + Spanish translation
- Use color coding (green=positive, red=warning, blue=information)

**Example Layout:**
```
[Screenshot of Uber "Accept Ride" screen]
→ "Accept" = "Aceptar"
→ "Decline" = "Rechazar"
→ "5 min away" = "A 5 minutos"
```

### 4. Video Content

**Best For:**
- Complex scenarios requiring context
- Roleplay demonstrations
- Complete courses
- Cultural explanations

**Technical Specifications:**
- **Format**: MP4 (H.264)
- **Size**: 30-100 MB (mark as online-only if >50MB)
- **Duration**: 5-15 minutes per video
- **Resolution**: 720p minimum
- **Subtitles**: REQUIRED in both English and Spanish

**Content Structure:**
```
0:00-1:00 - Introduction (Spanish)
1:00-3:00 - Demonstration (English with Spanish subtitles)
3:00-5:00 - Common variations
5:00-7:00 - Practice scenarios
7:00-End - Recap (Spanish)
```

**Production Standards:**
- Professional audio (no echo, clear voice)
- Good lighting
- Spanish subtitles (burned-in or SRT file)
- Chapter markers for easy navigation

---

## Target Audience

### Primary Users

**Delivery Drivers (Repartidores)**
- **Apps**: Rappi, Uber Eats, DoorDash, Postmates
- **Age**: 20-45 years old
- **English Level**: Beginner to Intermediate
- **Work Environment**: Urban areas, time-sensitive
- **Device**: Smartphone (often while working)

**Key Needs:**
- Fast, essential phrases
- Understanding customer requests
- Handling delivery issues
- Reading addresses and instructions

**Rideshare Drivers (Conductores)**
- **Apps**: Uber, Lyft, DiDi
- **Age**: 25-55 years old
- **English Level**: Beginner to Advanced
- **Work Environment**: Inside vehicle, longer interactions
- **Device**: Smartphone mounted in car

**Key Needs:**
- Small talk and conversation
- Navigation terms
- Passenger interaction
- Handling complaints professionally

### Learning Context

**When They Study:**
- **Before shifts**: 15-30 minutes preparation
- **Between orders/rides**: 5-10 minute micro-sessions
- **At home**: Evening study (30-60 minutes)
- **While waiting**: Quick reference lookups

**Learning Constraints:**
- Limited time (working multiple jobs)
- Studying while working (need quick access)
- May have low bandwidth or no internet
- Learning primarily through smartphone

---

## Content Standards

### Language Requirements

**Spanish Content:**
- Use Latin American Spanish (neutral accent)
- Avoid regional slang unless necessary
- Be respectful and professional
- Use "tú" form (informal but respectful)

**English Content:**
- American English (US standards)
- Clear, standard pronunciation
- Avoid idioms in beginner content
- Introduce slang gradually in advanced content

### Cultural Sensitivity

**Do:**
✅ Acknowledge cultural differences respectfully
✅ Explain American customs when relevant
✅ Use realistic scenarios from their work
✅ Celebrate bilingualism as a strength

**Don't:**
❌ Stereotype or make assumptions
❌ Focus on accent "correction" (focus on clarity)
❌ Assume prior English knowledge
❌ Use condescending language

### Accessibility

**Requirements:**
- All audio must have text transcripts
- All videos must have subtitles
- Use dyslexia-friendly fonts (OpenDyslexic, Arial)
- Minimum font size: 14pt
- High contrast ratios (4.5:1 minimum)

---

## Creation Workflow

### Step 1: Choose Template

```bash
# From data/templates/resource-templates.ts
# Select appropriate template based on:
- Target category (delivery/rideshare/universal)
- Skill level (basico/intermedio/avanzado)
- Content type (pdf/audio/image/video)
```

### Step 2: Research & Outline

**Research Checklist:**
- [ ] Identify real scenarios from driver feedback
- [ ] List common English phrases for this situation
- [ ] Research correct pronunciation
- [ ] Gather relevant app screenshots
- [ ] Verify current app UI (apps update frequently)

**Outline Format:**
```markdown
## Resource: [Title]

### Target Audience:
- Category: [repartidor/conductor/all]
- Level: [basico/intermedio/avanzado]

### Learning Objectives:
1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

### Content Sections:
1. [Section 1 title] - [Duration/Pages]
2. [Section 2 title] - [Duration/Pages]

### Required Materials:
- [List materials needed]
```

### Step 3: Create Content

**For PDFs:**
1. Use template from `templates/pdf-template.sketch` or Canva
2. Follow brand colors (see design system)
3. Include page numbers
4. Add Quick Reference section at end

**For Audio:**
1. Write complete script (Spanish + English)
2. Record in quiet environment
3. Edit for clarity (remove gaps, normalize audio)
4. Export as MP3 @ 128kbps

**For Images:**
1. Take screenshots or create graphics
2. Add annotations in image editor
3. Ensure text is readable on mobile
4. Optimize file size

**For Videos:**
1. Script entire video
2. Record video and audio separately for best quality
3. Add Spanish subtitles
4. Add chapter markers
5. Test on mobile device

### Step 4: Validate Content

Run through validation checklist:

```typescript
// Use lib/utils/resource-validator.ts
import { validateResource } from '@/lib/utils/resource-validator'

const newResource = {
  // ... your resource data
}

const validation = validateResource(newResource)
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors)
}
```

### Step 5: Test with Users

**Testing Protocol:**
1. Recruit 3-5 drivers from target category
2. Have them use resource in realistic conditions
3. Collect feedback:
   - Was it helpful?
   - Was anything confusing?
   - What's missing?
   - Would they use it again?
4. Iterate based on feedback

### Step 6: Add to Platform

1. Upload file to `/public/resources/[category]/`
2. Add resource entry to `data/resources.ts`
3. Update ID (increment from last resource)
4. Test download and offline functionality
5. Commit with descriptive message

---

## Quality Checklist

### Content Quality

- [ ] **Accuracy**: All English phrases are correct and natural
- [ ] **Relevance**: Content addresses real driver needs
- [ ] **Clarity**: Instructions are clear and unambiguous
- [ ] **Completeness**: Covers topic thoroughly
- [ ] **Engagement**: Content is interesting and practical

### Technical Quality

- [ ] **File Size**: Within recommended limits
- [ ] **Format**: Correct file format (.pdf, .mp3, .png, .mp4)
- [ ] **Compatibility**: Works on iOS and Android
- [ ] **Offline**: Marked correctly (offline: true/false)
- [ ] **Performance**: Loads quickly on mobile networks

### User Experience

- [ ] **Mobile-First**: Readable on small screens
- [ ] **Navigation**: Easy to find specific information
- [ ] **Bilingual**: Spanish explanations for all English content
- [ ] **Practical**: Can be applied immediately at work
- [ ] **Accessible**: Meets accessibility standards

### Metadata

- [ ] **Title**: Descriptive and clear
- [ ] **Description**: Accurately describes content
- [ ] **Tags**: At least 3 relevant tags
- [ ] **Category**: Correctly categorized
- [ ] **Level**: Appropriate difficulty level
- [ ] **Size**: Accurate file size listed

---

## Best Practices

### Content Creation

**1. Start with Pain Points**
- Ask drivers: "What English situation causes you the most stress?"
- Create resources that solve these specific problems

**2. Use Real Scenarios**
- Base content on actual situations drivers encounter
- Include multiple variations (customers don't always say the same thing)

**3. Progressive Learning**
- Basic: Survival phrases (yes/no, basic greetings)
- Intermediate: Full sentences and questions
- Advanced: Conversation and cultural nuance

**4. Reinforce with Multiple Formats**
- Create PDF + Audio versions of popular content
- Combine visual + audio for pronunciation

**5. Make It Searchable**
- Use specific, descriptive titles
- Include relevant tags
- Consider what drivers will search for

### Common Pitfalls to Avoid

❌ **Too Academic**: Avoid grammar lessons, focus on practical phrases
❌ **Too Long**: Resources over 10 pages/10 minutes are often abandoned
❌ **Wrong Context**: Office English ≠ Gig Economy English
❌ **Assuming Knowledge**: Always start from zero
❌ **Ignoring Accents**: Accept that accents exist, focus on clarity
❌ **One-Size-Fits-All**: Delivery phrases ≠ Rideshare phrases

### Engagement Strategies

**Make It Interactive:**
- Include practice exercises
- Add "Try it now" suggestions
- Provide fillable templates

**Make It Personal:**
- Use "tú" (you) throughout
- Include success stories from other drivers
- Acknowledge the challenges they face

**Make It Rewarding:**
- End with "Next Steps" suggestions
- Link to related resources
- Include motivational messages

---

## Example: Complete Resource Creation

### Scenario: Creating "Basic Delivery Phrases" PDF

**Step 1: Choose Template**
```typescript
import { DELIVERY_TEMPLATES } from '@/data/templates/resource-templates'
const template = DELIVERY_TEMPLATES.basic_phrases
```

**Step 2: Research**
- Interview 5 Rappi drivers
- Most common phrase needs:
  1. Greeting customer
  2. Confirming order
  3. Asking about special instructions
  4. Saying goodbye

**Step 3: Create Content**

```markdown
Page 1: Cover
- Title: "30 Frases Esenciales para Entregas"
- Icon: Delivery box
- Level badge: "BÁSICO"

Page 2: How to Use This Guide
[In Spanish]
Este guía te enseña las 30 frases más importantes...

Page 3-8: Phrase Categories
Category 1: Greetings (5 phrases)
Category 2: Confirmations (8 phrases)
Category 3: Questions (10 phrases)
Category 4: Problems (7 phrases)

Each phrase formatted as:
┌─────────────────────────────────┐
│ 1. "Here's your order"          │
│                                 │
│ 🗣️ Aquí está su pedido          │
│ 🔊 [hirs yor OR-der]            │
│                                 │
│ Usa cuando: Entregas el pedido  │
│ al cliente                      │
└─────────────────────────────────┘

Page 9: Quick Reference Card
[Table format with all 30 phrases]

Page 10: Next Steps
- Download the audio version
- Practice 5 phrases today
- Link to intermediate resources
```

**Step 4: Validate**
```bash
# Check file size
ls -lh delivery-phrases.pdf
# Output: 1.2 MB ✅

# Validate structure
npm run validate-resource -- delivery-phrases.pdf
# All checks passed ✅
```

**Step 5: Test**
- 5 drivers tested
- 4.8/5 average rating
- Feedback: "Add pronunciation for difficult words" - IMPLEMENTED

**Step 6: Deploy**
```bash
# Upload file
cp delivery-phrases.pdf public/resources/delivery/

# Add to resources.ts
# (See final resource object)

# Commit
git add .
git commit -m "feat: add basic delivery phrases PDF resource"
git push
```

**Final Resource Object:**
```typescript
{
  id: 101,
  title: 'Frases Esenciales para Entregas',
  description: 'Las 30 frases más importantes para domiciliarios principiantes',
  type: 'pdf',
  category: 'repartidor',
  level: 'basico',
  size: '1.2 MB',
  downloadUrl: '/resources/delivery/basic-phrases.pdf',
  tags: ['Rappi', 'Entregas', 'Básico', 'Frases'],
  offline: true
}
```

---

## Support & Resources

### Tools
- **PDF Creation**: Canva, Adobe InDesign, Figma
- **Audio Editing**: Audacity (free), Adobe Audition
- **Image Editing**: Figma, Photoshop, GIMP (free)
- **Video Editing**: DaVinci Resolve (free), Adobe Premiere

### References
- American English pronunciation: [Merriam-Webster](https://www.merriam-webster.com/)
- Gig economy terms: [Uber Driver Dictionary](https://www.uber.com/us/en/drive/resources/)
- Spanish translations: Latin American Spanish standards

### Getting Help
- Question about content: Check this guide first
- Technical issue: See `/docs/technical/README.md`
- Need feedback: Share draft in content review channel

---

**Last Updated**: October 2025
**Version**: 2.0
**Maintained By**: Hablas Content Team
