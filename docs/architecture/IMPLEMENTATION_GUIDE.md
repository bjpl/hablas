# Implementation Guide - Hablas Architecture Refactoring

**Quick Reference for Development Teams**

---

## Phase 1: Code Quality (Weeks 1-2)

### Task Checklist

#### Week 1: Logging & Linting

- [ ] **Replace console.log (Priority: P0)**
  - [ ] Create ESLint rule to ban console.log
  - [ ] Run bulk replacement script
  - [ ] Manual review of complex cases
  - [ ] Verify all instances replaced (target: 2,101 → 0)

**Script to use:**
```bash
# Find all console.log instances
npm run lint:find-console

# Bulk replace common patterns
npm run lint:replace-console

# Manual review remaining instances
npm run lint:manual-review
```

**Example Replacements:**
```typescript
// Before
console.log('User logged in', userId);
console.error('Database error', error);

// After
import { apiLogger } from '@/lib/utils/logger';

apiLogger.info('User logged in', { userId });
apiLogger.error('Database error', error);
```

- [ ] **Enable ESLint in builds**
  - [ ] Fix all ESLint warnings
  - [ ] Update eslint.config.mjs
  - [ ] Update next.config.js
  - [ ] Verify build passes

**Files to modify:**
```javascript
// eslint.config.mjs
rules: {
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-unused-vars": "error",
  "no-console": ["error", { allow: ["error"] }],
}

// next.config.js
// Remove: eslint: { ignoreDuringBuilds: true }
```

#### Week 2: TypeScript & Testing

- [ ] **Fix TypeScript 'any' types (Priority: P0)**
  - [ ] Audit 29 instances in lib/
  - [ ] Create proper interfaces
  - [ ] Use generics where appropriate
  - [ ] Use 'unknown' for truly dynamic types

**Example Fixes:**
```typescript
// Before
function processData(data: any): any {
  return data.map((item: any) => item.value);
}

// After
interface DataItem {
  value: string;
}

function processData(data: DataItem[]): string[] {
  return data.map((item) => item.value);
}
```

- [ ] **Consolidate test configuration**
  - [ ] Remove jest.config.js (root)
  - [ ] Create jest.config.base.js
  - [ ] Update client/server configs to extend base
  - [ ] Run all tests to verify

**Test Configuration Structure:**
```javascript
// jest.config.base.js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jose|@supabase)/)',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
  ],
};

// jest.config.client.js
const base = require('./jest.config.base');

module.exports = {
  ...base,
  displayName: 'client',
  testEnvironment: 'jsdom',
  // Client-specific overrides
};
```

---

## Phase 2: Data Migration (Weeks 3-4)

### Database Schema Creation

#### Week 3: Schema Design & Migration Scripts

- [ ] **Create database schema**
  - [ ] Create migration file: `database/migrations/001_create_content_tables.sql`
  - [ ] Add indexes for performance
  - [ ] Create rollback migration

**Migration File:**
```sql
-- database/migrations/001_create_content_tables.sql

-- Content edits table
CREATE TABLE content_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id VARCHAR(255) NOT NULL,
  original_content JSONB,
  edited_content JSONB NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  edited_by UUID REFERENCES users(id),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_content_edits_resource_id ON content_edits(resource_id);
CREATE INDEX idx_content_edits_status ON content_edits(status);
CREATE INDEX idx_content_edits_edited_by ON content_edits(edited_by);

-- Edit history table
CREATE TABLE edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_edit_id UUID REFERENCES content_edits(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  edited_by UUID REFERENCES users(id),
  change_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_edit_history_content_edit_id ON edit_history(content_edit_id);

-- Learning resources table
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  level VARCHAR(50),
  content JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_level ON resources(level);
CREATE INDEX idx_resources_external_id ON resources(external_id);
```

- [ ] **Create data migration script**
  - [ ] Script to read JSON files
  - [ ] Transform to database format
  - [ ] Batch insert for performance
  - [ ] Verify data integrity

