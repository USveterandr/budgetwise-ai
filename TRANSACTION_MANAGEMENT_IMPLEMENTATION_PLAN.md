# Transaction Management Implementation Plan - Steps 1-5

## Overview
This document outlines the implementation plan for the first five steps of the Transaction Management feature for BudgetWise AI.

## Step 1: Implement Database Worker Functions for Transaction CRUD Operations

### Objectives
- Create functions in the database worker to handle transaction CRUD operations
- Ensure proper user isolation and security
- Implement data validation

### Implementation Tasks

#### 1.1 Create Transaction Creation Function
```javascript
// In workers/database-worker.js
async function createTransaction(transactionData, userId) {
  try {
    // Validate required fields
    if (!transactionData.date || !transactionData.description || 
        !transactionData.amount || !transactionData.type) {
      throw new Error('Missing required fields');
    }
    
    // Generate unique ID
    const id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Set timestamps
    const now = new Date().toISOString();
    
    // Insert transaction into database
    const result = await env.DB.prepare(
      'INSERT INTO transactions (id, user_id, date, description, category, amount, type, receipt_url, merchant, tags, notes, currency, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      userId,
      transactionData.date,
      transactionData.description,
      transactionData.category || null,
      transactionData.amount,
      transactionData.type,
      transactionData.receipt_url || null,
      transactionData.merchant || null,
      transactionData.tags || null,
      transactionData.notes || null,
      transactionData.currency || 'USD',
      now,
      now
    ).run();
    
    // Return the created transaction
    const newTransaction = {
      id,
      user_id: userId,
      date: transactionData.date,
      description: transactionData.description,
      category: transactionData.category || null,
      amount: transactionData.amount,
      type: transactionData.type,
      receipt_url: transactionData.receipt_url || null,
      merchant: transactionData.merchant || null,
      tags: transactionData.tags || null,
      notes: transactionData.notes || null,
      currency: transactionData.currency || 'USD',
      created_at: now,
      updated_at: now
    };
    
    return { success: true, transaction: newTransaction };
  } catch (error) {
    console.error('Error creating transaction:', error);
    return { success: false, error: error.message };
  }
}
```

#### 1.2 Create Transaction Retrieval Function
```javascript
// In workers/database-worker.js
async function getTransactionById(transactionId, userId) {
  try {
    const transaction = await env.DB.prepare(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?'
    ).bind(transactionId, userId).first();
    
    if (!transaction) {
      return { success: false, error: 'Transaction not found' };
    }
    
    return { success: true, transaction };
  } catch (error) {
    console.error('Error getting transaction:', error);
    return { success: false, error: error.message };
  }
}

async function getUserTransactions(userId, filters = {}) {
  try {
    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    let bindings = [userId];
    
    // Apply filters
    if (filters.category) {
      query += ' AND category = ?';
      bindings.push(filters.category);
    }
    
    if (filters.type) {
      query += ' AND type = ?';
      bindings.push(filters.type);
    }
    
    if (filters.start_date) {
      query += ' AND date >= ?';
      bindings.push(filters.start_date);
    }
    
    if (filters.end_date) {
      query += ' AND date <= ?';
      bindings.push(filters.end_date);
    }
    
    if (filters.search) {
      query += ' AND (description LIKE ? OR merchant LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      bindings.push(searchTerm, searchTerm);
    }
    
    query += ' ORDER BY date DESC';
    
    // Apply limit and offset for pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    query += ' LIMIT ? OFFSET ?';
    bindings.push(limit, offset);
    
    const result = await env.DB.prepare(query).bind(...bindings).all();
    
    return { success: true, transactions: result.results || [], count: result.results ? result.results.length : 0 };
  } catch (error) {
    console.error('Error getting user transactions:', error);
    return { success: false, error: error.message };
  }
}
```

