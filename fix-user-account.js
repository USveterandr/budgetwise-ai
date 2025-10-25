// Script to fix user account by directly updating the database
async function fixUserAccount(email, newPassword) {
  try {
    console.log(`Fixing account for user: ${email}`);
    
    // First, let's generate a reset token and set it directly in the database
    const resetToken = 'manual-reset-' + Date.now();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now
    
    console.log('Generated reset token:', resetToken);
    
    // We'll use the existing reset token endpoint but with a small modification
    // Let's directly test if we can update the user's password hash to a known value
    
    // For now, let's try to manually trigger the password reset process
    // by directly updating the database with a reset token
    
    // Since we can't easily modify the worker, let's try a different approach
    // Let's create a simple API endpoint that we can call to fix this
    
    console.log('To fix your account, you need to:');
    console.log('1. Go to the login page and click "Forgot Password"');
    console.log('2. Enter your email: isaactrinidadllc@gmail.com');
    console.log('3. Wait for the system to generate a reset token (even if you dont receive the email)');
    console.log('4. Then we can manually retrieve and use that token to set your password');
    
    // Let's check if there's already a reset token for your account
    console.log('Checking if there is already a reset token for your account...');
    const userResponse = await fetch(`https://budgetwise-database-worker.isaactrinidadllc.workers.dev/users/${encodeURIComponent(email)}`);
    const userResult = await userResponse.json();
    
    if (userResult.success) {
      const user = userResult.user;
      console.log('User found:', user.email);
      console.log('Current password hash:', user.password_hash || 'EMPTY');
      console.log('Reset token:', user.password_reset_token || 'NONE');
      console.log('Reset expires:', user.password_reset_expires || 'NEVER');
      
      if (user.password_reset_token) {
        console.log('There is already a reset token. You can use it to set your password.');
        console.log('Try visiting: https://budgetwise-ai.pages.dev/auth/reset-password?token=' + user.password_reset_token);
      } else {
        console.log('No reset token found. You need to request a password reset first.');
      }
    } else {
      console.log('Failed to get user info:', userResult.error);
    }
  } catch (error) {
    console.error('Error fixing user account:', error);
  }
}

fixUserAccount('isaactrinidadllc@gmail.com', 'SecurePassword123!');