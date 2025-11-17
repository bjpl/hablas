-- Migration 003: Create Sessions Table
-- Description: Create sessions table for active user sessions with device tracking
-- Dependencies: 001_create_users_table.sql
-- Author: Database Architect
-- Date: 2025-11-17

BEGIN;

-- Create sessions table for active session tracking
CREATE TABLE IF NOT EXISTS sessions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  user_id UUID NOT NULL,

  -- Session Data
  session_token VARCHAR(255) NOT NULL,
  access_token_hash VARCHAR(255),
  refresh_token_hash VARCHAR(255),

  -- Session Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_type VARCHAR(50),
  device_name VARCHAR(100),
  browser VARCHAR(100),
  os VARCHAR(100),
  location VARCHAR(255),

  -- Session Status
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT fk_session_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_session_token CHECK (length(session_token) > 0),
  CONSTRAINT chk_expires_future CHECK (expires_at > created_at),
  CONSTRAINT chk_last_activity CHECK (last_activity <= CURRENT_TIMESTAMP)
);

-- Create indexes for sessions
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(user_id, is_active)
  WHERE is_active = true AND revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)
  WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON sessions(last_activity DESC)
  WHERE is_active = true;

-- Composite index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_sessions_cleanup ON sessions(expires_at, is_active)
  WHERE revoked_at IS NULL;

-- Index for user session management (limit per user)
CREATE INDEX IF NOT EXISTS idx_sessions_user_created ON sessions(user_id, created_at DESC)
  WHERE revoked_at IS NULL;

-- Attach trigger to sessions table for updated_at
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-revoke expired sessions
CREATE OR REPLACE FUNCTION auto_revoke_expired_sessions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at <= CURRENT_TIMESTAMP AND NEW.revoked_at IS NULL THEN
    NEW.is_active := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_session_expiry ON sessions;
CREATE TRIGGER check_session_expiry
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION auto_revoke_expired_sessions();

-- Table and column comments
COMMENT ON TABLE sessions IS 'Active user sessions with device and activity tracking';
COMMENT ON COLUMN sessions.session_token IS 'Unique session identifier (UUID or JWT ID)';
COMMENT ON COLUMN sessions.access_token_hash IS 'SHA-256 hash of access JWT token';
COMMENT ON COLUMN sessions.refresh_token_hash IS 'SHA-256 hash of refresh token (links to refresh_tokens table)';
COMMENT ON COLUMN sessions.device_type IS 'Device type: mobile, tablet, desktop, unknown';
COMMENT ON COLUMN sessions.is_active IS 'Session activity status (false = inactive/expired)';
COMMENT ON COLUMN sessions.last_activity IS 'Last API request timestamp for session';
COMMENT ON COLUMN sessions.expires_at IS 'Session expiration timestamp';
COMMENT ON COLUMN sessions.revoked_at IS 'Manual session revocation timestamp (for logout)';

-- Create function to cleanup expired sessions (call from cron or app)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete sessions expired more than 7 days ago
  WITH deleted AS (
    DELETE FROM sessions
    WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '7 days'
      AND (revoked_at < CURRENT_TIMESTAMP - INTERVAL '7 days' OR is_active = false)
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_sessions IS 'Cleanup sessions expired more than 7 days ago - call periodically';

-- Create function to limit sessions per user
CREATE OR REPLACE FUNCTION enforce_max_sessions_per_user()
RETURNS TRIGGER AS $$
DECLARE
  max_sessions INTEGER := 5; -- Match SESSION_CONFIG.MAX_SESSIONS_PER_USER
  current_count INTEGER;
  oldest_session_id UUID;
BEGIN
  -- Count active sessions for this user
  SELECT COUNT(*) INTO current_count
  FROM sessions
  WHERE user_id = NEW.user_id
    AND is_active = true
    AND revoked_at IS NULL
    AND expires_at > CURRENT_TIMESTAMP;

  -- If exceeds max, revoke oldest session
  IF current_count >= max_sessions THEN
    SELECT id INTO oldest_session_id
    FROM sessions
    WHERE user_id = NEW.user_id
      AND is_active = true
      AND revoked_at IS NULL
      AND id != NEW.id
    ORDER BY created_at ASC
    LIMIT 1;

    IF oldest_session_id IS NOT NULL THEN
      UPDATE sessions
      SET is_active = false,
          revoked_at = CURRENT_TIMESTAMP
      WHERE id = oldest_session_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_session_limit ON sessions;
CREATE TRIGGER enforce_session_limit
  AFTER INSERT ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION enforce_max_sessions_per_user();

COMMIT;
