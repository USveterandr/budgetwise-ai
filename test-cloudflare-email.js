// Test script to verify Cloudflare Email Service functionality
async function testCloudflareEmail() {
  console.log('Testing Cloudflare Email Service functionality...');
  
  try {
    // Use a unique email for testing
    const timestamp = Date.now();
    const testEmail = `cloudflare-test-${timestamp}@example.com`;
    const testName = 'Cloudflare Test User';
    
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
      console.log('🎉 Cloudflare Email Service should be sending emails now!');
    } else {
      console.log('❌ User creation failed');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.error('Error testing Cloudflare Email Service:', error);
  }
}

// Run the test
testCloudflareEmail();