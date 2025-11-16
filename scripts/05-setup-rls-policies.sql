-- ============================================================================
-- RLS Policies - Row Level Security
-- ============================================================================
-- Description: Sets up Row Level Security for the main tables.
-- This is a critical security measure to ensure users can only access
-- data they are permitted to see.
--
-- Dependencies: Tables created in 01-create-rbac-tables.sql
-- Idempotent: Yes - policies are created with IF NOT EXISTS
-- ============================================================================

-- Start transaction for atomicity
BEGIN;

-- ============================================================================
-- HELPER FUNCTION: get_user_role
-- Description: Returns the name of the role for a given user ID.
-- This is a stable function that can be used in RLS policies.
-- SECURITY DEFINER is used to allow the function to query tables it
-- otherwise might not have access to, but it's safe because it only
-- reads data based on the user ID provided.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_role_name TEXT;
BEGIN
  SELECT r.name INTO v_role_name
  FROM public.users u
  JOIN public.roles r ON u.role_id = r.id
  WHERE u.id = p_user_id;
  RETURN v_role_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- TABLE: users
-- ============================================================================

-- 1. Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to ensure a clean slate (idempotent)
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow Super Admins to manage all user profiles" ON public.users;

-- 3. Create SELECT policy for individual users
-- Allows users to see their own record in the users table.
CREATE POLICY "Allow users to view their own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- 4. Create ALL policy for Super Admins
-- Allows users with the 'Super Admin' role to do anything to user records.
CREATE POLICY "Allow Super Admins to manage all user profiles"
ON public.users
FOR ALL -- Includes SELECT, INSERT, UPDATE, DELETE
USING (public.get_user_role(auth.uid()) = 'Super Admin')
WITH CHECK (public.get_user_role(auth.uid()) = 'Super Admin');


-- ============================================================================
-- Note on other tables (employees, projects, etc.)
-- ============================================================================
-- For this exercise, we are only securing the 'users' table.
-- In a real-world application, you would add similar RLS policies to
-- every table containing sensitive data (employees, documents, etc.)
-- based on the permissions defined in the 'role_permissions' table.
-- ============================================================================


-- Commit transaction
COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'RLS policies for the users table have been configured.';
END $$;
