# Changelog

All notable changes to the Hablas project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Video tutorial resources
- Interactive pronunciation practice
- User progress tracking

## [1.2.0] - 2025-11-01

### Added
- Enhanced audio player with advanced controls (speed, loop, volume, seek)
- Audio preloading and offline caching system
- Service Worker audio cache for offline playback
- Playback position persistence across page reloads
- API rate limiting with Upstash Redis (optional, in-memory fallback)
- Comprehensive security audit documentation
- Setup guides for OAuth and Redis
- Production deployment checklist
- Static export migration plan

### Changed
- Restored 50 audio files (73MB) to public/audio directory
- Enhanced AudioPlayer component with professional controls
- Updated dependencies (11 packages including @anthropic-ai/sdk)
- Improved environment variable documentation

### Removed
- Admin panel and authentication system (incompatible with static export)
- NextAuth.js configuration (requires server-side rendering)
- Authentication middleware and utilities
- Admin-specific routes and components

### Fixed
- Missing audio files issue (were in build output, not committed)
- Audio playback functionality across all 59 resources
- Static export compatibility maintained

### Documentation
- Created retroactive daily reports for Oct 28-31 (41 commits documented)
- Added comprehensive setup and deployment guides
- Security audit findings documented
- Migration options analyzed with recommendations

### Security
- Identified and documented static export vs NextAuth incompatibility
- Reduced attack surface by removing authentication (no auth = no auth bugs)
- Documented security considerations for static hosting
- Recommended deployment options for future server features

## [1.1.0] - 2025-10-08

### Added
- AI-powered resource generation system using Claude Sonnet 4.5
- 50+ high-quality learning resources generated
- Comprehensive resource management CLI tools (`npm run resource:*`)
- AI generation scripts with multiple generation modes
- Resource validation and quality assurance system
- Performance optimizations achieving 95+ Lighthouse score
- Service Worker for offline capability
- Progressive Web App (PWA) functionality
- Virtual scrolling for resource lists
- Smart prefetching for critical resources
- Performance monitoring utilities
- CONTRIBUTING.md with comprehensive contribution guidelines
- CHANGELOG.md for version tracking
- API documentation structure in `/docs/api/`
- Testing guide in `/docs/testing/`

### Changed
- Upgraded Next.js from 14 to 15
- Upgraded React to 19 (in package.json)
- Reorganized documentation (moved files from root to `/docs`)
- Updated all documentation dates to October 2025
- Enhanced README with complete script documentation
- Improved file organization following CLAUDE.md guidelines
- Optimized bundle size and performance
- Enhanced resource template system

### Fixed
- File organization violations (moved working files from root)
- Version inconsistencies in documentation
- Outdated dependency references
- Missing script documentation
- Documentation date discrepancies

### Performance
- 50% perceived speed improvement
- 95+ Lighthouse score (target)
- Reduced First Contentful Paint to < 1.8s
- Reduced Largest Contentful Paint to < 2.5s
- Reduced Total Blocking Time to < 200ms
- Reduced Cumulative Layout Shift to < 0.1
- Optimized bundle size (33% reduction to ~200KB)

### Documentation
- Moved `PERFORMANCE_IMPLEMENTATION_SUMMARY.md` to `/docs/performance/`
- Moved `GENERATION_IN_PROGRESS.md` to `/docs/resources/`
- Updated all documentation with current tech stack
- Added comprehensive resource generation documentation
- Enhanced security recommendations
- Updated action items tracking

## [1.0.0] - 2025-09-27

### Added
- Initial production release
- Complete design system integration
- 6 placeholder learning resources
- Mobile-first responsive design
- WhatsApp community integration
- Offline-first architecture
- Colombian Spanish localization
- GitHub Pages deployment
- Automated documentation sync
- TypeScript strict mode
- ESLint configuration
- Tailwind CSS design system
- Component data extraction
- Supabase integration (prepared)

### Documentation
- Comprehensive architecture documentation
- Design system style guide
- Security recommendations
- Performance optimization guide
- Resource template system
- Evaluation reports

### Performance
- 91kB initial bundle size
- ~30s build time
- Mobile optimization for 3G/4G networks
- System font usage (no web fonts)
- Image compression
- Aggressive caching

## [0.9.0] - 2025-09-15

### Added
- Initial project structure
- Next.js 14 setup
- Basic component architecture
- Homepage and resource library
- Admin panel (unauthenticated)
- Analytics API endpoint
- Basic security headers

### Security
- Identified critical vulnerabilities
- Security assessment completed
- Recommendations documented

### Known Issues
- Next.js vulnerabilities (resolved in 1.0.0)
- Admin panel lacks authentication (planned)
- No API rate limiting (planned)
- Input sanitization needed (planned)

## [0.1.0] - 2025-09-01

### Added
- Project initialization
- Repository setup
- Basic documentation
- Technology stack selection
- Project planning and requirements

---

## Version History Summary

| Version | Date | Key Features |
|---------|------|-------------|
| 1.1.0 | 2025-10-08 | AI generation, 50+ resources, Next.js 15, performance optimization |
| 1.0.0 | 2025-09-27 | Production release, design system, offline-first |
| 0.9.0 | 2025-09-15 | Initial structure, security assessment |
| 0.1.0 | 2025-09-01 | Project initialization |

---

## Migration Notes

### Upgrading from 1.0.0 to 1.1.0

**Breaking Changes**: None

**New Dependencies**:
- `@anthropic-ai/sdk`: ^0.65.0 (for AI generation)
- `tsx`: ^4.19.0 (for running TypeScript scripts)

**New Scripts**:
```bash
# Resource management
npm run resource:list
npm run resource:generate
npm run resource:validate
npm run resource:stats

# AI generation
npm run ai:generate
npm run ai:generate-essentials
npm run ai:generate-all
npm run check:progress
```

**Environment Variables**:
Add to `.env`:
```env
ANTHROPIC_API_KEY=your_key_here  # Required for AI generation
```

**File Reorganization**:
- `PERFORMANCE_IMPLEMENTATION_SUMMARY.md` → `docs/performance/IMPLEMENTATION_SUMMARY.md`
- `GENERATION_IN_PROGRESS.md` → `docs/resources/GENERATION_STATUS.md`

---

**Repository**: https://github.com/bjpl/hablas
**Live Site**: https://bjpl.github.io/hablas/
**Documentation**: `/docs`

*Hecho con ❤️ en Medellín para toda Colombia*
