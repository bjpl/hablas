# API Documentation

**Version**: 1.1.0
**Last Updated**: October 8, 2025

## Overview

Hablas currently uses a minimal API surface focused on client-side operations. The primary API integration is with Anthropic Claude for AI-powered resource generation.

## Current APIs

### 1. Anthropic Claude API (External)

**Purpose**: AI-powered content generation for learning resources

**Authentication**: API key via environment variable
```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Model**: Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)

**Usage**:
```typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const message = await client.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 8000,
  temperature: 0.7,
  messages: [{
    role: 'user',
    content: 'Generate content...'
  }]
})
```

**Rate Limits**:
- Default: 50 requests/minute
- Our scripts include 2s delay between requests

**Cost**: ~$0.02-$0.08 per resource (varies by length)

**Documentation**: https://docs.anthropic.com/

---

## Planned Internal APIs

### Future Analytics API

**Status**: Planned for v1.2.0

**Endpoint**: `/api/analytics`

**Purpose**: Track resource usage and user engagement

**Features**:
- Resource download tracking
- Page view analytics
- User journey mapping
- Performance metrics

**Authentication**: Will require rate limiting and input validation

**Security Considerations**:
- Rate limiting (max 100 requests/hour per IP)
- Input sanitization (DOMPurify)
- CORS restrictions
- Request validation

---

## Resource Management API (CLI)

**Purpose**: Local resource management via command-line scripts

### Available Commands

#### List Resources
```bash
npm run resource:list
```

**Output**: All available resource templates with IDs, titles, categories

#### Generate Resource
```bash
npm run resource:generate [template-name]
```

**Parameters**:
- `template-name`: Optional template identifier
- Interactive if no parameter provided

**Output**: Generated resource in `/generated-resources`

#### Validate Resources
```bash
npm run resource:validate
```

**Validation Checks**:
- Required fields present
- Correct data types
- File size format
- Tag relevance
- Category/level consistency

**Output**: Validation report with errors/warnings

#### Resource Statistics
```bash
npm run resource:stats
```

**Output**:
- Total resources
- Resources by category
- Resources by level
- Resources by type
- Average resource size

#### Search Resources
```bash
npm run resource:search [query]
```

**Parameters**:
- `query`: Search term (title, tags, category)

**Output**: Matching resources with details

#### Export Resources
```bash
npm run resource:export [format]
```

**Formats**:
- `json`: JSON format
- `ts`: TypeScript format
- `csv`: CSV format (future)

**Output**: Exported file in `/exports`

---

## AI Generation API (CLI)

**Purpose**: AI-powered resource generation

### Generation Modes

#### Interactive Mode
```bash
npm run ai:generate
```

**Features**:
- Step-by-step prompts
- Template selection
- Customization options
- Real-time preview

#### Generate Essentials
```bash
npm run ai:generate-essentials
```

**Generates**: 20 core resources across all categories/levels

**Time**: ~10-15 minutes
**Cost**: ~$1-2

#### Generate All
```bash
npm run ai:generate-all
```

**Generates**: Complete resource library (40+ resources)

**Time**: ~20-30 minutes
**Cost**: ~$2-5

#### Generate by Category
```bash
npm run ai:generate-category <category>
```

**Categories**:
- `repartidor`: Delivery driver resources
- `conductor`: Rideshare driver resources
- `all`: Universal resources

**Time**: ~8-12 minutes per category
**Cost**: ~$0.75-$1.50

#### Generate by Level
```bash
npm run ai:generate-level <level>
```

**Levels**:
- `basico`: Beginner level
- `intermedio`: Intermediate level
- `avanzado`: Advanced level

**Time**: ~6-10 minutes per level
**Cost**: ~$0.60-$1.20

#### Generate by Topic
```bash
npm run ai:generate-topic "<topic>" <category>
```

**Example**:
```bash
npm run ai:generate-topic "Restaurant Delivery" repartidor
```

**Generates**: 4 resources (basic, audio, intermediate, advanced)

**Time**: ~3-5 minutes
**Cost**: ~$0.30-$0.75

#### Generate by Template
```bash
npm run ai:generate-template <template-name>
```

**Example**:
```bash
npm run ai:generate-template basic_phrases
```

**Time**: ~30-60 seconds
**Cost**: ~$0.05-$0.08

#### Check Progress
```bash
npm run check:progress
```

**Output**: Real-time status of ongoing generation

---

## API Response Formats

### Resource Object

```typescript
interface Resource {
  id: number
  title: string
  description: string
  type: 'pdf' | 'audio' | 'image' | 'video'
  category: 'repartidor' | 'conductor' | 'all'
  level: 'basico' | 'intermedio' | 'avanzado'
  size: string  // e.g., "1.2 MB"
  downloadUrl: string
  tags: string[]
  offline: boolean
}
```

### Validation Result

```typescript
interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  resource: Resource
}
```

### Generation Result

```typescript
interface GenerationResult {
  success: boolean
  resource: Resource
  content: string
  quality: number  // 0-100
  cost: number     // USD
  duration: number // seconds
  error?: string
}
```

---

## Error Handling

### Common Errors

#### `ANTHROPIC_API_KEY not set`
**Cause**: Missing API key in environment
**Solution**: Set environment variable or create `.env` file

#### `Rate limit exceeded`
**Cause**: Too many API requests
**Solution**: Scripts include automatic rate limiting; increase delay if needed

#### `Template not found`
**Cause**: Invalid template name
**Solution**: Run `npm run resource:list` to see available templates

#### `Validation failed`
**Cause**: Resource doesn't meet quality standards
**Solution**: Review error messages and fix issues

#### `Generation timeout`
**Cause**: Request took too long
**Solution**: Increase max_tokens or split into smaller requests

---

## Security Best Practices

### API Key Management

✅ **DO**:
- Store in `.env` file (never commit)
- Use environment variables
- Rotate keys periodically
- Use separate keys for dev/prod

❌ **DON'T**:
- Hardcode in source files
- Commit to version control
- Share in public channels
- Expose in client-side code

### Rate Limiting

Current implementation:
```typescript
// 2 second delay between requests
await new Promise(resolve => setTimeout(resolve, 2000))
```

### Input Validation

All user inputs are validated:
- Template names
- File paths
- Search queries
- Export formats

### Error Messages

- Don't expose internal details
- Provide actionable guidance
- Log full errors server-side
- Show sanitized errors to users

---

## API Monitoring

### Metrics to Track

- Request count
- Success/failure rate
- Average response time
- API costs
- Error rates
- Token usage

### Logging

Currently implemented:
```typescript
console.log(`[Generation] ${template.title}`)
console.log(`Quality: ${quality}/100`)
console.log(`Cost: $${cost.toFixed(4)}`)
console.log(`Duration: ${duration}s`)
```

Future: Structured logging with timestamps and log levels

---

## Future API Plans

### v1.2.0 - Analytics API
- Track resource usage
- User engagement metrics
- Performance monitoring

### v1.3.0 - User API
- User authentication
- Progress tracking
- Personalized recommendations

### v2.0.0 - Admin API
- Content management
- User management
- Analytics dashboard
- Bulk operations

---

## Development Guidelines

### Testing APIs

```bash
# Test resource CLI
npm run resource:list
npm run resource:validate
npm run resource:stats

# Test AI generation
npm run ai:generate-template basic_phrases
npm run check:progress
```

### Adding New API Endpoints

1. Create handler in `/app/api/[endpoint]/route.ts`
2. Implement request validation
3. Add rate limiting
4. Add error handling
5. Add logging
6. Document in this file
7. Add tests

### API Versioning

Future APIs will use path-based versioning:
- `/api/v1/analytics`
- `/api/v2/analytics`

---

## Support

### Issues with APIs

- Check environment variables
- Verify API key is valid
- Review error messages
- Check rate limits
- Consult Anthropic status page

### Documentation

- [Anthropic Documentation](https://docs.anthropic.com/)
- [Resource Generation Guide](/docs/resources/ai-generation-guide.md)
- [CLI Reference](/docs/resources/quick-reference.md)

### Contact

- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: Questions and ideas

---

**Last Updated**: October 8, 2025
**Version**: 1.1.0
**Status**: Current

*Hecho con ❤️ en Medellín para toda Colombia*
