import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';
import { logger } from '../server/utils/logger';

dotenv.config();

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    logger.error('DATABASE_URL is not set');
    process.exit(1);
  }

  logger.info('Starting database migration...');

  try {
    const connectionOptions = process.env.DATABASE_URL.includes('localhost') 
      ? {} 
      : { ssl: 'require' as any };
    
    const client = postgres(process.env.DATABASE_URL, {
      ...connectionOptions,
      max: 1 // Use single connection for migrations
    });
    
    const db = drizzle(client);

    logger.info('Running migrations...');
    await migrate(db, { migrationsFolder: './migrations' });
    logger.info('Migrations completed successfully');

    await client.end();
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed', { error: (error as Error).message });
    process.exit(1);
  }
}

runMigrations();