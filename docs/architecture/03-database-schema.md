# Database Schema Design

## Overview

This document defines the comprehensive database schema for the Hablas content management system, designed for PostgreSQL with scalability, security, and data integrity in mind.

## Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
│─────────────────│
│ id (PK)         │───┐
│ email (UNIQUE)  │   │
│ password_hash   │   │
│ role            │   │
│ name            │   │
│ created_at      │   │
│ updated_at      │   │
│ last_login      │   │
│ is_active       │   │
└─────────────────┘   │
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
┌─────────────────┐  │   ┌─────────────────┐
│ refresh_tokens  │  │   │ auth_audit_log  │
│─────────────────│  │   │─────────────────│
│ id (PK)         │  │   │ id (PK)         │
│ user_id (FK)    │──┘   │ user_id (FK)    │
│ token_hash      │      │ event_type      │
│ expires_at      │      │ ip_address      │
│ created_at      │      │ user_agent      │
│ revoked_at      │      │ success         │
│ ip_address      │      │ error_message   │
│ user_agent      │      │ created_at      │
└─────────────────┘      └─────────────────┘


┌─────────────────┐      ┌─────────────────┐
│     topics      │      │    content      │
│─────────────────│      │─────────────────│
│ id (PK)         │◄─────┤ id (PK)         │
│ name            │      │ topic_id (FK)   │
│ slug (UNIQUE)   │      │ author_id (FK)  │──┐
│ description     │      │ title           │  │
│ parent_id (FK)  │──┐   │ content         │  │
│ order           │  │   │ type            │  │
│ created_at      │  │   │ status          │  │
│ updated_at      │  │   │ created_at      │  │
│ is_active       │  │   │ updated_at      │  │
└─────────────────┘  │   │ published_at    │  │
         │           │   └─────────────────┘  │
         │           │            │            │
         └───────────┘            │            │
         (self-ref)               │            │
                                  │            │
                      ┌───────────┼────────────┘
                      │           │
                      ▼           ▼
           ┌─────────────────┐  ┌─────────────────┐
           │ content_reviews │  │ content_media   │
           │─────────────────│  │─────────────────│
           │ id (PK)         │  │ id (PK)         │
           │ content_id (FK) │  │ content_id (FK) │
           │ reviewer_id (FK)│  │ media_id (FK)   │
           │ action          │  │ order           │
           │ comments        │  │ created_at      │
           │ created_at      │  └─────────────────┘
           └─────────────────┘           │
                                         │
                      ┌──────────────────┘
                      │
                      ▼
           ┌─────────────────┐
           │      media      │
           │─────────────────│
           │ id (PK)         │
           │ filename        │
           │ original_name   │
           │ mime_type       │
           │ size            │
           │ url             │
           │ alt_text        │
           │ uploaded_by (FK)│───┐
           │ created_at      │   │
           │ updated_at      │   │
           └─────────────────┘   │
                      │           │
                      └───────────┘
                      (to users)
```

## Table Definitions

### 1. Users Table

Stores user accounts with authentication credentials and roles.

```sql
CREATE TABLE users (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Authentication
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,

  -- Profile
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'viewer',

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,

  -- Constraints
  CONSTRAINT chk_role CHECK (role IN ('admin', 'editor', 'viewer')),
  CONSTRAINT chk_email_format CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
  ),
  CONSTRAINT chk_password_hash CHECK (length(password_hash) >= 60)
);

-- Indexes
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX idx_users_created ON users(created_at DESC);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE users IS 'User accounts with authentication and authorization';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hash with cost factor 12';
COMMENT ON COLUMN users.role IS 'RBAC role: admin, editor, or viewer';
```

### 2. Refresh Tokens Table

Manages refresh tokens for token revocation and session tracking.

```sql
CREATE TABLE refresh_tokens (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  user_id UUID NOT NULL,

  -- Token Data
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,

  -- Session Info
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- Status
  revoked_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT fk_refresh_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_token_hash CHECK (length(token_hash) > 0),
  CONSTRAINT chk_expires_future CHECK (expires_at > created_at)
);

-- Indexes
CREATE INDEX idx_refresh_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_expires ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_active ON refresh_tokens(user_id, revoked_at)
  WHERE revoked_at IS NULL;

-- Auto-cleanup expired tokens (optional, can use pg_cron)
CREATE INDEX idx_refresh_cleanup ON refresh_tokens(expires_at)
  WHERE revoked_at IS NULL AND expires_at < CURRENT_TIMESTAMP;

COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for session management';
COMMENT ON COLUMN refresh_tokens.token_hash IS 'SHA-256 hash of refresh token';
```

### 3. Auth Audit Log Table

Tracks authentication events for security monitoring.

```sql
CREATE TABLE auth_audit_log (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys (nullable for failed attempts)
  user_id UUID,

  -- Event Data
  event_type VARCHAR(50) NOT NULL,
  success BOOLEAN DEFAULT false,
  error_message TEXT,

  -- Request Info
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_event_type CHECK (event_type IN (
    'login', 'logout', 'token_refresh', 'password_change',
    'failed_login', 'account_locked', 'suspicious_activity'
  ))
);

-- Indexes
CREATE INDEX idx_audit_user ON auth_audit_log(user_id);
CREATE INDEX idx_audit_type ON auth_audit_log(event_type);
CREATE INDEX idx_audit_created ON auth_audit_log(created_at DESC);
CREATE INDEX idx_audit_ip ON auth_audit_log(ip_address);
CREATE INDEX idx_audit_failed ON auth_audit_log(success, event_type)
  WHERE success = false;

-- Partition by month for large datasets (optional)
-- CREATE TABLE auth_audit_log_2025_01 PARTITION OF auth_audit_log
--   FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

COMMENT ON TABLE auth_audit_log IS 'Security audit trail for authentication events';
```

### 4. Topics Table

Hierarchical topic organization for content categorization.

```sql
CREATE TABLE topics (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Topic Data
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,

  -- Hierarchy
  parent_id UUID,
  order INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT fk_topic_parent FOREIGN KEY (parent_id)
    REFERENCES topics(id) ON DELETE CASCADE,
  CONSTRAINT chk_topic_slug CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT chk_no_self_reference CHECK (id != parent_id)
);

-- Indexes
CREATE UNIQUE INDEX idx_topics_slug ON topics(slug);
CREATE INDEX idx_topics_parent ON topics(parent_id);
CREATE INDEX idx_topics_order ON topics(parent_id, order);
CREATE INDEX idx_topics_active ON topics(is_active) WHERE is_active = true;

-- Trigger for updated_at
CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to generate slug from name (optional)
CREATE OR REPLACE FUNCTION generate_topic_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_topics_slug
  BEFORE INSERT OR UPDATE ON topics
  FOR EACH ROW
  EXECUTE FUNCTION generate_topic_slug();

COMMENT ON TABLE topics IS 'Hierarchical topic structure for content organization';
COMMENT ON COLUMN topics.slug IS 'URL-friendly identifier (auto-generated from name)';
```

### 5. Content Table

Main content storage with versioning and review workflow.

```sql
CREATE TABLE content (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  topic_id UUID NOT NULL,
  author_id UUID NOT NULL,

  -- Content Data
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,

  -- Workflow
  status VARCHAR(50) DEFAULT 'draft',

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP,

  -- Metadata (JSONB for flexibility)
  metadata JSONB DEFAULT '{}',

  -- Search
  search_vector TSVECTOR,

  -- Constraints
  CONSTRAINT fk_content_topic FOREIGN KEY (topic_id)
    REFERENCES topics(id) ON DELETE CASCADE,
  CONSTRAINT fk_content_author FOREIGN KEY (author_id)
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_content_type CHECK (type IN (
    'lesson', 'exercise', 'resource', 'assessment'
  )),
  CONSTRAINT chk_content_status CHECK (status IN (
    'draft', 'pending', 'approved', 'rejected', 'published', 'archived'
  )),
  CONSTRAINT chk_published_date CHECK (
    (status = 'published' AND published_at IS NOT NULL) OR
    (status != 'published')
  )
);

-- Indexes
CREATE INDEX idx_content_topic ON content(topic_id);
CREATE INDEX idx_content_author ON content(author_id);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_created ON content(created_at DESC);
CREATE INDEX idx_content_published ON content(published_at DESC)
  WHERE status = 'published';

-- Full-text search index
CREATE INDEX idx_content_search ON content USING GIN(search_vector);

-- JSONB index for metadata queries
CREATE INDEX idx_content_metadata ON content USING GIN(metadata);

-- Trigger for updated_at
CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for search vector
CREATE OR REPLACE FUNCTION update_content_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector =
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_search
  BEFORE INSERT OR UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_content_search_vector();

