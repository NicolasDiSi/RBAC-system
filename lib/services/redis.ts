import { Redis } from 'ioredis';
import { checkRedisHealth } from '@/lib/db/health';
import { getRedisUrl } from '@/lib/db/config';

const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

class RedisManager {
  private client: Redis | null = null;
  private isHealthy = true;
  private lastHealthCheck = 0;
  private redisUrl = getRedisUrl();

  async getClient(): Promise<Redis> {
    if (this.client && this.isHealthy) {
      await this.performPeriodicHealthCheck();
      return this.client;
    }

    await this.initializeClient();
    return this.client!;
  }

  private async initializeClient() {
    if (!this.client) {
      await this.connect();
    }
  }

  private async connect(): Promise<void> {
    try {
      console.log('🔌 Connecting to Redis...');
      
      this.client = new Redis(this.redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            console.error('❌ Redis max retries exceeded');
            return null;
          }
          const delay = Math.min(times * 200, 2000);
          console.log(`⏳ Redis retry attempt ${times} in ${delay}ms`);
          return delay;
        },
        reconnectOnError: (err) => {
          console.error('❌ Redis connection error:', err.message);
          return true;
        },
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis error:', err.message);
        this.isHealthy = false;
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isHealthy = true;
      });

      this.client.on('ready', () => {
        console.log('✅ Redis ready');
      });

      this.client.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });

      // Verify connection
      const healthResult = await checkRedisHealth(this.client);
      this.isHealthy = healthResult.isHealthy;
      
      if (!healthResult.isHealthy) {
        throw new Error(`Redis health check failed: ${healthResult.error}`);
      }

      this.lastHealthCheck = Date.now();
      
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
      this.client = null;
      this.isHealthy = false;
      throw error;
    }
  }

  private async performPeriodicHealthCheck() {
    const now = Date.now();
    
    if (now - this.lastHealthCheck < HEALTH_CHECK_INTERVAL) {
      return;
    }

    if (!this.client) return;

    const healthResult = await checkRedisHealth(this.client);
    this.isHealthy = healthResult.isHealthy;
    this.lastHealthCheck = now;

    if (!healthResult.isHealthy) {
      console.warn('⚠️  Redis health check failed, attempting reconnection...');
      await this.connect();
    }
  }

  async shutdown() {
    if (this.client) {
      console.log('🛑 Shutting down Redis connection...');
      await this.client.quit();
      this.client = null;
    }
  }
}

const redisManager = new RedisManager();

export const getRedisClient = async (): Promise<Redis> => {
  return redisManager.getClient();
};

// Cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    await redisManager.shutdown();
  });

  process.on('SIGINT', async () => {
    await redisManager.shutdown();
  });
}

// Legacy export for backward compatibility (throws error to force migration)
const redis = new Proxy({} as Redis, {
  get: () => {
    throw new Error('Direct redis access is deprecated. Use getRedisClient() instead.');
  },
});

export default redis;