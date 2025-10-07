# Resource Template System

**Comprehensive system for creating, managing, and generating learning resources for the Hablas platform**

## 📚 Overview

This template system provides everything needed to create high-quality English learning resources for Spanish-speaking delivery and rideshare drivers. It includes:

- **40+ Pre-built Templates** for all resource types and levels
- **AI-Powered Generation** using Claude Sonnet 4.5
- **Automatic Validation** to ensure quality
- **Helper Utilities** for batch operations
- **Comprehensive Documentation** with examples

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up API Key (for AI generation)

```bash
# Copy example environment file
cp .env.example .env

# Add your Anthropic API key
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" >> .env
```

### 3. Generate Your First Resource

```bash
# List available templates
npm run resource:list

# Generate from template
npm run resource:generate basic_phrases

# Or use AI to create content
npm run ai:generate-essentials
```

---

## 📁 File Structure

```
hablas/
├── data/
│   ├── resources.ts                  # Main resource list (add new resources here)
│   └── templates/
│       └── resource-templates.ts     # 40+ pre-built templates
│
├── docs/
│   └── resources/
│       ├── README.md                 # This file
│       ├── content-creation-guide.md # Detailed content guidelines
│       ├── quick-reference.md        # Fast lookup guide
│       ├── template-examples.md      # Real-world examples
│       └── ai-generation-guide.md    # AI generation documentation
│
├── lib/
│   ├── utils/
│   │   ├── resource-validator.ts     # Validation functions
│   │   └── resource-generator.ts     # Template generation helpers
│   └── ai/
│       └── resource-content-generator.ts # AI-powered content generation
│
├── scripts/
│   ├── generate-resource.ts          # Interactive CLI for templates
│   └── ai-generate-resources.ts      # AI generation CLI
│
└── generated-resources/              # Output directory for AI-generated content
```

---

## 🎯 Available Templates

### Delivery Driver Resources (Repartidor)
- ✅ Basic phrases and visual guides
- ✅ Intermediate situational handling
- ✅ Advanced professional communication
- ✅ Audio pronunciation resources

### Rideshare Driver Resources (Conductor)
- ✅ Greetings and passenger confirmations
- ✅ Navigation and directions
- ✅ Small talk and conversations
- ✅ Premium service standards

### Universal Resources (All Drivers)
- ✅ Basic greetings and numbers
- ✅ Customer service essentials
- ✅ Complaint handling
- ✅ App-specific vocabulary

### Specialized Resources
- ✅ Emergency phrases (safety-critical)
- ✅ App-specific guides (Uber, Rappi, DiDi, DoorDash)
- ✅ Cultural intelligence
- ✅ Regional variations

**Total: 40+ templates** across all categories and levels

---

## 🛠️ Usage Guide

### Manual Template Generation

**Step 1: Choose Template**
```typescript
import { DELIVERY_TEMPLATES } from '@/data/templates/resource-templates'

const template = DELIVERY_TEMPLATES.basic_phrases
```

**Step 2: Customize**
```typescript
import { generateFromTemplate } from '@/lib/utils/resource-generator'
import { resources } from '@/data/resources'

const newResource = generateFromTemplate(
  'basic_phrases',
  {
    title: 'My Custom Title',
    description: 'My custom description',
    tags: ['Custom', 'Tags']
  },
  resources
)
```

**Step 3: Validate**
```typescript
import { validateResource } from '@/lib/utils/resource-validator'

const validation = validateResource(newResource)
if (validation.isValid) {
  // Add to data/resources.ts
}
```

### AI-Powered Generation

**Generate Essentials** (recommended first step):
```bash
npm run ai:generate-essentials
```

**Generate by Category**:
```bash
npm run ai:generate-category repartidor  # Delivery drivers
npm run ai:generate-category conductor   # Rideshare drivers
npm run ai:generate-category all         # Universal resources
```

**Generate by Level**:
```bash
npm run ai:generate-level basico      # Beginner
npm run ai:generate-level intermedio  # Intermediate
npm run ai:generate-level avanzado    # Advanced
```

**Generate Complete Topic**:
```bash
npm run ai:generate-topic "Restaurant Delivery" repartidor
```

**Generate Everything** (takes 15-20 min):
```bash
npm run ai:generate-all
```

---

## 📋 CLI Commands

### Resource Management
```bash
npm run resource:list        # List all templates
npm run resource:generate    # Generate from template
npm run resource:validate    # Validate all resources
npm run resource:stats       # Show statistics
npm run resource:search      # Search resources
npm run resource:export      # Export to JSON/TypeScript
npm run resource:help        # Show help
```

### AI Generation
```bash
npm run ai:generate-essentials    # Generate 20 core resources
npm run ai:generate-category <cat> # Generate by category
npm run ai:generate-level <level>  # Generate by level
npm run ai:generate-topic <topic> <category>
npm run ai:generate-template <name>
npm run ai:generate-all           # Generate everything
```

---

## 💰 Cost Estimates

### AI Generation Costs (Claude Sonnet 4.5)

| Operation | Resources | Time | Cost |
|-----------|-----------|------|------|
| Single resource | 1 | 30-60s | $0.05-$0.08 |
| Essentials | 20 | 10-15 min | $1-2 |
| By category | 12-15 | 8-12 min | $0.75-$1.50 |
| By level | 10-12 | 6-10 min | $0.60-$1.20 |
| Complete library | 40+ | 20-30 min | $2-5 |

