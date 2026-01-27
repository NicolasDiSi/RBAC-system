import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { checkDbHealth } from './health';
import { getDatabaseConfig } from './config';

const HEALTH_CHECK_INTERVAL = 60000; // 30 seconds
const CONNECTION_TIMEOUT = 10000; // 10 seconds
const RECONNECT_COOLDOWN = 5000; // 5 seconds

interface DatabaseConnection {
  pool: Pool;
  db: NodePgDatabase<typeof schema>;
  type: 'primary' | 'fallback';
  isHealthy: boolean;
}

class DatabaseManager {
  private connection: DatabaseConnection | null = null;
  private initializationPromise: Promise<void> | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private lastConnectionAttempt = 0;
  private lastError: Error | null = null;
  private config = getDatabaseConfig();

  async getDb(): Promise<NodePgDatabase<typeof schema>> {
    // Ensure only one initialization happens at a time
    if (this.initializationPromise) {
      try {
        await this.initializationPromise;
      } catch (e) {
        // Ignore error here, handled by cooldown check below
      }
    }

    if (!this.connection || !this.connection.isHealthy) {
      const now = Date.now();
      
      if (now - this.lastConnectionAttempt < RECONNECT_COOLDOWN) {
        throw new Error(`Database unavailable. Retrying in ${Math.ceil((RECONNECT_COOLDOWN - (now - this.lastConnectionAttempt)) / 1000)}s. Last error: ${this.lastError?.message}`);
      }

      if (!this.initializationPromise) {
        this.lastConnectionAttempt = now;
        this.initializationPromise = this.initializeConnection()
          .then(() => {
            this.initializationPromise = null;
            this.lastError = null;
          })
          .catch((err) => {
            this.initializationPromise = null;
            this.lastError = err;
            this.lastConnectionAttempt = Date.now(); // Start cooldown from failure time
            throw err;
          });
      }
      await this.initializationPromise;
    }

    if (!this.connection) {
      throw new Error('Failed to establish database connection');
    }

    return this.connection.db;
  }

  private async initializeConnection(): Promise<void> {
    // Stop existing health check loop during initialization
    this.stopHealthCheckLoop();

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
        this.startHealthCheckLoop();
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
        this.startHealthCheckLoop();
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

    // Passive health check: Listen for errors on idle clients
    pool.on('error', (err) => {
      console.error('❌ Unexpected error on idle client', err);
      if (this.connection && this.connection.pool === pool) {
        this.connection.isHealthy = false;
      }
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
      isHealthy: true,
    };

    console.log(`✅ Database connection established (${type})`);
  }

  private startHealthCheckLoop() {
    if (this.healthCheckInterval) return;

    this.healthCheckInterval = setInterval(async () => {
      await this.performBackgroundHealthCheck();
    }, HEALTH_CHECK_INTERVAL);
  }

  private stopHealthCheckLoop() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  private async performBackgroundHealthCheck(): Promise<void> {
    if (!this.connection) return;

    try {
      // Quick health check using existing pool
      const client = await this.connection.pool.connect();
      await client.query('SELECT 1');
      client.release();
      
      // If we're on fallback and primary might be back, check primary
      if (this.connection.type === 'fallback') {
        await this.checkPrimaryRecovery();
      }
    } catch (error) {
      console.error('❌ Database health check failed:', error instanceof Error ? error.message : error);
      this.connection.isHealthy = false;
      
      // We don't automatically trigger initializeConnection here to avoid race conditions with getDb
      // The next getDb call will see isHealthy=false and trigger initialization.
    }
  }

  private async checkPrimaryRecovery(): Promise<void> {
    const { primaryUrl } = this.config;
    if (!primaryUrl) return;

    const healthResult = await checkDbHealth(primaryUrl);
    
    if (healthResult.isHealthy) {
      console.log('🔄 Primary database recovered, switching back...');
      
      try {
        if (!this.initializationPromise) {
          this.initializationPromise = this.initializeConnection()
            .finally(() => {
              this.initializationPromise = null;
            });
          await this.initializationPromise;
        }
      } catch (e) {
        console.error("Failed to switch back to primary", e);
      }
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
    this.stopHealthCheckLoop();
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