
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema';
import { checkDbHealth } from './health';

const CACHE_TTL = 30000; // 30 seconds

interface DbClient {
  getInstance: () => Promise<NodePgDatabase<typeof schema>>;
}

interface HealthCache {
  isHealthy: boolean;
  lastChecked: number;
}

const createDbClient = (): DbClient => {
  let db: NodePgDatabase<typeof schema> | null = null;
  let activeClient: Client | null = null;
  let isUsingFallback = false;

  const healthCache: HealthCache = {
    isHealthy: true,
    lastChecked: 0,
  };

  const getPrimaryUrl = () => process.env.DATABASE_URL;
  const getFallbackUrl = () => process.env.FALLBACK_DATABASE_URL;

  const connect = async (url: string, type: 'primary' | 'fallback'): Promise<Client | null> => {
    const newClient = new Client({ connectionString: url });
    try {
      await newClient.connect();
      console.log(`Successfully connected to ${type} database.`);
      return newClient;
    } catch (error) {
      console.error(`Failed to connect to ${type} database:`, error instanceof Error ? error.message : error);
      await newClient.end();
      return null;
    }
  };

  const determineConnection = async (): Promise<Client | null> => {
    const now = Date.now();
    const primaryUrl = getPrimaryUrl();

    // Invalidate client if it exists but is unhealthy
    if (activeClient) {
        try {
            await activeClient.query('SELECT 1');
        } catch {
            console.warn('Active database connection lost. Re-evaluating connection.');
            await activeClient.end();
            activeClient = null;
            db = null;
        }
    }
    
    // Check primary health status, using cache if valid
    if (now - healthCache.lastChecked > CACHE_TTL) {
      healthCache.isHealthy = primaryUrl ? await checkDbHealth(primaryUrl) : false;
      healthCache.lastChecked = now;
    }

    // Connect to primary if healthy and not already on fallback
    if (healthCache.isHealthy && !isUsingFallback && primaryUrl) {
        if (!activeClient) { // Connect only if there's no active client
            activeClient = await connect(primaryUrl, 'primary');
        }
    }

    // If primary is unhealthy or unavailable, switch to fallback
    if (!healthCache.isHealthy) {
        const fallbackUrl = getFallbackUrl();
        if (!fallbackUrl) {
            throw new Error('Primary database is down and no FALLBACK_DATABASE_URL is provided.');
        }
        if (!isUsingFallback) {
            console.warn('Primary database is unhealthy. Switching to fallback.');
            if (activeClient) await activeClient.end();
            activeClient = await connect(fallbackUrl, 'fallback');
            isUsingFallback = true;
        } else if (!activeClient) { // If already on fallback but client is down
            activeClient = await connect(fallbackUrl, 'fallback');
        }
    }
    
    // If we were on fallback, but primary is healthy again, switch back
    if(isUsingFallback && healthCache.isHealthy) {
        const primaryUrl = getPrimaryUrl();
        if (primaryUrl) {
            console.log("Primary database is healthy again. Switching back from fallback.");
            if(activeClient) await activeClient.end();
            activeClient = await connect(primaryUrl, 'primary');
            isUsingFallback = false;
        }
    }
    
    return activeClient;
  };

  const getInstance = async (): Promise<NodePgDatabase<typeof schema>> => {
    const client = await determineConnection();
    if (!client) {
      throw new Error('Unable to establish a connection with any database.');
    }
    // Create new drizzle instance only if the client has changed
    if (!db || activeClient !== client) {
        db = drizzle(client, { schema });
    }

    return db;
  };

  return { getInstance };
};

const dbClient = createDbClient();

export const getDb = dbClient.getInstance;
