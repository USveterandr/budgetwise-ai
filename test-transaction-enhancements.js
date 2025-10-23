// Simple test script to verify transaction enhancement endpoints
// Run with: node test-transaction-enhancements.js

const BASE_URL = process.env.DATABASE_WORKER_URL || 'http://localhost:8787';

async function testTransactionEnhancements() {
  console.log('Testing Transaction Enhancement endpoints...\n');
  
  // Test data
  const testUserId = 'user_test_123';
  const testTransaction = {
    user_id: testUserId,
    date: '2023-06-15',
    description: 'Test Grocery Purchase at Walmart',
    category: 'Food',
    amount: 85.30,
    type: 'expense',
    receipt_url: null,
    merchant: 'Walmart',
    tags: 'groceries,food',
    notes: 'Weekly shopping',
    currency: 'USD'
  };
  
  try {
    // Test 1: Create a transaction with new fields
    console.log('1. Creating a test transaction with new fields...');
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
    
    // Test 2: Get transactions for user (existing endpoint)
    console.log('\n2. Fetching transactions for user...');
    const getResponse = await fetch(`${BASE_URL}/transactions/user/${testUserId}`);
    const getResult = await getResponse.json();
    console.log('Get response:', getResult);
    
    if (!getResult.success) {
      console.log('❌ Failed to fetch transactions');
      return;
    }
    
    console.log('✅ Successfully fetched', getResult.transactions.length, 'transactions');
    
    // Test 3: Search transactions
    console.log('\n3. Searching transactions...');
    const searchResponse = await fetch(`${BASE_URL}/transactions/search?user_id=${testUserId}&query=grocery`);
    const searchResult = await searchResponse.json();
    console.log('Search response:', searchResult);
    
    if (!searchResult.success) {
      console.log('❌ Failed to search transactions');
      return;
    }
    
    console.log('✅ Successfully searched transactions, found', searchResult.count, 'results');
    
    // Test 4: Create category rule
    console.log('\n4. Creating category rule...');
    const categoryRule = {
      user_id: testUserId,
      merchant_pattern: 'Walmart|Target',
      category: 'Shopping',
      priority: 1
    };
    
    const ruleResponse = await fetch(`${BASE_URL}/category-rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryRule),
    });
    
    const ruleResult = await ruleResponse.json();
    console.log('Category rule response:', ruleResult);
    
    if (!ruleResult.success) {
      console.log('❌ Failed to create category rule');
      return;
    }
    
    const ruleId = ruleResult.category_rule.id;
    console.log('✅ Category rule created successfully with ID:', ruleId);
    
    // Test 5: Get category suggestion
    console.log('\n5. Getting category suggestion...');
    const categorizeData = {
      description: 'Purchase at Target',
      merchant: 'Target',
      amount: 45.67
    };
    
    const categorizeResponse = await fetch(`${BASE_URL}/transactions/categorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categorizeData),
    });
    
    const categorizeResult = await categorizeResponse.json();
    console.log('Categorize response:', categorizeResult);
    
    if (!categorizeResult.success) {
      console.log('❌ Failed to get category suggestion');
      return;
    }
    
    console.log('✅ Category suggestion:', categorizeResult.category, '(confidence:', categorizeResult.confidence, ')');
    
    // Test 6: Bulk update transactions
    console.log('\n6. Bulk updating transactions...');
    const bulkUpdateData = {
      transaction_ids: [transactionId],
      updates: {
        category: 'Shopping',
        tags: 'groceries,shopping'
      }
    };
    
    const bulkUpdateResponse = await fetch(`${BASE_URL}/transactions/bulk-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bulkUpdateData),
    });
    
    const bulkUpdateResult = await bulkUpdateResponse.json();
    console.log('Bulk update response:', bulkUpdateResult);
    
    if (!bulkUpdateResult.success) {
      console.log('❌ Failed to bulk update transactions');
      return;
    }
    
    console.log('✅ Successfully updated', bulkUpdateResult.updated_count, 'transactions');
    
    // Test 7: Analytics - Spending by category
    console.log('\n7. Getting spending by category report...');
    const analyticsResponse = await fetch(`${BASE_URL}/transactions/analytics/spending-by-category?user_id=${testUserId}`);
    const analyticsResult = await analyticsResponse.json();
    console.log('Analytics response:', analyticsResult);
    
    if (!analyticsResult.success) {
      console.log('❌ Failed to get analytics data');
      return;
    }
    
    console.log('✅ Successfully retrieved analytics data with', analyticsResult.data.length, 'categories');
    
    // Test 8: Delete the transaction
    console.log('\n8. Deleting the transaction...');
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
    
    // Test 9: Delete the category rule
    console.log('\n9. Deleting the category rule...');
    const deleteRuleResponse = await fetch(`${BASE_URL}/category-rules/${ruleId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const deleteRuleResult = await deleteRuleResponse.json();
    console.log('Delete rule response:', deleteRuleResult);
    
    if (!deleteRuleResult.success) {
      console.log('❌ Failed to delete category rule');
      return;
    }
    
    console.log('✅ Category rule deleted successfully');
    
    console.log('\n🎉 All tests passed! Transaction enhancement endpoints are working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testTransactionEnhancements();