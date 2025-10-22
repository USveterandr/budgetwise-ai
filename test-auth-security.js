// Comprehensive test for authentication and security features
const DATABASE_WORKER_URL = 'http://localhost:54033';

async function testAuthSecurity() {
  console.log('Testing authentication and security features...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${DATABASE_WORKER_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check result:', healthData);
    
    // Test 2: User signup
    console.log('\n2. Testing user signup...');
    const testUser = {
      id: `user_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      name: 'Test User',
      password: 'TestPass123!',
      plan: 'trial',
      is_admin: false
    };
    
    const signupResponse = await fetch(`${DATABASE_WORKER_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });
    
    const signupData = await signupResponse.json();
    console.log('Signup result:', signupData);
    
    // Test 3: Login without email verification (should fail)
    console.log('\n3. Testing login without email verification...');
    const loginResponse = await fetch(`${DATABASE_WORKER_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      }),
    });
    
    const loginData = await loginResponse.json();
    console.log('Login result (should fail):', loginData);
    
    // Test 4: Email confirmation
    console.log('\n4. Testing email confirmation...');
    // In a real test, we would extract the token from the email
    // For this test, we'll simulate the confirmation process
    const confirmResponse = await fetch(`${DATABASE_WORKER_URL}/auth/confirm-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'test-token' // This would be the actual token from the email
      }),
    });
    
    const confirmData = await confirmResponse.json();
    console.log('Email confirmation result:', confirmData);
    
    // Test 5: Login with email verification (should succeed after confirmation)
    console.log('\n5. Testing login with email verification...');
    const loginResponse2 = await fetch(`${DATABASE_WORKER_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      }),
    });
    
    const loginData2 = await loginResponse2.json();
    console.log('Login result (after confirmation):', loginData2);
    
    // Test 6: Password reset request
    console.log('\n6. Testing password reset request...');
    const resetRequestResponse = await fetch(`${DATABASE_WORKER_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email
      }),
    });
    
    const resetRequestData = await resetRequestResponse.json();
    console.log('Password reset request result:', resetRequestData);
    
    // Test 7: Password reset token verification
    console.log('\n7. Testing password reset token verification...');
    // In a real test, we would extract the token from the email
    const resetVerifyResponse = await fetch(`${DATABASE_WORKER_URL}/auth/reset-password/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'test-reset-token' // This would be the actual token from the email
      }),
    });
    
    const resetVerifyData = await resetVerifyResponse.json();
    console.log('Password reset token verification result:', resetVerifyData);
    
    // Test 8: Password reset
    console.log('\n8. Testing password reset...');
    const resetResponse = await fetch(`${DATABASE_WORKER_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'test-reset-token', // This would be the actual token from the email
        newPassword: 'NewTestPass123!'
      }),
    });
    
    const resetData = await resetResponse.json();
    console.log('Password reset result:', resetData);
    
    console.log('\n✅ All authentication and security tests completed!');
    console.log('\nNote: Some tests simulate token-based operations that would normally');
    console.log('involve extracting tokens from actual emails. In a production environment,');
    console.log('these tokens would be properly generated and verified.');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testAuthSecurity();