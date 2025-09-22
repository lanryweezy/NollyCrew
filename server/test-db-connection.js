
import postgres from 'postgres';

async function testDbConnection() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set in environment variables.');
    return;
  }

  const connectionString = process.env.DATABASE_URL;
  let client;

  try {
    console.log('Attempting to connect to database...');
    client = postgres(connectionString, { ssl: 'require', connect_timeout: 5 });
    await client`SELECT 1`;
    console.log('Successfully connected to the database!');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

testDbConnection();
