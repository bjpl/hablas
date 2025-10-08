# Claude Code Configuration - Hablas Project

## Project Overview

**Hablas** is an English learning platform for Spanish-speaking gig economy workers in Colombia (delivery drivers and rideshare workers). It provides practical, job-specific English resources optimized for mobile devices and low-bandwidth scenarios.

**Tech Stack**: Next.js 15, TypeScript, Tailwind CSS, Anthropic Claude API
**Target Users**: Colombian delivery/rideshare workers (Rappi, Didi, Uber, inDriver)
**Deployment**: GitHub Pages (static export)

---

## ════════════════════════════════════════════════════════
## AGENT OPERATING INSTRUCTIONS
## ALL DIRECTIVES ARE MANDATORY - STRICT COMPLIANCE
## ════════════════════════════════════════════════════════

### [MANDATORY-1] COMMUNICATION & TRANSPARENCY
→ Explain every action in detail as you perform it
→ Include: what you're doing, why, expected outcomes, context, and rationale
→ Maximize thought exposure: make reasoning visible and understandable

### [MANDATORY-2] VERSION CONTROL & DOCUMENTATION
→ Commit frequently to local and remote repositories
→ Write clear, meaningful commit messages for all changes

### [MANDATORY-3] TARGET AUDIENCE & SCOPE
→ Primary user: Individual use (requestor)
→ Future scope: Multi-user, public open-source or paid offering
→ Current priority: Build meaningful, functional features first

### [MANDATORY-4] CLARIFICATION PROTOCOL
→ Stop and ask questions when:
  • Instructions unclear or ambiguous
  • Uncertain about requirements or approach
  • Insufficient information for intelligent decisions
  • Multiple valid paths exist

### [MANDATORY-5] SWARM ORCHESTRATION
→ Topology: Use Claude Flow's MCP for agent topology and communication
→ Execution: Use Task tool per CLAUDE.md guidelines
→ Separation: Distinguish orchestration layer (Flow/MCP) from execution layer (Task tool)

### [MANDATORY-6] ERROR HANDLING & RESILIENCE
→ Implement graceful error handling with clear error messages
→ Log errors with context for debugging
→ Validate inputs and outputs at boundaries
→ Provide fallback strategies when operations fail
→ Never fail silently; always surface issues appropriately

### [MANDATORY-7] TESTING & QUALITY ASSURANCE
→ Write tests for critical functionality before considering work complete
→ Verify changes work as expected before committing
→ Document test cases and edge cases considered
→ Run existing tests to ensure no regressions

### [MANDATORY-8] SECURITY & PRIVACY
→ Never commit secrets, API keys, or sensitive credentials
→ Use environment variables for configuration (see .env.example)
→ Sanitize user inputs to prevent injection attacks
→ Consider data privacy implications for future multi-user scenarios
→ Follow principle of least privilege

### [MANDATORY-9] ARCHITECTURE & DESIGN
→ Favor simple, readable solutions over clever complexity
→ Design for modularity and reusability from the start
→ Document architectural decisions and trade-offs
→ Consider future extensibility without over-engineering
→ Apply SOLID principles and appropriate design patterns

### [MANDATORY-10] INCREMENTAL DELIVERY
→ Break large tasks into small, deployable increments
→ Deliver working functionality frequently (daily if possible)
→ Each commit should leave the system in a working state
→ Prioritize MVP features over perfect implementations
→ Iterate based on feedback and learnings

### [MANDATORY-11] DOCUMENTATION STANDARDS
→ Update README.md as features are added
→ Document "why" decisions were made, not just "what"
→ Include setup instructions, dependencies, and usage examples
→ Maintain API documentation for all public interfaces
→ Document known limitations and future considerations

### [MANDATORY-12] DEPENDENCY MANAGEMENT
→ Minimize external dependencies; evaluate necessity
→ Pin dependency versions for reproducibility
→ Document why each major dependency was chosen
→ Regularly review and update dependencies for security

### [MANDATORY-13] PERFORMANCE AWARENESS
→ Profile before optimizing; avoid premature optimization
→ Consider scalability implications of design choices
→ Document performance characteristics and bottlenecks
→ Optimize for readability first, performance second (unless critical)
→ **CRITICAL FOR HABLAS**: Optimize for low-bandwidth, slow 3G/4G networks

### [MANDATORY-14] STATE MANAGEMENT
→ Make state transitions explicit and traceable
→ Validate state consistency at critical points
→ Consider idempotency for operations that might retry
→ Document state machine behavior where applicable

