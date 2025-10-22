// Simple test script to verify transaction API endpoints
// Run with: node test-transaction-api.js

const BASE_URL = process.env.DATABASE_WORKER_URL || 'http://localhost:8787';

async function testTransactionAPI() {
  console.log('Testing Transaction API endpoints...\n');
  
  // Test data
  const testUserId = 'user_test_123';
  const testTransaction = {
    user_id: testUserId,
    date: '2023-06-15',
    description: 'Test Grocery Purchase',
    category: 'Food',
    amount: 85.30,
    type: 'expense',
    receipt_url: null
  };
  
  try {
    // Test 1: Create a transaction
    console.log('1. Creating a test transaction...');
    const createResponse = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testTransaction),
    });
    
    const createResult = await createResponse.json();
    console.log('Create response:', createResult);
    
    if (!createResult.success) {
      console.log('❌ Failed to create transaction');
      return;
    }
    
    const transactionId = createResult.transaction.id;
    console.log('✅ Transaction created successfully with ID:', transactionId);
    
    // Test 2: Get transactions for user
    console.log('\n2. Fetching transactions for user...');
    const getResponse = await fetch(`${BASE_URL}/transactions/user/${testUserId}`);
    const getResult = await getResponse.json();
    console.log('Get response:', getResult);
    
    if (!getResult.success) {
      console.log('❌ Failed to fetch transactions');
      return;
    }
    
    console.log('✅ Successfully fetched', getResult.transactions.length, 'transactions');
    
    // Test 3: Update the transaction
    console.log('\n3. Updating the transaction...');
    const updateData = {
      description: 'Updated Test Grocery Purchase',
      amount: 95.50
    };
    
    const updateResponse = await fetch(`${BASE_URL}/transactions/${transactionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    const updateResult = await updateResponse.json();
    console.log('Update response:', updateResult);
    
    if (!updateResult.success) {
      console.log('❌ Failed to update transaction');
      return;
    }
    
    console.log('✅ Transaction updated successfully');
    
    // Test 4: Delete the transaction
    console.log('\n4. Deleting the transaction...');
    const deleteResponse = await fetch(`${BASE_URL}/transactions/${transactionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const deleteResult = await deleteResponse.json();
    console.log('Delete response:', deleteResult);
    
    if (!deleteResult.success) {
      console.log('❌ Failed to delete transaction');
      return;
    }
    
    console.log('✅ Transaction deleted successfully');
    
    console.log('\n🎉 All tests passed! Transaction API is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testTransactionAPI();