const postgres = require('postgres');

// Test database connection
const dbUrl = 'postgresql://nollycrew:nollycrew123@localhost:5433/nollycrew';
const db = postgres(dbUrl);

async function verifyUser() {
  try {
    console.log('Verifying test user credentials...');
    
    // Query the user directly from the database
    const users = await db`SELECT * FROM users WHERE email = 'test@example.com'`;
    
    if (users.length > 0) {
      const user = users[0];
      console.log('User found:');
      console.log('- Email:', user.email);
      console.log('- First Name:', user.first_name);
      console.log('- Last Name:', user.last_name);
      console.log('- Created At:', user.created_at);
      console.log('- Is Verified:', user.is_verified);
      console.log('\nUse these credentials to login:');
      console.log('Email: test@example.com');
      console.log('Password: Password123');
    } else {
      console.log('Test user not found in database');
    }
  } catch (error) {
    console.error('Database query failed:', error.message);
  } finally {
    await db.end();
  }
}

verifyUser();