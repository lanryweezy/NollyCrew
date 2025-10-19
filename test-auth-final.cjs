async function testLogin() {
  try {
    const response = await fetch('http://localhost:3003/api/auth/login', {
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

// Test login
testLogin();