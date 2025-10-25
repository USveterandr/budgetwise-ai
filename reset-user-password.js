// Script to reset password for an existing user
async function resetUserPassword(email) {
  try {
    // First, let's check if the user exists
    const userResponse = await fetch(`https://budgetwise-database-worker.isaactrinidadllc.workers.dev/users/${encodeURIComponent(email)}`);
    const userResult = await userResponse.json();
    
    if (!userResult.success) {
      console.log('User not found:', userResult.message || userResult.error);
      return;
    }
    
    console.log('Found user:', userResult.user.email);
    console.log('Current password hash:', userResult.user.password_hash || 'EMPTY');
    
    // Now let's trigger the password reset flow
    const resetResponse = await fetch('https://budgetwise-database-worker.isaactrinidadllc.workers.dev/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const resetResult = await resetResponse.json();
    
    if (resetResult.success) {
      console.log('Password reset initiated successfully:', resetResult.message);
    } else {
      console.log('Failed to initiate password reset:', resetResult.error);
    }
  } catch (error) {
    console.error('Error resetting password:', error);
  }
}

// Replace with your actual email
resetUserPassword('isaactrinidadllc@gmail.com');