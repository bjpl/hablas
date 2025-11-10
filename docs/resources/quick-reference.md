# Resource Templates - Quick Reference

**Fast guide for creating new resources**

## 🚀 Quick Start

### 1. Choose Template

```typescript
import { DELIVERY_TEMPLATES, RIDESHARE_TEMPLATES, UNIVERSAL_TEMPLATES }
  from '@/data/templates/resource-templates'

// Pick the template closest to what you need
const template = DELIVERY_TEMPLATES.basic_phrases
```

### 2. Generate Resource

```typescript
import { generateFromTemplate } from '@/lib/utils/resource-generator'
import { resources } from '@/data/resources'

const newResource = generateFromTemplate(
  'basic_phrases',  // template name
  {
    // Override any fields
    title: 'My Custom Title',
    description: 'My custom description',
    downloadUrl: '/resources/delivery/my-file.pdf'
  },
  resources  // existing resources (for ID generation)
)
```

### 3. Validate

```typescript
import { validateResource, formatValidationResult } from '@/lib/utils/resource-validator'

const validation = validateResource(newResource)
console.log(formatValidationResult(validation))

if (validation.isValid) {
  // Add to resources.ts
}
```

### 4. Add to Resources

```typescript
// In data/resources.ts
export const resources: Resource[] = [
  // ... existing resources
  newResource  // Add your new resource
]
```

---

## 📋 Template Categories

### Delivery Driver Templates (Repartidor)
```typescript
import { DELIVERY_TEMPLATES } from '@/data/templates/resource-templates'

// Basic Level
DELIVERY_TEMPLATES.basic_phrases           // Essential phrases PDF
DELIVERY_TEMPLATES.basic_audio            // Pronunciation audio
DELIVERY_TEMPLATES.basic_visual           // Visual guide with images

// Intermediate Level
DELIVERY_TEMPLATES.intermediate_situations // Complex scenarios
DELIVERY_TEMPLATES.intermediate_conversations // Full dialogues

// Advanced Level
DELIVERY_TEMPLATES.advanced_professional  // Professional communication
DELIVERY_TEMPLATES.advanced_video         // Video tutorial
```

### Rideshare Driver Templates (Conductor)
```typescript
import { RIDESHARE_TEMPLATES } from '@/data/templates/resource-templates'

// Basic Level
RIDESHARE_TEMPLATES.basic_greetings             // Greetings & confirmation
RIDESHARE_TEMPLATES.basic_directions            // GPS & navigation
RIDESHARE_TEMPLATES.basic_audio_navigation      // Navigation audio

// Intermediate Level
RIDESHARE_TEMPLATES.intermediate_smalltalk      // Small talk guide
RIDESHARE_TEMPLATES.intermediate_audio_conversations // Conversation audio
RIDESHARE_TEMPLATES.intermediate_problems       // Difficult situations

// Advanced Level
RIDESHARE_TEMPLATES.advanced_professional_service // Premium service
RIDESHARE_TEMPLATES.advanced_cultural           // Cultural differences
RIDESHARE_TEMPLATES.advanced_video_training     // Advanced video
```

### Universal Templates (All)
```typescript
import { UNIVERSAL_TEMPLATES } from '@/data/templates/resource-templates'

// Basic Level
UNIVERSAL_TEMPLATES.basic_greetings_all    // Basic greetings
UNIVERSAL_TEMPLATES.basic_numbers          // Numbers & addresses
UNIVERSAL_TEMPLATES.basic_time             // Time & schedules
UNIVERSAL_TEMPLATES.basic_app_vocabulary   // App terms with images

// Intermediate Level
UNIVERSAL_TEMPLATES.intermediate_customer_service // Customer service
UNIVERSAL_TEMPLATES.intermediate_complaints      // Complaint handling
UNIVERSAL_TEMPLATES.intermediate_audio_scenarios // Common scenarios
UNIVERSAL_TEMPLATES.intermediate_weather_traffic // Weather & traffic

// Advanced Level
UNIVERSAL_TEMPLATES.advanced_business_english    // Business English
UNIVERSAL_TEMPLATES.advanced_idioms_slang       // Idioms & slang
UNIVERSAL_TEMPLATES.advanced_accent_reduction   // Pronunciation
UNIVERSAL_TEMPLATES.advanced_video_comprehensive // Complete course
```

