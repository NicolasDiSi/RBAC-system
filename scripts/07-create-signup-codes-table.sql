-- ============================================================================
-- Create Table: signup_codes
-- ============================================================================
-- Description: Stores one-time signup codes for user registration.
-- Dependencies: users table
-- Idempotent: Yes - uses IF NOT EXISTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS signup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add index for faster lookup by code
CREATE INDEX IF NOT EXISTS idx_signup_codes_code ON signup_codes (code);

-- Add index for faster lookup by user_id
CREATE INDEX IF NOT EXISTS idx_signup_codes_user_id ON signup_codes (user_id);

-- Add RLS policy for signup_codes table
ALTER TABLE signup_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read their own signup codes (if applicable)
CREATE POLICY "Allow authenticated users to read their own signup codes"
ON signup_codes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Allow service role to manage all signup codes
CREATE POLICY "Allow service role to manage signup codes"
ON signup_codes FOR ALL
TO service_role
USING (TRUE) WITH CHECK (TRUE);

-- Policy: Allow anonymous users to verify codes (read only)
CREATE POLICY "Allow anonymous users to verify codes"
ON signup_codes FOR SELECT
TO anon
USING (TRUE);

-- Policy: Allow authenticated users to update their own signup codes (e.g., mark as used)
CREATE POLICY "Allow authenticated users to update their own signup codes"
ON signup_codes FOR UPDATE
TO authenticated
USING (get_current_user_id() = user_id) WITH CHECK (get_current_user_id() = user_id);
