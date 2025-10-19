import postgres from 'postgres';
import redis from 'redis';

// Test database connection
console.log('Testing database connection...');
const dbUrl = 'postgresql://nollycrew:nollycrew123@localhost:5433/nollycrew';
const db = postgres(dbUrl);

async function testDatabase() {
  try {
    const result = await db`SELECT version()`;
    console.log('Database connection successful:', result[0].version);
  } catch (error) {
    console.error('Database connection failed:', error.message);
  } finally {
    await db.end();
  }
}

// Test Redis connection
console.log('Testing Redis connection...');
const redisClient = redis.createClient({
  socket: {
    host: 'localhost',
    port: 6380
  }
});

async function testRedis() {
  try {
    await redisClient.connect();
    const result = await redisClient.ping();
    console.log('Redis connection successful:', result);
  } catch (error) {
    console.error('Redis connection failed:', error.message);
  } finally {
    await redisClient.quit();
  }
}

testDatabase().then(() => testRedis());