**Migration Script:**
```typescript
// scripts/migrate-json-to-db.ts

import { db } from '@/lib/db/pool';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '@/lib/utils/logger';

async function migrateContentEdits() {
  const editsPath = path.join(process.cwd(), 'data', 'content-edits.json');
  const editsData = await fs.readFile(editsPath, 'utf-8');
  const data = JSON.parse(editsData);

  logger.info(`Migrating ${data.edits.length} content edits...`);

  await db.transaction(async (client) => {
    for (const edit of data.edits) {
      await client.query(`
        INSERT INTO content_edits (
          id, resource_id, original_content, edited_content,
          status, edited_by, comments, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        edit.id,
        edit.resourceId,
        edit.originalContent,
        edit.editedContent,
        edit.status,
        edit.editedBy,
        edit.comments,
        edit.createdAt,
        edit.updatedAt,
      ]);
    }
  });

  logger.info('Content edits migration complete');
}

async function migrateResources() {
  const resourcesDir = path.join(process.cwd(), 'data', 'resources');
  const categories = await fs.readdir(resourcesDir);

  for (const category of categories) {
    const categoryPath = path.join(resourcesDir, category);
    const stat = await fs.stat(categoryPath);

    if (stat.isDirectory()) {
      const files = await fs.readdir(categoryPath);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(categoryPath, file);
          const resourceData = await fs.readFile(filePath, 'utf-8');
          const resource = JSON.parse(resourceData);

          await db.query(`
            INSERT INTO resources (
              external_id, category, level, content, metadata
            ) VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (external_id) DO NOTHING
          `, [
            file.replace('.json', ''),
            category,
            resource.level || null,
            JSON.stringify(resource),
            JSON.stringify({ source: 'migration', migrated_at: new Date() }),
          ]);
        }
      }

      logger.info(`Migrated resources from category: ${category}`);
    }
  }

  logger.info('Resources migration complete');
}

