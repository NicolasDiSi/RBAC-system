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

-- ============================================================================
-- 1. Create a helper function to check for the specific permission
-- ============================================================================
CREATE OR REPLACE FUNCTION public.can_create_share_token()
RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.role_permissions rp
    JOIN public.permissions p ON rp.permission_id = p.id
    JOIN public.users u ON rp.role_id = u.role_id
    WHERE u.id = get_current_user_id() AND p.name = 'users.generate_share_link'
  ) INTO has_permission;
  
  RETURN COALESCE(has_permission, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. Drop the old, incorrect RLS policies on the share_tokens table
-- ============================================================================
DROP POLICY IF EXISTS "Allow service role to manage share tokens" ON public.share_tokens;
DROP POLICY IF EXISTS "Allow Super Admin to manage all share tokens" ON public.share_tokens;

DROP POLICY IF EXISTS "Allow anonymous users to read share tokens" ON public.share_tokens;
DROP POLICY IF EXISTS "Allow authenticated users to view their own share tokens" ON public.share_tokens;
DROP POLICY IF EXISTS "Allow authenticated users to update their own share tokens" ON public.share_tokens;

-- ============================================================================
-- 3. Create the new, correct policy for creating share tokens (INSERT)
-- ============================================================================
CREATE POLICY "Allow authorized users to create share tokens"
ON public.share_tokens
FOR INSERT
WITH CHECK (can_create_share_token());

-- ============================================================================
-- 4. Re-apply the existing policies for reading and updating tokens
-- ============================================================================

-- Policy: Allow anonymous users to read tokens for verification (read only)
-- Note: This is required for the /api/auth/verify-share-token route to work
-- when the user is not yet logged in.
CREATE POLICY "Allow anonymous users to read share tokens"
ON public.share_tokens FOR SELECT
USING (TRUE);

-- Policy: Allow authenticated users to see their own tokens
CREATE POLICY "Allow authenticated users to view their own share tokens"
ON public.share_tokens FOR SELECT
USING (get_current_user_id() = user_id);

-- Policy: Allow authenticated users to update their own share tokens (e.g., mark as used)
-- Note: This is now handled by the verify-share-token route, but the policy is
-- kept for completeness and potential future use cases.
CREATE POLICY "Allow authenticated users to update their own share tokens"
ON public.share_tokens FOR UPDATE
USING (get_current_user_id() = user_id);

DO $$
BEGIN
  RAISE NOTICE 'RLS policies for share_tokens have been successfully updated.';
END $$;