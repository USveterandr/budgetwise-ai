// Test login functionality
async function testLogin() {
  const DATABASE_WORKER_URL = 'https://budgetwise-database-worker.isaactrinidadllc.workers.dev';
  const email = 'login_test@example.com';
  
  try {
    console.log('Testing login for email:', email);
    
    // Call our database worker to get the user
    const encodedEmail = encodeURIComponent(email);
    console.log('Encoded email:', encodedEmail);
    
    const response = await fetch(`${DATABASE_WORKER_URL}/users/${encodedEmail}`);
    console.log('Response status:', response.status);
    
    const result = await response.json();
    console.log('Response result:', JSON.stringify(result, null, 2));
    
    if (!response.ok) {
      console.error('Login API error:', response.status, result);
      return { success: false, error: result.error || 'Network error. Please try again.' };
    }
    
    if (!result.success) {
      // Handle case where user doesn't exist
      if (result.message === 'User not found') {
        return { success: false, error: 'Invalid credentials' };
      }
      return { success: false, error: result.message || 'Invalid credentials' };
    }
    
    console.log('Login successful!');
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// Run the test
testLogin().then(result => {
  console.log('Test result:', result);
});