#### 1.3 Create Transaction Update Function
```javascript
// In workers/database-worker.js
async function updateTransaction(transactionId, userId, updates) {
  try {
    // Check if transaction exists and belongs to user
    const existing = await env.DB.prepare(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?'
    ).bind(transactionId, userId).first();
    
    if (!existing) {
      return { success: false, error: 'Transaction not found' };
    }
    
    // Build update query dynamically
    let query = 'UPDATE transactions SET ';
    let bindings = [];
    let fields = [];
    
    // Only update fields that are provided
    const updatableFields = ['date', 'description', 'category', 'amount', 'type', 'receipt_url', 'merchant', 'tags', 'notes', 'currency'];
    
    for (const field of updatableFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`);
        bindings.push(updates[field]);
      }
    }
    
    // Always update the updated_at timestamp
    fields.push('updated_at = ?');
    bindings.push(new Date().toISOString());
    
    query += fields.join(', ');
    query += ' WHERE id = ? AND user_id = ?';
    bindings.push(transactionId, userId);
    
    await env.DB.prepare(query).bind(...bindings).run();
    
    // Get the updated transaction
    const updatedTransaction = await env.DB.prepare(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?'
    ).bind(transactionId, userId).first();
    
    return { success: true, transaction: updatedTransaction };
  } catch (error) {
    console.error('Error updating transaction:', error);
    return { success: false, error: error.message };
  }
}
```

#### 1.4 Create Transaction Deletion Function
```javascript
// In workers/database-worker.js
async function deleteTransaction(transactionId, userId) {
  try {
    // Check if transaction exists and belongs to user
    const existing = await env.DB.prepare(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?'
    ).bind(transactionId, userId).first();
    
    if (!existing) {
      return { success: false, error: 'Transaction not found' };
    }
    
    // Delete the transaction
    await env.DB.prepare(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?'
    ).bind(transactionId, userId).run();
    
    return { success: true, message: 'Transaction deleted successfully' };
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return { success: false, error: error.message };
  }
}
```

### Testing
- Unit tests for each function
- Integration tests with the database
- Error handling tests

## Step 2: Implement API Endpoints for Transaction Operations

### Objectives
- Create RESTful API endpoints for transaction management
- Implement proper authentication and authorization
- Add request validation and error handling

### Implementation Tasks

#### 2.1 Create GET /api/transactions Endpoint
```javascript
// In src/app/api/transactions/route.ts
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-client';