### Emergency & App-Specific
```typescript
import { EMERGENCY_TEMPLATES, APP_SPECIFIC_TEMPLATES }
  from '@/data/templates/resource-templates'

// Emergency
EMERGENCY_TEMPLATES.emergency_phrases      // Critical emergency phrases
EMERGENCY_TEMPLATES.safety_protocols       // Safety communication

// App-Specific
APP_SPECIFIC_TEMPLATES.uber_guide          // Uber complete guide
APP_SPECIFIC_TEMPLATES.rappi_guide         // Rappi complete guide
APP_SPECIFIC_TEMPLATES.didi_guide          // DiDi complete guide
APP_SPECIFIC_TEMPLATES.doordash_guide      // DoorDash complete guide
```

---

## 🎯 Common Use Cases

### Create Basic Delivery Resource

```typescript
const deliveryResource = generateFromTemplate('basic_phrases', {
  title: 'Frases para Entregas en Restaurantes',
  description: 'Frases específicas para entregas de restaurantes',
  downloadUrl: '/resources/delivery/restaurant-phrases.pdf',
  tags: ['Rappi', 'Restaurantes', 'Básico']
})
```

### Create Intermediate Audio Resource

```typescript
const audioResource = generateFromTemplate('intermediate_conversations', {
  title: 'Conversaciones: Entregas Complejas',
  description: 'Audio de situaciones complejas con clientes difíciles',
  size: '6.8 MB',
  downloadUrl: '/resources/delivery/complex-audio.mp3'
})
```

### Create App-Specific Guide

```typescript
const uberGuide = generateFromTemplate('uber_guide', {
  title: 'Guía Completa Uber 2025',
  description: 'Guía actualizada con nuevas funciones de Uber',
  size: '3.2 MB',
  downloadUrl: '/resources/apps/uber-2025-guide.pdf'
})
```

### Create Resource Set for New Topic

```typescript
import { generateResourceSet } from '@/lib/utils/resource-generator'

const airportResources = generateResourceSet({
  category: 'conductor',
  baseTitle: 'Viajes al Aeropuerto',
  basePath: '/resources/rideshare/airport'
})

// Returns: [basic PDF, basic audio, intermediate, advanced]
```

---

## ✅ Validation Rules

### Required Fields
- ✅ `id` - Unique number (auto-generated)
- ✅ `title` - 5-100 characters with Spanish accents
- ✅ `description` - 20-200 characters, descriptive
- ✅ `type` - 'pdf' | 'audio' | 'image' | 'video'
- ✅ `category` - 'all' | 'repartidor' | 'conductor'
- ✅ `level` - 'basico' | 'intermedio' | 'avanzado'
- ✅ `size` - Format: "X.X MB" or "XXX KB"
- ✅ `downloadUrl` - Must start with '/resources/'
- ✅ `tags` - Array with 2-8 tags
- ✅ `offline` - Boolean (true/false)

### Size Limits
- PDF: Max 5 MB (warning at 3 MB)
- Audio: Max 15 MB (warning at 10 MB)
- Image: Max 8 MB (warning at 5 MB)
- Video: Max 150 MB (warning at 100 MB)

### Best Practices
- Use Spanish characters in title (á, é, í, ó, ú, ñ, ¿, ¡)
- Include at least one category-specific tag
- Mark large files (>50 MB) as `offline: false`
- Match file extension with type (e.g., .pdf for PDF)

---

## 🛠️ Utility Functions

### List All Templates
```typescript
import { listTemplates, listTemplatesByCategory }
  from '@/lib/utils/resource-generator'

const allTemplates = listTemplates()
// ['basic_phrases', 'basic_audio', ...]

const byCategory = listTemplatesByCategory()
// { delivery: [...], rideshare: [...], universal: [...] }
```

### Batch Generate
```typescript
import { generateBatch } from '@/lib/utils/resource-generator'

const newResources = generateBatch([
  'basic_phrases',
  'basic_audio',
  'intermediate_situations'
], existingResources)

// Returns array of 3 resources with sequential IDs
```

