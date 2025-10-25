// Script to test JWT functionality
require('dotenv').config({ path: './.env.local' });

const jwt = require('jsonwebtoken');

console.log('Testing JWT functionality...');

// Check if JWT_SECRET is set
console.log('JWT_SECRET environment variable:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
if (process.env.JWT_SECRET) {
  console.log('JWT_SECRET length:', process.env.JWT_SECRET.length);
}

// Test JWT signing
try {
  const testPayload = { 
    email: 'test@example.com', 
    role: 'user',
    id: 'user_123'
  };
  
  // Test with the environment variable
  if (process.env.JWT_SECRET) {
    const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('JWT signing successful with env secret');
    console.log('Generated token:', token.substring(0, 20) + '...');
    
    // Test verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('JWT verification successful');
    console.log('Decoded payload:', decoded);
  } else {
    console.log('Skipping JWT test - no secret key configured');
  }
} catch (error) {
  console.error('JWT test failed:', error.message);
}

console.log('Test completed');