-- ============================================================================
-- MASTER DATABASE SETUP SCRIPT
-- ============================================================================
-- Description: Orchestrates the complete database setup process
-- Usage: Run this script to set up the entire database from scratch
-- Environment: Can be run in development, staging, or production
-- Idempotent: Yes - safe to run multiple times
-- ============================================================================

-- ============================================================================
-- ENVIRONMENT CONFIGURATION
-- ============================================================================
-- Set client encoding and timezone
SET client_encoding = 'UTF8';
SET timezone = 'UTC';

-- Display current database information
DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'HR RBAC System - Database Setup';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Database: %', current_database();
  RAISE NOTICE 'User: %', current_user;
  RAISE NOTICE 'Timestamp: %', NOW();
  RAISE NOTICE '============================================================================';
END $$;

-- ============================================================================
-- SAFETY CHECK: Confirm before proceeding in production
-- ============================================================================
-- Uncomment the following block to require manual confirmation in production
/*
DO $$
BEGIN
  IF current_database() = 'production_db_name' THEN
    RAISE EXCEPTION 'SAFETY CHECK: This appears to be a production database. Please review the script carefully before proceeding.';
  END IF;
END $$;
*/

-- ============================================================================
-- STEP 1: Create RBAC Tables (Roles, Users, Permissions)
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'STEP 1: Creating RBAC tables...'
\echo '============================================================================'
\i scripts/01-create-rbac-tables.sql

-- ============================================================================
-- STEP 2: Create Business Tables (Employees, Projects, etc.)
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'STEP 2: Creating business tables...'
\echo '============================================================================'
\i scripts/02-create-business-tables.sql

-- ============================================================================
-- STEP 2.1: Create Signup Codes Table
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'STEP 2.1: Creating signup_codes table...'
\echo '============================================================================'
\i scripts/07-create-signup-codes-table.sql

-- ============================================================================
-- STEP 2.2: Create Share Tokens Table
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'STEP 2.2: Creating share_tokens table...'
\echo '============================================================================'
\i scripts/08-create-share-tokens-table.sql

-- ============================================================================
-- STEP 3: Seed Initial Data (Roles and Permissions)
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'STEP 3: Seeding initial roles and permissions...'
\echo '============================================================================'
\i scripts/03-seed-roles-permissions.sql

-- ============================================================================
-- STEP 4: Create Helper Functions
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'STEP 4: Creating helper functions for RLS...'
\echo '============================================================================'
\i scripts/04-create-helper-functions.sql

-- ============================================================================
-- STEP 5: Setup RLS Policies
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'STEP 5: Setting up Row-Level Security (RLS) policies...'
\echo '============================================================================'
\i scripts/05-setup-rls-policies.sql

-- ============================================================================
-- STEP 6: FINAL VERIFICATION: Database Health Check
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'STEP 6: FINAL VERIFICATION: Database Health Check'
\echo '============================================================================'

DO $$
DECLARE
  table_count INT;
  index_count INT;
  trigger_count INT;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
  
  -- Count indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public';
  
  -- Count triggers
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE trigger_schema = 'public';
  
  RAISE NOTICE 'Database setup completed successfully!';
  RAISE NOTICE '  - Tables created: %', table_count;
  RAISE NOTICE '  - Indexes created: %', index_count;
  RAISE NOTICE '  - Triggers created: %', trigger_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Configure your application environment variables';
  RAISE NOTICE '  2. Set up Google OAuth credentials';
  RAISE NOTICE '  3. Create your first Super Admin user';
  RAISE NOTICE '  4. Test the authentication flow';
END $$;

-- ============================================================================
-- TABLE LISTING: Show all created tables
-- ============================================================================
\echo ''
\echo 'Created tables:'
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
