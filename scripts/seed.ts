
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from '../lib/db/schema';
import { getDatabaseConfig } from '../lib/db/config';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// ============================================================================ 
// SEED DATA
// ============================================================================ 

const ROLES = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Super Admin', description: 'Full system access with all permissions including user and role management' },
  { id: '00000000-0000-0000-0000-000000000002', name: 'HR Manager', description: 'Manage employees, projects, assignments, and documents with full CRUD access' },
  { id: '00000000-0000-0000-0000-000000000003', name: 'HR Staff', description: 'Create, view, and edit employee information without delete permissions' },
  { id: '00000000-0000-0000-0000-000000000004', name: 'Viewer', description: 'Read-only access to employee and project data for reporting purposes' },
];

const PERMISSIONS = [
  // User Management
  { name: 'users.create', description: 'Create new users in the system', resource: 'users', action: 'create' },
  { name: 'users.read', description: 'View user information and profiles', resource: 'users', action: 'read' },
  { name: 'users.update', description: 'Update user information and settings', resource: 'users', action: 'update' },
  { name: 'users.delete', description: 'Delete users from the system', resource: 'users', action: 'delete' },
  { name: 'users.activate', description: 'Activate or deactivate user accounts', resource: 'users', action: 'activate' },
  { name: 'users.assign_role', description: 'Assign roles to users', resource: 'users', action: 'assign_role' },
  { name: 'users.update_password', description: 'Update a user/s password', resource: 'users', action: 'update_password' },
  { name: 'users.share', description: 'Share user credentials or access information', resource: 'users', action: 'share' },
  { name: 'users.generate_signup_code', description: 'Generate signup codes for inviting new users', resource: 'users', action: 'generate_signup_code' },
  { name: 'users.read_signup_codes', description: 'View all generated signup codes', resource: 'users', action: 'read_signup_codes' },
  { name: 'users.update_signup_code', description: 'Update a signup code, e.g., to mark it as used', resource: 'users', action: 'update_signup_code' },
  { name: 'users.delete_signup_code', description: 'Delete an unused signup code', resource: 'users', action: 'delete_signup_code' },
  { name: 'users.send_verification_email', description: 'Send a verification email to a user', resource: 'users', action: 'send_verification_email' },

  // Role Management
  { name: 'roles.create', description: 'Create new roles', resource: 'roles', action: 'create' },
  { name: 'roles.read', description: 'View role information and permissions', resource: 'roles', action: 'read' },
  { name: 'roles.update', description: 'Update role information', resource: 'roles', action: 'update' },
  { name: 'roles.delete', description: 'Delete roles from the system', resource: 'roles', action: 'delete' },
  { name: 'roles.assign_permissions', description: 'Assign permissions to roles', resource: 'roles', action: 'assign_permissions' },

  // Employee Management
  { name: 'employees.create', description: 'Create new employee records', resource: 'employees', action: 'create' },
  { name: 'employees.read', description: 'View employee information', resource: 'employees', action: 'read' },
  { name: 'employees.update', description: 'Update employee information', resource: 'employees', action: 'update' },
  { name: 'employees.delete', description: 'Delete employee records', resource: 'employees', action: 'delete' },
  { name: 'employees.deactivate', description: 'Deactivate employee records', resource: 'employees', action: 'deactivate' },

  // Project Management
  { name: 'projects.create', description: 'Create new construction projects', resource: 'projects', action: 'create' },
  { name: 'projects.read', description: 'View project information', resource: 'projects', action: 'read' },
  { name: 'projects.update', description: 'Update project information', resource: 'projects', action: 'update' },
  { name: 'projects.delete', description: 'Delete projects', resource: 'projects', action: 'delete' },

  // Assignment Management
  { name: 'assignments.create', description: 'Create employee-project assignments', resource: 'assignments', action: 'create' },
  { name: 'assignments.read', description: 'View assignment information', resource: 'assignments', action: 'read' },
  { name: 'assignments.update', description: 'Update assignment information', resource: 'assignments', action: 'update' },
  { name: 'assignments.delete', description: 'Delete assignments', resource: 'assignments', action: 'delete' },

  // Document Management
  { name: 'documents.create', description: 'Upload employee documents', resource: 'documents', action: 'create' },
  { name: 'documents.read', description: 'View and download documents', resource: 'documents', action: 'read' },
  { name: 'documents.update', description: 'Update document information', resource: 'documents', action: 'update' },
  { name: 'documents.delete', description: 'Delete documents', resource: 'documents', action: 'delete' },

  // Document Request Management
  { name: 'document_requests.create', description: 'Create new document request threads', resource: 'document_requests', action: 'create' },
  { name: 'document_requests.read', description: 'Read document request threads and messages', resource: 'document_requests', action: 'read' },
  { name: 'document_requests.reply', description: 'Reply to document request threads', resource: 'document_requests', action: 'reply' },
  { name: 'document_requests.close', description: 'Close or reopen document request threads', resource: 'document_requests', action: 'close' },
  { name: 'document_requests.review', description: 'Review and approve/reject submitted documents', resource: 'document_requests', action: 'review' },


  // Dashboard and Analytics
  { name: 'dashboard.view', description: 'View dashboard and home page', resource: 'dashboard', action: 'view' },
  { name: 'dashboard.export', description: 'Export reports to various formats', resource: 'dashboard', action: 'export' },
  
  // Reports and Analytics
  { name: 'reports.view', description: 'View reports and analytics dashboards', resource: 'reports', action: 'read' },
  { name: 'reports.export', description: 'Export reports to various formats', resource: 'reports', action: 'export' },
];

