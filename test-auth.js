const fetch = require('node-fetch');

async function testRegistration() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test2@example.com',
        password: 'Password123',
        firstName: 'Test2',
        lastName: 'User2'
      })
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function testLogin() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123'
      })
    });

    const data = await response.json();
    console.log('Login Response:', data);
  } catch (error) {
    console.error('Login Error:', error);
  }
}

// Test registration
testRegistration().then(() => {
  // Test login after registration
  setTimeout(testLogin, 1000);
});