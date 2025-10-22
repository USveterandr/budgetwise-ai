// Test script to verify authentication flows
const BASE_URL = 'https://budgetwise-database-worker.isaactrinidadllc.workers.dev';

async function testSignup() {
  console.log('Testing Signup Flow...');
  
  const testUser = {
    id: `user_${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    name: 'Test User',
    password: 'TestPass123',
    plan: 'trial',
    is_admin: false,
    email_verified: true // For testing purposes, we'll set this to true
  };
  
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });
    
    const result = await response.json();
    console.log('Signup Response:', result);
    
    if (result.success) {
      console.log('✅ Signup successful');
      return testUser;
    } else {
      console.log('❌ Signup failed:', result.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Signup error:', error);
    return null;
  }
}

async function testLogin(email, password) {
  console.log('\nTesting Login Flow...');
  
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const result = await response.json();
    console.log('Login Response:', result);
    
    if (result.success) {
      console.log('✅ Login successful');
      return result.user;
    } else {
      console.log('❌ Login failed:', result.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Login error:', error);
    return null;
  }
}

async function testTransactionCreation(user) {
  console.log('\nTesting Transaction Creation...');
  
  // Create a proper token for authentication (matching the format expected by the worker)
  const tokenData = {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    isAdmin: user.is_admin === 1 ? true : false,
    emailVerified: user.email_verified === 1 ? true : false
  };
  
  const token = btoa(JSON.stringify(tokenData));
  
  const transactionData = {
    user_id: user.id,
    date: new Date().toISOString().split('T')[0],
    description: 'Test Transaction',
    amount: 100.50,
    type: 'expense',
    category: 'Test Category'
  };
  
  try {
    const response = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(transactionData),
    });
    
    console.log('Transaction Response Status:', response.status);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      console.log('Transaction Response:', result);
      
      if (result.success) {
        console.log('✅ Transaction creation successful');
        return result.transaction;
      } else {
        console.log('❌ Transaction creation failed:', result.error);
        return null;
      }
    } else {
      const text = await response.text();
      console.log('Non-JSON Response:', text);
      return null;
    }
  } catch (error) {
    console.log('❌ Transaction creation error:', error);
    return null;
  }
}

async function testGetTransactions(user) {
  console.log('\nTesting Get Transactions...');
  
  // Create a proper token for authentication
  const tokenData = {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    isAdmin: user.is_admin === 1 ? true : false,
    emailVerified: user.email_verified === 1 ? true : false
  };
  
  const token = btoa(JSON.stringify(tokenData));
  
  try {
    const response = await fetch(`${BASE_URL}/transactions/user/${user.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    console.log('Get Transactions Response Status:', response.status);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      console.log('Get Transactions Response:', result);
      
      if (result.success) {
        console.log('✅ Get transactions successful');
        console.log(`Found ${result.count} transactions`);
        return result.transactions;
      } else {
        console.log('❌ Get transactions failed:', result.error);
        return null;
      }
    } else {
      const text = await response.text();
      console.log('Non-JSON Response:', text);
      return null;
    }
  } catch (error) {
    console.log('❌ Get transactions error:', error);
    return null;
  }
}

async function runTests() {
  console.log('Starting Authentication and Transaction Flow Tests...\n');
  
  // Test 1: Signup
  const testUser = await testSignup();
  if (!testUser) {
    console.log('Stopping tests due to signup failure');
    return;
  }
  
  // Test 2: Login
  const loggedInUser = await testLogin(testUser.email, testUser.password);
  if (!loggedInUser) {
    console.log('Stopping tests due to login failure');
    return;
  }
  
  // Test 3: Create Transaction
  const transaction = await testTransactionCreation(loggedInUser);
  if (!transaction) {
    console.log('Stopping tests due to transaction creation failure');
    return;
  }
  
  // Test 4: Get Transactions
  const transactions = await testGetTransactions(loggedInUser);
  if (!transactions) {
    console.log('Transaction retrieval failed');
    return;
  }
  
  console.log('\n🎉 All tests completed successfully!');
}

// Run the tests
runTests();