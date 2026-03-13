import { Client } from 'pg';

const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds (increased from 3)
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface HealthCheckResult {
  isHealthy: boolean;
  latency?: number;
  error?: string;
}

/**
 * Validates a PostgreSQL connection string format
 */
function isValidConnectionString(connectionString: string): boolean {
  if (!connectionString || typeof connectionString !== 'string') {
    return false;
  }
  
  // Check for postgresql:// or postgres:// prefix
  return /^postgres(ql)?:\/\/.+/.test(connectionString);
}

/**
 * Performs a health check on a PostgreSQL database with retry logic
 */
export const checkDbHealth = async (
  connectionString: string,
  retries = MAX_RETRIES
): Promise<HealthCheckResult> => {
  if (!isValidConnectionString(connectionString)) {
    return {
      isHealthy: false,
      error: 'Invalid connection string format'
    };
  }

  let client: Client | null = null;
  const startTime = Date.now();

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      client = new Client({ 
        connectionString,
        connectionTimeoutMillis: HEALTH_CHECK_TIMEOUT 
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Health check timeout')), HEALTH_CHECK_TIMEOUT)
      );

      const connectAndQuery = async () => {
        await client!.connect();
        await client!.query('SELECT 1');
        return true;
      };

      await Promise.race([connectAndQuery(), timeoutPromise]);
      
      const latency = Date.now() - startTime;
      return { isHealthy: true, latency };

    } catch (error) {
      const isLastAttempt = attempt === retries;
      
      if (isLastAttempt) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Health check failed after ${retries} attempts: ${errorMessage}`);
        return { 
          isHealthy: false, 
          error: errorMessage 
        };
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      
    } finally {
      if (client) {
        try {
          await client.end();
        } catch (e) {
          // Ignore errors when closing failed connections
        }
      }
    }
  }

  return { isHealthy: false, error: 'Max retries exceeded' };
};

/**
 * Checks Redis health
 */
export const checkRedisHealth = async (redis: any): Promise<HealthCheckResult> => {
  const startTime = Date.now();
  
  try {
    await Promise.race([
      redis.ping(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis ping timeout')), HEALTH_CHECK_TIMEOUT)
      )
    ]);
    
    const latency = Date.now() - startTime;
    return { isHealthy: true, latency };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Redis health check failed: ${errorMessage}`);
    return { isHealthy: false, error: errorMessage };
  }
};