### [MANDATORY-15] CONTINUOUS LEARNING & IMPROVEMENT
→ Document what worked and what didn't after completing tasks
→ Identify patterns in errors and user requests
→ Suggest process improvements based on observed inefficiencies
→ Build reusable solutions from recurring problems
→ Maintain a decision log for complex choices

### [MANDATORY-16] OBSERVABILITY & MONITORING
→ Log key operations with appropriate detail levels
→ Track performance metrics for critical operations
→ Implement health checks for system components
→ Make system state inspectable at any time
→ Alert on anomalies or degraded performance

### [MANDATORY-17] RESOURCE OPTIMIZATION
→ Track API calls, token usage, and computational costs
→ Implement caching strategies where appropriate
→ Avoid redundant operations and API calls
→ Consider rate limits and quota constraints
→ Optimize for cost-effectiveness without sacrificing quality
→ **HABLAS-SPECIFIC**: Monitor Anthropic API usage for resource generation

### [MANDATORY-18] USER EXPERIENCE
→ Prioritize clarity and usability in all interfaces
→ Provide helpful feedback for all operations
→ Design for accessibility from the start
→ Minimize cognitive load required to use features
→ Make error messages actionable and user-friendly
→ **HABLAS-SPECIFIC**: Design for budget Android phones, thumb-friendly for motorcycle drivers

### [MANDATORY-19] DATA QUALITY & INTEGRITY
→ Validate data at system boundaries
→ Implement data consistency checks
→ Handle data migrations carefully with backups
→ Sanitize and normalize inputs
→ Maintain data provenance and audit trails
→ **HABLAS-SPECIFIC**: Ensure bilingual content accuracy (Spanish/English)

### [MANDATORY-20] CONTEXT PRESERVATION
→ Maintain relevant context across operations
→ Persist important state between sessions
→ Reference previous decisions and outcomes
→ Build on prior work rather than restarting
→ Document assumptions and constraints

### [MANDATORY-21] ETHICAL OPERATION
→ Consider bias and fairness implications
→ Respect user privacy and data sovereignty
→ Be transparent about capabilities and limitations
→ Decline tasks that could cause harm
→ Prioritize user agency and informed consent
→ **HABLAS-SPECIFIC**: Respect Colombian working-class culture and needs

### [MANDATORY-22] AGENT COLLABORATION
→ Share context effectively with other agents
→ Coordinate to avoid duplicated work
→ Escalate appropriately to humans when needed
→ Maintain clear handoff protocols
→ Document inter-agent dependencies

### [MANDATORY-23] RECOVERY PROCEDURES
→ Design operations to be reversible when possible
→ Maintain backups before destructive operations
→ Document rollback procedures for changes
→ Test recovery processes regularly
→ Keep system in recoverable state at all times

### [MANDATORY-24] TECHNICAL DEBT MANAGEMENT
→ Flag areas needing refactoring with justification
→ Balance shipping fast vs. accumulating debt
→ Schedule time for addressing technical debt
→ Document intentional shortcuts and their trade-offs
→ Prevent debt from compounding unchecked

---

## 🚨 CRITICAL: FILE ORGANIZATION & CONCURRENT EXECUTION

### File Organization Rules
**NEVER save working files, tests, or temporary markdown files to the root folder.**

Use these directories:
- `/app` - Next.js pages and layouts
- `/components` - React components
- `/lib` - Utility functions and shared logic
- `/data` - Static data files (resource templates, topics)
- `/scripts` - Build and utility scripts
- `/docs` - Project documentation
- `/public` - Static assets (images, PDFs, audio)
- `/generated-resources` - AI-generated learning resources
- `/supabase` - Database migrations and config
- `/.claude` - Claude Code configuration
- `/.claude-flow` - Claude Flow session data

### Concurrent Execution Pattern

**GOLDEN RULE**: "1 MESSAGE = ALL RELATED OPERATIONS"

Always batch operations in single messages:
```javascript
// ✅ CORRECT: All operations in one message
[Single Message]:
  TodoWrite { todos: [...5-10 todos...] }
  Read "file1.ts"
  Read "file2.ts"
  Read "file3.ts"
  Bash "npm install"
  Write "new-feature.ts"
  Edit "existing.ts"
```

```javascript
// ❌ WRONG: Multiple messages
Message 1: TodoWrite { todos: [single todo] }
Message 2: Read "file1.ts"
Message 3: Write "file.ts"
```

---

## 🎯 Hablas-Specific Development Guidelines

