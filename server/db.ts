import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

let db: any;

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set - database operations will fail');
  // Create a dummy client for development/testing
  const dummyClient = {} as any;
  db = drizzle(dummyClient, { schema });
} else {
  const connectionOptions = process.env.DATABASE_URL.includes('localhost') 
    ? {} 
    : { ssl: 'require' };
  
  const client = postgres(process.env.DATABASE_URL, connectionOptions);
  db = drizzle(client, { schema });
}

export { db };