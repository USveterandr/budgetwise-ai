// Script to create a new reset token for your account
async function createNewResetToken(email) {
  try {
    console.log(`Creating new reset token for user: ${email}`);
    
    // First, let's check the current state of your account
    console.log('Checking current user status...');
    const userResponse = await fetch(`https://budgetwise-database-worker.isaactrinidadllc.workers.dev/users/${encodeURIComponent(email)}`);
    const userResult = await userResponse.json();
    
    if (userResult.success) {
      const user = userResult.user;
      console.log('User found:', user.email);
      console.log('Current password hash:', user.password_hash || 'EMPTY');
      console.log('Current reset token:', user.password_reset_token || 'NONE');
      console.log('Reset expires:', user.password_reset_expires || 'NEVER');
    } else {
      console.log('Failed to get user info:', userResult.error);
      return;
    }
    
    // Now let's request a new password reset
    console.log('Requesting new password reset...');
    const resetResponse = await fetch('https://budgetwise-database-worker.isaactrinidadllc.workers.dev/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const resetResult = await resetResponse.json();
    
    if (resetResult.success) {
      console.log('Password reset request successful:', resetResult.message);
      
      // Now let's check the user again to see the new reset token
      console.log('Checking user status after reset request...');
      const userResponse2 = await fetch(`https://budgetwise-database-worker.isaactrinidadllc.workers.dev/users/${encodeURIComponent(email)}`);
      const userResult2 = await userResponse2.json();
      
      if (userResult2.success) {
        const user = userResult2.user;
        console.log('User found:', user.email);
        console.log('New reset token:', user.password_reset_token || 'NONE');
        console.log('Reset expires:', user.password_reset_expires || 'NEVER');
        
        if (user.password_reset_token) {
          console.log('New reset link:');
          console.log(`https://budgetwise-ai.pages.dev/auth/reset-password?token=${user.password_reset_token}`);
        }
      }
    } else {
      console.log('Failed to request password reset:', resetResult.error);
    }
  } catch (error) {
    console.error('Error creating new reset token:', error);
  }
}

createNewResetToken('isaactrinidadllc@gmail.com');