export async function GET(request: Request) {
  try {
    // Check authentication
    if (!isAuthenticated()) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get user from token (this would be implemented in auth-client)
    const user = getCurrentUser(); // Assuming this function exists
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }
    
    // Parse query parameters
    const url = new URL(request.url);
    const filters = {
      category: url.searchParams.get('category') || undefined,
      type: url.searchParams.get('type') || undefined,
      start_date: url.searchParams.get('start_date') || undefined,
      end_date: url.searchParams.get('end_date') || undefined,
      search: url.searchParams.get('search') || undefined,
      limit: parseInt(url.searchParams.get('limit') || '50'),
      offset: parseInt(url.searchParams.get('offset') || '0')
    };
    
    // Call database worker
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/transactions/user/${user.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filters }),
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to fetch transactions' },
        { status: response.status || 500 }
      );
    }
    
    return NextResponse.json({ success: true, transactions: result.transactions, count: result.count });
  } catch (error) {
    console.error('Error in GET /api/transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 2.2 Create POST /api/transactions Endpoint
```javascript
// In src/app/api/transactions/route.ts
export async function POST(request: Request) {
  try {
    // Check authentication
    if (!isAuthenticated()) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get user from token
    const user = getCurrentUser(); // Assuming this function exists
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const transactionData = await request.json();
    
    // Validate required fields
    if (!transactionData.date || !transactionData.description || 
        !transactionData.amount || !transactionData.type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: date, description, amount, type' },
        { status: 400 }
      );
    }
    
    // Validate transaction type
    if (!['income', 'expense', 'transfer'].includes(transactionData.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid transaction type. Must be income, expense, or transfer' },
        { status: 400 }
      );
    }
    
    // Validate amount
    if (isNaN(parseFloat(transactionData.amount))) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }
    
    // Call database worker
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        transactionData: {
          ...transactionData,
          user_id: user.id,
          amount: parseFloat(transactionData.amount)
        }
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create transaction' },
        { status: response.status || 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      transaction: result.transaction,
      message: 'Transaction created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 2.3 Create PUT /api/transactions/[id] Endpoint
```javascript
// In src/app/api/transactions/[id]/route.ts
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    if (!isAuthenticated()) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get user from token
    const user = getCurrentUser(); // Assuming this function exists
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const updates = await request.json();
    
    // Call database worker
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/transactions/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        userId: user.id,
        updates
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to update transaction' },
        { status: response.status || 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      transaction: result.transaction,
      message: 'Transaction updated successfully' 
    });
  } catch (error) {
    console.error('Error in PUT /api/transactions/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 2.4 Create DELETE /api/transactions/[id] Endpoint
```javascript
// In src/app/api/transactions/[id]/route.ts
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    if (!isAuthenticated()) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get user from token
    const user = getCurrentUser(); // Assuming this function exists
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }
    
    // Call database worker
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/transactions/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        userId: user.id
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to delete transaction' },
        { status: response.status || 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: result.message || 'Transaction deleted successfully' 
    });
  } catch (error) {
    console.error('Error in DELETE /api/transactions/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Testing
- Unit tests for each endpoint
- Integration tests with the database worker
- Authentication tests
- Validation tests

## Step 3: Implement Database Worker API Endpoints

### Objectives
- Create endpoints in the database worker to handle transaction operations
- Ensure proper authentication and authorization
- Implement rate limiting and error handling

### Implementation Tasks

#### 3.1 Add Transaction Endpoints to Database Worker
```javascript
// In workers/database-worker.js
// Add these endpoints to the fetch function

// Create transaction endpoint
if (path === '/transactions' && request.method === 'POST') {
  const rateLimitResult = rateLimit(request, 20, 60); // 20 requests per minute
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }
  
  try {
    const { transactionData } = await request.json();
    
    // Authenticate user (this would be implemented)
    // For now, we'll assume the user ID is provided
    
    const result = await createTransaction(transactionData, transactionData.user_id);
    
    if (!result.success) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: result.error
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      transaction: result.transaction,
      message: 'Transaction created successfully'
    }), {
      status: 201,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// Get user transactions endpoint
if (path.startsWith('/transactions/user/') && request.method === 'POST') {
  try {
    // Extract user ID from path
    const pathParts = path.split('/');
    const userId = pathParts[3];
    
    // Parse filters from request body
    const { filters } = await request.json();
    
    const result = await getUserTransactions(userId, filters);
    
    if (!result.success) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: result.error
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      transactions: result.transactions,
      count: result.count
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// Update transaction endpoint
if (path.startsWith('/transactions/') && request.method === 'PUT') {
  try {
    // Extract transaction ID from path
    const pathParts = path.split('/');
    const transactionId = pathParts[2];
    
    // Parse request body
    const { userId, updates } = await request.json();
    
    const result = await updateTransaction(transactionId, userId, updates);
    
    if (!result.success) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: result.error
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      transaction: result.transaction,
      message: 'Transaction updated successfully'
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// Delete transaction endpoint
if (path.startsWith('/transactions/') && request.method === 'DELETE') {
  try {
    // Extract transaction ID from path
    const pathParts = path.split('/');
    const transactionId = pathParts[2];
    
    // Parse request body
    const { userId } = await request.json();
    
    const result = await deleteTransaction(transactionId, userId);
    
    if (!result.success) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: result.error
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: result.message
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}
```

### Testing
- Unit tests for each endpoint
- Integration tests with the database
- Rate limiting tests
- Error handling tests

## Step 4: Create Basic Frontend Components

### Objectives
- Create the Transactions page layout
- Implement transaction list component
- Create transaction form component

### Implementation Tasks

#### 4.1 Create Transactions Page
```tsx
// src/app/transactions/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  SearchIcon
} from "@heroicons/react/24/outline";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getCurrentUser } from "@/lib/auth-client";

interface Transaction {
  id: string;
  user_id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  receipt_url: string | null;
  merchant: string | null;
  tags: string | null;
  notes: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const user = getCurrentUser();

  // Fetch transactions when component mounts
  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/transactions?search=${searchTerm}`);
      const result = await response.json();
      
      if (result.success) {
        setTransactions(result.transactions);
      } else {
        setError(result.error || "Failed to fetch transactions");
      }
    } catch (err) {
      setError("Failed to fetch transactions");
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = () => {
    setShowForm(true);
    setEditingTransaction(null);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction.id);
    setShowForm(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh transactions
        await fetchTransactions();
      } else {
        setError(result.error || "Failed to delete transaction");
      }
    } catch (err) {
      setError("Failed to delete transaction");
      console.error("Error deleting transaction:", err);
    }
  };

  const handleSubmitTransaction = async (transactionData: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    try {
      let response;
      
      if (editingTransaction) {
        // Update existing transaction
        response = await fetch(`/api/transactions/${editingTransaction}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transactionData),
        });
      } else {
        // Add new transaction
        response = await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transactionData),
        });
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh transactions
        await fetchTransactions();
        setShowForm(false);
      } else {
        setError(result.error || "Failed to save transaction");
      }
    } catch (err) {
      setError("Failed to save transaction");
      console.error("Error saving transaction:", err);
    }
  };

  const handleCancelTransaction = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                <p className="text-gray-600">Track and manage your financial transactions</p>
              </div>
              <Button 
                onClick={handleAddTransaction}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Transaction
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchTransactions()}
              />
            </div>
          </div>

          {showForm && (
            <TransactionForm 
              transaction={editingTransaction ? transactions.find(t => t.id === editingTransaction) : undefined}
              onSubmit={handleSubmitTransaction}
              onCancel={handleCancelTransaction}
            />
          )}

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No transactions found. Add your first transaction to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {transaction.description}
                            {transaction.merchant && (
                              <div className="text-xs text-gray-500">{transaction.merchant}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.category}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            transaction.type === 'income' ? 'text-green-600' : 
                            transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : '⇄'}
                            {transaction.currency} {Math.abs(transaction.amount).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditTransaction(transaction)}
                              className="text-blue-600 hover:text-blue-900 mr-2"
                              aria-label="Edit transaction"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="text-red-600 hover:text-red-900"
                              aria-label="Delete transaction"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
