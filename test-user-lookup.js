// Simple script to check if a user exists in the database
async function checkUser(email) {
  try {
    const response = await fetch(`https://budgetwise-database-worker.isaactrinidadllc.workers.dev/users/${encodeURIComponent(email)}`);
    const result = await response.json();
    
    if (result.success) {
      console.log('User found:', result.user);
      console.log('Email verified:', result.user.email_verified);
      console.log('Password hash:', result.user.password_hash);
    } else {
      console.log('User not found or error:', result.message || result.error);
    }
  } catch (error) {
    console.error('Error checking user:', error);
  }
}

// Replace with your actual email
checkUser('isaactrinidadllc@gmail.com');