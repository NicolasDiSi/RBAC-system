-- Seed initial roles and permissions
-- This script creates default roles and permissions for the RBAC system

-- Insert default roles
INSERT INTO roles (id, name, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Super Admin', 'Full system access with all permissions'),
  ('00000000-0000-0000-0000-000000000002', 'HR Manager', 'Manage employees, projects, and assignments'),
  ('00000000-0000-0000-0000-000000000003', 'HR Staff', 'View and edit employee information'),
  ('00000000-0000-0000-0000-000000000004', 'Viewer', 'Read-only access to employee and project data')
ON CONFLICT (id) DO NOTHING;

-- Insert permissions for user management
INSERT INTO permissions (name, description, resource, action) VALUES
  ('users.create', 'Create new users', 'users', 'create'),
  ('users.read', 'View user information', 'users', 'read'),
  ('users.update', 'Update user information', 'users', 'update'),
  ('users.delete', 'Delete users', 'users', 'delete'),
  ('users.activate', 'Activate/deactivate users', 'users', 'activate'),
  ('users.assign_role', 'Assign roles to users', 'users', 'assign_role')
ON CONFLICT (name) DO NOTHING;

-- Insert permissions for role management
INSERT INTO permissions (name, description, resource, action) VALUES
  ('roles.create', 'Create new roles', 'roles', 'create'),
  ('roles.read', 'View role information', 'roles', 'read'),
  ('roles.update', 'Update role information', 'roles', 'update'),
  ('roles.delete', 'Delete roles', 'roles', 'delete'),
  ('roles.assign_permissions', 'Assign permissions to roles', 'roles', 'assign_permissions')
ON CONFLICT (name) DO NOTHING;

-- Insert permissions for employee management
INSERT INTO permissions (name, description, resource, action) VALUES
  ('employees.create', 'Create new employees', 'employees', 'create'),
  ('employees.read', 'View employee information', 'employees', 'read'),
  ('employees.update', 'Update employee information', 'employees', 'update'),
  ('employees.delete', 'Delete employees', 'employees', 'delete')
ON CONFLICT (name) DO NOTHING;

-- Insert permissions for project management
INSERT INTO permissions (name, description, resource, action) VALUES
  ('projects.create', 'Create new projects', 'projects', 'create'),
  ('projects.read', 'View project information', 'projects', 'read'),
  ('projects.update', 'Update project information', 'projects', 'update'),
  ('projects.delete', 'Delete projects', 'projects', 'delete')
ON CONFLICT (name) DO NOTHING;

-- Insert permissions for assignment management
INSERT INTO permissions (name, description, resource, action) VALUES
  ('assignments.create', 'Create employee assignments', 'assignments', 'create'),
  ('assignments.read', 'View assignment information', 'assignments', 'read'),
  ('assignments.update', 'Update assignment information', 'assignments', 'update'),
  ('assignments.delete', 'Delete assignments', 'assignments', 'delete')
ON CONFLICT (name) DO NOTHING;

-- Insert permissions for document management
INSERT INTO permissions (name, description, resource, action) VALUES
  ('documents.create', 'Upload documents', 'documents', 'create'),
  ('documents.read', 'View documents', 'documents', 'read'),
  ('documents.update', 'Update document information', 'documents', 'update'),
  ('documents.delete', 'Delete documents', 'documents', 'delete')
ON CONFLICT (name) DO NOTHING;

-- Insert permissions for reports
INSERT INTO permissions (name, description, resource, action) VALUES
  ('reports.view', 'View reports and analytics', 'reports', 'read'),
  ('reports.export', 'Export reports', 'reports', 'export')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to Super Admin role (all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign permissions to HR Manager role
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permissions
WHERE resource IN ('employees', 'projects', 'assignments', 'documents', 'reports')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign permissions to HR Staff role (no delete permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', id FROM permissions
WHERE resource IN ('employees', 'projects', 'assignments', 'documents', 'reports')
  AND action IN ('create', 'read', 'update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign permissions to Viewer role (read-only)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000004', id FROM permissions
WHERE action = 'read'
ON CONFLICT (role_id, permission_id) DO NOTHING;
