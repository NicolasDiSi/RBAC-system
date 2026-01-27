import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { checkDbHealth } from './health';
import { getDatabaseConfig } from './config';

const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const CONNECTION_TIMEOUT = 10000; // 10 seconds

interface DatabaseConnection {
  pool: Pool;
  db: NodePgDatabase<typeof schema>;
  type: 'primary' | 'fallback';
  lastHealthCheck: number;
  isHealthy: boolean;
}

class DatabaseManager {
  private connection: DatabaseConnection | null = null;
  private initializationPromise: Promise<void> | null = null;
  private config = getDatabaseConfig();

  async getDb(): Promise<NodePgDatabase<typeof schema>> {
    // Ensure only one initialization happens at a time
    if (this.initializationPromise) {
      await this.initializationPromise;
    }

    if (!this.connection || !this.connection.isHealthy) {
      this.initializationPromise = this.initializeConnection();
      await this.initializationPromise;
      this.initializationPromise = null;
    } else {
      // Periodic health check
      await this.performPeriodicHealthCheck();
    }

    if (!this.connection) {
      throw new Error('Failed to establish database connection');
    }

    return this.connection.db;
  }

  private async initializeConnection(): Promise<void> {
    const { primaryUrl, fallbackUrl } = this.config;

    console.log(`🔍 DB Driver: ${this.config.driver}`);
    console.log(`🔍 Using Supabase: ${this.config.useSupabase}`);

    // Try primary first
    if (primaryUrl) {
      console.log('🔌 Attempting primary database connection...');
      const primaryHealth = await checkDbHealth(primaryUrl);
      
      if (primaryHealth.isHealthy) {
        console.log(`✅ Primary DB healthy (latency: ${primaryHealth.latency}ms)`);
        await this.createConnection(primaryUrl, 'primary');
        return;
      } else {
        console.warn(`⚠️  Primary DB unhealthy: ${primaryHealth.error}`);
      }
    }

    // Fallback to local PostgreSQL
    if (fallbackUrl) {
      console.log('🔌 Attempting fallback database connection...');
      const fallbackHealth = await checkDbHealth(fallbackUrl);
      
      if (fallbackHealth.isHealthy) {
        console.log(`✅ Using fallback DB (latency: ${fallbackHealth.latency}ms)`);
        await this.createConnection(fallbackUrl, 'fallback');
        return;
      } else {
        console.error(`❌ Fallback DB also unhealthy: ${fallbackHealth.error}`);
      }
    }

    throw new Error('All database connections failed health checks');
  }

  private async createConnection(
    connectionString: string,
    type: 'primary' | 'fallback'
  ): Promise<void> {
    // Close existing connection if any
    if (this.connection) {
      await this.closeConnection();
    }

    const pool = new Pool({
      connectionString,
      max: 20, // Maximum pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: CONNECTION_TIMEOUT,
      ssl: connectionString.includes('supabase') ? { rejectUnauthorized: false } : false,
    });

    // Test the connection
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
    } catch (error) {
      await pool.end();
      throw new Error(`Failed to connect to ${type} database: ${error instanceof Error ? error.message : error}`);
    }

    // Create Drizzle instance
    const db = drizzle(pool, { schema });

    this.connection = {
      pool,
      db,
      type,
      lastHealthCheck: Date.now(),
      isHealthy: true,
    };

    console.log(`✅ Database connection established (${type})`);
  }

  private async performPeriodicHealthCheck(): Promise<void> {
    if (!this.connection) return;

    const now = Date.now();
    const timeSinceLastCheck = now - this.connection.lastHealthCheck;

    if (timeSinceLastCheck < HEALTH_CHECK_INTERVAL) {
      return; // Not time for a check yet
    }

    try {
      // Quick health check using existing pool
      const client = await this.connection.pool.connect();
      await client.query('SELECT 1');
      client.release();
      
      this.connection.lastHealthCheck = now;
      this.connection.isHealthy = true;

      // If we're on fallback and primary might be back, check primary
      if (this.connection.type === 'fallback') {
        await this.checkPrimaryRecovery();
      }
    } catch (error) {
      console.error('❌ Database health check failed:', error instanceof Error ? error.message : error);
      this.connection.isHealthy = false;
      
      // Trigger reconnection
      await this.initializeConnection();
    }
  }

  private async checkPrimaryRecovery(): Promise<void> {
    const { primaryUrl } = this.config;
    if (!primaryUrl) return;

    const healthResult = await checkDbHealth(primaryUrl);
    
    if (healthResult.isHealthy) {
      console.log('🔄 Primary database recovered, switching back...');
      await this.createConnection(primaryUrl, 'primary');
    }
  }

  private async closeConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.pool.end();
      this.connection = null;
    }
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down database connections...');
    await this.closeConnection();
  }
}

const dbManager = new DatabaseManager();

export const getDb = () => dbManager.getDb();

// Cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    await dbManager.shutdown();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    await dbManager.shutdown();
    process.exit(0);
  });
}