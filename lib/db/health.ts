import { Client } from 'pg';

const HEALTH_CHECK_TIMEOUT = 3000; // 3 seconds

/**
 * Performs a health check on a PostgreSQL database connection.
 * @param connectionString - The database connection string.
 * @returns A promise that resolves to true if the connection is healthy, false otherwise.
 */
export const checkDbHealth = async (connectionString: string): Promise<boolean> => {
  if (!connectionString || typeof connectionString !== 'string') {
    console.error('Health check failed: Connection string is invalid or missing.');
    return false;
  }
  
  let client: Client;
  try {
    client = new Client({ connectionString });
  } catch (error) {
    console.error(`Health check failed: Could not create DB client. Check if the connection string is a valid URL.`, error);
    return false;
  }

  try {
    const timeoutPromise = new Promise<boolean>((_, reject) =>
      setTimeout(() => {
        reject(new Error(`Database health check timed out after ${HEALTH_CHECK_TIMEOUT}ms`));
      }, HEALTH_CHECK_TIMEOUT)
    );

    const connectAndQuery = async () => {
      await client.connect();
      await client.query('SELECT 1');
      return true;
    };

    return await Promise.race([connectAndQuery(), timeoutPromise]);
  } catch (error) {
    if (error instanceof Error) {
        // Log only the error message to avoid printing sensitive connection details
        console.error(`Health check failed: ${error.message}`);
    } else {
        console.error('An unknown error occurred during health check.');
    }
    return false;
  } finally {
    if (client) {
      await client.end();
    }
  }
};