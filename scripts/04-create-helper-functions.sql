-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================
-- Description: Defines helper functions for RLS and general use.
-- Idempotent: Yes - can be run multiple times safely
-- ============================================================================

BEGIN;

-- ============================================================================
-- FUNCTION: get_current_user_id()
-- Description: Safely retrieves the current user's ID from the JWT 'sub' claim.
-- ============================================================================
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  -- This will extract the 'sub' claim from the current request's JWT,
  -- which is set by the application server.
  RETURN (auth.jwt()->>'sub')::UUID;
EXCEPTION
  -- Handle cases where the JWT or 'sub' claim is missing or invalid
  WHEN others THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set a secure search path for the function to prevent hijacking
ALTER FUNCTION public.get_current_user_id() SET search_path = public;

-- ============================================================================
-- FUNCTION: check_permission(permission_name TEXT)
-- Description: Checks if the currently authenticated user has a specific
-- permission based on their role. Uses an RLS bypass to query the users table.
-- ============================================================================
CREATE OR REPLACE FUNCTION check_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role_name TEXT;
  user_role_id UUID;
  has_permission BOOLEAN;
BEGIN
  -- Get the role name directly from the JWT 'role' claim.
  -- This is now reliable because we fixed the JWT creation process.
  user_role_name := auth.jwt()->>'role';

  IF user_role_name IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Find the role_id from the role name
  SELECT id INTO user_role_id FROM public.roles WHERE name = user_role_name;

  IF user_role_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if a mapping exists in role_permissions
  SELECT EXISTS (
    SELECT 1
    FROM public.role_permissions rp
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE rp.role_id = user_role_id AND p.name = permission_name
  ) INTO has_permission;

  RETURN COALESCE(has_permission, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set a secure search path for the function to prevent hijacking
ALTER FUNCTION public.check_permission(TEXT) SET search_path = public;

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Helper functions created successfully.';
END $$;