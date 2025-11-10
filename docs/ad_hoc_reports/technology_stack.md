# Technology Stack Analysis - Hablas.co

**Project:** Hablas - English Learning Hub for Colombian Workers
**Version:** 1.1.0
**Analysis Date:** October 12, 2025
**Repository:** https://github.com/bjpl/hablas

---

## Executive Summary

Hablas.co is a mobile-first Progressive Web Application (PWA) designed to provide practical English learning resources to Colombian gig economy workers (delivery drivers and rideshare operators). The platform is optimized for low-bandwidth environments, offline functionality, and deployment on GitHub Pages as a static site.

### Key Architectural Decisions

1. **Static Site Generation**: Uses Next.js static export for zero-cost hosting on GitHub Pages
2. **AI-Powered Content**: Leverages Claude Sonnet 4.5 for generating 50+ educational resources
3. **Offline-First Design**: Service Worker implementation enables full offline capability
4. **Mobile Optimization**: Tailored for budget Android devices on 3G/4G networks in Colombia
5. **Zero Backend**: Entirely client-side application with optional Supabase integration

---

## Operating System & Infrastructure

### Development Environment
| Component | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | v20.11.0 | JavaScript runtime |
| **npm** | v10.2.4 | Package manager |
| **Operating System** | Windows (MSYS_NT-10.0) | Development platform |

**Engine Requirements** (from package.json):
- Node.js: >= 18.0.0
- npm: >= 9.0.0

### Deployment Platform
| Platform | Configuration | Purpose |
|----------|--------------|---------|
| **GitHub Pages** | Static hosting | Production deployment |
| **GitHub Actions** | ubuntu-latest | CI/CD pipeline |
| **Base Path** | `/hablas` | GitHub Pages subpath routing |

---

## Frontend Technology Stack

### Core Framework
| Technology | Version | Purpose | Architectural Notes |
|------------|---------|---------|---------------------|
| **Next.js** | ^15.0.0 | React framework | Static export mode (`output: 'export'`) |
| **React** | ^18.3.1 | UI library | React 19 support enabled |
| **React DOM** | ^18.3.1 | React renderer | DOM manipulation |
| **TypeScript** | ^5.6.0 | Type safety | Strict mode enabled, ES2017 target |

**Next.js Configuration Highlights:**
- Static export for GitHub Pages compatibility
- React Strict Mode enabled
- Compression enabled for performance
- Powered-by header disabled for security
- Custom build IDs with timestamps
- Image optimization disabled (static export requirement)

### Styling & UI

| Technology | Version | Purpose | Configuration |
|------------|---------|---------|---------------|
| **Tailwind CSS** | ^3.4.0 | Utility-first CSS | Custom design system |
| **PostCSS** | ^8.4.0 | CSS processing | Autoprefixer integration |
| **Autoprefixer** | ^10.4.0 | CSS vendor prefixing | Browser compatibility |

