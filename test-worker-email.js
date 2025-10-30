// Test script to verify worker email functionality
async function testWorkerEmail() {
  console.log('Testing worker email functionality...');
  
  try {
    // Use a unique email for testing
    const timestamp = Date.now();
    const testEmail = `worker-test-${timestamp}@example.com`;
    const testName = 'Worker Test User';
    
    console.log(`Creating user with email: ${testEmail}`);
    
    // Test the database worker directly
    const response = await fetch('https://budgetwise-database-worker.isaactrinidadllc.workers.dev/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: `user_${timestamp}`,
        email: testEmail,
        name: testName,
        password: 'TestPassword123!',
        plan: 'trial',
        is_admin: false,
        email_verified: false
      }),
    });
    
    const result = await response.json();
    console.log('Worker response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ User creation successful');
      console.log('Message:', result.message);
      
      // Check if SendGrid is configured by looking at the message
      if (result.message.includes('Please check your email')) {
        console.log('📧 Email should be sent via SendGrid');
      } else if (result.message.includes('confirmation URL')) {
        console.log('📝 Using development fallback (confirmation URL logged)');
      }
    } else {
      console.log('❌ User creation failed');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.error('Error testing worker email:', error);
  }
}

// Run the test
testWorkerEmail();