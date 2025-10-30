// Test script to verify email functionality
async function testEmailFunctionality() {
  console.log('Testing email functionality...');
  
  // Use a unique email for testing
  const testEmail = `test-${Date.now()}@example.com`;
  
  try {
    console.log(`Creating user with email: ${testEmail}`);
    
    // Test the database worker directly
    const response = await fetch('https://budgetwise-database-worker.isaactrinidadllc.workers.dev/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: `user_${Date.now()}`,
        email: testEmail,
        name: 'Test User',
        password: 'TestPassword123',
        plan: 'trial',
        is_admin: false,
        email_verified: false
      }),
    });
    
    const result = await response.json();
    console.log('Database worker response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ User creation successful');
      console.log('Message:', result.message);
      console.log('🎉 Email should be sent to:', testEmail);
    } else {
      console.log('❌ User creation failed');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.error('Error testing email functionality:', error);
  }
}

// Run the test
testEmailFunctionality();