-- ============================================================================
-- Create Table: share_tokens
-- ============================================================================
-- Description: Stores secure, temporary access tokens for existing users.
-- Dependencies: users table
-- Idempotent: Yes - uses IF NOT EXISTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS share_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) UNIQUE NOT NULL, -- Using VARCHAR(255) for a long hash
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  region_restriction VARCHAR(255), -- e.g., 'US', 'EU'
  timezone_restriction VARCHAR(255), -- e.g., 'America/New_York'
  is_used BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add index for faster lookup by token
CREATE INDEX IF NOT EXISTS idx_share_tokens_token ON share_tokens (token);

-- Add index for faster lookup by user_id
CREATE INDEX IF NOT EXISTS idx_share_tokens_user_id ON share_tokens (user_id);

-- Add RLS policy for share_tokens table
ALTER TABLE share_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service role to manage share tokens" ON public.share_tokens;
DROP POLICY IF EXISTS "Allow Super Admin to manage all share tokens" ON public.share_tokens;

-- Policy: Allow Super Admin to manage all share tokens
CREATE POLICY "Allow Super Admin to manage all share tokens" ON public.share_tokens
FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = get_current_user_id()
      AND role_id = '00000000-0000-0000-0000-000000000001' -- Super Admin role ID
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = get_current_user_id()
      AND role_id = '00000000-0000-0000-0000-000000000001' -- Super Admin role ID
  )
);

-- Policy: Allow anonymous users to read tokens for verification (read only)
CREATE POLICY "Allow anonymous users to read share tokens"
ON share_tokens FOR SELECT
TO anon
USING (TRUE);

-- Policy: Allow authenticated users to update their own share tokens (e.g., mark as used)
CREATE POLICY "Allow authenticated users to update their own share tokens"
ON share_tokens FOR UPDATE
TO authenticated
USING (get_current_user_id() = user_id);
