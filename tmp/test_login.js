// test_login.js
async function testLogin() {
  const email = 'master@123';
  const password = 'Password@123'; // Guessing the password used during test or user login
  const role = 'manager';

  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Body:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testLogin();
