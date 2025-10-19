import bcrypt from 'bcryptjs';

// Mock storage functions
const users = [];

// Simple function to create a user
async function createUser(userData) {
  // Hash the password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(userData.password, saltRounds);
  
  // Create user object
  const user = {
    id: Date.now().toString(),
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    passwordHash,
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  users.push(user);
  console.log('User created successfully:', user);
  return user;
}

// Create a default test user
async function createDefaultUser() {
  const defaultUser = {
    email: 'test@example.com',
    password: 'Password123',
    firstName: 'Test',
    lastName: 'User'
  };
  
  await createUser(defaultUser);
  console.log('Default user created with credentials:');
  console.log('Email: test@example.com');
  console.log('Password: Password123');
}

createDefaultUser().catch(console.error);