async function main() {
  try {
    await migrateContentEdits();
    await migrateResources();

    logger.info('✅ All migrations complete');
  } catch (error) {
    logger.error('Migration failed', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

main();
```

**Run migration:**
```bash
npm run db:migrate:up
npm run migrate:json-to-db
npm run db:verify:migration
```

#### Week 4: Update API Routes

- [ ] **Create repository layer**
  - [ ] ContentRepository
  - [ ] TopicRepository
  - [ ] ResourceRepository

**Example Repository:**
```typescript
// lib/repositories/ContentRepository.ts

import { db } from '@/lib/db/pool';
import { cache } from '@/lib/cache/redis-cache';
import type { ContentEdit, EditHistory } from '@/lib/domain/content/types';

export class ContentRepository {
  async createEdit(edit: Omit<ContentEdit, 'id' | 'created_at' | 'updated_at'>): Promise<ContentEdit> {
    const result = await db.query<ContentEdit>(`
      INSERT INTO content_edits (
        resource_id, original_content, edited_content,
        status, edited_by, comments
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      edit.resource_id,
      edit.original_content,
      edit.edited_content,
      edit.status,
      edit.edited_by,
      edit.comments,
    ]);

    return result.rows[0];
  }

  async findByResourceId(resourceId: string): Promise<ContentEdit | null> {
    const cacheKey = `content_edit:${resourceId}`;

    return cache.getOrSet(cacheKey, async () => {
      const result = await db.query<ContentEdit>(`
        SELECT * FROM content_edits
        WHERE resource_id = $1
        ORDER BY updated_at DESC
        LIMIT 1
      `, [resourceId]);

      return result.rows[0] || null;
    }, { ttl: 300 }); // 5 minutes
  }

  async addHistory(history: Omit<EditHistory, 'id' | 'created_at'>): Promise<EditHistory> {
    const result = await db.query<EditHistory>(`
      INSERT INTO edit_history (
        content_edit_id, content, edited_by, change_description
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      history.content_edit_id,
      history.content,
      history.edited_by,
      history.change_description,
    ]);

    return result.rows[0];
  }
}
```

- [ ] **Update API routes**
  - [ ] Replace file system operations
  - [ ] Use repositories
  - [ ] Add proper error handling

**Example Updated Route:**
```typescript
// app/api/content/save/route.ts (AFTER)

import { NextResponse } from 'next/server';
import { ContentRepository } from '@/lib/repositories/ContentRepository';
import { apiLogger } from '@/lib/utils/logger';
import type { SaveContentRequest } from '@/lib/types/content-edits';

const contentRepo = new ContentRepository();

export async function POST(request: Request) {
  try {
    const body: SaveContentRequest = await request.json();
    const { resourceId, editedContent, status = 'pending', editedBy, comments } = body;

    // Validate input
    if (!resourceId || !editedContent) {
      return NextResponse.json(
        { error: 'Missing required fields: resourceId and editedContent' },
        { status: 400 }
      );
    }

    // Check for existing edit
    const existingEdit = await contentRepo.findByResourceId(resourceId);

    let editId: string;

    if (existingEdit) {
      // Update existing
      const updated = await contentRepo.update(existingEdit.id, {
        edited_content: editedContent,
        status,
        updated_at: new Date(),
      });
      editId = updated.id;

      // Add history
      await contentRepo.addHistory({
        content_edit_id: editId,
        content: editedContent,
        edited_by: editedBy,
        change_description: 'Content updated',
      });
    } else {
      // Create new
      const created = await contentRepo.createEdit({
        resource_id: resourceId,
        edited_content: editedContent,
        status,
        edited_by: editedBy,
        comments,
      });
      editId = created.id;

      // Add initial history
      await contentRepo.addHistory({
        content_edit_id: editId,
        content: editedContent,
        edited_by: editedBy,
        change_description: 'Initial edit created',
      });
    }

    // Invalidate cache
    await contentRepo.invalidateCache(resourceId);

    apiLogger.info('Content saved', { editId, resourceId });

    return NextResponse.json({
      success: true,
      editId,
      message: 'Content saved successfully',
    });
  } catch (error) {
    apiLogger.error('Error saving content', error);
    return NextResponse.json(
      { error: 'Failed to save content' },
      { status: 500 }
    );
  }
}
```

---

## Phase 3: Architecture Refactoring (Weeks 5-8)

### Service Layer Implementation

#### Week 5-6: Create Service Layer

- [ ] **Create base service structure**

**Directory Structure:**
```
lib/services/
├── content/
│   ├── ContentService.ts
│   ├── TopicService.ts
│   └── types.ts
├── auth/
│   ├── AuthService.ts
│   ├── SessionService.ts
│   └── types.ts
└── shared/
    ├── BaseService.ts
    └── ServiceError.ts
```

**Base Service:**
```typescript
// lib/services/shared/BaseService.ts

import { Logger } from '@/lib/shared/logging/Logger';

export abstract class BaseService {
  protected logger: Logger;

  constructor(name: string) {
    this.logger = new Logger(name);
  }

  protected handleError(error: unknown, context?: Record<string, unknown>): never {
    if (error instanceof Error) {
      this.logger.error(error.message, error, context);
      throw error;
    }

    const errorMessage = String(error);
    this.logger.error('Unknown error', new Error(errorMessage), context);
    throw new Error(errorMessage);
  }
}
```

**Content Service:**
```typescript
// lib/services/content/ContentService.ts

import { BaseService } from '@/lib/services/shared/BaseService';
import { ContentRepository } from '@/lib/repositories/ContentRepository';
import { cache } from '@/lib/cache/redis-cache';
import type { SaveContentRequest, ContentEdit } from './types';

export class ContentService extends BaseService {
  private contentRepo: ContentRepository;

  constructor() {
    super('ContentService');
    this.contentRepo = new ContentRepository();
  }

  async saveContent(request: SaveContentRequest): Promise<{ editId: string }> {
    try {
      this.logger.info('Saving content', { resourceId: request.resourceId });

      // Validate business rules
      this.validateSaveRequest(request);

      // Check for existing edit
      const existingEdit = await this.contentRepo.findByResourceId(request.resourceId);

      let editId: string;

      if (existingEdit) {
        editId = await this.updateExistingEdit(existingEdit, request);
      } else {
        editId = await this.createNewEdit(request);
      }

      // Invalidate cache
      await cache.deleteNamespace('resources');
      await cache.delete(`content_edit:${request.resourceId}`);

      this.logger.info('Content saved successfully', { editId });

      return { editId };
    } catch (error) {
      return this.handleError(error, { request });
    }
  }

  private validateSaveRequest(request: SaveContentRequest): void {
    if (!request.resourceId || !request.editedContent) {
      throw new Error('Missing required fields: resourceId and editedContent');
    }

    if (request.status && !['pending', 'approved', 'rejected'].includes(request.status)) {
      throw new Error('Invalid status value');
    }
  }

  private async updateExistingEdit(
    existingEdit: ContentEdit,
    request: SaveContentRequest
  ): Promise<string> {
    const updated = await this.contentRepo.update(existingEdit.id, {
      edited_content: request.editedContent,
      status: request.status || existingEdit.status,
      updated_at: new Date(),
    });

    await this.contentRepo.addHistory({
      content_edit_id: updated.id,
      content: request.editedContent,
      edited_by: request.editedBy,
      change_description: 'Content updated',
    });

    return updated.id;
  }

  private async createNewEdit(request: SaveContentRequest): Promise<string> {
    const created = await this.contentRepo.createEdit({
      resource_id: request.resourceId,
      edited_content: request.editedContent,
      status: request.status || 'pending',
      edited_by: request.editedBy,
      comments: request.comments,
    });

    await this.contentRepo.addHistory({
      content_edit_id: created.id,
      content: request.editedContent,
      edited_by: request.editedBy,
      change_description: 'Initial edit created',
    });

    return created.id;
  }

  async getContentHistory(resourceId: string): Promise<EditHistory[]> {
    try {
      this.logger.debug('Fetching content history', { resourceId });

      const edit = await this.contentRepo.findByResourceId(resourceId);
      if (!edit) {
        return [];
      }

      return this.contentRepo.getHistory(edit.id);
    } catch (error) {
      return this.handleError(error, { resourceId });
    }
  }
}
```

#### Week 7-8: Redis Session Storage & Caching

- [ ] **Move sessions to Redis**

**Session Service:**
```typescript
// lib/services/auth/SessionService.ts

import { BaseService } from '@/lib/services/shared/BaseService';
import { cache } from '@/lib/cache/redis-cache';
import { generateRandomString } from '@/lib/utils/crypto';
import type { Session } from './types';

export class SessionService extends BaseService {
  constructor() {
    super('SessionService');
  }

  async createSession(
    userId: string,
    email: string,
    role: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<Session> {
    const sessionId = generateRandomString(32);
    const refreshToken = generateRandomString(64);

    const session: Session = {
      id: sessionId,
      user_id: userId,
      refresh_token: refreshToken,
      user_agent: userAgent,
      ip_address: ipAddress,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      created_at: new Date(),
    };

    // Store in Redis with TTL
    const ttl = 30 * 24 * 60 * 60; // 30 days in seconds
    await cache.set(`session:${sessionId}`, session, { ttl });

    // Also store user -> sessions mapping
    const userSessions = await this.getUserSessions(userId);
    userSessions.push(sessionId);
    await cache.set(`user_sessions:${userId}`, userSessions, { ttl });

    this.logger.info('Session created', { userId, sessionId });

    return session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const session = await cache.get<Session>(`session:${sessionId}`);

    if (!session) {
      this.logger.debug('Session not found', { sessionId });
      return null;
    }

    // Check expiration
    if (new Date(session.expires_at) < new Date()) {
      await this.deleteSession(sessionId);
      return null;
    }

    return session;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      await cache.delete(`session:${sessionId}`);

      // Remove from user sessions
      const userSessions = await this.getUserSessions(session.user_id);
      const updated = userSessions.filter(id => id !== sessionId);
      await cache.set(`user_sessions:${session.user_id}`, updated);

      this.logger.info('Session deleted', { sessionId });
    }
  }

  private async getUserSessions(userId: string): Promise<string[]> {
    const sessions = await cache.get<string[]>(`user_sessions:${userId}`);
    return sessions || [];
  }
}
```

- [ ] **Implement cache warming**

**Cache Warming Script:**
```typescript
// scripts/warm-cache.ts

import { db } from '@/lib/db/pool';
import { cache } from '@/lib/cache/redis-cache';
import { logger } from '@/lib/utils/logger';

async function warmResourceCache() {
  logger.info('Warming resource cache...');

  const result = await db.query('SELECT * FROM resources');
  const resources = result.rows;

  for (const resource of resources) {
    await cache.set(
      `resource:${resource.external_id}`,
      resource,
      { ttl: 3600 } // 1 hour
    );
  }

  logger.info(`Cached ${resources.length} resources`);
}

async function warmTopicCache() {
  logger.info('Warming topic cache...');

  const result = await db.query('SELECT * FROM topics');
  const topics = result.rows;

  for (const topic of topics) {
    await cache.set(
      `topic:${topic.slug}`,
      topic,
      { ttl: 3600 } // 1 hour
    );
  }

  logger.info(`Cached ${topics.length} topics`);
}

async function main() {
  try {
    await warmResourceCache();
    await warmTopicCache();

    logger.info('✅ Cache warming complete');
  } catch (error) {
    logger.error('Cache warming failed', error);
    process.exit(1);
  }
}

main();
```

---

## Phase 4: Testing & Quality (Weeks 9-10)

### Test Coverage Improvement

#### Week 9: Unit Tests

- [ ] **Service layer tests**

**Example Test:**
```typescript
// lib/services/content/__tests__/ContentService.test.ts

import { ContentService } from '../ContentService';
import { ContentRepository } from '@/lib/repositories/ContentRepository';
import { cache } from '@/lib/cache/redis-cache';

jest.mock('@/lib/repositories/ContentRepository');
jest.mock('@/lib/cache/redis-cache');

describe('ContentService', () => {
  let service: ContentService;
  let mockRepo: jest.Mocked<ContentRepository>;

  beforeEach(() => {
    mockRepo = new ContentRepository() as jest.Mocked<ContentRepository>;
    service = new ContentService();
    (service as any).contentRepo = mockRepo;
  });

  describe('saveContent', () => {
    it('should create new edit when none exists', async () => {
      const request = {
        resourceId: 'test-resource',
        editedContent: { title: 'Test' },
        status: 'pending',
        editedBy: 'user-123',
      };

      mockRepo.findByResourceId.mockResolvedValue(null);
      mockRepo.createEdit.mockResolvedValue({
        id: 'edit-123',
        ...request,
        created_at: new Date(),
        updated_at: new Date(),
      });
      mockRepo.addHistory.mockResolvedValue({} as any);

      const result = await service.saveContent(request);

      expect(result.editId).toBe('edit-123');
      expect(mockRepo.createEdit).toHaveBeenCalledWith(
        expect.objectContaining({
          resource_id: request.resourceId,
          edited_content: request.editedContent,
        })
      );
    });

    it('should update existing edit', async () => {
      const request = {
        resourceId: 'test-resource',
        editedContent: { title: 'Updated' },
        status: 'approved',
        editedBy: 'user-123',
      };

      const existingEdit = {
        id: 'edit-123',
        resource_id: 'test-resource',
        edited_content: { title: 'Old' },
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRepo.findByResourceId.mockResolvedValue(existingEdit);
      mockRepo.update.mockResolvedValue({
        ...existingEdit,
        edited_content: request.editedContent,
        status: request.status,
      });
      mockRepo.addHistory.mockResolvedValue({} as any);

      const result = await service.saveContent(request);

      expect(result.editId).toBe('edit-123');
      expect(mockRepo.update).toHaveBeenCalled();
    });

    it('should throw error for invalid request', async () => {
      const request = {
        resourceId: '',
        editedContent: null,
      };

      await expect(service.saveContent(request as any)).rejects.toThrow(
        'Missing required fields'
      );
    });
  });
});
```

**Coverage Target:**
- Services: 80%
- Repositories: 70%
- Utilities: 90%

#### Week 10: Integration & E2E Tests

- [ ] **Integration tests**

**Example Integration Test:**
```typescript
// tests/integration/content-save.test.ts

import { db } from '@/lib/db/pool';
import { ContentService } from '@/lib/services/content/ContentService';

describe('Content Save Integration', () => {
  let service: ContentService;

  beforeAll(async () => {
    await db.initialize();
    service = new ContentService();
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(async () => {
    // Clean database
    await db.query('TRUNCATE content_edits CASCADE');
  });

  it('should save content and create history', async () => {
    const request = {
      resourceId: 'test-resource',
      editedContent: { title: 'Test Content' },
      status: 'pending',
      editedBy: 'user-123',
    };

    // Save content
    const result = await service.saveContent(request);
    expect(result.editId).toBeDefined();

    // Verify in database
    const editResult = await db.query(
      'SELECT * FROM content_edits WHERE id = $1',
      [result.editId]
    );
    expect(editResult.rows[0].resource_id).toBe(request.resourceId);

    // Verify history
    const historyResult = await db.query(
      'SELECT * FROM edit_history WHERE content_edit_id = $1',
      [result.editId]
    );
    expect(historyResult.rows.length).toBe(1);
  });
});
```

---

## Quick Commands Reference

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Testing
```bash
# Run all tests
npm test

# Run client tests only
npm run test:client

# Run server tests only
npm run test:server

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Database
```bash
# Initialize database
npm run db:init

# Run migrations
npm run db:migrate

# Health check
npm run db:health

# Migrate JSON to DB
npm run migrate:json-to-db
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run typecheck

# Find console.log
npm run lint:find-console
```

### Cache
```bash
# Clear all cache
npm run cache:clear

# Warm cache
npm run cache:warm

# Cache stats
npm run cache:stats
```

---

## Common Issues & Solutions

### Issue 1: JWT_SECRET not set
**Error:** `JWT_SECRET must be set in production`

**Solution:**
```bash
# Generate secure secret
openssl rand -base64 32

# Add to .env.local
JWT_SECRET=your-generated-secret-here
```

### Issue 2: Database connection failed
**Error:** `Failed to initialize database pool`

**Solution:**
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
npm run db:health

# Check SSL settings for production
```

### Issue 3: Redis connection issues
**Error:** `Redis cache initialization failed`

**Solution:**
```bash
# Verify Redis URL
npm run verify:redis

# Check Redis connection
redis-cli ping

# Test connection
npm run cache:stats
```

### Issue 4: Test failures after migration
**Error:** `Cannot find module` or `Unexpected token`

**Solution:**
```bash
# Clear test cache
npm run test -- --clearCache

# Reinstall dependencies
rm -rf node_modules
npm install

# Verify test configs
npm run test:config:validate
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] ESLint passing with no warnings
- [ ] TypeScript compilation successful
- [ ] Database migrations run in staging
- [ ] Cache warmed
- [ ] Environment variables set
- [ ] Secrets rotated (if needed)

### Deployment
- [ ] Run database migrations
- [ ] Warm cache
- [ ] Deploy application
- [ ] Verify health check
- [ ] Check logs for errors
- [ ] Monitor performance metrics

### Post-Deployment
- [ ] Verify authentication flows
- [ ] Test critical user paths
- [ ] Check database connection pool
- [ ] Monitor cache hit rates
- [ ] Review error logs
- [ ] Update documentation

---

**Need Help?**
- Architecture questions: See `SYSTEM_ARCHITECTURE_ANALYSIS.md`
- Component details: See `COMPONENT_DIAGRAM.md`
- Security questions: See `lib/config/security.ts`
- Database schema: See `database/migrations/`

---

*Last Updated: December 4, 2025*