COMMENT ON TABLE content IS 'Content items with review workflow and full-text search';
COMMENT ON COLUMN content.search_vector IS 'Full-text search index (auto-updated)';
COMMENT ON COLUMN content.metadata IS 'Flexible JSON metadata (difficulty, tags, etc.)';
```

### 6. Content Reviews Table

Tracks review history for content approval workflow.

```sql
CREATE TABLE content_reviews (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  content_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,

  -- Review Data
  action VARCHAR(50) NOT NULL,
  comments TEXT,

  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT fk_review_content FOREIGN KEY (content_id)
    REFERENCES content(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_reviewer FOREIGN KEY (reviewer_id)
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_review_action CHECK (action IN (
    'approve', 'reject', 'request_changes', 'comment'
  ))
);

-- Indexes
CREATE INDEX idx_review_content ON content_reviews(content_id);
CREATE INDEX idx_review_reviewer ON content_reviews(reviewer_id);
CREATE INDEX idx_review_created ON content_reviews(created_at DESC);
CREATE INDEX idx_review_action ON content_reviews(action);

-- Composite index for content review history
CREATE INDEX idx_review_content_history ON content_reviews(content_id, created_at DESC);

COMMENT ON TABLE content_reviews IS 'Review history and audit trail for content';
```

### 7. Media Table

Stores uploaded media files (images, videos, documents).

```sql
CREATE TABLE media (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  uploaded_by UUID NOT NULL,

  -- File Data
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  url TEXT NOT NULL,

  -- Metadata
  alt_text TEXT,
  caption TEXT,
  width INTEGER,
  height INTEGER,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT fk_media_uploader FOREIGN KEY (uploaded_by)
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_media_size CHECK (size > 0 AND size <= 10485760), -- 10MB
  CONSTRAINT chk_media_mime CHECK (mime_type ~ '^(image|video|audio|application)/'),
  CONSTRAINT chk_media_filename CHECK (filename ~ '^[a-zA-Z0-9._-]+$')
);

-- Indexes
CREATE INDEX idx_media_uploader ON media(uploaded_by);
CREATE INDEX idx_media_mime ON media(mime_type);
CREATE INDEX idx_media_created ON media(created_at DESC);
CREATE INDEX idx_media_filename ON media(filename);

-- Trigger for updated_at
CREATE TRIGGER update_media_updated_at
  BEFORE UPDATE ON media
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE media IS 'Uploaded media files with metadata';
COMMENT ON COLUMN media.size IS 'File size in bytes (max 10MB)';
```

### 8. Content Media Junction Table

Many-to-many relationship between content and media.

```sql
CREATE TABLE content_media (
  -- Composite Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  content_id UUID NOT NULL,
  media_id UUID NOT NULL,

  -- Ordering
  order INTEGER DEFAULT 0,

  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT fk_cm_content FOREIGN KEY (content_id)
    REFERENCES content(id) ON DELETE CASCADE,
  CONSTRAINT fk_cm_media FOREIGN KEY (media_id)
    REFERENCES media(id) ON DELETE CASCADE,
  CONSTRAINT uq_content_media UNIQUE (content_id, media_id)
);

-- Indexes
CREATE INDEX idx_cm_content ON content_media(content_id);
CREATE INDEX idx_cm_media ON content_media(media_id);
CREATE INDEX idx_cm_order ON content_media(content_id, order);

COMMENT ON TABLE content_media IS 'Many-to-many relationship between content and media';
```

## Data Types Reference

| Type      | Usage                          | Example                    |
|-----------|--------------------------------|----------------------------|
| UUID      | Primary keys, foreign keys     | gen_random_uuid()          |
| VARCHAR   | Short text with max length     | VARCHAR(255)               |
| TEXT      | Long text without limit        | Content, descriptions      |
| TIMESTAMP | Date and time                  | CURRENT_TIMESTAMP          |
| BOOLEAN   | True/false flags               | is_active                  |
| INTEGER   | Whole numbers                  | order, width, height       |
| BIGINT    | Large integers                 | file size in bytes         |
| JSONB     | Flexible JSON data             | metadata                   |
| TSVECTOR  | Full-text search index         | search_vector              |

## Relationships Summary

```
users (1) ──< (∞) content (author)
users (1) ──< (∞) content_reviews (reviewer)
users (1) ──< (∞) media (uploader)
users (1) ──< (∞) refresh_tokens
users (1) ──< (∞) auth_audit_log

topics (1) ──< (∞) content
topics (1) ──< (∞) topics (self-reference for hierarchy)

content (1) ──< (∞) content_reviews
content (∞) ──< (∞) media (through content_media)
```

## Indexes Strategy

### Types of Indexes

1. **B-tree (default)**: Standard indexes for equality and range queries
2. **GIN (Generalized Inverted Index)**: JSONB and full-text search
3. **Partial Indexes**: Filtered indexes for common queries
4. **Composite Indexes**: Multi-column indexes for specific queries

### Index Maintenance

```sql
-- Analyze tables for query optimization
ANALYZE users;
ANALYZE content;

-- Reindex if needed (after bulk operations)
REINDEX TABLE content;

-- Monitor index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan;
```

## Data Integrity

### Cascading Deletes

- Delete user → cascade to refresh_tokens
- Delete user → nullify content.author_id (preserve content)
- Delete topic → cascade to content
- Delete content → cascade to content_reviews and content_media

### Constraints

1. **Check Constraints**: Validate data at insert/update
2. **Foreign Keys**: Maintain referential integrity
3. **Unique Constraints**: Prevent duplicates
4. **Not Null**: Required fields

## Performance Optimization

### Query Patterns

```sql
-- Efficient content listing with topic
SELECT c.*, t.name as topic_name, u.name as author_name
FROM content c
JOIN topics t ON c.topic_id = t.id
JOIN users u ON c.author_id = u.id
WHERE c.status = 'published'
ORDER BY c.published_at DESC
LIMIT 50;

-- Full-text search
SELECT *
FROM content
WHERE search_vector @@ to_tsquery('english', 'postgres & tutorial')
ORDER BY ts_rank(search_vector, to_tsquery('english', 'postgres & tutorial')) DESC;

-- Content with review history
SELECT c.*,
  json_agg(json_build_object(
    'reviewer', u.name,
    'action', cr.action,
    'comments', cr.comments,
    'created_at', cr.created_at
  ) ORDER BY cr.created_at DESC) as reviews
FROM content c
LEFT JOIN content_reviews cr ON c.id = cr.content_id
LEFT JOIN users u ON cr.reviewer_id = u.id
WHERE c.id = $1
GROUP BY c.id;
```

### Connection Pooling

```javascript
// Recommended: Use connection pooling
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,  // Max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Migration Strategy

### Initial Setup

```bash
# 1. Create database
createdb hablas

# 2. Run migrations in order
psql -d hablas -f migrations/001_create_users.sql
psql -d hablas -f migrations/002_create_auth_tables.sql
psql -d hablas -f migrations/003_create_topics.sql
psql -d hablas -f migrations/004_create_content.sql
psql -d hablas -f migrations/005_create_media.sql
```

### Seed Data

```sql
-- Insert default admin
INSERT INTO users (email, password_hash, name, role)
VALUES (
  'admin@hablas.local',
  '$2b$12$...', -- bcrypt hash of 'admin123'
  'Administrator',
  'admin'
);

-- Insert sample topics
INSERT INTO topics (name, slug, description) VALUES
('Grammar', 'grammar', 'Spanish grammar lessons'),
('Vocabulary', 'vocabulary', 'Word lists and practice'),
('Conversation', 'conversation', 'Speaking practice');
```

## Backup & Recovery

### Backup Commands

```bash
# Full backup
pg_dump hablas > hablas_backup_$(date +%Y%m%d).sql

# Schema only
pg_dump --schema-only hablas > schema_backup.sql

# Data only
pg_dump --data-only hablas > data_backup.sql

# Specific tables
pg_dump -t users -t content hablas > important_tables.sql
```

### Restore

```bash
# Restore full database
psql hablas < hablas_backup_20250116.sql

# Restore specific table
psql hablas -c "TRUNCATE users CASCADE;"
psql hablas < users_backup.sql
```

## Security Considerations

1. **Row Level Security (RLS)**: Consider enabling for multi-tenancy
2. **Encryption at Rest**: Database-level encryption
3. **SSL Connections**: Require SSL for all connections
4. **Least Privilege**: Create role-specific database users
5. **Audit Logging**: Enable PostgreSQL audit extensions

## Monitoring Queries

```sql
-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Active connections
SELECT * FROM pg_stat_activity
WHERE state = 'active';
```
