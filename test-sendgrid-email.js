// Test script to verify SendGrid email functionality
async function testSendGridEmail() {
  console.log('Testing SendGrid email functionality...');
  
  try {
    // Use a unique email for testing
    const testEmail = `sendgrid-test-${Date.now()}@example.com`;
    const testName = 'SendGrid Test User';
    const testToken = `token-${Date.now()}`;
    
    console.log(`Sending test email to: ${testEmail}`);
    
    // Test the API endpoint directly
    const response = await fetch('http://localhost:3003/api/send-confirmation-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        name: testName,
        confirmationToken: testToken
      }),
    });
    
    const result = await response.json();
    console.log('API response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Email sending test successful');
      console.log('Message:', result.message);
    } else {
      console.log('❌ Email sending test failed');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.error('Error testing SendGrid email:', error);
  }
}

// Run the test
testSendGridEmail();