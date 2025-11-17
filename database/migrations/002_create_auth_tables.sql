-- Migration 002: Create Authentication Tables
-- Description: Create refresh tokens and audit log tables
-- Dependencies: 001_create_users_table.sql
-- Author: Database Migration Specialist
-- Date: 2025-01-16

BEGIN;

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  user_id UUID NOT NULL,

  -- Token Data
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Session Info
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- Status
  revoked_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT fk_refresh_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_token_hash CHECK (length(token_hash) > 0),
  CONSTRAINT chk_expires_future CHECK (expires_at > created_at)
);

-- Create indexes for refresh_tokens
CREATE INDEX IF NOT EXISTS idx_refresh_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_expires ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_active ON refresh_tokens(user_id, revoked_at)
  WHERE revoked_at IS NULL;

-- Auto-cleanup expired tokens index (removed CURRENT_TIMESTAMP predicate - not immutable)
CREATE INDEX IF NOT EXISTS idx_refresh_cleanup ON refresh_tokens(expires_at)
  WHERE revoked_at IS NULL;

-- Table comments
COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for session management';
COMMENT ON COLUMN refresh_tokens.token_hash IS 'SHA-256 hash of refresh token';
COMMENT ON COLUMN refresh_tokens.revoked_at IS 'Token revocation timestamp (NULL = active)';

-- Create auth_audit_log table
CREATE TABLE IF NOT EXISTS auth_audit_log (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_event_type CHECK (event_type IN (
    'login', 'logout', 'token_refresh', 'password_change',
    'failed_login', 'account_locked', 'suspicious_activity',
    'registration', 'password_reset'
  ))
);

-- Create indexes for auth_audit_log
CREATE INDEX IF NOT EXISTS idx_audit_user ON auth_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_type ON auth_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_created ON auth_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_ip ON auth_audit_log(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_failed ON auth_audit_log(success, event_type)
  WHERE success = false;

-- Table comments
COMMENT ON TABLE auth_audit_log IS 'Security audit trail for authentication events';
COMMENT ON COLUMN auth_audit_log.user_id IS 'User ID (NULL for failed login attempts)';
COMMENT ON COLUMN auth_audit_log.event_type IS 'Type of authentication event';
COMMENT ON COLUMN auth_audit_log.success IS 'Whether the operation succeeded';

COMMIT;
