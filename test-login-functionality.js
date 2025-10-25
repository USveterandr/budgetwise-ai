// Script to test login functionality with JWT
async function testLogin() {
  try {
    console.log('Testing login functionality...');
    
    // First, let's make sure your account has a password set
    // We'll check your account status
    console.log('Checking account status...');
    const userResponse = await fetch(`https://budgetwise-database-worker.isaactrinidadllc.workers.dev/users/isaactrinidadllc@gmail.com`);
    const userResult = await userResponse.json();
    
    if (userResult.success) {
      const user = userResult.user;
      console.log('User found:', user.email);
      console.log('Email verified:', user.email_verified);
      console.log('Password hash exists:', !!user.password_hash && user.password_hash.length > 0);
      
      if (!user.password_hash || user.password_hash.length === 0) {
        console.log('⚠️  Warning: No password hash found for this account');
        console.log('You need to set a password first using the reset link');
        return;
      }
    } else {
      console.log('Failed to get user info:', userResult.error);
      return;
    }
    
    // Test the login API directly
    console.log('Testing direct login API call...');
    const loginResponse = await fetch('https://budgetwise-database-worker.isaactrinidadllc.workers.dev/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: 'isaactrinidadllc@gmail.com',
        password: 'SecurePassword123!' // Use the password you set
      }),
    });
    
    console.log('Login response status:', loginResponse.status);
    const loginResult = await loginResponse.json();
    console.log('Login result:', loginResult);
    
    if (loginResult.success) {
      console.log('✅ Login successful!');
      console.log('User:', loginResult.user.email);
      console.log('Email verified:', loginResult.user.email_verified);
    } else {
      console.log('❌ Login failed:', loginResult.error);
    }
  } catch (error) {
    console.error('Error testing login:', error);
  }
}

testLogin();