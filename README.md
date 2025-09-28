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

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Deployment**: GitHub Pages (static export)
- **Styling**: Tailwind CSS with custom design system
- **PWA**: Service Workers for offline functionality
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
- `npm run sync-docs` - Manually sync design system documentation
- `npm run lint` - Run ESLint

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

- **Version**: 1.0.0
- **Last Updated**: September 27, 2025
- **Resources**: 6 downloadable learning materials
- **Design System**: 100% integrated across all components
- **Documentation**: Complete with interactive style guide

### Recent Improvements

- ✅ Complete design system integration
- ✅ Automated documentation sync
- ✅ TypeScript strict mode enabled
- ✅ Component data extraction (57% size reduction)
- ✅ Comprehensive cleanup and optimization

## 🤝 Contributing

Contributions welcome! Focus on:
- More workplace-specific phrases
- Audio pronunciations with Colombian accent considerations
- Visual vocabulary for app interfaces

## 📄 License

MIT - Free for all Colombian workers to use and share

---

Hecho con ❤️ en Medellín para toda Colombia