### Mobile-First Philosophy
- Design for 360px-wide screens (budget Android phones)
- Use thumb-friendly buttons (48px minimum touch targets)
- Optimize for one-handed use while driving motorcycle/bicycle
- Test on slow 3G/4G connections

### Colombian Context
- Use Colombian Spanish (vos, parce, llave, etc.)
- Understand gig economy worker schedules (peak hours: lunch/dinner)
- Respect data conservation needs (prepaid plans)
- Consider offline-first functionality

### Content Quality Standards
- All English phrases must be practical and job-relevant
- Bilingual content must be accurate and natural
- Audio pronunciation must consider Colombian accent
- PDFs must be readable on small screens

### Resource Generation
- Use AI generation scripts in `/scripts` folder
- Follow resource template structure in `/data/resourceTemplates.ts`
- Validate generated resources before committing
- Track API costs and generation quality

---

## 🛠️ Available Scripts

### Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run typecheck        # TypeScript type checking
```

### Resource Management
```bash
npm run resource:list           # List all resources
npm run resource:generate       # Generate resources manually
npm run resource:validate       # Validate resource structure
npm run resource:stats          # Show resource statistics
npm run resource:search         # Search resources
npm run resource:export         # Export resources
npm run resource:help           # Show help
```

### AI Resource Generation
```bash
npm run ai:generate              # Interactive generation
npm run ai:generate-all          # Generate all resources
npm run ai:generate-essentials   # Generate essential resources only
npm run ai:generate-topic        # Generate by topic
npm run ai:generate-template     # Generate by template
npm run ai:generate-category     # Generate by category
npm run ai:generate-level        # Generate by level
npm run check:progress           # Check generation progress
```

---

## 🔧 Environment Configuration

Required environment variables (see `.env.example`):
- `ANTHROPIC_API_KEY` - Anthropic API key for resource generation
- Additional Supabase vars (if using backend features)

**NEVER commit `.env` file to version control.**

---

## 📊 Key Project Files

### Data & Configuration
- `/data/topics.ts` - Learning topic definitions
- `/data/resourceTemplates.ts` - Resource generation templates
- `/lib/resources.ts` - Resource management logic
- `/lib/ai/resourceGenerator.ts` - AI generation system

### Scripts
- `/scripts/ai-generate-resources.ts` - Main AI generation script
- `/scripts/generate-resource.ts` - Resource CLI tool
- `/scripts/check-progress.ts` - Generation progress tracker

### Components
- `/components/ResourceCard.tsx` - Resource display component
- `/app/page.tsx` - Homepage
- `/app/recursos/page.tsx` - Resources page

---

## 🚀 Deployment

### GitHub Pages Configuration
- Static export enabled (`output: 'export'` in `next.config.js`)
- Base path: `/hablas`
- Automated deployment via GitHub Actions
- Live URL: `https://bjpl.github.io/hablas/`

### Build Process
1. Push to `main` branch
2. GitHub Actions triggers build
3. Next.js generates static files
4. Deployed to GitHub Pages

---

## 🧪 Testing Strategy

### Current Coverage
- Manual testing for UI components
- Resource validation scripts
- API generation testing

### Future Improvements
- Unit tests for utility functions
- Integration tests for resource generation
- E2E tests for user workflows
- Performance testing on slow networks

---

## 📈 Performance Optimization

### Current Optimizations
- System fonts (no web fonts)
- Image compression for slow networks
- Aggressive caching with Service Workers
- Code splitting and lazy loading
- Static generation for fast TTFB

### Monitoring
- Track bundle size
- Monitor API costs
- Measure generation quality
- Track user engagement (future)

---

## 🤝 Contributing Guidelines

### Code Style
- Use TypeScript with strict mode
- Follow ESLint configuration
- Use Tailwind CSS for styling
- Prefer functional components
- Use meaningful variable names

### Commit Messages
Format: `<type>: <description>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build process or tooling changes

Example: `feat: add pronunciation guide for rideshare phrases`

---

## 📚 Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Project Documentation
- `/docs/performance/` - Performance optimization docs
- `/README.md` - Project overview
- `/.claude/commands/` - Custom slash commands

---

## ════════════════════════════════════════════════════════
## END AGENT OPERATING INSTRUCTIONS
## COMPLIANCE REQUIRED FOR ALL DEVELOPMENT WORK
## ════════════════════════════════════════════════════════

---

*Last Updated: October 7, 2025*
*Hecho con ❤️ en Medellín para toda Colombia*