const DOCUMENT_REQUEST_TASKS = [
    { nombre: 'Copia de DNI', descripcion: 'Presentar una copia escaneada del Documento Nacional de Identidad.' },
    { nombre: 'Constancia de CUIL', descripcion: 'Presentar la constancia de CUIL actualizada.' },
    { nombre: 'Certificado de Antecedentes Penales', descripcion: 'Presentar el certificado de antecedentes penales con una antigüedad no mayor a 6 meses.' },
    { nombre: 'Título Secundario', descripcion: 'Presentar una copia del título secundario o analítico.' },
    { nombre: 'Examen Preocupacional', descripcion: 'Presentar el apto médico del examen preocupacional.' },
];

const main = async () => {
  console.log('🌱 Starting database seed...');

  const { primaryUrl, fallbackUrl } = getDatabaseConfig();
  const connectionString = primaryUrl || fallbackUrl;

  if (!connectionString) {
    throw new Error('No database connection string available for seeding.');
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  try {
    await db.transaction(async (tx) => {
      // 1. Seed Roles
      console.log('Seeding roles...');
      await tx.insert(schema.roles).values(ROLES).onConflictDoUpdate({
        target: schema.roles.id,
        set: {
          name: sql`EXCLUDED.name`,
          description: sql`EXCLUDED.description`,
          updatedAt: new Date(),
        }
      });

      // 2. Seed Permissions
      console.log('Seeding permissions...');
      const insertedPermissions = await tx.insert(schema.permissions).values(PERMISSIONS).onConflictDoUpdate({
        target: schema.permissions.name,
        set: {
          description: sql`EXCLUDED.description`,
          resource: sql`EXCLUDED.resource`,
          action: sql`EXCLUDED.action`,
        }
      }).returning();

      // 3. Seed Role-Permission Mappings
      console.log('Seeding role-permission mappings...');
      const superAdminRoleId = '00000000-0000-0000-0000-000000000001';
      const hrManagerRoleId = '00000000-0000-0000-0000-000000000002';
      const hrStaffRoleId = '00000000-0000-0000-0000-000000000003';
      const viewerRoleId = '00000000-0000-0000-0000-000000000004';

      const superAdminPermissions = insertedPermissions.map(p => ({ roleId: superAdminRoleId, permissionId: p.id }));
      const hrManagerPermissions = insertedPermissions.filter(p => ['employees', 'projects', 'assignments', 'documents', 'reports', 'document_requests'].includes(p.resource)).map(p => ({ roleId: hrManagerRoleId, permissionId: p.id }));
      const hrStaffPermissions = insertedPermissions.filter(p => ['employees', 'projects', 'assignments', 'documents', 'reports'].includes(p.resource) && ['create', 'read', 'update'].includes(p.action)).map(p => ({ roleId: hrStaffRoleId, permissionId: p.id }));
      const viewerPermissions = insertedPermissions.filter(p => p.action === 'read').map(p => ({ roleId: viewerRoleId, permissionId: p.id }));

      const allRolePermissions = [
        ...superAdminPermissions,
        ...hrManagerPermissions,
        ...hrStaffPermissions,
        ...viewerPermissions,
      ];
      
      await tx.insert(schema.rolePermissions).values(allRolePermissions).onConflictDoNothing();

      // 4. Seed Document Request Tasks
      console.log('Seeding document request tasks...');
      await tx.insert(schema.tareasSolicitudDocumento).values(DOCUMENT_REQUEST_TASKS).onConflictDoNothing();

      // 5. Seed Default Admin User
      console.log('Seeding default admin user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await tx.insert(schema.users).values({
        id: '8a796910-3963-44e3-98a9-58566a6117d4',
        email: 'admin@example.com',
        name: 'Admin User',
        hashedPassword,
        isActive: true,
        roleId: superAdminRoleId,
        verifiedAt: new Date(),
      }).onConflictDoUpdate({
        target: schema.users.id,
        set: {
          email: 'admin@example.com',
          name: 'Admin User',
          hashedPassword,
          isActive: true,
          roleId: superAdminRoleId,
          updatedAt: new Date(),
        }
      });
    });

    console.log('✅ Database seed successful!');
  } catch (error) {
    console.error('❌ Database seed failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

main();
