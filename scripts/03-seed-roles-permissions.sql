-- ============================================================================
-- Seed Data - Roles and Permissions
-- ============================================================================
-- Description: Populates initial roles and permissions for RBAC system
-- Dependencies: roles, permissions, role_permissions tables
-- Idempotent: Yes - uses ON CONFLICT to prevent duplicates
-- ============================================================================

-- Start transaction for atomicity
BEGIN;

-- ============================================================================
-- SEED: Default Roles
-- Description: Creates 4 default roles with fixed UUIDs for consistency
-- ============================================================================
INSERT INTO roles (id, name, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Super Admin', 'Full system access with all permissions including user and role management'),
  ('00000000-0000-0000-0000-000000000002', 'HR Manager', 'Manage employees, projects, assignments, and documents with full CRUD access'),
  ('00000000-0000-0000-0000-000000000003', 'HR Staff', 'Create, view, and edit employee information without delete permissions'),
  ('00000000-0000-0000-0000-000000000004', 'Viewer', 'Read-only access to employee and project data for reporting purposes')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ============================================================================
-- SEED: User Management Permissions
-- ============================================================================
INSERT INTO permissions (name, description, resource, action) VALUES
  ('users.create', 'Create new users in the system', 'users', 'create'),
  ('users.read', 'View user information and profiles', 'users', 'read'),
  ('users.update', 'Update user information and settings', 'users', 'update'),
  ('users.delete', 'Delete users from the system', 'users', 'delete'),
  ('users.activate', 'Activate or deactivate user accounts', 'users', 'activate'),
  ('users.assign_role', 'Assign roles to users', 'users', 'assign_role'),
  ('users.update_password', 'Update a user/s password', 'users', 'update_password'),
  ('users.share', 'Share user credentials or access information', 'users', 'share'),
  ('users.generate_signup_code', 'Generate signup codes for inviting new users', 'users', 'generate_signup_code'),
  ('users.read_signup_codes', 'View all generated signup codes', 'users', 'read_signup_codes'),
  ('users.update_signup_code', 'Update a signup code, e.g., to mark it as used', 'users', 'update_signup_code'),
  ('users.delete_signup_code', 'Delete an unused signup code', 'users', 'delete_signup_code'),
  ('users.generate_share_link', 'Generate secure, temporary login links for users', 'users', 'generate_share_link')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  resource = EXCLUDED.resource,
  action = EXCLUDED.action;

-- ============================================================================
-- SEED: Role Management Permissions
-- ============================================================================
INSERT INTO permissions (name, description, resource, action) VALUES
  ('roles.create', 'Create new roles', 'roles', 'create'),
  ('roles.read', 'View role information and permissions', 'roles', 'read'),
  ('roles.update', 'Update role information', 'roles', 'update'),
  ('roles.delete', 'Delete roles from the system', 'roles', 'delete'),
  ('roles.assign_permissions', 'Assign permissions to roles', 'roles', 'assign_permissions')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  resource = EXCLUDED.resource,
  action = EXCLUDED.action;

-- ============================================================================
-- SEED: Employee Management Permissions
-- ============================================================================
INSERT INTO permissions (name, description, resource, action) VALUES
  ('employees.create', 'Create new employee records', 'employees', 'create'),
  ('employees.read', 'View employee information', 'employees', 'read'),
  ('employees.update', 'Update employee information', 'employees', 'update'),
  ('employees.delete', 'Delete employee records', 'employees', 'delete'),
  ('employees.deactivate', 'Deactivate employee records', 'employees', 'deactivate')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  resource = EXCLUDED.resource,
  action = EXCLUDED.action;

-- ============================================================================
-- SEED: Project Management Permissions
-- ============================================================================
INSERT INTO permissions (name, description, resource, action) VALUES
  ('projects.create', 'Create new construction projects', 'projects', 'create'),
  ('projects.read', 'View project information', 'projects', 'read'),
  ('projects.update', 'Update project information', 'projects', 'update'),
  ('projects.delete', 'Delete projects', 'projects', 'delete')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  resource = EXCLUDED.resource,
  action = EXCLUDED.action;

-- ============================================================================
-- SEED: Assignment Management Permissions
-- ============================================================================
INSERT INTO permissions (name, description, resource, action) VALUES
  ('assignments.create', 'Create employee-project assignments', 'assignments', 'create'),
  ('assignments.read', 'View assignment information', 'assignments', 'read'),
  ('assignments.update', 'Update assignment information', 'assignments', 'update'),
  ('assignments.delete', 'Delete assignments', 'assignments', 'delete')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  resource = EXCLUDED.resource,
  action = EXCLUDED.action;

-- ============================================================================
-- SEED: Document Management Permissions
-- ============================================================================
INSERT INTO permissions (name, description, resource, action) VALUES
  ('documents.create', 'Upload employee documents', 'documents', 'create'),
  ('documents.read', 'View and download documents', 'documents', 'read'),
  ('documents.update', 'Update document information', 'documents', 'update'),
  ('documents.delete', 'Delete documents', 'documents', 'delete')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  resource = EXCLUDED.resource,
  action = EXCLUDED.action;

-- ============================================================================
-- SEED: Dashboard and Analytics Permissions
-- ============================================================================
INSERT INTO permissions (name, description, resource, action) VALUES
  ('dashboard.view', 'View dashboard and home page', 'dashboard', 'view'),
  ('dashboard.export', 'Export reports to various formats', 'dashboard', 'export')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  resource = EXCLUDED.resource,
  action = EXCLUDED.action;
  
-- ============================================================================
-- SEED: Reports and Analytics Permissions
-- ============================================================================
INSERT INTO permissions (name, description, resource, action) VALUES
  ('reports.view', 'View reports and analytics dashboards', 'reports', 'read'),
  ('reports.export', 'Export reports to various formats', 'reports', 'export')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  resource = EXCLUDED.resource,
  action = EXCLUDED.action;

-- ============================================================================
-- ROLE PERMISSIONS MAPPING: Super Admin
-- Description: Assign ALL permissions to Super Admin role
-- ============================================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================================
-- ROLE PERMISSIONS MAPPING: HR Manager
-- Description: Full access to business resources (employees, projects, etc.)
-- ============================================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permissions
WHERE resource IN ('employees', 'projects', 'assignments', 'documents', 'reports')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================================
-- ROLE PERMISSIONS MAPPING: HR Staff
-- Description: Create, read, update access (no delete) for business resources
-- ============================================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', id FROM permissions
WHERE resource IN ('employees', 'projects', 'assignments', 'documents', 'reports')
  AND action IN ('create', 'read', 'update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================================
-- ROLE PERMISSIONS MAPPING: Viewer
-- Description: Read-only access to all business resources
-- ============================================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000004', id FROM permissions
WHERE action = 'read'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Commit transaction
COMMIT;

-- ============================================================================
-- VERIFICATION: Check if seed data was inserted successfully
-- ============================================================================
DO $$
DECLARE
  role_count INT;
  permission_count INT;
  mapping_count INT;
BEGIN
  SELECT COUNT(*) INTO role_count FROM roles;
  SELECT COUNT(*) INTO permission_count FROM permissions;
  SELECT COUNT(*) INTO mapping_count FROM role_permissions;
  
  RAISE NOTICE 'Seed data inserted successfully:';
  RAISE NOTICE '  - Roles: % (expected: 4)', role_count;
  RAISE NOTICE '  - Permissions: % (expected: 30)', permission_count;
  RAISE NOTICE '  - Role-Permission mappings: %', mapping_count;
  
  -- Verify each role has permissions
  RAISE NOTICE 'Permissions per role:';
  RAISE NOTICE '  - Super Admin: % permissions', (
    SELECT COUNT(*) FROM role_permissions 
    WHERE role_id = '00000000-0000-0000-0000-000000000001'
  );
  RAISE NOTICE '  - HR Manager: % permissions', (
    SELECT COUNT(*) FROM role_permissions 
    WHERE role_id = '00000000-0000-0000-0000-000000000002'
  );
  RAISE NOTICE '  - HR Staff: % permissions', (
    SELECT COUNT(*) FROM role_permissions 
    WHERE role_id = '00000000-0000-0000-0000-000000000003'
  );
  RAISE NOTICE '  - Viewer: % permissions', (
    SELECT COUNT(*) FROM role_permissions 
    WHERE role_id = '00000000-0000-0000-0000-000000000004'
  );
END $$;
