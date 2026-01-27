import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { getDatabaseConfig } from './lib/db/config';

dotenv.config({
  path: '.env',
});

const { primaryUrl, fallbackUrl } = getDatabaseConfig();
const connectionString = primaryUrl || fallbackUrl;

if (!connectionString) {
  throw new Error('No database connection string available');
}

export default {
  schema: './lib/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
} satisfies Config;