```

#### 4.2 Create Transaction Form Component
```tsx
// src/components/transaction/TransactionForm.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlusIcon, 
  LightBulbIcon
} from "@heroicons/react/24/outline";

interface Transaction {
  id?: string;
  user_id?: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  receipt_url?: string | null;
  merchant?: string | null;
  tags?: string | null;
  notes?: string | null;
  currency?: string;
  created_at?: string;
  updated_at?: string;
}

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

export default function TransactionForm({ 
  transaction, 
  onSubmit, 
  onCancel 
}: TransactionFormProps) {
  const [formData, setFormData] = useState({
    date: transaction?.date || new Date().toISOString().split('T')[0],
    description: transaction?.description || "",
    category: transaction?.category || "",
    amount: transaction?.amount ? transaction.amount.toString() : "",
    type: transaction?.type || "expense",
    merchant: transaction?.merchant || "",
    tags: transaction?.tags || "",
    notes: transaction?.notes || "",
    currency: transaction?.currency || "USD"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transactionData = {
      date: formData.date,
      description: formData.description,
      category: formData.category,
      amount: parseFloat(formData.amount),
      type: formData.type as "income" | "expense" | "transfer",
      merchant: formData.merchant || null,
      tags: formData.tags || null,
      notes: formData.notes || null,
      currency: formData.currency
    };
    
    onSubmit(transactionData);
  };

  return (
    <Card className="mb-6 shadow-sm">
      <CardHeader>
        <CardTitle>
          {transaction?.id ? "Edit Transaction" : "Add New Transaction"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">Date</label>
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">Type</label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as "income" | "expense" | "transfer"})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                required
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <input
                id="description"
                type="text"
                placeholder="e.g., Grocery Store"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="merchant" className="text-sm font-medium">Merchant</label>
              <input
                id="merchant"
                type="text"
                placeholder="e.g., Walmart"
                value={formData.merchant}
                onChange={(e) => setFormData({...formData, merchant: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <input
                id="category"
                type="text"
                placeholder="e.g., Food"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">Amount</label>
              <div className="flex">
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 50.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="flex-1 px-3 py-2 border-t border-b border-r border-gray-300 rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium">Tags</label>
              <input
                id="tags"
                type="text"
                placeholder="e.g., groceries, essentials"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
              <p className="text-xs text-gray-500">Separate tags with commas</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">Notes</label>
            <textarea
              id="notes"
              placeholder="Additional notes about this transaction"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              rows={3}
            />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {transaction?.id ? "Update" : "Add"}
            </Button>
            <Button 
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Testing
- Component rendering tests
- Form validation tests
- User interaction tests
- Integration tests with API endpoints

## Step 5: Add Validation and Error Handling

### Objectives
- Implement comprehensive validation for transaction data
- Add proper error handling throughout the application
- Create user-friendly error messages

### Implementation Tasks

#### 5.1 Create Validation Utility Functions
```ts
// src/lib/transaction-validation.ts
export interface TransactionData {
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  merchant?: string | null;
  tags?: string | null;
  notes?: string | null;
  currency?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateTransactionData(data: Partial<TransactionData>): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Validate date
  if (!data.date) {
    errors.push({ field: 'date', message: 'Date is required' });
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
      errors.push({ field: 'date', message: 'Invalid date format. Use YYYY-MM-DD' });
    }
  }
  
  // Validate description
  if (!data.description) {
    errors.push({ field: 'description', message: 'Description is required' });
  } else if (data.description.length > 255) {
    errors.push({ field: 'description', message: 'Description must be less than 255 characters' });
  }
  
  // Validate category
  if (!data.category) {
    errors.push({ field: 'category', message: 'Category is required' });
  } else if (data.category.length > 50) {
    errors.push({ field: 'category', message: 'Category must be less than 50 characters' });
  }
  
  // Validate amount
  if (data.amount === undefined || data.amount === null) {
    errors.push({ field: 'amount', message: 'Amount is required' });
  } else if (isNaN(data.amount) || data.amount <= 0) {
    errors.push({ field: 'amount', message: 'Amount must be a positive number' });
  }
  
  // Validate type
  if (!data.type) {
    errors.push({ field: 'type', message: 'Transaction type is required' });
  } else if (!['income', 'expense', 'transfer'].includes(data.type)) {
    errors.push({ field: 'type', message: 'Invalid transaction type' });
  }
  
  // Validate currency
  if (data.currency) {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD'];
    if (!validCurrencies.includes(data.currency)) {
      errors.push({ field: 'currency', message: 'Invalid currency code' });
    }
  }
  
  // Validate tags
  if (data.tags && data.tags.length > 255) {
    errors.push({ field: 'tags', message: 'Tags must be less than 255 characters' });
  }
  
  // Validate notes
  if (data.notes && data.notes.length > 1000) {
    errors.push({ field: 'notes', message: 'Notes must be less than 1000 characters' });
  }
  
  return errors;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (error) {
    // Fallback if currency is invalid
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return dateString;
  }
}
```

#### 5.2 Update API Endpoints with Validation
```ts
// Update src/app/api/transactions/route.ts to use validation
import { validateTransactionData } from '@/lib/transaction-validation';

// In POST endpoint, add validation:
const validationErrors = validateTransactionData(transactionData);
if (validationErrors.length > 0) {
  return NextResponse.json(
    { success: false, error: 'Validation failed', details: validationErrors },
    { status: 400 }
  );
}
```

#### 5.3 Update Frontend Components with Validation
```tsx
// Update TransactionForm.tsx to show validation errors
// Add state for validation errors:
const [errors, setErrors] = useState<Record<string, string>>({});

// In handleSubmit, add validation:
const validationErrors = validateTransactionData(formData);
if (validationErrors.length > 0) {
  const errorMap: Record<string, string> = {};
  validationErrors.forEach(error => {
    errorMap[error.field] = error.message;
  });
  setErrors(errorMap);
  return;
}

// Clear errors when user starts typing:
const handleInputChange = (field: string, value: string) => {
  setFormData({...formData, [field]: value});
  if (errors[field]) {
    setErrors({...errors, [field]: ''});
  }
};
```

### Testing
- Unit tests for validation functions
- Integration tests with validation
- Error handling tests
- User experience tests for validation feedback

## Summary

These five steps will establish the core foundation for the Transaction Management feature:

1. **Database Worker Functions** - Backend logic for CRUD operations
2. **API Endpoints** - RESTful interface for frontend communication
3. **Database Worker API Endpoints** - Cloudflare Worker endpoints
4. **Frontend Components** - User interface for transaction management
5. **Validation and Error Handling** - Data integrity and user experience

Each step builds upon the previous one, creating a complete and robust transaction management system.