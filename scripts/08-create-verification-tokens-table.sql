-- ============================================================================
-- Create Table: verification_tokens
-- ============================================================================
-- Description: Stores secure, temporary tokens for email verification and password reset.
-- Dependencies: users table
-- Idempotent: Yes - uses IF NOT EXISTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- e.g., 'email_verification', 'password_reset'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add index for faster lookup by token
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens (token);

-- Add index for faster lookup by user_id
CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens (user_id);

-- Add RLS policy for verification_tokens table
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Policies for verification_tokens
-- ============================================================================

-- Allow service roles (and other privileged roles) to manage tokens
-- This is a broad policy for admin-level operations.
CREATE POLICY "Allow service role to manage verification tokens"
ON public.verification_tokens
FOR ALL
USING (is_service_role());

-- Allow users to manage their own tokens
CREATE POLICY "Allow users to manage their own verification tokens"
ON public.verification_tokens
FOR ALL
USING (get_current_user_id() = user_id)
WITH CHECK (get_current_user_id() = user_id);

-- Allow anonymous access for token verification
-- This is necessary for the verification link to work without being logged in.
CREATE POLICY "Allow anonymous read access for token verification"
ON public.verification_tokens
FOR SELECT
USING (TRUE);

DO $$
BEGIN
  RAISE NOTICE 'Table and RLS policies for verification_tokens have been successfully created/updated.';
END $$;
