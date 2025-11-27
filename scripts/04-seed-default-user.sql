-- ============================================================================
-- Seed Default Admin User
-- ============================================================================
-- Description: Creates a default admin user directly in the public.users table.
-- Credentials: admin@example.com / password123
-- ============================================================================

BEGIN;

-- 1. Create the user profile in the public.users table
-- The password 'password123' is hashed using bcrypt with 10 rounds.
-- This hash was generated externally as Supabase psql doesn't have bcrypt.
-- You can generate this with: `require('bcrypt').hashSync('password123', 12)`
INSERT INTO public.users (id, email, name, hashed_password, is_active, role_id)
VALUES (
    '8a796910-3963-44e3-98a9-58566a6117d4', -- Must match the UUID above
    'admin@example.com',
    'Admin User',
    '$2a$10$7d96yCKtVEgkA/SMOAtUvOuO1NyuAvadE/EnjPhZBe2wfV1dAvvxe', -- bcrypt hash for 'password123'
    TRUE,
    '00000000-0000-0000-0000-000000000001' -- Super Admin role ID
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    hashed_password = EXCLUDED.hashed_password,
    is_active = EXCLUDED.is_active,
    role_id = EXCLUDED.role_id;

COMMIT;
