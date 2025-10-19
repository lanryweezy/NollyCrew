import bcrypt from 'bcryptjs';
import { db } from './server/db';
import { users } from './shared/schema';
import { eq } from 'drizzle-orm';

async function addUser() {
  try {
    console.log('Adding user to database...');
    
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({ 
      where: eq(users.email, 'test@example.com') 
    });
    
    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      return;
    }
    
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('Password123', saltRounds);
    
    // Create user
    const result = await db.insert(users).values({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      passwordHash: passwordHash,
      isVerified: true
    }).returning();
    
    console.log('User created successfully:', result[0].email);
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

addUser();