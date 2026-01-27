
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  uniqueIndex,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { check } from 'drizzle-orm/gel-core';

// RBAC System Tables

export const roles = pgTable(
  'roles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).unique().notNull(),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      nameIndex: uniqueIndex('roles_name_key').on(table.name),
    };
  },
);

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    hashedPassword: text('hashed_password'),
    googleId: varchar('google_id', { length: 255 }).unique(),
    name: varchar('name', { length: 255 }).notNull(),
    avatarUrl: text('avatar_url'),
    isActive: boolean('is_active').default(false),
    roleId: uuid('role_id').references(() => roles.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
  },
  (table) => {
    return {
      emailIndex: index('idx_users_email').on(table.email),
      googleIdIndex: index('idx_users_google_id').on(table.googleId),
      roleIdIndex: index('idx_users_role_id').on(table.roleId),
      isActiveIndex: index('idx_users_is_active').on(table.isActive),
    };
  },
);

export const permissions = pgTable(
  'permissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).unique().notNull(),
    description: text('description'),
    resource: varchar('resource', { length: 100 }).notNull(),
    action: varchar('action', { length: 50 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    nameIndex: uniqueIndex('permissions_name_key').on(table.name),
    resourceIndex: index('idx_permissions_resource').on(table.resource),
    actionIndex: index('idx_permissions_action').on(table.action),
    // Added SQL constraint parity
    chkPermissionName: check('chk_permission_name', sql`${table.name} ~ '^[a-z_]+\.[a-z_]+$'`),
  }),
);

export const rolePermissions = pgTable(
  'role_permissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      uniqueRolePermission: uniqueIndex('unique_role_permission').on(
        table.roleId,
        table.permissionId,
      ),
      roleIdIndex: index('idx_role_permissions_role_id').on(table.roleId),
      permissionIdIndex: index('idx_role_permissions_permission_id').on(table.permissionId),
    };
  },
);

export const signupCodes = pgTable(
  'signup_codes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 6 }).unique().notNull(),
    roleId: uuid('role_id').references(() => roles.id, { onDelete: 'set null' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    isUsed: boolean('is_used').default(false).notNull(),
    usedByUserId: uuid('used_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => {
    return {
      codeIndex: index('idx_signup_codes_code').on(table.code),
    };
  },
);

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    token: varchar('token', { length: 255 }).unique().notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 50 }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    isUsed: boolean('is_used').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => {
    return {
      tokenIndex: index('idx_verification_tokens_token').on(table.token),
      userIdIndex: index('idx_verification_tokens_user_id').on(table.userId),
    };
  },
);

// --- RELATIONS ---

export const usersRelations = relations(users, ({ one, many }) => ({
    role: one(roles, {
      fields: [users.roleId],
      references: [roles.id],
    }),
    verificationTokens: many(verificationTokens),
    signupCodes: many(signupCodes),
  }));
  
  export const rolesRelations = relations(roles, ({ many }) => ({
    users: many(users),
    rolePermissions: many(rolePermissions),
    signupCodes: many(signupCodes),
  }));
  
  export const permissionsRelations = relations(permissions, ({ many }) => ({
    rolePermissions: many(rolePermissions),
  }));
  
  export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  }));
  
  export const signupCodesRelations = relations(signupCodes, ({ one }) => ({
    role: one(roles, {
      fields: [signupCodes.roleId],
      references: [roles.id],
    }),
    usedByUser: one(users, {
      fields: [signupCodes.usedByUserId],
      references: [users.id],
    }),
  }));
  
  export const verificationTokensRelations = relations(verificationTokens, ({ one }) => ({
    user: one(users, {
      fields: [verificationTokens.userId],
      references: [users.id],
    }),
  }));
