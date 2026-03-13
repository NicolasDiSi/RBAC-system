# Database Setup Scripts

This directory contains SQL scripts for setting up and managing the HR RBAC System database.

## 📋 Script Overview

| Script | Purpose | Dependencies | Idempotent |
|--------|---------|--------------|------------|
| `00-master-setup.sql` | Master script that runs all setup scripts in order | None | ✅ Yes |
| `01-create-rbac-tables.sql` | Creates authentication and authorization tables | None | ✅ Yes |
| `02-create-business-tables.sql` | Creates HR management business tables | Script 01 | ✅ Yes |
| `03-seed-roles-permissions.sql` | Seeds initial roles and permissions | Scripts 01-02 | ✅ Yes |
| `99-teardown.sql` | ⚠️ Drops all tables (development only) | None | ✅ Yes |

## 🚀 Quick Start

### Option 1: Run Master Setup (Recommended)

The master setup script runs all scripts in the correct order:

\`\`\`bash
psql $DATABASE_URL -f scripts/00-master-setup.sql
\`\`\`

### Option 2: Run Individual Scripts

Run scripts in order if you need more control:

\`\`\`bash
# Step 1: Create RBAC tables
psql $DATABASE_URL -f scripts/01-create-rbac-tables.sql

# Step 2: Create business tables
psql $DATABASE_URL -f scripts/02-create-business-tables.sql

# Step 3: Seed initial data
psql $DATABASE_URL -f scripts/03-seed-roles-permissions.sql
\`\`\`

## 🔒 Idempotency

All scripts are **idempotent** - they can be run multiple times safely:

- Tables use `CREATE TABLE IF NOT EXISTS`
- Indexes use `CREATE INDEX IF NOT EXISTS`
- Seed data uses `ON CONFLICT` clauses to prevent duplicates
- Triggers are dropped and recreated to ensure consistency

## 🌍 Environment Support

### Development
\`\`\`bash
# Run master setup
psql $DEV_DATABASE_URL -f scripts/00-master-setup.sql

# Or run teardown + setup for fresh start
psql $DEV_DATABASE_URL -f scripts/99-teardown.sql
psql $DEV_DATABASE_URL -f scripts/00-master-setup.sql
\`\`\`

### Staging
\`\`\`bash
# Run master setup (safe to run multiple times)
psql $STAGING_DATABASE_URL -f scripts/00-master-setup.sql
\`\`\`

### Production
\`\`\`bash
# ⚠️ IMPORTANT: Review scripts carefully before running in production
# ⚠️ Ensure you have proper backups
# ⚠️ Test in staging first

psql $PRODUCTION_DATABASE_URL -f scripts/00-master-setup.sql
\`\`\`

## 🗃️ Database Schema

### RBAC Tables
- **roles** - User roles (Super Admin, HR Manager, HR Staff, Viewer)
- **users** - User accounts with Google OAuth integration
- **permissions** - Granular permissions (resource.action format)
- **role_permissions** - Many-to-many mapping of roles to permissions

### Business Tables
- **empleados** - Employee records with personal and employment info
- **obras** - Construction project information
- **asignaciones_contratos** - Employee-project assignments
- **documentos** - Employee document metadata
- **historial_relacion_laboral** - Employment history audit trail

## 🔐 Default Roles & Permissions

The seed script creates 4 default roles:

| Role | Permissions | Use Case |
|------|-------------|----------|
| **Super Admin** | All permissions | System administrators |
| **HR Manager** | Full CRUD on business resources | HR department managers |
| **HR Staff** | Create, Read, Update (no Delete) | HR department staff |
| **Viewer** | Read-only access | Reporting and analytics users |

## ⚠️ Teardown Script

The `99-teardown.sql` script **DELETES ALL DATA**. Use with extreme caution:

\`\`\`bash
# ⚠️ Only use in development!
psql $DEV_DATABASE_URL -f scripts/99-teardown.sql
\`\`\`

**Safety features:**
- Blocks execution if database name contains 'production', 'prod', or 'main'
- 5-second delay to allow cancellation
- Requires manual confirmation

## 🧪 Testing

### Test in Development
\`\`\`bash
# Fresh setup
psql $DEV_DATABASE_URL -f scripts/99-teardown.sql
psql $DEV_DATABASE_URL -f scripts/00-master-setup.sql

# Verify tables
psql $DEV_DATABASE_URL -c "\dt"

# Verify seed data
psql $DEV_DATABASE_URL -c "SELECT * FROM roles;"
psql $DEV_DATABASE_URL -c "SELECT COUNT(*) FROM permissions;"
\`\`\`

### Test Idempotency
\`\`\`bash
# Run setup twice - should not cause errors
psql $DEV_DATABASE_URL -f scripts/00-master-setup.sql
psql $DEV_DATABASE_URL -f scripts/00-master-setup.sql
\`\`\`

## 📊 Verification Queries

After running setup, verify the database:

\`\`\`sql
-- Check all tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check roles
SELECT * FROM roles;

-- Check permissions count
SELECT COUNT(*) FROM permissions;

-- Check role-permission mappings
SELECT r.name, COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.name;
\`\`\`

## 🐛 Troubleshooting

### Error: "relation does not exist"
- Ensure scripts are run in the correct order
- Check that previous scripts completed successfully

### Error: "duplicate key value violates unique constraint"
- This is expected if running scripts multiple times
- The `ON CONFLICT` clauses handle this gracefully

### Error: "permission denied"
- Ensure your database user has CREATE privileges
- Check connection string and credentials

## 📝 Best Practices

1. **Always backup production** before running any scripts
2. **Test in staging** before deploying to production
3. **Review changes** in version control before executing
4. **Use transactions** - all scripts use BEGIN/COMMIT blocks
5. **Monitor execution** - check NOTICE messages for verification
6. **Document changes** - update this README when adding new scripts

## 🔄 Migration Strategy

For schema changes after initial setup:

1. Create a new migration script: `04-add-feature-name.sql`
2. Make it idempotent with `IF NOT EXISTS` and `ON CONFLICT`
3. Test in development first
4. Update the master setup script to include the new migration
5. Document the changes in this README

## 📞 Support

If you encounter issues:
1. Check the script output for error messages
2. Review the verification queries above
3. Consult the main project documentation
4. Contact the development team
