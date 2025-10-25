// Script to create a password reset for your account
async function createPasswordReset() {
  try {
    console.log('Creating password reset for isaactrinidadllc@gmail.com...');
    
    // Request password reset
    const resetResponse = await fetch('https://budgetwise-database-worker.isaactrinidadllc.workers.dev/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: 'isaactrinidadllc@gmail.com'
      }),
    });
    
    const resetResult = await resetResponse.json();
    console.log('Password reset request result:', resetResult);
    
    if (resetResult.success) {
      console.log('✅ Password reset request successful');
      console.log('Message:', resetResult.message);
      
      // Check the user to get the reset token
      console.log('Getting reset token...');
      const userResponse = await fetch(`https://budgetwise-database-worker.isaactrinidadllc.workers.dev/users/isaactrinidadllc@gmail.com`);
      const userResult = await userResponse.json();
      
      if (userResult.success) {
        const user = userResult.user;
        if (user.password_reset_token) {
          console.log('✅ Reset token generated successfully');
          console.log('Reset token:', user.password_reset_token);
          console.log('Reset expires:', user.password_reset_expires);
          console.log('Use this link to set your password:');
          console.log(`https://budgetwise-ai.pages.dev/auth/reset-password?token=${user.password_reset_token}`);
        } else {
          console.log('❌ No reset token found');
        }
      } else {
        console.log('Failed to get user info:', userResult.error);
      }
    } else {
      console.log('❌ Password reset request failed:', resetResult.error);
    }
  } catch (error) {
    console.error('Error creating password reset:', error);
  }
}

createPasswordReset();