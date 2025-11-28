# Spanish Resource Browser

A modern web application for browsing and learning Spanish language resources, featuring categorized content, bilingual support, and an intuitive mobile-first interface.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Overview

Spanish Resource Browser is a curated collection of Spanish language learning materials organized by category and difficulty level. The application provides an easy-to-navigate interface for discovering and studying Spanish phrases, vocabulary, and expressions with English translations.

**Version:** 1.2.0
**Status:** Active Development
**Last Updated:** 2025-01-27

**Live Demo:** [hablas.co](https://hablas.co)

## Features

### Core Functionality
- **Resource Browsing**: Navigate through 50+ Spanish learning resources organized by category
- **Bilingual Interface**: Toggle between English and Spanish UI
- **Category Filtering**: Filter resources by type (delivery driver, rideshare, general topics)
- **Difficulty Levels**: Resources organized by beginner, intermediate, and advanced levels
- **Phrase Cards**: Interactive cards displaying Spanish phrases with English translations
- **Audio Support**: Built-in audio playback for pronunciation practice
- **Mobile-First Design**: Responsive interface optimized for mobile devices
- **Clean UI**: Modern, intuitive interface using Tailwind CSS

### Technical Stack
- **Framework**: Next.js 15.0 with React 18 and TypeScript 5.6
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React 0.548
- **Schema Validation**: Zod 4.1.12
- **Testing**: Jest 30.2 with jest-axe for accessibility
- **Static Export**: Optimized static site generation for fast loading

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

Development commands:
- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build for production
- `npm run lint` - Run ESLint for code quality
- `npm run typecheck` - Run TypeScript type checking

Testing:
- `npm run test` - Run Jest test suite
- `npm run test:watch` - Run tests in watch mode

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

## Exploring the Code

The project demonstrates practical language learning application development with a focus on accessibility for low-resource environments:

```
hablas/
├── src/
│   ├── app/              # Next.js app router with SSG
│   ├── components/       # React components optimized for mobile
│   ├── lib/              # Resource generation and AI integration
│   ├── types/            # TypeScript definitions
│   └── utils/            # Data conservation utilities
├── public/               # Static assets with aggressive compression
├── docs/                 # Documentation
└── tests/                # Accessibility and unit tests
```

**Architecture Highlights:**
- Progressive Web App with service worker for offline functionality
- AI-powered resource generation using Claude Sonnet 4.5
- Mobile-first design optimized for budget Android devices
- Data conservation through aggressive compression and caching
- WhatsApp community integration for peer learning support

**Implementation Demonstrates:**
- Static site generation for optimal performance on slow networks
- Automated documentation synchronization with build process
- Resource templating system for scalable content generation
- Jest with jest-axe for comprehensive accessibility testing

**For Technical Review:**

Those interested in the implementation details can explore:
- `/src/lib/` for AI integration and resource generation
- `/src/components/` for mobile-optimized React components
- `/tests/` for accessibility testing patterns
- Resource CLI tools for content management workflow

---

Built with care in Medellín for all of Colombia
