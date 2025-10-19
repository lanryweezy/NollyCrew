import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

let db: any;

const databaseUrl = process.env.DATABASE_URL || 'postgresql://nollycrew:nollycrew123@localhost:5433/nollycrew';

const connectionOptions = databaseUrl.includes('localhost') 
  ? {} 
  : { ssl: 'require' as any };

const client = postgres(databaseUrl, connectionOptions);
db = drizzle(client, { schema });

export { db };