# Resource Template Examples

**Real-world examples of resource creation using templates**

## Table of Contents

1. [Basic Examples](#basic-examples)
2. [Intermediate Examples](#intermediate-examples)
3. [Advanced Examples](#advanced-examples)
4. [Special Cases](#special-cases)
5. [Batch Operations](#batch-operations)

---

## Basic Examples

### Example 1: Simple Delivery Phrase Guide

**Scenario**: Creating a basic PDF with essential delivery phrases

```typescript
import { generateFromTemplate } from '@/lib/utils/resource-generator'
import { resources } from '@/data/resources'

const basicDeliveryGuide = generateFromTemplate(
  'basic_phrases',
  {
    title: 'Frases Rápidas para Domiciliarios',
    description: 'Las 20 frases más usadas en entregas de comida rápida',
    downloadUrl: '/resources/delivery/quick-phrases.pdf',
    size: '1.1 MB',
    tags: ['Rappi', 'Uber Eats', 'Básico', 'Frases']
  },
  resources
)

console.log(basicDeliveryGuide)
// ✅ Ready to add to resources.ts
```

**Result**:
```json
{
  "id": 7,
  "title": "Frases Rápidas para Domiciliarios",
  "description": "Las 20 frases más usadas en entregas de comida rápida",
  "type": "pdf",
  "category": "repartidor",
  "level": "basico",
  "size": "1.1 MB",
  "downloadUrl": "/resources/delivery/quick-phrases.pdf",
  "tags": ["Rappi", "Uber Eats", "Básico", "Frases"],
  "offline": true
}
```

---

### Example 2: Pronunciation Audio

**Scenario**: Adding audio for basic greetings

```typescript
const greetingsAudio = generateFromTemplate(
  'basic_audio',
  {
    title: 'Audio: Saludos Profesionales',
    description: 'Pronunciación correcta de saludos para clientes en inglés',
    size: '2.8 MB',
    downloadUrl: '/resources/universal/professional-greetings.mp3',
    tags: ['Audio', 'Saludos', 'Básico', 'Pronunciación']
  },
  resources
)
```

**Use Case**: Driver wants to practice pronunciation during downtime

---

### Example 3: Visual App Guide

**Scenario**: Creating image-based guide for app interface

```typescript
const appGuide = generateFromTemplate(
  'basic_app_vocabulary',
  {
    title: 'Guía Visual: Interfaz de Uber',
    description: 'Todas las palabras en inglés de la app Uber explicadas con capturas',
    size: '5.2 MB',
    downloadUrl: '/resources/apps/uber-visual-guide.pdf',
    tags: ['Uber', 'Visual', 'Básico', 'Apps', 'Imágenes']
  },
  resources
)
```

**Content**: Screenshots of Uber app with Spanish annotations

---

## Intermediate Examples

### Example 4: Situation-Specific Guide

**Scenario**: Handling difficult customer situations

```typescript
const difficultSituations = generateFromTemplate(
  'intermediate_situations',
  {
    title: 'Manejo de Clientes Difíciles',
    description: 'Estrategias y frases para situaciones complicadas en entregas',
    size: '2.2 MB',
    downloadUrl: '/resources/delivery/difficult-customers.pdf',
    tags: ['Intermedio', 'Servicio', 'Problemas', 'Entregas']
  },
  resources
)
```

**Content Outline**:
```markdown
1. Client is angry about delay
2. Wrong item delivered
3. Cannot find apartment number
4. Payment issues
5. Special requests
6. Safety concerns
```

---

### Example 5: Conversational Audio

**Scenario**: Full conversations for rideshare drivers

```typescript
const conversationPractice = generateFromTemplate(
  'intermediate_audio_conversations',
  {
    title: 'Conversaciones Reales: Uber',
    description: 'Diálogos completos desde pickup hasta drop-off con pasajeros',
    size: '8.5 MB',
    downloadUrl: '/resources/rideshare/full-conversations.mp3',
    tags: ['Uber', 'Audio', 'Intermedio', 'Conversación', 'Diálogos']
  },
  resources
)
```

**Audio Structure**:
```
0:00-1:30 - Conversation 1: Business passenger
1:30-3:00 - Conversation 2: Tourist asking for directions
3:00-4:30 - Conversation 3: Group going to event
4:30-6:00 - Conversation 4: Quiet professional (minimal talk)
6:00-8:30 - Conversation 5: Handling complaint
```

---

### Example 6: Weather & Small Talk

**Scenario**: Intermediate small talk phrases

```typescript
const smallTalk = generateFromTemplate(
  'intermediate_weather_traffic',
  {
    title: 'Small Talk: Clima y Tráfico',
    description: 'Conversación ligera sobre el clima, tráfico y eventos actuales',
    size: '1.6 MB',
    downloadUrl: '/resources/rideshare/weather-smalltalk.pdf',
    tags: ['Intermedio', 'Small Talk', 'Clima', 'Uber', 'DiDi']
  },
  resources
)
```

**Phrase Categories**:
- Weather observations
- Traffic comments
- Weekend plans
- Local events
- Sports (safe topics)

---

## Advanced Examples

### Example 7: Professional Premium Service

**Scenario**: Advanced guide for Uber Black drivers

```typescript
const premiumService = generateFromTemplate(
  'advanced_professional_service',
  {
    title: 'Servicio Premium: Uber Black',
    description: 'Inglés profesional para viajes ejecutivos y servicio de lujo',
    size: '3.1 MB',
    downloadUrl: '/resources/rideshare/uber-black-guide.pdf',
    tags: ['Avanzado', 'Uber Black', 'Profesional', 'Premium', 'Ejecutivo']
  },
  resources
)
```

**Topics Covered**:
```markdown
1. Professional greetings and introductions
2. Business etiquette
3. Handling VIP clients
4. Airport procedures
5. Corporate account protocols
6. Luxury service standards
```

---

### Example 8: Cultural Intelligence Guide

**Scenario**: Understanding cultural differences

```typescript
const culturalGuide = generateFromTemplate(
  'advanced_cultural',
  {
    title: 'Guía Cultural: Estados Unidos',
    description: 'Diferencias culturales, costumbres y etiqueta estadounidense para conductores',
    size: '2.5 MB',
    downloadUrl: '/resources/universal/us-cultural-guide.pdf',
    tags: ['Avanzado', 'Cultura', 'USA', 'Etiqueta', 'Costumbres']
  },
  resources
)
```

**Content**:
- Tipping culture
- Personal space norms
- Conversation topics (dos and don'ts)
- Holiday traditions
- Regional differences (North, South, West, East)

---

### Example 9: Comprehensive Video Course

**Scenario**: Complete video training series

```typescript
const videoCourse = generateFromTemplate(
  'advanced_video_comprehensive',
  {
    title: 'Curso Completo: Inglés para Gig Workers',
    description: 'Curso en video de 60 minutos con todas las situaciones para Uber y Rappi',
    size: '125 MB',
    downloadUrl: '/resources/universal/complete-course-2025.mp4',
    tags: ['Video', 'Avanzado', 'Curso', 'Uber', 'Rappi', 'Completo'],
    offline: false  // Too large for offline
  },
  resources
)
```

**Video Chapters**:
```
0:00 - Introduction
5:00 - Module 1: Basic Phrases
15:00 - Module 2: Navigation & Directions
25:00 - Module 3: Customer Service
35:00 - Module 4: Problem Resolution
45:00 - Module 5: Advanced Conversations
55:00 - Final Exam & Certification
```

---

## Special Cases

### Example 10: Emergency Phrases

**Scenario**: Critical safety and emergency communication

```typescript
const emergencyGuide = generateFromTemplate(
  'emergency_phrases',
  {
    title: 'EMERGENCIA: Frases Críticas',
    description: 'Vocabulario esencial para accidentes, robos, y situaciones de emergencia',
    size: '450 KB',
    downloadUrl: '/resources/emergency/critical-phrases.pdf',
    tags: ['Emergencia', 'Seguridad', 'Crítico', 'Policía', 'Médico'],
    offline: true  // MUST be offline for emergencies!
  },
  resources
)
```

**Content Priority**:
```
🚨 CRITICAL:
- "Call 911" / "Llama al 911"
- "I need help" / "Necesito ayuda"
- "Medical emergency" / "Emergencia médica"
- "I was robbed" / "Me robaron"
- "Accident" / "Accidente"
```

---

### Example 11: Multi-App Comparison

**Scenario**: Comparing terminology across platforms

```typescript
const multiAppGuide = generateFromTemplate(
  'basic_app_vocabulary',
  {
    title: 'Comparación: Uber vs Rappi vs DiDi',
    description: 'Términos en inglés de las 3 apps principales lado a lado',
    size: '3.8 MB',
    downloadUrl: '/resources/apps/multi-app-comparison.pdf',
    tags: ['Uber', 'Rappi', 'DiDi', 'Apps', 'Comparación', 'Básico']
  },
  resources
)
```

**Layout**:
```
| Function    | Uber        | Rappi      | DiDi       |
|-------------|-------------|------------|------------|
| Accept job  | "Accept"    | "Aceptar"  | "Accept"   |
| Navigation  | "Navigate"  | "Ir"       | "Start"    |
| Arrive      | "Arrive"    | "Llegué"   | "Arrived"  |
```

---

### Example 12: Region-Specific Guide

**Scenario**: English variations by US region

```typescript
const regionalGuide = generateFromTemplate(
  'advanced_idioms_slang',
  {
    title: 'Inglés Regional: USA',
    description: 'Diferencias en vocabulario entre Nueva York, Texas, California y Florida',
    size: '2.0 MB',
    downloadUrl: '/resources/universal/regional-english.pdf',
    tags: ['Avanzado', 'Regional', 'USA', 'Dialectos', 'Slang']
  },
  resources
)
```

**Regions Covered**:
- Northeast (NYC, Boston)
- South (Texas, Florida)
- West Coast (California)
- Midwest (Chicago)

---

## Batch Operations

### Example 13: Creating a Complete Topic Set

**Scenario**: Adding full airport transportation topic

```typescript
import { generateResourceSet } from '@/lib/utils/resource-generator'

const airportResources = generateResourceSet({
  category: 'conductor',
  baseTitle: 'Viajes al Aeropuerto',
  basePath: '/resources/rideshare/airport',
  existingResources: resources
})

// Returns 4 resources:
// 1. Basic PDF guide
// 2. Basic audio pronunciation
// 3. Intermediate guide
// 4. Advanced guide

// Customize after generation
airportResources[0].description = 'Frases esenciales para viajes al aeropuerto'
airportResources[0].tags = ['Uber', 'Aeropuerto', 'Básico', 'Viajes']
```

---

### Example 14: Bulk Generate from Templates

**Scenario**: Creating multiple resources at once

```typescript
import { generateBatch } from '@/lib/utils/resource-generator'

const newResources = generateBatch([
  'basic_greetings_all',
  'basic_numbers',
  'basic_time',
  'intermediate_customer_service',
  'emergency_phrases'
], resources)

console.log(`Generated ${newResources.length} resources`)

// Validate all at once
import { validateResources } from '@/lib/utils/resource-validator'
const { summary } = validateResources(newResources)
console.log(`Valid: ${summary.valid}/${summary.total}`)
```

---

### Example 15: Clone and Modify Existing

**Scenario**: Creating similar resource with modifications

```typescript
import { cloneResource } from '@/lib/utils/resource-generator'

const existingResource = resources[0] // "Frases para Entregas"

// Create advanced version
const advancedVersion = cloneResource(
  existingResource,
  {
    title: existingResource.title + ' - Avanzado',
    level: 'avanzado',
    description: 'Versión avanzada con frases complejas y modismos',
    size: '2.4 MB',
    downloadUrl: existingResource.downloadUrl.replace('.pdf', '-advanced.pdf'),
    tags: [...existingResource.tags, 'Avanzado']
  },
  resources
)
```

---

## Complete Workflow Example

### Real-World: Adding "Restaurant Delivery" Topic

```typescript
// Step 1: Generate base resources
const restaurantBasic = generateFromTemplate('basic_phrases', {
  title: 'Frases para Entregas de Restaurantes',
  description: 'Vocabulario específico para entrega de comida de restaurantes',
  downloadUrl: '/resources/delivery/restaurant-basic.pdf',
  size: '1.4 MB',
  tags: ['Rappi', 'Restaurantes', 'Básico', 'Food Delivery']
})

const restaurantAudio = generateFromTemplate('basic_audio', {
  title: 'Audio: Pronunciación Restaurantes',
  description: 'Cómo pronunciar nombres de comidas y frases de restaurantes',
  downloadUrl: '/resources/delivery/restaurant-audio.mp3',
  size: '4.1 MB',
  tags: ['Audio', 'Restaurantes', 'Básico', 'Pronunciación']
})

const restaurantIntermediate = generateFromTemplate('intermediate_situations', {
  title: 'Situaciones Complejas: Restaurantes',
  description: 'Manejo de pedidos incorrectos, alergias y peticiones especiales',
  downloadUrl: '/resources/delivery/restaurant-intermediate.pdf',
  size: '2.0 MB',
  tags: ['Intermedio', 'Restaurantes', 'Problemas', 'Food Delivery']
})

// Step 2: Validate all
const allResources = [restaurantBasic, restaurantAudio, restaurantIntermediate]
const { results, summary } = validateResources(allResources)

if (summary.valid === summary.total) {
  console.log('✅ All resources valid!')

  // Step 3: Export for easy copy-paste
  console.log(exportToTypeScript(allResources))

  // Step 4: Add to data/resources.ts manually
} else {
  console.error('❌ Fix validation errors first')
  results.forEach(r => {
    if (!r.isValid) {
      console.log(formatValidationResult(r))
    }
  })
}
```

---

## Tips & Best Practices

### ✅ DO:
- Start with closest matching template
- Always validate before adding to resources
- Use descriptive, Spanish titles with proper accents
- Include at least 3 relevant tags
- Consider file size (keep under 3MB for PDFs)
- Test resource on mobile device

### ❌ DON'T:
- Don't skip validation
- Don't use generic titles like "Guide 1"
- Don't forget Spanish characters (á, é, í, etc.)
- Don't mark large files (>50MB) as offline=true
- Don't duplicate existing content

---

## Testing Your Resource

```typescript
// After generation, test the resource
import { validateResource, formatValidationResult } from '@/lib/utils/resource-validator'

const newResource = generateFromTemplate(/* ... */)

// Validate
const validation = validateResource(newResource)
console.log(formatValidationResult(validation))

// Check for duplicates
import { checkDuplicates } from '@/lib/utils/resource-validator'
const dups = checkDuplicates([...resources, newResource])

if (dups.duplicateIds.length === 0 && validation.isValid) {
  console.log('✅ Ready to add!')
} else {
  console.log('⚠️ Issues found, fix before adding')
}
```

---

**Need more examples?** See the [Content Creation Guide](./content-creation-guide.md) for detailed guidelines.
