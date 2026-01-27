/**
 * Database configuration based on environment variables
 */

export interface DatabaseConfig {
    driver: 'supabase' | 'postgresql';
    primaryUrl: string | null;
    fallbackUrl: string | null;
    useSupabase: boolean;
  }
  
  export function getDatabaseConfig(): DatabaseConfig {
    const driver = (process.env.DB_DRIVER || 'supabase') as 'supabase' | 'postgresql';
    const useSupabase = driver === 'supabase';
  
    // Primary connection (Supabase or direct PostgreSQL)
    const primaryUrl = process.env.DATABASE_URL || null;
  
    // Fallback connection (local PostgreSQL)
    const fallbackUrl = buildFallbackUrl();
  
    if (!primaryUrl && !fallbackUrl) {
      throw new Error('No database connection configured. Set DATABASE_URL or POSTGRES_* variables.');
    }
  
    return {
      driver,
      primaryUrl,
      fallbackUrl,
      useSupabase,
    };
  }
  
  function buildFallbackUrl(): string | null {
    const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = process.env;
  
    if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB) {
      return null;
    }
  
    // Local Docker PostgreSQL
    return `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}`;
  }
  
  export function getRedisUrl(): string {
    return process.env.REDIS_URL || 'redis://localhost:6379';
  }
  
  export function getJWTSecret(): string {
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      throw new Error('JWT_SECRET is not set in environment variables');
    }
  
    if (secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }
  
    return secret;
  }
  
  export function getSupabaseConfig() {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKey: process.env.SUPABASE_SERVICE_KEY,
      jwtSecret: process.env.SUPABASE_JWT_SECRET,
    };
  }