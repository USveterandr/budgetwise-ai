// Script to check SendGrid setup in Cloudflare Worker AI
async function checkSendGridSetup() {
  console.log('🔍 Checking SendGrid setup in Cloudflare Worker AI...\n');
  
  try {
    // We can't directly access secrets, but we can test if the worker 
    // is using the SendGrid API by checking the behavior
    
    console.log('1. Testing email sending behavior...');
    
    // Create a test user which should trigger email sending
    const timestamp = Date.now();
    const testEmail = `sendgrid-check-${timestamp}@example.com`;
    
    const startTime = Date.now();
    const response = await fetch('https://budgetwise-database-worker.isaactrinidadllc.workers.dev/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: `user_${timestamp}`,
        email: testEmail,
        name: 'SendGrid Check User',
        password: 'TestPassword123!',
        plan: 'trial',
        is_admin: false,
        email_verified: false
      }),
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const result = await response.json();
    
    if (result.success) {
      console.log('   ✅ User creation successful');
      console.log('   ⏱️  Response time:', responseTime, 'ms');
      console.log('   📝 Message:', result.message);
      
      // Based on our implementation, we can infer the SendGrid status:
      console.log('\n📋 SendGrid Configuration Status:');
      console.log('   If you see "Please check your email for confirmation" and emails are actually');
      console.log('   being delivered to', testEmail, ', then SendGrid is properly configured.');
      console.log('   If no email arrives, check your Cloudflare Worker secrets.');
      
      console.log('\n🔧 To verify SendGrid secrets are set in Cloudflare:');
      console.log('   Run: npx wrangler pages secret list');
      console.log('   You should see SENDGRID_API_KEY and SENDGRID_FROM_EMAIL in the list');
      
      console.log('\n📊 Additional verification steps:');
      console.log('   1. Check your email inbox for a confirmation message');
      console.log('   2. Check your SendGrid dashboard for email activity');
      console.log('   3. Monitor Cloudflare Worker logs for any email sending errors');
      
    } else {
      console.log('   ❌ User creation failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Check failed with error:', error.message);
  }
  
  console.log('\nℹ️  Note: For security, Cloudflare does not allow retrieving secret values.');
  console.log('   You can only verify they are set by observing the worker behavior.');
}

// Run the check
checkSendGridSetup();