**Design System Features:**
- Custom color palette for Colombian gig economy brands:
  - WhatsApp colors (#25D366, #128C7E, #E8F9E0)
  - Rappi (#FF4E00), DiDi (#FFA033), Uber (#000000)
  - Accent colors (blue, green, purple)
- System font stack for performance
- Touch-friendly spacing (minimum 44px targets)
- Mobile-first responsive breakpoints (xs: 375px)
- Custom shadows and transitions

### UI Components

**Component Architecture:**
```
components/
├── Hero.tsx              - Landing page hero section
├── InstallPrompt.tsx     - PWA installation prompt
├── OfflineNotice.tsx     - Network status indicator
├── OptimizedImage.tsx    - Performance-optimized images
├── ResourceCard.tsx      - Learning resource cards
├── ResourceLibrary.tsx   - Resource catalog display
├── SearchBar.tsx         - Resource search functionality
└── WhatsAppCTA.tsx       - WhatsApp community integration
```

**Component Characteristics:**
- TypeScript for type safety
- Mobile-first responsive design
- Accessibility features (ARIA labels, keyboard navigation)
- Performance optimizations (lazy loading, code splitting)
- Colombian Spanish localization

---

## Content & Data Layer

### Content Management

| Component | Location | Purpose |
|-----------|----------|---------|
| **Learning Resources** | `/public/resources/` | PDF, audio, image, video resources |
| **Generated Content** | `/public/generated-resources/` | AI-generated learning materials |
| **Resource Metadata** | `/data/resources.ts` | TypeScript resource definitions |

### AI Content Generation

| Technology | Version | Purpose | Configuration |
|------------|---------|---------|---------------|
| **Anthropic Claude SDK** | ^0.65.0 | AI content generation | Claude Sonnet 4.5 model |
| **Content Generator** | Custom | Resource creation | `lib/ai/resource-content-generator.ts` |

**AI Generation Capabilities:**
- **Model**: claude-sonnet-4-5-20250929
- **Max Tokens**: 8,000 per request
- **Temperature**: 0.7 (balanced creativity)
- **Content Types**: PDF guides, audio scripts, image specs, video scripts
- **Batch Processing**: Sequential generation with rate limiting
- **Validation**: Automated content validation and quality checks

**Content Generation Pipeline:**
1. Template-based resource definitions
2. AI-powered content generation with Claude
3. Validation against quality standards
4. Export to markdown/text formats
5. Manual conversion to final media formats

### Static Data

**Resource Schema:**
```typescript
interface Resource {
  id: string
  title: string
  description: string
  type: 'pdf' | 'audio' | 'image' | 'video'
  category: 'repartidor' | 'conductor' | 'all'
  level: 'basico' | 'intermedio' | 'avanzado'
  size: string
  downloadUrl: string
  tags: string[]
  offline: boolean
}
```

---

## Database & Backend Services

### Primary Database (Optional)

| Technology | Version | Purpose | Usage Status |
|------------|---------|---------|--------------|
| **Supabase** | ^2.58.0 | PostgreSQL BaaS | Optional (devDependency) |
| **PostgreSQL** | Latest | Relational database | Via Supabase |

**Database Schema** (`supabase/schema.sql`):

1. **resources** - Learning materials catalog
   - Fields: id, title, description, type, category, level, size, download_url, tags, offline_available, download_count
   - Indexes: category, level, type
   - RLS: Public read access enabled

2. **whatsapp_groups** - Community group management
   - Fields: id, name, description, invite_link, member_count, rules, category, is_active
   - Indexes: is_active
   - RLS: Public read for active groups

3. **analytics** - Usage tracking
   - Fields: id, event_type, resource_id, user_agent, ip_address, city, region, device_type, network_type
   - Indexes: created_at, event_type
   - RLS: Public insert access

4. **announcements** - Platform announcements
   - Fields: id, title, content, type (meetup/resource/general), is_active, expires_at
   - RLS: Public read for active announcements

**Database Features:**
- Row Level Security (RLS) enabled on all tables
- Automatic timestamp triggers (created_at, updated_at)
- Optimized indexes for query performance
- Public read access for content
- Analytics tracking capability

**Note:** Supabase is configured but not required for core functionality. The application works fully as a static site without backend services.

---

## Progressive Web App (PWA)

### Service Worker Implementation

| File | Purpose | Cache Strategy |
|------|---------|----------------|
| **public/sw.js** | Main service worker | Cache-first with network fallback |
| **public/sw/service-worker.js** | Alternative SW | Workbox-based caching |
| **lib/utils/serviceWorkerRegistration.ts** | SW registration | Lifecycle management |

**Service Worker Features:**

1. **Precaching**
   - Core application files
   - Static assets (_next/static/*)
   - Entry points and manifest

2. **Runtime Caching**
   - Generated resources (/generated-resources/*)
   - Resource catalog (/recursos/*)
   - Next.js static files

3. **Offline Support**
   - Fallback to cached content when offline
   - Offline page for navigation requests
   - Custom 503 responses for failed fetches

4. **Cache Management**
   - Version-based cache naming (hablas-v1)
   - Automatic cleanup of old caches
   - Separate runtime and precache stores

### PWA Manifest

**File:** `public/manifest.json`

```json
{
  "name": "Hablas - Aprende Inglés para Trabajo",
  "short_name": "Hablas",
  "start_url": "/hablas/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#25D366",
  "orientation": "portrait",
  "categories": ["education", "productivity"],
  "lang": "es-CO"
}
```

**PWA Capabilities:**
- Installable on home screen (Add to Home Screen)
- Standalone display mode (full-screen app experience)
- Colombian Spanish localization (es-CO)
- WhatsApp brand theme color (#25D366)
- Portrait-optimized for mobile devices

---

## Networking & Protocols

### HTTP/HTTPS
| Protocol | Usage |
|----------|-------|
| **HTTPS** | All production traffic (GitHub Pages enforced) |
| **HTTP/2** | Automatic via GitHub Pages CDN |

### API Integration

**Anthropic API:**
- REST API over HTTPS
- Bearer token authentication
- Rate limiting: 1 request per second (self-imposed)
- Error handling and retry logic
- Usage tracking (tokens, generation time)

**External Integrations:**
- WhatsApp Community links (direct linking)
- No external API calls in production build
- All content statically generated

### Resource Loading

**Optimization Strategies:**
- Asset compression (gzip/brotli via GitHub Pages)
- Lazy loading for images and components
- Code splitting by route
- Prefetching for anticipated navigation
- Service Worker caching for repeat visits

---

## Security

### Authentication & Authorization

**Current Implementation:**
- No user authentication (public access)
- Optional Supabase RLS for future user features
- Read-only public access to all resources

**Security Headers:**
- `X-Powered-By` header removed (Next.js config)
- Content-Security-Policy recommended for future implementation

### Data Protection

**Client-Side Security:**
- Environment variables for API keys (`.env`)
- No sensitive data stored client-side
- Analytics data anonymization (IP hashing recommended)

**API Security:**
- Anthropic API key stored securely in environment
- GitHub Secrets for CI/CD credentials
- No API keys in client bundle

### Content Security

**Static Site Security:**
- Read-only deployment (no backend attack surface)
- GitHub Pages HTTPS enforcement
- No user-generated content risks
- XSS protection via React's built-in escaping

---

## Development Tools & Utilities

### Build Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **tsx** | ^4.19.0 | TypeScript execution |
| **ESLint** | ^9.0.0 | Code linting |
| **eslint-config-next** | ^15.0.0 | Next.js ESLint rules |

### TypeScript Configuration

**Target:** ES2017
**Module System:** ESNext with bundler resolution
**Strict Mode:** Enabled

**Compiler Options:**
- Path aliases: `@/*` maps to project root
- Incremental compilation enabled
- Next.js plugin integration
- JSX preservation for React

### Build Scripts

**NPM Scripts:**

**Core Development:**
```json
{
  "dev": "next dev",              // Development server
  "build": "next build",          // Production build
  "start": "next start",          // Production server
  "lint": "next lint",            // Code linting
  "typecheck": "tsc --noEmit"     // Type checking
}
```

**Resource Management:**
```json
{
  "resource:list": "List all resource templates",
  "resource:generate": "Generate resources from templates",
  "resource:validate": "Validate resource structure",
  "resource:stats": "Show resource statistics",
  "resource:search": "Search available resources",
  "resource:export": "Export resources",
  "resource:integrate": "Integrate resources into app"
}
```

**AI Content Generation:**
```json
{
  "ai:generate": "Interactive AI resource generation",
  "ai:generate-all": "Generate complete resource library",
  "ai:generate-essentials": "Generate 20 core resources",
  "ai:generate-topic": "Generate resources by topic",
  "ai:generate-category": "Generate by category",
  "ai:generate-level": "Generate by difficulty level"
}
```

### Utility Libraries

**Custom Utilities:**
```
lib/utils/
├── performance.ts              - Performance monitoring
├── prefetch.ts                 - Resource prefetching
├── resource-generator.ts       - Resource template engine
├── resource-validator.ts       - Content validation
└── serviceWorkerRegistration.ts - PWA registration
```

**Custom Hooks:**
```
lib/hooks/
├── useIntersectionObserver.ts  - Viewport visibility
├── usePerformanceMonitor.ts    - Performance metrics
└── useVirtualScroll.ts         - Virtual scrolling
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

**File:** `.github/workflows/deploy.yml`

**Workflow Configuration:**

| Stage | Action | Version |
|-------|--------|---------|
| **Checkout** | actions/checkout | v4 |
| **Node Setup** | actions/setup-node | v4 |
| **Build** | Custom script | - |
| **Pages Setup** | actions/configure-pages | v4 |
| **Upload** | actions/upload-pages-artifact | v3 |
| **Deploy** | actions/deploy-pages | v4 |

**Pipeline Steps:**

1. **Environment Setup**
   - Node.js 20 installation
   - npm cache utilization
   - Dependency installation (`npm ci`)

2. **Build Process**
   - Next.js static export (`npm run build`)
   - Output directory validation
   - Build artifact verification

3. **Deployment**
   - GitHub Pages configuration
   - Artifact upload from `./out` directory
   - Automatic deployment to production

**Triggers:**
- Push to `main` branch (automatic)
- Manual workflow dispatch

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` (from GitHub Secrets)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from GitHub Secrets)

**Concurrency:**
- Group: "pages"
- Cancel in-progress deployments on new push

---

## Monitoring & Analytics

### Performance Monitoring

**Built-in Monitoring:**
- Custom performance monitoring hook (`usePerformanceMonitor`)
- Lighthouse performance auditing script
- Build-time performance analysis

**Metrics Tracked:**
- Page load time
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Component render performance

### Analytics (Optional)

**Supabase Analytics Schema:**
- Event tracking
- Resource download counts
- User agent and device type
- Geographic data (city, region)
- Network type detection

**Performance Benchmarks:**
- Lighthouse score: 95+
- 50% speed improvement (October 2025 update)
- Component data extraction: 57% size reduction

---

## External APIs & Integrations

### AI Services

| Service | Purpose | Authentication | Rate Limits |
|---------|---------|----------------|-------------|
| **Anthropic Claude API** | Content generation | API Key (Bearer token) | Self-imposed: 1 req/sec |

**API Configuration:**
```typescript
{
  model: "claude-sonnet-4-5-20250929",
  maxTokens: 8000,
  temperature: 0.7
}
```

### Communication Platforms

| Platform | Integration | Purpose |
|----------|-------------|---------|
| **WhatsApp** | Direct links | Community groups for learners |

**WhatsApp Integration:**
- No API calls (direct web links only)
- Community invite links stored in database
- Share functionality for resources

### Content Delivery

| Service | Purpose |
|---------|---------|
| **GitHub Pages CDN** | Static asset delivery |
| **Next.js Image Optimization** | Disabled (static export) |

---

## Performance Optimizations

### Network Optimization

**Compression:**
- Gzip/Brotli compression (automatic via GitHub Pages)
- Next.js built-in compression enabled

**Asset Optimization:**
- System fonts (no web font loading)
- Image compression for low bandwidth
- Aggressive caching strategies
- Code splitting and lazy loading

**Mobile Optimization:**
- Mobile-first CSS
- Touch-friendly UI (44px minimum targets)
- Reduced JavaScript bundle size
- Optimized for 3G/4G networks in Colombia

### Build Optimization

**Next.js Optimizations:**
- Static export eliminates server overhead
- Tree shaking and dead code elimination
- Minification of HTML, CSS, JavaScript
- Asset hashing for cache busting

**TypeScript Optimizations:**
- Incremental compilation
- Build info caching
- Type-only imports eliminated at build time

---

## Development Environment Setup

### Environment Variables

**Required (.env):**
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**Optional:**
```bash
AI_MODEL=claude-sonnet-4-5-20250929
AI_MAX_TOKENS=8000
AI_TEMPERATURE=0.7
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Local Development

**Setup Steps:**
1. Clone repository
2. Install dependencies: `npm install`
3. Configure environment: Copy `.env.example` to `.env`
4. Add API keys
5. Run development server: `npm run dev`
6. Access at: http://localhost:3000

**Development Features:**
- Hot module replacement
- Fast refresh for React components
- TypeScript type checking
- ESLint on save
- Service Worker development mode

---

## Project File Structure

```
hablas/
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD pipeline
├── app/
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Home page
│   └── recursos/                   # Resource routes
├── components/
│   ├── Hero.tsx
│   ├── InstallPrompt.tsx
│   ├── OfflineNotice.tsx
│   ├── OptimizedImage.tsx
│   ├── ResourceCard.tsx
│   ├── ResourceLibrary.tsx
│   ├── SearchBar.tsx
│   └── WhatsAppCTA.tsx
├── data/
│   └── resources.ts                # Resource metadata
├── docs/
│   └── ad_hoc_reports/
│       └── technology_stack.md     # This document
├── lib/
│   ├── ai/
│   │   ├── improved-content-generator.ts
│   │   └── resource-content-generator.ts
│   ├── hooks/
│   │   ├── useIntersectionObserver.ts
│   │   ├── usePerformanceMonitor.ts
│   │   └── useVirtualScroll.ts
│   ├── utils/
│   │   ├── performance.ts
│   │   ├── prefetch.ts
│   │   ├── resource-generator.ts
│   │   ├── resource-validator.ts
│   │   └── serviceWorkerRegistration.ts
│   └── supabase.ts
├── public/
│   ├── generated-resources/        # AI-generated content
│   ├── resources/                  # Static learning materials
│   ├── sw/
│   │   └── service-worker.js      # Alternative service worker
│   ├── manifest.json              # PWA manifest
│   └── sw.js                      # Main service worker
├── scripts/
│   ├── ai-generate-resources.ts   # AI generation CLI
│   ├── check-progress.ts          # Progress tracking
│   ├── generate-resource.ts       # Template generator
│   ├── integrate-resources.ts     # Resource integration
│   ├── performance-audit.js       # Performance testing
│   └── sync-docs.js               # Documentation sync
├── supabase/
│   └── schema.sql                 # Database schema
├── .env.example                   # Environment template
├── next.config.js                 # Next.js configuration
├── package.json                   # Dependencies and scripts
├── postcss.config.js              # PostCSS configuration
├── tailwind.config.js             # Tailwind CSS configuration
└── tsconfig.json                  # TypeScript configuration
```

---

## Technology Stack Summary Table

### Frontend Stack
| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | Next.js | 15.0.0 | React framework with SSG |
| Library | React | 18.3.1 | UI components |
| Language | TypeScript | 5.6.0 | Type safety |
| Styling | Tailwind CSS | 3.4.0 | Utility-first CSS |
| CSS Processing | PostCSS | 8.4.0 | CSS transformations |

### AI & Content Generation
| Technology | Version | Purpose |
|-----------|---------|---------|
| Anthropic SDK | 0.65.0 | Claude AI integration |
| Model | Claude Sonnet 4.5 | Content generation |

### Development Tools
| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20.11.0 | Runtime environment |
| npm | 10.2.4 | Package management |
| tsx | 4.19.0 | TypeScript execution |
| ESLint | 9.0.0 | Code quality |

### Backend Services (Optional)
| Service | Version | Purpose |
|---------|---------|---------|
| Supabase | 2.58.0 | PostgreSQL BaaS |
| PostgreSQL | Latest | Relational database |

### Infrastructure & Deployment
| Component | Platform | Purpose |
|-----------|----------|---------|
| Hosting | GitHub Pages | Static site hosting |
| CI/CD | GitHub Actions | Automated deployment |
| CDN | GitHub CDN | Content delivery |

### PWA Technologies
| Technology | Purpose |
|-----------|---------|
| Service Worker | Offline functionality |
| Web App Manifest | Installation capability |
| Cache API | Resource caching |

---

## Architectural Patterns & Principles

### Design Patterns

1. **Static Site Generation (SSG)**
   - Pre-renders all pages at build time
   - Eliminates server-side rendering overhead
   - Perfect for GitHub Pages deployment

2. **Component-Based Architecture**
   - Reusable React components
   - Single Responsibility Principle
   - Props-based data flow

3. **Progressive Enhancement**
   - Core functionality without JavaScript
   - Enhanced experience with JS enabled
   - Service Worker for offline capability

4. **Mobile-First Design**
   - Responsive layouts starting from mobile
   - Touch-optimized interactions
   - Performance budget for slow networks

5. **Content-First Strategy**
   - Static content prioritized
   - AI-generated resources pre-built
   - No runtime content generation in production

### Architecture Principles

**Performance:**
- Lighthouse score target: 95+
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1

**Accessibility:**
- WCAG 2.1 AA compliance target
- Semantic HTML
- ARIA labels
- Keyboard navigation support

**Internationalization:**
- Colombian Spanish (es-CO) primary language
- English content for learning
- Cultural context for Colombian users

**Scalability:**
- Static files scale infinitely on CDN
- No backend bottlenecks
- Optional Supabase for future features

---

## Future Technology Considerations

### Potential Additions

1. **User Authentication**
   - Supabase Auth integration
   - Progress tracking
   - Personalized content

2. **Real-time Features**
   - WebSocket for live tutoring
   - Real-time chat (WhatsApp Web API)
   - Collaborative learning rooms

3. **Enhanced Analytics**
   - Google Analytics integration
   - Custom event tracking
   - A/B testing framework

4. **Advanced PWA Features**
   - Background sync
   - Push notifications
   - Periodic background sync

5. **Content Delivery**
   - CDN optimization
   - Edge caching strategies
   - Video streaming platform integration

6. **AI Enhancements**
   - Real-time pronunciation feedback
   - Personalized learning paths
   - Adaptive difficulty adjustment

---

## Version History

| Version | Date | Major Changes |
|---------|------|---------------|
| 1.1.0 | Oct 2025 | AI content generation, Next.js 15, React 19 |
| 1.0.0 | Sep 2025 | Initial release with core features |

---

## References & Documentation

### Official Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com)
- [Supabase Documentation](https://supabase.com/docs)

### Project Documentation
- README.md - Project overview and setup
- CONTRIBUTING.md - Contribution guidelines
- CHANGELOG.md - Version history
- docs/resources/ - Resource creation guidelines

### Related Repositories
- GitHub Repository: https://github.com/bjpl/hablas
- Live Site: https://bjpl.github.io/hablas/

---

**Document Prepared By:** Claude Code System Architecture Analysis
**Last Updated:** October 12, 2025
**Next Review:** January 2026
