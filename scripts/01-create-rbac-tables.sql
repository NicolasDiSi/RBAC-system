-- ============================================================================
-- RBAC System Tables - Role-Based Access Control
-- ============================================================================
-- Description: Creates authentication and authorization infrastructure
-- Dependencies: None (base tables)
-- Idempotent: Yes - can be run multiple times safely
-- ============================================================================

-- Start transaction for atomicity
BEGIN;

-- ============================================================================
-- TABLE: roles
-- Description: Defines different user roles in the system
-- Note: Created first to avoid circular dependency with users table
-- ============================================================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE: users
-- Description: Stores user information and authentication data from Google OAuth
-- Dependencies: roles table (foreign key)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  google_id VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE: permissions
-- Description: Defines granular permissions for actions on resources
-- Format: resource.action (e.g., employees.create, projects.read)
-- ============================================================================
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  resource VARCHAR(100) NOT NULL, -- e.g., 'employees', 'projects', 'users'
  action VARCHAR(50) NOT NULL, -- e.g., 'create', 'read', 'update', 'delete'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT chk_permission_name CHECK (name ~ '^[a-z_]+\.[a-z_]+$')
);

-- ============================================================================
-- TABLE: role_permissions
-- Description: Many-to-many mapping between roles and permissions
-- Dependencies: roles, permissions tables
-- ============================================================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_role_permission UNIQUE(role_id, permission_id)
);

-- ============================================================================
-- INDEXES: Performance optimization for common queries
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- ============================================================================
-- TRIGGERS: Automatic timestamp updates
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop triggers if they exist (idempotent)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;

-- Create triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Commit transaction
COMMIT;

-- ============================================================================
-- VERIFICATION: Check if tables were created successfully
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'RBAC tables created successfully:';
  RAISE NOTICE '  - roles: % rows', (SELECT COUNT(*) FROM roles);
  RAISE NOTICE '  - users: % rows', (SELECT COUNT(*) FROM users);
  RAISE NOTICE '  - permissions: % rows', (SELECT COUNT(*) FROM permissions);
  RAISE NOTICE '  - role_permissions: % rows', (SELECT COUNT(*) FROM role_permissions);
END $$;
