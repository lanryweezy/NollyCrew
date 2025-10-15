async function testLogin() {
  try {
    console.log('Testing login with credentials:');
    console.log('Email: test@example.com');
    console.log('Password: Password123');
    
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

    console.log('Login Response Status:', response.status);
    console.log('Response Headers:', [...response.headers.entries()]);
    
    let data;
    try {
      data = await response.json();
      console.log('Login Response:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      const text = await response.text();
      console.log('Response Text:', text);
      data = { error: 'Failed to parse JSON response' };
    }
    
    if (response.ok && data.token) {
      console.log('SUCCESS: Login successful!');
      console.log('Token:', data.token);
    } else {
      console.log('FAILED: Login failed');
      console.log('Error:', data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Login Error:', error.message);
  }
}

testLogin();