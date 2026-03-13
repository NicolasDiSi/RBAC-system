-- ============================================================================
-- DATABASE TEARDOWN SCRIPT
-- ============================================================================
-- ⚠️  WARNING: THIS SCRIPT WILL DELETE ALL DATA ⚠️
-- Description: Drops all tables and data for clean reinstall
-- Usage: Only use in development/testing environments
-- NEVER run this in production without proper backups!
-- ============================================================================

-- ============================================================================
-- SAFETY CHECK: Prevent accidental execution in production
-- ============================================================================
DO $$
BEGIN
  -- Uncomment and modify this check for your production database name
  IF current_database() IN ('production', 'prod', 'main') THEN
    RAISE EXCEPTION 'SAFETY CHECK FAILED: Cannot run teardown script in production database "%"', current_database();
  END IF;
  
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '⚠️  WARNING: TEARDOWN SCRIPT STARTING';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Database: %', current_database();
  RAISE NOTICE 'This will delete ALL tables and data!';
  RAISE NOTICE 'Press Ctrl+C within 5 seconds to cancel...';
  RAISE NOTICE '============================================================================';
  
  -- 5 second delay to allow cancellation
  PERFORM pg_sleep(5);
END $$;

-- ============================================================================
-- DROP TABLES: Remove all tables in reverse dependency order
-- ============================================================================
BEGIN;

-- Drop business tables first (they depend on RBAC tables)
DROP TABLE IF EXISTS historial_relacion_laboral CASCADE;
DROP TABLE IF EXISTS documentos CASCADE;
DROP TABLE IF EXISTS asignaciones_contratos CASCADE;
DROP TABLE IF EXISTS obras CASCADE;
DROP TABLE IF EXISTS empleados CASCADE;

-- Drop RBAC tables
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

COMMIT;

-- ============================================================================
-- VERIFICATION: Confirm all tables are dropped
-- ============================================================================
DO $$
DECLARE
  remaining_tables INT;
BEGIN
  SELECT COUNT(*) INTO remaining_tables
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
  
  IF remaining_tables = 0 THEN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '✓ Teardown completed successfully';
    RAISE NOTICE '  All tables have been dropped';
    RAISE NOTICE '  Database is now empty and ready for fresh setup';
    RAISE NOTICE '============================================================================';
  ELSE
    RAISE WARNING 'Some tables still remain: %', remaining_tables;
  END IF;
END $$;
