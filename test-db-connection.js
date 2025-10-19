import { db } from './server/db.ts';
import { users } from './shared/schema.ts';
import { eq } from 'drizzle-orm';

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Try to query users table
    const result = await db.query.users.findMany();
    console.log('Database connection successful');
    console.log('Number of users:', result.length);
    
    // Check if our test user exists
    const testUser = await db.query.users.findFirst({ 
      where: eq(users.email, 'test@example.com') 
    });
    
    if (testUser) {
      console.log('Test user found:', testUser.email);
    } else {
      console.log('Test user not found');
    }
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
}

testDatabase();