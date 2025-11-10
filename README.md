# Hablas.co - English Learning Hub for Colombian Workers

A mobile-first web application connecting Colombian delivery drivers and rideshare workers to practical English learning resources through WhatsApp communities.

## 🎯 Mission

Help working-class Colombians (Rappi/Didi/Uber/inDriver drivers and delivery workers) learn practical workplace English to:
- Communicate with international customers
- Increase tips and ratings
- Access better opportunities

## 🚀 Features

- **WhatsApp Community Integration**: Direct links to learning groups
- **Offline-First Resources**: Download materials for use without data
- **Job-Specific Content**: Tailored phrases for delivery and rideshare scenarios
- **Mobile Optimized**: Built for budget Android phones on 3G/4G networks
- **Colombian Spanish**: Interface uses local dialect and conventions
- **Data Conservation**: Aggressive compression and caching
- **AI-Powered Content**: 50+ resources generated using Claude Sonnet 4.5

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Deployment**: GitHub Pages (static export)
- **Styling**: Tailwind CSS with custom design system
- **PWA**: Service Workers for offline functionality
- **AI Generation**: Anthropic Claude API for resource creation
- **Build Automation**: Automated documentation sync

## 📱 Optimization for Colombia

- System fonts to reduce load time
- Image compression for slow networks
- Thumb-friendly buttons for motorcycle drivers
- WhatsApp sharing integration
- Prepaid data warnings

## 🏗️ Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Build for production: `npm run build`

### Build Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (automatically syncs design system docs)
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript type checking

### Resource Management Scripts

- `npm run resource:list` - List all resource templates
- `npm run resource:generate` - Generate resources from templates
- `npm run resource:validate` - Validate resource structure
- `npm run resource:stats` - Show resource statistics
- `npm run resource:search` - Search available resources
- `npm run resource:help` - Show resource CLI help

### AI Generation Scripts

- `npm run ai:generate` - Interactive AI resource generation
- `npm run ai:generate-essentials` - Generate 20 core resources
- `npm run ai:generate-all` - Generate complete resource library
- `npm run ai:generate-topic` - Generate resources by topic
- `npm run ai:generate-category` - Generate by category (repartidor/conductor/all)
- `npm run ai:generate-level` - Generate by level (basico/intermedio/avanzado)
- `npm run check:progress` - Check AI generation progress

## 🌐 Deployment

Deployed to GitHub Pages using static export:

1. Push to `main` branch
2. GitHub Actions automatically builds and deploys
3. Live at: `https://bjpl.github.io/hablas/`

### Build Configuration

- **Static Export**: `output: 'export'` in next.config.js
- **Base Path**: `/hablas` for GitHub Pages
- **Automated Sync**: Design system docs copied to public/ during build

## 📊 Current Status

- **Version**: 1.1.0
- **Last Updated**: October 8, 2025
- **Resources**: 50+ AI-generated learning materials
- **Design System**: 100% integrated across all components
- **Documentation**: Comprehensive with automated sync
- **Performance**: 95+ Lighthouse score, 50% speed improvement

### Recent Improvements (October 2025)

- ✅ AI-powered resource generation system (50+ resources)
- ✅ Performance optimizations (95+ Lighthouse score)
- ✅ Complete design system integration
- ✅ Automated documentation sync
- ✅ TypeScript strict mode enabled
- ✅ Next.js 15 upgrade with React 19 support
- ✅ Component data extraction (57% size reduction)
- ✅ Comprehensive cleanup and optimization
- ✅ Service Worker for offline capability

## 🤝 Contributing

Contributions welcome! Focus on:
- More workplace-specific phrases
- Audio pronunciations with Colombian accent considerations
- Visual vocabulary for app interfaces

## 📄 License

MIT - Free for all Colombian workers to use and share

---

Hecho con ❤️ en Medellín para toda Colombia