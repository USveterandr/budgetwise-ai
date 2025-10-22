// Test script to verify the database schema
const DATABASE_WORKER_URL = 'http://localhost:54532';

async function testSchema() {
  console.log('Testing database schema...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${DATABASE_WORKER_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check result:', healthData);
    
    // Test database connection
    console.log('\n2. Testing database connection...');
    const dbResponse = await fetch(`${DATABASE_WORKER_URL}/test-db`);
    const dbData = await dbResponse.json();
    console.log('Database connection result:', dbData);
    
    // Test creating a user with the new schema
    console.log('\n3. Testing user creation with new schema...');
    const testUser = {
      id: `user_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      name: 'Test User',
      password: 'TestPass123!',
      plan: 'trial',
      is_admin: false
    };
    
    // First, let's check what columns exist in the users table
    console.log('\n4. Checking users table schema...');
    const schemaResponse = await fetch(`${DATABASE_WORKER_URL}/test-db-schema`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'PRAGMA table_info(users);'
      }),
    });
    
    if (schemaResponse.ok) {
      const schemaData = await schemaResponse.json();
      console.log('Users table schema:', schemaData);
    } else {
      console.log('Failed to get schema info');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testSchema();