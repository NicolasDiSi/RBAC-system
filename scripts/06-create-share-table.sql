-- ============================================================================
-- TABLE: secure_shares
-- Description: Stores temporary, secure tokens for sharing credentials.
-- ============================================================================
CREATE TABLE IF NOT EXISTS secure_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  region_scope VARCHAR(2) NOT NULL, -- ISO 3166-1 alpha-2 country code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT chk_region_scope_format CHECK (region_scope ~ '^[A-Z]{2}$')
);

CREATE INDEX IF NOT EXISTS idx_secure_shares_token ON secure_shares(token);
CREATE INDEX IF NOT EXISTS idx_secure_shares_expires_at ON secure_shares(expires_at);
