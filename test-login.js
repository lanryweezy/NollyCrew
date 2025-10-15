import { storage } from './server/storage.ts';
import bcrypt from 'bcryptjs';

async function testLogin() {
  try {
    console.log('Testing login functionality...');
    
    // Try to get the test user
    const user = await storage.getUserByEmail('test@example.com');
    
    if (!user) {
      console.log('Test user not found');
      return;
    }
    
    console.log('User found:', user.email);
    
    // Test password verification
    const isValidPassword = await bcrypt.compare('Password123', user.passwordHash);
    console.log('Password valid:', isValidPassword);
    
    if (isValidPassword) {
      console.log('Login would be successful!');
    } else {
      console.log('Invalid password');
    }
  } catch (error) {
    console.error('Login test failed:', error.message);
  }
}

testLogin();