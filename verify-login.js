// Script to verify login after password reset
async function verifyLogin(email, password) {
  try {
    console.log(`Verifying login for user: ${email}`);
    
    const response = await fetch('https://budgetwise-database-worker.isaactrinidadllc.workers.dev/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: email,
        password: password
      }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Login successful!');
      console.log('User:', result.user.email);
      console.log('Email verified:', result.user.email_verified);
    } else {
      console.log('Login failed:', result.error);
    }
  } catch (error) {
    console.error('Error verifying login:', error);
  }
}

// Run this after you've reset your password
console.log('After resetting your password, run this function to verify login works:');
console.log('verifyLogin("isaactrinidadllc@gmail.com", "YourNewPassword");');