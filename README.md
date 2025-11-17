# Hablas

A mobile-first English learning platform designed for Colombian delivery drivers and rideshare workers, featuring WhatsApp community integration and offline-first resources.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

Hablas provides practical English learning resources for working-class Colombians, specifically delivery drivers and rideshare workers using platforms like Rappi, Didi, Uber, and inDriver. The application focuses on workplace English skills to improve customer communication, increase tips and ratings, and create better opportunities.

**Version:** 1.2.0
**Status:** Very Active
**Last Updated:** 2025-01-08

## Features

### Core Functionality
- WhatsApp community integration with direct links to learning groups
- Offline-first resources with downloadable materials
- Job-specific content tailored for delivery and rideshare scenarios
- Mobile optimization for budget Android phones on 3G/4G networks
- Colombian Spanish interface using local dialect and conventions
- Data conservation with aggressive compression and caching
- 50+ AI-powered resources generated using Claude Sonnet 4.5

### Technical Capabilities
- Built with Next.js 15.0, React 18, and TypeScript 5.6
- AI integration via Anthropic Claude SDK 0.65.0 for resource generation
- Supabase 2.58.0 for data management
- Zod 4.1.12 for schema validation
- Lucide React 0.548 for icons
- Tailwind CSS with custom design system
- Progressive Web App with service workers for offline functionality
- Jest 30.2 with jest-axe for accessibility testing
- Automated documentation synchronization

## Installation

### Prerequisites
- Node.js 18 or higher
- npm or pnpm

### Setup

Clone the repository:

```bash
git clone https://github.com/bjpl/hablas.git
cd hablas
```

Install dependencies:

```bash
npm install
```

## Usage

### Development

Start development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

### Build Scripts

Core commands:
- `npm run dev` - Start development server
- `npm run build` - Build for production with automatic documentation sync
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript type checking

Resource management:
- `npm run resource:list` - List all resource templates
- `npm run resource:generate` - Generate resources from templates
- `npm run resource:validate` - Validate resource structure
- `npm run resource:stats` - Show resource statistics
- `npm run resource:search` - Search available resources
- `npm run resource:help` - Show resource CLI help

AI generation:
- `npm run ai:generate` - Interactive AI resource generation
- `npm run ai:generate-essentials` - Generate 20 core resources
- `npm run ai:generate-all` - Generate complete resource library
- `npm run ai:generate-topic` - Generate resources by topic
- `npm run ai:generate-category` - Generate by category (repartidor/conductor/all)
- `npm run ai:generate-level` - Generate by level (basico/intermedio/avanzado)
- `npm run check:progress` - Check AI generation progress

## Project Structure

```
hablas/
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   ├── lib/              # Core libraries
│   ├── types/            # TypeScript definitions
│   └── utils/            # Utility functions
├── public/               # Static assets
├── docs/                 # Documentation
└── tests/                # Test files
```

## Development

### Testing

Run tests:

```bash
npm run test
```

### Code Quality

Linting and type checking:

```bash
npm run lint
npm run typecheck
```

## Deployment

### Primary Domain

The application is deployed at https://hablas.co with custom domain configuration.

### Build Configuration

- Static export enabled with `output: 'export'` in next.config.js
- No base path required for custom domain
- Service worker configured for offline functionality
- Full Progressive Web App capabilities

### Deployment Process

Build the application:

```bash
npm run build
```

Deploy the `out` directory to hosting service. Domain is configured for hablas.co.

### GitHub Pages (Previous)

Previously deployed to `https://bjpl.github.io/hablas/`

## Contributing

Contributions are welcome. Focus areas include:
- Additional workplace-specific phrases
- Audio pronunciations with Colombian accent considerations
- Visual vocabulary for app interfaces

Please open an issue or submit a pull request.

## License

MIT License - Free for all Colombian workers to use and share.

---

Made with care in Medellín for all of Colombia
