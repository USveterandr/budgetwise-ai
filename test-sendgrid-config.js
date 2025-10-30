// Test script to verify SendGrid configuration
async function testSendGridConfig() {
  console.log('Testing SendGrid configuration...');
  
  try {
    // Test the database worker's environment variables endpoint (if available)
    const response = await fetch('https://budgetwise-database-worker.isaactrinidadllc.workers.dev/test-sendgrid', {
      method: 'GET',
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('SendGrid config test result:', result);
    } else {
      console.log('SendGrid config test endpoint not available');
    }
  } catch (error) {
    console.log('SendGrid config test not available:', error.message);
  }
}

// Run the test
testSendGridConfig();