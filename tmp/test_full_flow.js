// test_full_flow.js
async function testFlow() {
  const email = 'fullflow@test.com';
  try {
    console.log('--- Step 1: Send OTP ---');
    const sendRes = await fetch('http://localhost:5000/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    console.log('Send OTP Status:', sendRes.status);
    
    console.log('\n--- Step 2: Verify OTP (with bypass) ---');
    const verifyRes = await fetch('http://localhost:5000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: '000000' })
    });
    const verifyData = await verifyRes.json();
    console.log('Verify OTP Status:', verifyRes.status);
    console.log('Verify OTP Data:', verifyData);

    if (verifyRes.ok) {
       console.log('\n--- Step 3: Register User ---');
       const regRes = await fetch('http://localhost:5000/api/auth/register', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           name: 'Full Flow User',
           email: email,
           password: 'Password123',
           role: 'consumer'
         })
       });
       const regData = await regRes.json();
       console.log('Register Status:', regRes.status);
       console.log('Register Data:', regData);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testFlow();
