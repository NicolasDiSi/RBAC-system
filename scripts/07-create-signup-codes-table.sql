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
  role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE NOT NULL,
  used_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add index for faster lookup by code
CREATE INDEX IF NOT EXISTS idx_signup_codes_code ON signup_codes (code);

-- Add RLS policy for signup_codes table
ALTER TABLE signup_codes ENABLE ROW LEVEL SECURITY;

-- Create new policies based on permissions
-- This uses the check_permission function defined in 04-create-helper-functions.sql

-- Allow users with 'read_signup_codes' permission to view all codes
CREATE POLICY "Allow authorized users to view signup codes"
ON public.signup_codes FOR SELECT
USING (check_permission('users.read_signup_codes'));

-- Allow users with 'generate_signup_code' permission to create codes
CREATE POLICY "Allow authorized users to create signup codes"
ON public.signup_codes FOR INSERT
WITH CHECK (check_permission('users.generate_signup_code'));

-- Allow users with 'delete_signup_code' permission to delete codes
CREATE POLICY "Allow authorized users to delete signup codes"
ON public.signup_codes FOR DELETE
USING (check_permission('users.delete_signup_code'));

-- Allow the system (or an admin) to update codes (e.g., mark as used)
-- This is a broad policy for simplicity; could be narrowed if needed.
CREATE POLICY "Allow authorized users to update signup codes"
ON public.signup_codes FOR UPDATE
USING (check_permission('users.update_signup_code')); -- Assumes this permission exists or will be created

-- Allow anonymous users to read a code for verification purposes
CREATE POLICY "Allow anonymous read for verification"
ON public.signup_codes FOR SELECT
USING (true);
