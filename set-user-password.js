// Script to set password for a user directly
async function setUserPassword(email, newPassword) {
  try {
    console.log(`Setting password for user: ${email}`);
    
    const response = await fetch('https://budgetwise-database-worker.isaactrinidadllc.workers.dev/users/set-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: email,
        password: newPassword
      }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Password set successfully!');
      console.log(result.message);
    } else {
      console.log('Failed to set password:', result.error);
    }
  } catch (error) {
    console.error('Error setting password:', error);
  }
}

// Set a new password for your account
setUserPassword('isaactrinidadllc@gmail.com', 'SecurePassword123!');