### Clone Existing Resource
```typescript
import { cloneResource } from '@/lib/utils/resource-generator'

const cloned = cloneResource(
  existingResource,
  {
    title: 'New Title',
    level: 'avanzado'
  },
  allResources
)
```

### Validate Multiple Resources
```typescript
import { validateResources } from '@/lib/utils/resource-validator'

const { results, summary } = validateResources([resource1, resource2, resource3])

console.log(`Valid: ${summary.valid}/${summary.total}`)
console.log(`Errors: ${summary.totalErrors}`)
```

### Check for Duplicates
```typescript
import { checkDuplicates } from '@/lib/utils/resource-validator'

const duplicates = checkDuplicates(allResources)

if (duplicates.duplicateIds.length > 0) {
  console.error('Duplicate IDs:', duplicates.duplicateIds)
}
```

### Suggest Next ID
```typescript
import { suggestNextId } from '@/lib/utils/resource-validator'

const nextId = suggestNextId(resources)
// Returns: max(existing IDs) + 1
```

---

## 📊 Export Formats

### Export to JSON
```typescript
import { exportToJSON } from '@/lib/utils/resource-generator'

const json = exportToJSON(resources)
// Formatted JSON string
```

### Export to TypeScript
```typescript
import { exportToTypeScript } from '@/lib/utils/resource-generator'

const tsCode = exportToTypeScript(resources)
// Ready-to-use TypeScript array
```

### Generate Documentation
```typescript
import { generateMarkdownDocs } from '@/lib/utils/resource-generator'

const docs = generateMarkdownDocs(resources)
// Markdown documentation with categories and levels
```

---

## 🎨 File Organization

```
hablas/
├── data/
│   ├── resources.ts              ← Main resource list
│   └── templates/
│       └── resource-templates.ts ← All templates
│
├── docs/
│   └── resources/
│       ├── content-creation-guide.md ← Detailed guide
│       └── quick-reference.md        ← This file
│
├── lib/
│   └── utils/
│       ├── resource-validator.ts     ← Validation
│       └── resource-generator.ts     ← Generation helpers
│
└── public/
    └── resources/                ← Actual files
        ├── delivery/
        ├── rideshare/
        ├── universal/
        ├── emergency/
        └── apps/
```

---

## 🔧 CLI Usage (Optional)

```typescript
import { cli } from '@/lib/utils/resource-generator'

// List all templates
cli.list()

// Show specific template
cli.show('basic_phrases')

// Generate from template
cli.generate('basic_phrases', {
  title: 'Custom Title'
})
```

---

## 📝 Complete Example

```typescript
// 1. Import dependencies
import { generateFromTemplate } from '@/lib/utils/resource-generator'
import { validateResource, formatValidationResult } from '@/lib/utils/resource-validator'
import { resources } from '@/data/resources'

// 2. Generate resource
const newResource = generateFromTemplate(
  'basic_phrases',
  {
    title: 'Frases para Food Delivery',
    description: 'Las 40 frases más usadas en entrega de comida a domicilio',
    downloadUrl: '/resources/delivery/food-delivery-phrases.pdf',
    size: '1.8 MB',
    tags: ['Rappi', 'Uber Eats', 'Food Delivery', 'Básico']
  },
  resources
)

// 3. Validate
const validation = validateResource(newResource)
console.log(formatValidationResult(validation))

// 4. If valid, add to resources.ts
if (validation.isValid) {
  console.log('✅ Resource ready! Add to resources.ts:')
  console.log(JSON.stringify(newResource, null, 2))
} else {
  console.error('❌ Fix errors before adding')
}
```

---

## 🆘 Troubleshooting

**Error: "Template not found"**
- Check template name spelling
- Use `cli.list()` to see available templates

**Error: "Validation failed"**
- Run `formatValidationResult()` to see specific errors
- Check size format (should be "1.5 MB" not "1.5mb")
- Verify downloadUrl starts with '/resources/'

**Warning: "File too large"**
- Optimize your file (compress images, reduce audio bitrate)
- Or mark as `offline: false` for online-only access

**Missing Spanish characters**
- Add accents to title: á, é, í, ó, ú, ñ
- Use proper Spanish punctuation: ¿, ¡

---

**Need more help?** See the complete [Content Creation Guide](./content-creation-guide.md)
