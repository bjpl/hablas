# Contributing to Hablas

Thank you for your interest in contributing to Hablas! This document provides guidelines for contributing to this project.

## 🎯 Project Mission

Hablas helps Colombian delivery and rideshare workers learn practical workplace English. All contributions should align with this mission and serve our target users.

## 📋 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Prioritize user needs over technical preferences
- Respect Colombian culture and language

## 🚀 Getting Started

### 1. Fork and Clone

```bash
git clone https://github.com/bjpl/hablas.git
cd hablas
npm install
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Development Environment

```bash
# Start development server
npm run dev

# Run type checking
npm run typecheck

# Run linter
npm run lint
```

## 📝 Contribution Guidelines

### Code Style

- **TypeScript**: Use strict mode, proper types for all functions
- **Components**: Use functional components with hooks
- **Naming**: Clear, descriptive names (camelCase for variables, PascalCase for components)
- **Comments**: Explain "why", not "what"
- **File Organization**: Never save working files to root directory (see CLAUDE.md)

### File Organization Rules

**CRITICAL**: Follow the mandatory file organization rules in `CLAUDE.md`:

- `/app` - Next.js pages and layouts
- `/components` - React components
- `/lib` - Utility functions and shared logic
- `/data` - Static data files
- `/scripts` - Build and utility scripts
- `/docs` - Project documentation
- `/public` - Static assets
- `/generated-resources` - AI-generated learning resources

**NEVER save working files, temporary markdown files, or tests to the root folder.**

### Component Guidelines

1. **Always use React.memo** for performance optimization
2. **Use useCallback** for all event handlers
3. **Use useMemo** for expensive computations
4. **Follow the design system** (see `/docs/design-system/`)
5. **Mobile-first** - design for 360px screens first

### Commit Messages

Follow conventional commits format:

```
<type>: <description>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build process or tooling changes
- `perf`: Performance improvements
- `style`: Code style changes (formatting)

**Examples**:
```
feat: add pronunciation guide for delivery phrases
fix: resolve navigation issue on iOS devices
docs: update resource generation guide
perf: optimize image loading with lazy loading
```

### Creating Resources

When adding learning resources:

1. Use the resource template system (`/data/resourceTemplates.ts`)
2. Generate content with AI: `npm run ai:generate`
3. Validate resources: `npm run resource:validate`
4. Follow content guidelines (`/docs/resources/content-creation-guide.md`)

**Resource Requirements**:
- Practical and immediately useful
- Natural English that natives actually use
- Accurate Colombian Spanish translations
- Appropriate difficulty level
- Mobile-friendly format

### Performance Requirements

All contributions must maintain or improve performance:

- Lighthouse score: 95+
- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Total Blocking Time: < 200ms
- Cumulative Layout Shift: < 0.1

Test with:
```bash
npm run build
npx serve -s out -p 3000
lighthouse http://localhost:3000/hablas --view
```

### Testing

While formal testing infrastructure is being developed:

1. **Manual testing required** for all changes
2. **Test on mobile** (Chrome DevTools mobile emulation minimum)
3. **Test offline functionality** if modifying Service Worker
4. **Verify on slow 3G** network (DevTools network throttling)
5. **Check accessibility** (keyboard navigation, screen readers)

## 🌐 Colombian Context

### Language Considerations

- Use Colombian Spanish (es-CO), not generic Spanish
- Include colloquialisms where appropriate: "parce", "llave", etc.
- Respect regional variations (Bogotá vs Medellín vs Cali)

### User Context

- Budget Android phones (consider device limitations)
- Prepaid data plans (minimize data usage)
- 3G/4G networks (optimize for slow connections)
- Motorcycle/bicycle drivers (thumb-friendly UI)
- Working hours: peak times for lunch and dinner delivery

### Cultural Sensitivity

- Respect working-class culture
- Avoid assumptions about education level
- Use clear, simple language
- Provide context for American customs/phrases

## 📊 Pull Request Process

### Before Submitting

1. **Update documentation** for any new features
2. **Run all checks**:
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```
3. **Test thoroughly** on mobile and desktop
4. **Update CHANGELOG.md** if adding features

### PR Description Template

```markdown
## Description
[Clear description of changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Testing
- [ ] Tested on desktop
- [ ] Tested on mobile (or mobile emulation)
- [ ] Tested offline functionality (if applicable)
- [ ] Verified performance (Lighthouse score)

## Screenshots
[If UI changes]

## Checklist
- [ ] Code follows project style guidelines
- [ ] TypeScript type checking passes
- [ ] ESLint passes with no warnings
- [ ] Documentation updated
- [ ] No files saved to root directory
- [ ] CHANGELOG.md updated (for features)
```

### Review Process

1. Maintainer reviews code and tests
2. Feedback provided (if needed)
3. Contributor addresses feedback
4. Approved and merged by maintainer

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
## Bug Description
[Clear, concise description]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll to '...'
4. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Screenshots
[If applicable]

## Environment
- Device: [e.g., Samsung Galaxy A12]
- OS: [e.g., Android 12]
- Browser: [e.g., Chrome 118]
- Network: [e.g., 3G, 4G, WiFi]

## Additional Context
[Any other relevant information]
```

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Description
[Clear description of proposed feature]

## User Story
As a [type of user], I want [goal] so that [benefit].

## Use Case
[Specific scenario where this would be useful]

## Target Users
- [ ] Delivery drivers (repartidores)
- [ ] Rideshare drivers (conductores)
- [ ] All users

## Priority
- [ ] Critical (blocks users)
- [ ] High (significant improvement)
- [ ] Medium (nice to have)
- [ ] Low (future consideration)

## Implementation Ideas
[Optional: suggestions for how to implement]
```

## 🔐 Security

**Never commit**:
- API keys or secrets
- `.env` files
- Personal information
- Credentials

Use `.env.example` for environment variable templates.

If you discover a security vulnerability, please email the project maintainer directly rather than opening a public issue.

## 📖 Resources

### Project Documentation
- [Project README](./README.md)
- [Claude Code Configuration](./CLAUDE.md)
- [Resource Creation Guide](./docs/resources/content-creation-guide.md)
- [AI Generation Guide](./docs/resources/ai-generation-guide.md)
- [Performance Optimization](./docs/performance/optimizations.md)
- [Design System](./docs/design-system/README.md)

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Hooks](https://react.dev/reference/react)

## 🤝 Questions?

- Review existing documentation in `/docs`
- Check closed issues for similar questions
- Open a GitHub Discussion for general questions
- Open an Issue for bug reports or feature requests

## 📜 License

By contributing to Hablas, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for helping make English learning more accessible for Colombian workers!**

*Hecho con ❤️ en Medellín para toda Colombia*
