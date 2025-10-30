// Script to verify Cloudflare Worker AI configuration
async function verifyCloudflareConfig() {
  console.log('🔍 Verifying Cloudflare Worker AI configuration...\n');
  
  try {
    // Test the health endpoint first
    console.log('1. Testing worker health endpoint...');
    const healthResponse = await fetch('https://budgetwise-database-worker.isaactrinidadllc.workers.dev/health');
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   ✅ Health check passed:', healthData);
    } else {
      console.log('   ❌ Health check failed with status:', healthResponse.status);
    }
    
    // Test database connection
    console.log('\n2. Testing database connection...');
    const dbResponse = await fetch('https://budgetwise-database-worker.isaactrinidadllc.workers.dev/test-db', {
      method: 'GET'
    });
    
    if (dbResponse.ok) {
      const dbData = await dbResponse.json();
      console.log('   ✅ Database connection successful:', dbData.message);
    } else {
      console.log('   ❌ Database connection failed with status:', dbResponse.status);
    }
    
    // Test user creation (this will trigger email sending if configured)
    console.log('\n3. Testing user creation flow (triggers email if SendGrid is configured)...');
    const timestamp = Date.now();
    const testEmail = `verify-${timestamp}@example.com`;
    
    const userResponse = await fetch('https://budgetwise-database-worker.isaactrinidadllc.workers.dev/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: `user_${timestamp}`,
        email: testEmail,
        name: 'Verification Test User',
        password: 'TestPassword123!',
        plan: 'trial',
        is_admin: false,
        email_verified: false
      }),
    });
    
    const userData = await userResponse.json();
    
    if (userData.success) {
      console.log('   ✅ User creation successful');
      console.log('   📧 Email sending behavior:');
      console.log('      - If SendGrid is properly configured in Cloudflare Worker AI: Email sent');
      console.log('      - If using placeholder values: Confirmation URL logged (development mode)');
      console.log('   📝 Message:', userData.message);
    } else {
      console.log('   ❌ User creation failed:', userData.error);
    }
    
    console.log('\n📋 Configuration Summary:');
    console.log('   - NEXT_PUBLIC_DATABASE_WORKER_URL: Configured in .env.local');
    console.log('   - SENDGRID_API_KEY: Should be set as secret in Cloudflare Worker AI');
    console.log('   - SENDGRID_FROM_EMAIL: Configured in .env.local');
    
    console.log('\n✅ Verification complete!');
    console.log('\nTo verify SendGrid is working:');
    console.log('   1. Check if the test user received an email at:', testEmail);
    console.log('   2. Check your SendGrid dashboard for email activity');
    console.log('   3. Review Cloudflare Worker logs for any email sending errors');
    
  } catch (error) {
    console.error('❌ Verification failed with error:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Ensure you have network connectivity');
    console.log('   2. Verify the Cloudflare Worker URL is correct');
    console.log('   3. Check if the worker is deployed and running');
    console.log('   4. Confirm SendGrid API key is set as a secret in Cloudflare');
  }
}

// Run the verification
verifyCloudflareConfig();