_Prices as of October 2025_

---

## ✅ Quality Assurance

### Automatic Validation

All resources are automatically validated for:
- ✅ Required fields (title, description, type, etc.)
- ✅ Format standards (file size, URL structure)
- ✅ Tag relevance and count
- ✅ Category/level consistency
- ✅ Spanish character usage
- ✅ No duplicates

### Content Quality Standards

AI-generated content ensures:
- ✅ **Natural English** - Phrases natives actually use
- ✅ **Accurate Spanish** - Perfect Latin American Spanish translations
- ✅ **Practical Focus** - All content immediately applicable
- ✅ **Cultural Context** - American customs explained
- ✅ **Real Scenarios** - Based on actual driver situations
- ✅ **Consistent Format** - Follows all style guidelines

---

## 📖 Documentation

### For Content Creators
- **[Content Creation Guide](./content-creation-guide.md)** - Comprehensive guidelines for creating resources
- **[Quick Reference](./quick-reference.md)** - Fast lookup for common operations
- **[Template Examples](./template-examples.md)** - Real-world usage examples

### For Developers
- **[AI Generation Guide](./ai-generation-guide.md)** - Using Claude Sonnet 4.5 for content generation
- TypeScript documentation in code files
- Inline comments and JSDoc

---

## 🔧 Advanced Usage

### Custom Template Creation

```typescript
// In data/templates/resource-templates.ts

export const CUSTOM_TEMPLATES = {
  my_custom_template: {
    id: 0,
    title: 'My Custom Resource',
    description: 'Custom description',
    type: 'pdf' as const,
    category: 'all' as const,
    level: 'basico' as const,
    size: '1.0 MB',
    downloadUrl: '/resources/custom/my-resource.pdf',
    tags: ['Custom', 'Tags'],
    offline: true
  }
}
```

### Batch Operations

```typescript
import { generateBatch } from '@/lib/utils/resource-generator'

const templates = ['basic_phrases', 'basic_audio', 'basic_visual']
const resources = generateBatch(templates, existingResources)
```

### Custom AI Prompts

```typescript
// Modify prompts in lib/ai/resource-content-generator.ts

function createGenerationPrompt(resource, guidelines) {
  return `
    Custom instructions here...
    ${guidelines}
  `
}
```

---

## 🐛 Troubleshooting

### Common Issues

**"Template not found"**
- Run `npm run resource:list` to see available templates
- Check spelling of template name

**"Validation failed"**
- Review error messages
- Check file size format ("1.5 MB" not "1.5mb")
- Ensure all required fields present

**"API key not set"**
- Set `ANTHROPIC_API_KEY` environment variable
- Check `.env` file exists and has key

**"Rate limit exceeded"**
- Script includes 1s delay between requests
- If still hitting limits, increase delay in code

### Getting Help

1. Check documentation files in `docs/resources/`
2. Review code comments and JSDoc
3. Search existing issues
4. Open new issue with details

---

## 🤝 Contributing

### Adding New Templates

1. Add template to `data/templates/resource-templates.ts`
2. Follow existing format and conventions
3. Include all required fields
4. Add appropriate tags
5. Test generation
6. Document in this README

### Improving AI Generation

1. Modify prompts in `lib/ai/resource-content-generator.ts`
2. Test with sample resources
3. Validate output quality
4. Update documentation
5. Submit PR with examples

---

## 📊 Statistics

### Current Template Library

- **Total Templates**: 40+
- **Categories**: 5 (Delivery, Rideshare, Universal, Emergency, App-Specific)
- **Levels**: 3 (Basic, Intermediate, Advanced)
- **Resource Types**: 4 (PDF, Audio, Image, Video)
- **Supported Apps**: Uber, Rappi, DiDi, DoorDash, Lyft, Uber Eats

### Content Coverage

- **Delivery Drivers**: 7 templates
- **Rideshare Drivers**: 9 templates
- **Universal**: 12 templates
- **Emergency**: 2 templates
- **App-Specific**: 4 templates

---

## 🎯 Roadmap

### Phase 1: Template Library (✅ Complete)
- [x] Create 40+ templates
- [x] Cover all categories and levels
- [x] Include all resource types

### Phase 2: AI Generation (✅ Complete)
- [x] Integrate Claude Sonnet 4.5
- [x] Create generation scripts
- [x] Add batch operations
- [x] Implement validation

### Phase 3: Content Production (In Progress)
- [ ] Generate essential resources
- [ ] Convert to final formats (PDF, audio)
- [ ] Add to platform
- [ ] User testing

### Phase 4: Expansion (Planned)
- [ ] Region-specific variations
- [ ] Industry-specific content
- [ ] Video tutorial production
- [ ] Interactive elements

---

## 📞 Support

### Resources
- **Documentation**: `/docs/resources/`
- **Code Examples**: `/docs/resources/template-examples.md`
- **API Docs**: Inline JSDoc in code files

### Contact
- GitHub Issues: Report bugs or request features
- Discussions: Ask questions or share ideas

---

## 📝 License

Private - For Hablas platform use only

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Maintained By**: Hablas Team
