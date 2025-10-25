// Script to manually reset password for a user
async function manualPasswordReset(email, newPassword) {
  try {
    // First, let's check if the user exists
    console.log(`Checking user: ${email}`);
    const userResponse = await fetch(`https://budgetwise-database-worker.isaactrinidadllc.workers.dev/users/${encodeURIComponent(email)}`);
    const userResult = await userResponse.json();
    
    if (!userResult.success) {
      console.log('User not found:', userResult.message || userResult.error);
      return;
    }
    
    const user = userResult.user;
    console.log('Found user:', user.email);
    console.log('Current password hash:', user.password_hash || 'EMPTY');
    
    // Generate a reset token manually
    const resetToken = crypto.randomUUID();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now
    
    console.log('Generated reset token:', resetToken);
    
    // Update the user with the reset token
    const updateResponse = await fetch('https://budgetwise-database-worker.isaactrinidadllc.workers.dev/users/reset-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: user.email,
        resetToken: resetToken,
        resetExpires: resetExpires.toISOString()
      }),
    });
    
    if (!updateResponse.ok) {
      console.log('Failed to update user with reset token');
      return;
    }
    
    const updateResult = await updateResponse.json();
    console.log('User updated with reset token:', updateResult.success);
    
    // Now use the reset token to set the new password
    console.log('Setting new password...');
    const resetResponse = await fetch('https://budgetwise-database-worker.isaactrinidadllc.workers.dev/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        token: resetToken,
        newPassword: newPassword
      }),
    });
    
    const resetResult = await resetResponse.json();
    
    if (resetResult.success) {
      console.log('Password reset successfully!');
      console.log(resetResult.message);
    } else {
      console.log('Failed to reset password:', resetResult.error);
    }
  } catch (error) {
    console.error('Error in manual password reset:', error);
  }
}

// We need to add a new endpoint to the database worker to set the reset token
// For now, let's just show what needs to be done

console.log('To fix your account, we need to add a new endpoint to the database worker.');
console.log('Add this to the database worker:');
console.log(`
// Set reset token endpoint (for admin/manual use)
if (path === '/users/reset-token' && request.method === 'POST') {
  try {
    const { email, resetToken, resetExpires } = await request.json();
    
    // Update user with reset token
    await env.DB.prepare(
      'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE email = ?'
    ).bind(resetToken, resetExpires, email).run();
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Reset token set successfully.',
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error setting reset token:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'An error occurred while setting reset token.',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}
`);