import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from '../shared/schema.js';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://nollycrew:nollycrew123@localhost:5433/nollycrew';

const pool = new Pool({ connectionString: databaseUrl });
const db = drizzle(pool, { schema });

export { db };