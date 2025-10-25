# Next 5 Implementation Steps for Transaction Management

## Overview
This document outlines the next 5 implementation steps for the Transaction Management feature, building upon the foundation established in the initial implementation plan.

## Step 1: Implement Advanced Search and Filtering

### Objectives
- Enhance transaction search capabilities
- Add advanced filtering options
- Implement pagination for large datasets

### Implementation Tasks

#### 1.1 Update GET /api/transactions Endpoint with Advanced Filtering
```javascript
// In src/app/api/transactions/route.ts
export async function GET(request: Request) {
  try {
    // Check authentication
    if (!isAuthenticated()) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get user from token
    const user = getCurrentUser();
    
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
      merchant: url.searchParams.get('merchant') || undefined,
      min_amount: url.searchParams.get('min_amount') ? parseFloat(url.searchParams.get('min_amount')!) : undefined,
      max_amount: url.searchParams.get('max_amount') ? parseFloat(url.searchParams.get('max_amount')!) : undefined,
      tags: url.searchParams.get('tags') || undefined,
      sort_by: url.searchParams.get('sort_by') || 'date',
      sort_order: url.searchParams.get('sort_order') || 'desc',
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
    
    return NextResponse.json({ 
      success: true, 
      transactions: result.transactions, 
      count: result.count,
      total: result.total 
    });
  } catch (error) {
    console.error('Error in GET /api/transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 1.2 Update Database Worker Function for Advanced Filtering
```javascript
// In workers/database-worker.js
async function getUserTransactions(userId, filters = {}) {
  try {
    let query = 'SELECT *, COUNT(*) OVER() as total_count FROM transactions WHERE user_id = ?';
    let countQuery = 'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?';
    let bindings = [userId];
    let countBindings = [userId];
    
    // Apply filters
    if (filters.category) {
      query += ' AND category = ?';
      countQuery += ' AND category = ?';
      bindings.push(filters.category);
      countBindings.push(filters.category);
    }
    
    if (filters.type) {
      query += ' AND type = ?';
      countQuery += ' AND type = ?';
      bindings.push(filters.type);
      countBindings.push(filters.type);
    }
    
    if (filters.start_date) {
      query += ' AND date >= ?';
      countQuery += ' AND date >= ?';
      bindings.push(filters.start_date);
      countBindings.push(filters.start_date);
    }
    
    if (filters.end_date) {
      query += ' AND date <= ?';
      countQuery += ' AND date <= ?';
      bindings.push(filters.end_date);
      countBindings.push(filters.end_date);
    }
    
    if (filters.search) {
      query += ' AND (description LIKE ? OR merchant LIKE ? OR notes LIKE ?)';
      countQuery += ' AND (description LIKE ? OR merchant LIKE ? OR notes LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      bindings.push(searchTerm, searchTerm, searchTerm);
      countBindings.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (filters.merchant) {
      query += ' AND merchant LIKE ?';
      countQuery += ' AND merchant LIKE ?';
      bindings.push(`%${filters.merchant}%`);
      countBindings.push(`%${filters.merchant}%`);
    }
    
    if (filters.min_amount !== undefined) {
      query += ' AND amount >= ?';
      countQuery += ' AND amount >= ?';
      bindings.push(filters.min_amount);
      countBindings.push(filters.min_amount);
    }
    
    if (filters.max_amount !== undefined) {
      query += ' AND amount <= ?';
      countQuery += ' AND amount <= ?';
      bindings.push(filters.max_amount);
      countBindings.push(filters.max_amount);
    }
    
    if (filters.tags) {
      query += ' AND tags LIKE ?';
      countQuery += ' AND tags LIKE ?';
      bindings.push(`%${filters.tags}%`);
      countBindings.push(`%${filters.tags}%`);
    }
    
    // Apply sorting
    const validSortFields = ['date', 'amount', 'description', 'merchant', 'category'];
    const validSortOrders = ['asc', 'desc'];
    
    const sortBy = validSortFields.includes(filters.sort_by) ? filters.sort_by : 'date';
    const sortOrder = validSortOrders.includes(filters.sort_order) ? filters.sort_order : 'desc';
    
    query += ` ORDER BY ${sortBy} ${sortOrder}`;
    
    // Apply limit and offset for pagination
    const limit = Math.min(filters.limit || 50, 100); // Cap at 100 per page
    const offset = filters.offset || 0;
    query += ' LIMIT ? OFFSET ?';
    bindings.push(limit, offset);
    
    const result = await env.DB.prepare(query).bind(...bindings).all();
    const countResult = await env.DB.prepare(countQuery).bind(...countBindings).first();
    
    return { 
      success: true, 
      transactions: result.results || [], 
      count: result.results ? result.results.length : 0,
      total: countResult.total
    };
  } catch (error) {
    console.error('Error getting user transactions:', error);
    return { success: false, error: error.message };
  }
}
```

### Testing
- Unit tests for advanced filtering logic
- Integration tests with various filter combinations
- Performance tests with large datasets
- Pagination tests

## Step 2: Implement Bulk Operations

### Objectives
- Enable users to perform actions on multiple transactions
- Implement bulk delete functionality
- Implement bulk update functionality
- Add proper validation and error handling

### Implementation Tasks

#### 2.1 Create Bulk Delete Endpoint
```javascript
// In src/app/api/transactions/bulk-delete/route.ts
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-client';

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
    const user = getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const { transactionIds } = await request.json();
    
    // Validate input
    if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Transaction IDs are required' },
        { status: 400 }
      );
    }
    
    if (transactionIds.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete more than 100 transactions at once' },
        { status: 400 }
      );
    }
    
    // Call database worker
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/transactions/bulk-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        userId: user.id,
        transactionIds
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to delete transactions' },
        { status: response.status || 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${result.deletedCount} transactions`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error in POST /api/transactions/bulk-delete:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 2.2 Create Bulk Update Endpoint
```javascript
// In src/app/api/transactions/bulk-update/route.ts
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-client';
import { validateTransactionData } from '@/lib/transaction-validation';

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
    const user = getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const { transactionIds, updates } = await request.json();
    
    // Validate input
    if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Transaction IDs are required' },
        { status: 400 }
      );
    }
    
    if (transactionIds.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Cannot update more than 100 transactions at once' },
        { status: 400 }
      );
    }
    
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Updates object is required' },
        { status: 400 }
      );
    }
    
    // Validate updates
    const validationErrors = validateTransactionData(updates);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }
    
    // Call database worker
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/transactions/bulk-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        userId: user.id,
        transactionIds,
        updates
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to update transactions' },
        { status: response.status || 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully updated ${result.updatedCount} transactions`,
      updatedCount: result.updatedCount
    });
  } catch (error) {
    console.error('Error in POST /api/transactions/bulk-update:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 2.3 Update Database Worker with Bulk Operations
```javascript
// In workers/database-worker.js

// Bulk delete function
async function bulkDeleteTransactions(userId, transactionIds) {
  try {
    // Validate that all transactions belong to the user
    const placeholders = transactionIds.map(() => '?').join(',');
    const query = `SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND id IN (${placeholders})`;
    const bindings = [userId, ...transactionIds];
    
    const result = await env.DB.prepare(query).bind(...bindings).first();
    
    if (result.count !== transactionIds.length) {
      return { success: false, error: 'Some transactions do not belong to the user' };
    }
    
    // Delete the transactions
    const deleteQuery = `DELETE FROM transactions WHERE user_id = ? AND id IN (${placeholders})`;
    await env.DB.prepare(deleteQuery).bind(userId, ...transactionIds).run();
    
    return { success: true, deletedCount: transactionIds.length };
  } catch (error) {
    console.error('Error bulk deleting transactions:', error);
    return { success: false, error: error.message };
  }
}

// Bulk update function
async function bulkUpdateTransactions(userId, transactionIds, updates) {
  try {
    // Validate that all transactions belong to the user
    const placeholders = transactionIds.map(() => '?').join(',');
    const countQuery = `SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND id IN (${placeholders})`;
    const countBindings = [userId, ...transactionIds];
    
    const countResult = await env.DB.prepare(countQuery).bind(...countBindings).first();
    
    if (countResult.count !== transactionIds.length) {
      return { success: false, error: 'Some transactions do not belong to the user' };
    }
    
    // Build update query dynamically
    let query = `UPDATE transactions SET `;
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
    query += ` WHERE user_id = ? AND id IN (${placeholders})`;
    bindings = [...bindings, userId, ...transactionIds];
    
    await env.DB.prepare(query).bind(...bindings).run();
    
    return { success: true, updatedCount: transactionIds.length };
  } catch (error) {
    console.error('Error bulk updating transactions:', error);
    return { success: false, error: error.message };
  }
}

// Add endpoints to the fetch function
if (path === '/transactions/bulk-delete' && request.method === 'POST') {
  try {
    const { userId, transactionIds } = await request.json();
    
    const result = await bulkDeleteTransactions(userId, transactionIds);
    
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
      deletedCount: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} transactions`
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error in bulk delete endpoint:', error);
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

if (path === '/transactions/bulk-update' && request.method === 'POST') {
  try {
    const { userId, transactionIds, updates } = await request.json();
    
    const result = await bulkUpdateTransactions(userId, transactionIds, updates);
    
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
      updatedCount: result.updatedCount,
      message: `Successfully updated ${result.updatedCount} transactions`
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error in bulk update endpoint:', error);
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
- Unit tests for bulk operations functions
- Integration tests for API endpoints
- Validation tests for input parameters
- Error handling tests

## Step 3: Implement Category Management

### Objectives
- Create a system for managing transaction categories
- Allow users to create, edit, and delete custom categories
- Implement category color coding and icons

### Implementation Tasks

#### 3.1 Create Category API Endpoints
```javascript
// In src/app/api/categories/route.ts
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
    
    // Get user from token
    const user = getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }
    
    // Call database worker
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/categories/user/${user.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to fetch categories' },
        { status: response.status || 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      categories: result.categories
    });
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const user = getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const categoryData = await request.json();
    
    // Validate required fields
    if (!categoryData.name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    // Validate type
    if (categoryData.type && !['income', 'expense'].includes(categoryData.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category type. Must be income or expense' },
        { status: 400 }
      );
    }
    
    // Call database worker
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        categoryData: {
          ...categoryData,
          user_id: user.id
        }
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create category' },
        { status: response.status || 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      category: result.category,
      message: 'Category created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/categories:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 3.2 Create Individual Category Endpoint
```javascript
// In src/app/api/categories/[id]/route.ts
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-client';

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
    const user = getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const updates = await request.json();
    
    // Call database worker
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/categories/${params.id}`, {
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
        { success: false, error: result.error || 'Failed to update category' },
        { status: response.status || 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      category: result.category,
      message: 'Category updated successfully' 
    });
  } catch (error) {
    console.error('Error in PUT /api/categories/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const user = getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }
    
    // Call database worker
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/categories/${params.id}`, {
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
        { success: false, error: result.error || 'Failed to delete category' },
        { status: response.status || 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: result.message || 'Category deleted successfully' 
    });
  } catch (error) {
    console.error('Error in DELETE /api/categories/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 3.3 Update Database Worker with Category Functions
```javascript
// In workers/database-worker.js

// Create category function
async function createCategory(categoryData, userId) {
  try {
    // Validate required fields
    if (!categoryData.name) {
      throw new Error('Category name is required');
    }
    
    // Generate unique ID
    const id = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Set timestamps
    const now = new Date().toISOString();
    
    // Insert category into database
    const result = await env.DB.prepare(
      'INSERT INTO categories (id, user_id, name, type, color, icon, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      userId,
      categoryData.name,
      categoryData.type || null,
      categoryData.color || null,
      categoryData.icon || null,
      now,
      now
    ).run();
    
    // Return the created category
    const newCategory = {
      id,
      user_id: userId,
      name: categoryData.name,
      type: categoryData.type || null,
      color: categoryData.color || null,
      icon: categoryData.icon || null,
      created_at: now,
      updated_at: now
    };
    
    return { success: true, category: newCategory };
  } catch (error) {
    console.error('Error creating category:', error);
    return { success: false, error: error.message };
  }
}

// Get user categories function
async function getUserCategories(userId) {
  try {
    const result = await env.DB.prepare(
      'SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC'
    ).bind(userId).all();
    
    return { success: true, categories: result.results || [] };
  } catch (error) {
    console.error('Error getting user categories:', error);
    return { success: false, error: error.message };
  }
}

// Update category function
async function updateCategory(categoryId, userId, updates) {
  try {
    // Check if category exists and belongs to user
    const existing = await env.DB.prepare(
      'SELECT * FROM categories WHERE id = ? AND user_id = ?'
    ).bind(categoryId, userId).first();
    
    if (!existing) {
      return { success: false, error: 'Category not found' };
    }
    
    // Build update query dynamically
    let query = 'UPDATE categories SET ';
    let bindings = [];
    let fields = [];
    
    // Only update fields that are provided
    const updatableFields = ['name', 'type', 'color', 'icon'];
    
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
    bindings.push(categoryId, userId);
    
    await env.DB.prepare(query).bind(...bindings).run();
    
    // Get the updated category
    const updatedCategory = await env.DB.prepare(
      'SELECT * FROM categories WHERE id = ? AND user_id = ?'
    ).bind(categoryId, userId).first();
    
    return { success: true, category: updatedCategory };
  } catch (error) {
    console.error('Error updating category:', error);
    return { success: false, error: error.message };
  }
}

// Delete category function
async function deleteCategory(categoryId, userId) {
  try {
    // Check if category exists and belongs to user
    const existing = await env.DB.prepare(
      'SELECT * FROM categories WHERE id = ? AND user_id = ?'
    ).bind(categoryId, userId).first();
    
    if (!existing) {
      return { success: false, error: 'Category not found' };
    }
    
    // Delete the category
    await env.DB.prepare(
      'DELETE FROM categories WHERE id = ? AND user_id = ?'
    ).bind(categoryId, userId).run();
    
    return { success: true, message: 'Category deleted successfully' };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: error.message };
  }
}

// Add category endpoints to the fetch function
if (path === '/categories' && request.method === 'POST') {
  try {
    const { categoryData } = await request.json();
    
    const result = await createCategory(categoryData, categoryData.user_id);
    
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
      category: result.category,
      message: 'Category created successfully'
    }), {
      status: 201,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error creating category:', error);
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

if (path.startsWith('/categories/user/') && request.method === 'GET') {
  try {
    // Extract user ID from path
    const pathParts = path.split('/');
    const userId = pathParts[3];
    
    const result = await getUserCategories(userId);
    
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
      categories: result.categories
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error getting categories:', error);
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

if (path.startsWith('/categories/') && request.method === 'PUT') {
  try {
    // Extract category ID from path
    const pathParts = path.split('/');
    const categoryId = pathParts[2];
    
    // Parse request body
    const { userId, updates } = await request.json();
    
    const result = await updateCategory(categoryId, userId, updates);
    
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
      category: result.category,
      message: 'Category updated successfully'
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error updating category:', error);
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

if (path.startsWith('/categories/') && request.method === 'DELETE') {
  try {
    // Extract category ID from path
    const pathParts = path.split('/');
    const categoryId = pathParts[2];
    
    // Parse request body
    const { userId } = await request.json();
    
    const result = await deleteCategory(categoryId, userId);
    
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
    console.error('Error deleting category:', error);
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
- Unit tests for category management functions
- Integration tests for API endpoints
- Validation tests for category data
- Error handling tests

## Step 4: Implement AI-Powered Categorization

### Objectives
- Add AI-powered automatic transaction categorization
- Create an endpoint for suggesting categories based on transaction details
- Implement user feedback mechanism for improving AI suggestions

### Implementation Tasks

#### 4.1 Create AI Categorization Endpoint
```javascript
// In src/app/api/transactions/categorize/route.ts
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-client';

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
    const user = getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const { transactionData } = await request.json();
    
    // Validate required fields
    if (!transactionData.description) {
      return NextResponse.json(
        { success: false, error: 'Transaction description is required for categorization' },
        { status: 400 }
      );
    }
    
    // Call database worker
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/transactions/categorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        transactionData,
        userId: user.id
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to categorize transaction' },
        { status: response.status || 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      category: result.category,
      confidence: result.confidence
    });
  } catch (error) {
    console.error('Error in POST /api/transactions/categorize:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 4.2 Update Database Worker with AI Categorization Function
```javascript
// In workers/database-worker.js

// AI categorization function
async function aiCategorizeTransaction(transactionData, userId) {
  try {
    // Get user's existing categories for context
    const categoriesResult = await getUserCategories(userId);
    const userCategories = categoriesResult.success ? categoriesResult.categories : [];
    
    // Prepare prompt for AI
    const prompt = `
      Based on the transaction description and other details, suggest the most appropriate category.
      
      Transaction Details:
      - Description: ${transactionData.description}
      - Merchant: ${transactionData.merchant || 'N/A'}
      - Amount: ${transactionData.amount || 'N/A'}
      - Type: ${transactionData.type || 'N/A'}
      
      Available Categories:
      ${userCategories.map(cat => `- ${cat.name} (${cat.type})`).join('\n') || 'No custom categories defined'}
      
      Please respond with only the category name that best fits this transaction.
    `;
    
    // Call OpenAI API (this would be implemented with your actual API key)
    // For demonstration purposes, we'll simulate a response
    const simulatedCategories = [
      'Groceries', 'Dining Out', 'Transportation', 'Entertainment', 
      'Shopping', 'Utilities', 'Healthcare', 'Salary', 'Investment Income'
    ];
    
    // Simple keyword matching for demonstration
    const description = transactionData.description.toLowerCase();
    let suggestedCategory = 'Other';
    let confidence = 0.5;
    
    if (description.includes('grocery') || description.includes('food') || description.includes('market')) {
      suggestedCategory = 'Groceries';
      confidence = 0.9;
    } else if (description.includes('restaurant') || description.includes('dining') || description.includes('cafe')) {
      suggestedCategory = 'Dining Out';
      confidence = 0.85;
    } else if (description.includes('gas') || description.includes('uber') || description.includes('taxi')) {
      suggestedCategory = 'Transportation';
      confidence = 0.8;
    } else if (description.includes('movie') || description.includes('concert') || description.includes('entertainment')) {
      suggestedCategory = 'Entertainment';
      confidence = 0.75;
    } else if (description.includes('amazon') || description.includes('shopping') || description.includes('clothing')) {
      suggestedCategory = 'Shopping';
      confidence = 0.7;
    } else if (description.includes('electric') || description.includes('water') || description.includes('internet')) {
      suggestedCategory = 'Utilities';
      confidence = 0.8;
    } else if (description.includes('doctor') || description.includes('hospital') || description.includes('pharmacy')) {
      suggestedCategory = 'Healthcare';
      confidence = 0.75;
    } else if (description.includes('salary') || description.includes('payroll') || description.includes('wage')) {
      suggestedCategory = 'Salary';
      confidence = 0.95;
    } else if (description.includes('dividend') || description.includes('interest') || description.includes('investment')) {
      suggestedCategory = 'Investment Income';
      confidence = 0.9;
    }
    
    // Check if suggested category exists in user's categories
    const matchingCategory = userCategories.find(cat => 
      cat.name.toLowerCase() === suggestedCategory.toLowerCase()
    );
    
    // If not found, find the closest match
    if (!matchingCategory) {
      const closestMatch = userCategories.find(cat => 
        suggestedCategory.toLowerCase().includes(cat.name.toLowerCase()) ||
        cat.name.toLowerCase().includes(suggestedCategory.toLowerCase())
      );
      
      if (closestMatch) {
        suggestedCategory = closestMatch.name;
      }
    }
    
    return { 
      success: true, 
      category: suggestedCategory,
      confidence: confidence
    };
  } catch (error) {
    console.error('Error in AI categorization:', error);
    return { success: false, error: error.message };
  }
}

// Add AI categorization endpoint to the fetch function
if (path === '/transactions/categorize' && request.method === 'POST') {
  try {
    const { transactionData, userId } = await request.json();
    
    const result = await aiCategorizeTransaction(transactionData, userId);
    
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
      category: result.category,
      confidence: result.confidence
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error in AI categorization endpoint:', error);
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

#### 4.3 Update Frontend to Use AI Categorization
```tsx
// In src/components/transaction/TransactionForm.tsx
// Add AI categorization functionality

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  onAICategorize?: (description: string) => Promise<{ category: string; confidence: number }>;
}

export default function TransactionForm({ 
  transaction, 
  onSubmit, 
  onCancel,
  onAICategorize
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
  
  const [isAICategorizing, setIsAICategorizing] = useState(false);

  const handleAICategorize = async () => {
    if (!onAICategorize || !formData.description) return;
    
    setIsAICategorizing(true);
    try {
      const result = await onAICategorize(formData.description);
      setFormData({...formData, category: result.category});
    } catch (error) {
      console.error('Error getting AI category suggestion:', error);
    } finally {
      setIsAICategorizing(false);
    }
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
          {/* ... existing form fields ... */}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ... existing fields ... */}
            
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <div className="flex space-x-2">
                <input
                  id="category"
                  type="text"
                  placeholder="e.g., Food"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  required
                />
                <Button
                  type="button"
                  onClick={handleAICategorize}
                  disabled={!formData.description || isAICategorizing}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm"
                >
                  {isAICategorizing ? 'Suggesting...' : 'AI Suggest'}
                </Button>
              </div>
            </div>
            
            {/* ... rest of form ... */}
          </div>
          
          {/* ... rest of form ... */}
        </form>
      </CardContent>
    </Card>
  );
}
```

### Testing
- Unit tests for AI categorization logic
- Integration tests with simulated AI responses
- Performance tests for categorization speed
- Accuracy tests with various transaction types

## Step 5: Implement Transaction Statistics and Summary

### Objectives
- Create endpoints for transaction statistics and summaries
- Implement spending insights and trends
- Add visualization data for the dashboard

### Implementation Tasks

#### 5.1 Create Statistics API Endpoint
```javascript
// In src/app/api/transactions/stats/route.ts
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
    
    // Get user from token
    const user = getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }
    
    // Parse query parameters
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'month';
    const startDate = url.searchParams.get('start_date') || undefined;
    const endDate = url.searchParams.get('end_date') || undefined;
    
    // Call database worker
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/transactions/stats/${user.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ period, startDate, endDate }),
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to fetch statistics' },
        { status: response.status || 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      stats: result.stats
    });
  } catch (error) {
    console.error('Error in GET /api/transactions/stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 5.2 Update Database Worker with Statistics Function
```javascript
// In workers/database-worker.js

// Transaction statistics function
async function getTransactionStats(userId, options = {}) {
  try {
    const { period = 'month', startDate, endDate } = options;
    
    // Determine date range
    let dateFilter = '';
    let bindings = [userId];
    
    if (startDate && endDate) {
      dateFilter = ' AND date BETWEEN ? AND ?';
      bindings.push(startDate, endDate);
    } else {
      // Default to current period
      const now = new Date();
      let start, end;
      
      switch (period) {
        case 'week':
          start = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
          end = new Date().toISOString().split('T')[0];
          break;
        case 'month':
          start = new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0];
          end = new Date().toISOString().split('T')[0];
          break;
        case 'year':
          start = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split('T')[0];
          end = new Date().toISOString().split('T')[0];
          break;
        default:
          start = new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0];
          end = new Date().toISOString().split('T')[0];
      }
      
      dateFilter = ' AND date BETWEEN ? AND ?';
      bindings.push(start, end);
    }
    
    // Get total income
    const incomeQuery = `
      SELECT COALESCE(SUM(amount), 0) as total_income 
      FROM transactions 
      WHERE user_id = ? AND type = 'income'${dateFilter}
    `;
    
    const incomeResult = await env.DB.prepare(incomeQuery).bind(...bindings).first();
    
    // Get total expenses
    const expenseQuery = `
      SELECT COALESCE(SUM(amount), 0) as total_expenses 
      FROM transactions 
      WHERE user_id = ? AND type = 'expense'${dateFilter}
    `;
    
    const expenseResult = await env.DB.prepare(expenseQuery).bind(...bindings).first();
    
    // Get category breakdown
    const categoryQuery = `
      SELECT category, SUM(amount) as total, type
      FROM transactions 
      WHERE user_id = ?${dateFilter}
      GROUP BY category, type
      ORDER BY total DESC
    `;
    
    const categoryResult = await env.DB.prepare(categoryQuery).bind(...bindings).all();
    
    // Get top merchants
    const merchantQuery = `
      SELECT merchant, SUM(amount) as total
      FROM transactions 
      WHERE user_id = ? AND merchant IS NOT NULL${dateFilter}
      GROUP BY merchant
      ORDER BY total DESC
      LIMIT 5
    `;
    
    const merchantResult = await env.DB.prepare(merchantQuery).bind(...bindings).all();
    
    // Get daily spending trend
    const dailyQuery = `
      SELECT date, SUM(amount) as total
      FROM transactions 
      WHERE user_id = ? AND type = 'expense'${dateFilter}
      GROUP BY date
      ORDER BY date
    `;
    
    const dailyResult = await env.DB.prepare(dailyQuery).bind(...bindings).all();
    
    // Calculate net balance
    const netBalance = incomeResult.total_income - expenseResult.total_expenses;
    
    return { 
      success: true, 
      stats: {
        total_income: incomeResult.total_income,
        total_expenses: expenseResult.total_expenses,
        net_balance: netBalance,
        category_breakdown: categoryResult.results || [],
        top_merchants: merchantResult.results || [],
        daily_trend: dailyResult.results || [],
        period: period,
        start_date: bindings[bindings.length - 2],
        end_date: bindings[bindings.length - 1]
      }
    };
  } catch (error) {
    console.error('Error getting transaction stats:', error);
    return { success: false, error: error.message };
  }
}

// Add statistics endpoint to the fetch function
if (path.startsWith('/transactions/stats/') && request.method === 'POST') {
  try {
    // Extract user ID from path
    const pathParts = path.split('/');
    const userId = pathParts[3];
    
    // Parse request body
    const { period, startDate, endDate } = await request.json();
    
    const result = await getTransactionStats(userId, { period, startDate, endDate });
    
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
      stats: result.stats
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error in statistics endpoint:', error);
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

#### 5.3 Create Statistics Component for Dashboard
```tsx
// src/components/dashboard/TransactionStats.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getCurrentUser } from "@/lib/auth-client";

interface TransactionStats {
  total_income: number;
  total_expenses: number;
  net_balance: number;
  category_breakdown: Array<{category: string; total: number; type: string}>;
  top_merchants: Array<{merchant: string; total: number}>;
  daily_trend: Array<{date: string; total: number}>;
  period: string;
  start_date: string;
  end_date: string;
}

export default function TransactionStats() {
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');

  const user = getCurrentUser();

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, period]);

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/transactions/stats?period=${period}`);
      const result = await response.json();
      
      if (result.success) {
        setStats(result.stats);
      } else {
        setError(result.error || "Failed to fetch statistics");
      }
    } catch (err) {
      setError("Failed to fetch statistics");
      console.error("Error fetching statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Error loading statistics: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Financial Overview</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setPeriod('week')}
            className={`px-3 py-1 text-sm rounded ${period === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Week
          </button>
          <button 
            onClick={() => setPeriod('month')}
            className={`px-3 py-1 text-sm rounded ${period === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Month
          </button>
          <button 
            onClick={() => setPeriod('year')}
            className={`px-3 py-1 text-sm rounded ${period === 'year' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Year
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  ${stats.total_income.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ArrowTrendingDownIcon className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  ${stats.total_expenses.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Net Balance</p>
                <p className={`text-2xl font-bold ${stats.net_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${stats.net_balance.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.category_breakdown.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{item.category}</span>
                  <span className="font-medium">
                    ${item.total.toFixed(2)}
                  </span>
                </div>
              ))}
              {stats.category_breakdown.length === 0 && (
                <p className="text-gray-500 text-sm">No transactions in this period</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Merchants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.top_merchants.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{item.merchant}</span>
                  <span className="font-medium">
                    ${item.total.toFixed(2)}
                  </span>
                </div>
              ))}
              {stats.top_merchants.length === 0 && (
                <p className="text-gray-500 text-sm">No merchant data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### Testing
- Unit tests for statistics calculation functions
- Integration tests for API endpoints
- Performance tests with large datasets
- Visualization tests for dashboard components

## Summary

These next 5 implementation steps will significantly enhance the Transaction Management feature by adding:

1. **Advanced Search and Filtering** - Powerful search capabilities with multiple filter options and pagination
2. **Bulk Operations** - Ability to perform actions on multiple transactions simultaneously
3. **Category Management** - Custom category creation and management system
4. **AI-Powered Categorization** - Intelligent transaction categorization using AI
5. **Transaction Statistics** - Comprehensive financial insights and dashboard visualizations

Each step builds upon the previous implementation work and adds substantial value to the user experience, making BudgetWise AI a more powerful and intuitive financial management tool.