// Rate limiting middleware
const requestCounts = {};

// Budget functions
async function createBudget(budgetData, userId) {
  try {
    // Validate required fields
    if (!budgetData.category || budgetData.limit_amount === undefined) {
      throw new Error('Category and limit amount are required');
    }
    
    // Generate unique ID
    const id = `bud_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Set timestamps
    const now = new Date().toISOString();
    
    // Insert budget into database
    const result = await env.users.prepare(
      'INSERT INTO budgets (id, user_id, category, limit_amount, spent_amount, start_date, end_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      userId,
      budgetData.category,
      budgetData.limit_amount,
      budgetData.spent_amount || 0,
      budgetData.start_date || now,
      budgetData.end_date || null,
      now,
      now
    ).run();
    
    // Return the created budget
    const newBudget = {
      id,
      user_id: userId,
      category: budgetData.category,
      limit_amount: budgetData.limit_amount,
      spent_amount: budgetData.spent_amount || 0,
      start_date: budgetData.start_date || now,
      end_date: budgetData.end_date || null,
      created_at: now,
      updated_at: now
    };
    
    return { success: true, budget: newBudget };
  } catch (error) {
    console.error('Error creating budget:', error);
    return { success: false, error: error.message };
  }
}

async function getUserBudgets(userId) {
  try {
    const result = await env.users.prepare(
      'SELECT * FROM budgets WHERE user_id = ? ORDER BY category ASC'
    ).bind(userId).all();
    
    return { success: true, budgets: result.results || [] };
  } catch (error) {
    console.error('Error getting user budgets:', error);
    return { success: false, error: error.message };
  }
}

async function getBudgetById(budgetId, userId) {
  try {
    const budget = await env.users.prepare(
      'SELECT * FROM budgets WHERE id = ? AND user_id = ?'
    ).bind(budgetId, userId).first();
    
    if (!budget) {
      return { success: false, error: 'Budget not found' };
    }
    
    return { success: true, budget };
  } catch (error) {
    console.error('Error getting budget:', error);
    return { success: false, error: error.message };
  }
}

async function updateBudget(budgetId, userId, updates) {
  try {
    // Check if budget exists and belongs to user
    const existing = await env.users.prepare(
      'SELECT * FROM budgets WHERE id = ? AND user_id = ?'
    ).bind(budgetId, userId).first();
    
    if (!existing) {
      return { success: false, error: 'Budget not found' };
    }
    
    // Build update query dynamically
    let query = 'UPDATE budgets SET ';
    let bindings = [];
    let fields = [];
    
    // Only update fields that are provided
    const updatableFields = ['category', 'limit_amount', 'spent_amount', 'start_date', 'end_date'];
    
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
    bindings.push(budgetId, userId);
    
    await env.users.prepare(query).bind(...bindings).run();
    
    // Get the updated budget
    const updatedBudget = await env.users.prepare(
      'SELECT * FROM budgets WHERE id = ? AND user_id = ?'
    ).bind(budgetId, userId).first();
    
    return { success: true, budget: updatedBudget };
  } catch (error) {
    console.error('Error updating budget:', error);
    return { success: false, error: error.message };
  }
}

async function deleteBudget(budgetId, userId) {
  try {
    // Check if budget exists and belongs to user
    const existing = await env.users.prepare(
      'SELECT * FROM budgets WHERE id = ? AND user_id = ?'
    ).bind(budgetId, userId).first();
    
    if (!existing) {
      return { success: false, error: 'Budget not found' };
    }
    
    // Delete the budget
    await env.users.prepare(
      'DELETE FROM budgets WHERE id = ? AND user_id = ?'
    ).bind(budgetId, userId).run();
    
    return { success: true, message: 'Budget deleted successfully' };
  } catch (error) {
    console.error('Error deleting budget:', error);
    return { success: false, error: error.message };
  }
}

function rateLimit(request, maxRequests, windowSeconds) {
  const ip = request.headers.get('cf-connecting-ip');
  const now = Date.now();

  if (!requestCounts[ip]) {
    requestCounts[ip] = [];
  }

  // Remove requests that are outside the time window
  requestCounts[ip] = requestCounts[ip].filter(
    (timestamp) => timestamp > now - windowSeconds * 1000
  );

  // Check if the number of requests exceeds the limit
  if (requestCounts[ip].length >= maxRequests) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({ success: false, error: 'Too many requests' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      ),
    };
  }

  // Add the current request timestamp
  requestCounts[ip].push(now);

  return { success: true };
}

// Helper function to hash password using Web Crypto API
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper function to verify password
async function verifyPassword(password, hash) {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}

// Helper function to generate secure random token
function generateToken() {
  return crypto.randomUUID();
}

// Helper function to verify auth token
function verifyAuthToken(token) {
  try {
    // Decode the base64 encoded token
    const tokenData = JSON.parse(atob(token));
    return {
      success: true,
      user: tokenData
    };
  } catch (error) {
    return {
      success: false,
      error: 'Invalid token'
    };
  }
}

// Authentication middleware
function requireAuth(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      response: new Response(JSON.stringify({ 
        success: false, 
        error: 'Authentication required'
      }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      })
    };
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const verification = verifyAuthToken(token);
  
  if (!verification.success) {
    return {
      success: false,
      response: new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid token'
      }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      })
    };
  }
  
  return {
    success: true,
    user: verification.user
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Log incoming requests for debugging
    console.log(`Incoming request: ${request.method} ${request.url}`);
    console.log(`Path: ${path}`);
    console.log(`Path parts:`, path.split('/'));
    
    // Handle CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // Health check endpoint
      if (path === '/health') {
        return new Response(JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          database: 'connected'
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      // Test database connection
      if (path === '/test-db') {
        try {
          // Test the database connection with a simple query
          const result = await env.users.prepare('SELECT 1 as test').all();
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Database connection ready',
            result: result,
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }

      // Test database schema
      if (path === '/test-db-schema' && request.method === 'POST') {
        try {
          const { query } = await request.json();
          
          // Test the database schema with the provided query
          const result = await env.users.prepare(query).all();
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Database schema query executed',
            result: result,
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Debug logging for transaction endpoints
      console.log(`Checking transaction endpoints for path: ${path} and method: ${request.method}`);
      
      // Transaction operations
      if (path === '/transactions' && request.method === 'POST') {
        console.log('Matched POST /transactions endpoint');
        // Require authentication for transaction operations
        const authResult = requireAuth(request);
        if (!authResult.success) {
          console.log('Authentication failed for POST /transactions');
          return authResult.response;
        }
        const user = authResult.user;
        console.log('Authentication successful for POST /transactions, user:', user);
        
        try {
          const transactionData = await request.json();
          console.log('Transaction data received:', transactionData);
          
          // Validate required fields
          if (!transactionData.user_id || !transactionData.date || !transactionData.description || 
              transactionData.amount === undefined || !transactionData.type) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Missing required fields: user_id, date, description, amount, type',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Ensure user can only create transactions for themselves
          if (transactionData.user_id !== user.id) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Unauthorized: Cannot create transaction for another user',
              timestamp: new Date().toISOString()
            }), {
              status: 403,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Validate transaction type
          if (transactionData.type !== 'income' && transactionData.type !== 'expense') {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Invalid transaction type. Must be "income" or "expense"',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Generate unique ID
          const id = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
          const now = new Date().toISOString();
          
          // Insert transaction into database
          const result = await env.users.prepare(
            'INSERT INTO transactions (id, user_id, date, description, category, amount, type, receipt_url, merchant, tags, notes, currency, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          ).bind(
            id,
            transactionData.user_id,
            transactionData.date,
            transactionData.description,
            transactionData.category,
            transactionData.amount,
            transactionData.type,
            transactionData.receipt_url,
            transactionData.merchant,
            transactionData.tags,
            transactionData.notes,
            transactionData.currency,
            now,
            now
          ).run();
          console.log('Transaction inserted:', result);
          
          return new Response(JSON.stringify({ 
            success: true, 
            transaction_id: id,
            message: 'Transaction created successfully',
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error creating transaction:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'An error occurred while creating the transaction.',
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      if (path === '/transactions' && request.method === 'GET') {
        console.log('Matched GET /transactions endpoint');
        // Require authentication for transaction operations
        const authResult = requireAuth(request);
        if (!authResult.success) {
          console.log('Authentication failed for GET /transactions');
          return authResult.response;
        }
        const user = authResult.user;
        console.log('Authentication successful for GET /transactions, user:', user);
        
        try {
          // Fetch transactions for the authenticated user
          const result = await env.users.prepare(
            'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC'
          ).bind(user.id).all();
          console.log('Transactions fetched:', result);
          
          return new Response(JSON.stringify({ 
            success: true, 
            transactions: result,
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error fetching transactions:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'An error occurred while fetching transactions.',
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // User operations
      if (path === '/users/register' && request.method === 'POST') {
        try {
          const { email, password } = await request.json();
          
          // Hash the password
          const passwordHash = await hashPassword(password);
          
          // Check if user already exists
          const userExists = await env.users.prepare(
            'SELECT * FROM users WHERE email = ?'
          ).bind(email).all();
          if (userExists.length > 0) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'User already exists.',
              timestamp: new Date().toISOString()
            }), {
              status: 409,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Generate unique ID
          const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
          const now = new Date().toISOString();
          
          // Insert user into database
          const result = await env.users.prepare(
            'INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
          ).bind(
            id,
            email,
            passwordHash,
            now,
            now
          ).run();
          console.log('User registered:', result);
          
          return new Response(JSON.stringify({ 
            success: true, 
            user_id: id,
            message: 'User registered successfully',
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error registering user:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'An error occurred while registering the user.',
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      if (path === '/users/login' && request.method === 'POST') {
        try {
          const { email, password } = await request.json();
          
          // Fetch user by email
          const userResult = await env.users.prepare(
            'SELECT * FROM users WHERE email = ?'
          ).bind(email).all();
          if (userResult.length === 0) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'User not found.',
              timestamp: new Date().toISOString()
            }), {
              status: 404,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          const user = userResult[0];
          
          // Verify password
          const isPasswordValid = await verifyPassword(password, user.password_hash);
          if (!isPasswordValid) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Invalid password.',
              timestamp: new Date().toISOString()
            }), {
              status: 401,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Generate JWT token
          const token = await generateToken(user);
          
          return new Response(JSON.stringify({ 
            success: true, 
            token: token,
            message: 'User logged in successfully',
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error logging in user:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'An error occurred while logging in the user.',
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Set reset token endpoint (for admin/manual use)
      if (path === '/users/reset-token' && request.method === 'POST') {
        try {
          const { email, resetToken, resetExpires } = await request.json();
          
          // Update user with reset token
          await env.users.prepare(
            'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE email = ?'
          ).bind(resetToken, resetExpires, email).run();
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Reset token set successfully.',
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error setting reset token:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'An error occurred while setting reset token.',
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Manual password set endpoint (for admin use)
      if (path === '/users/set-password' && request.method === 'POST') {
        try {
          const { email, password } = await request.json();
          
          // Hash the password
          const passwordHash = await hashPassword(password);
          
          // Update user's password directly
          await env.users.prepare(
            'UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE email = ?'
          ).bind(passwordHash, email).run();
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Password set successfully.',
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error setting password:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'An error occurred while setting password.',
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      if (path === '/transactions' && request.method === 'POST') {
        console.log('Matched POST /transactions endpoint');
        // Require authentication for transaction operations
        const authResult = requireAuth(request);
        if (!authResult.success) {
          console.log('Authentication failed for POST /transactions');
          return authResult.response;
        }
        const user = authResult.user;
        console.log('Authentication successful for POST /transactions, user:', user);
        
        try {
          const transactionData = await request.json();
          console.log('Transaction data received:', transactionData);
          
          // Validate required fields
          if (!transactionData.user_id || !transactionData.date || !transactionData.description || 
              transactionData.amount === undefined || !transactionData.type) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Missing required fields: user_id, date, description, amount, type',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Ensure user can only create transactions for themselves
          if (transactionData.user_id !== user.id) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Unauthorized: Cannot create transaction for another user',
              timestamp: new Date().toISOString()
            }), {
              status: 403,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Validate transaction type
          if (transactionData.type !== 'income' && transactionData.type !== 'expense' && transactionData.type !== 'transfer') {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Invalid transaction type. Must be "income", "expense", or "transfer"',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Generate unique ID
          const id = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
          const now = new Date().toISOString();
          
          // Insert transaction into database
          const result = await env.users.prepare(
            'INSERT INTO transactions (id, user_id, date, description, category, amount, type, receipt_url, merchant, tags, notes, currency, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          ).bind(
            id,
            transactionData.user_id,
            transactionData.date,
            transactionData.description,
            transactionData.category,
            transactionData.amount,
            transactionData.type,
            transactionData.receipt_url,
            transactionData.merchant,
            transactionData.tags,
            transactionData.notes,
            transactionData.currency,
            now,
            now
          ).run();
          console.log('Transaction inserted:', result);
          
          // Return the created transaction
          const newTransaction = {
            id,
            user_id: transactionData.user_id,
            date: transactionData.date,
            description: transactionData.description,
            category: transactionData.category,
            amount: transactionData.amount,
            type: transactionData.type,
            receipt_url: transactionData.receipt_url,
            merchant: transactionData.merchant,
            tags: transactionData.tags,
            notes: transactionData.notes,
            currency: transactionData.currency,
            created_at: now,
            updated_at: now
          };
          
          return new Response(JSON.stringify({ 
            success: true, 
            transaction: newTransaction,
            message: 'Transaction created successfully',
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error creating transaction:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'An error occurred while creating the transaction.',
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      if (path.startsWith('/transactions/user/') && request.method === 'GET') {
        console.log('Matched GET /transactions/user/{userId} endpoint');
        // Require authentication for transaction operations
        const authResult = requireAuth(request);
        if (!authResult.success) {
          console.log('Authentication failed for GET /transactions/user/{userId}');
          return authResult.response;
        }
        const user = authResult.user;
        console.log('Authentication successful for GET /transactions/user/{userId}, user:', user);
        
        try {
          // Extract user ID from the URL path
          const pathParts = path.split('/');
          console.log('Path parts for transaction user lookup:', pathParts);
          if (pathParts.length < 4) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Invalid path. Expected format: /transactions/user/{user_id}',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          const userId = pathParts[3];
          console.log('Extracted userId from path:', userId);
          
          // Ensure user can only access their own transactions
          if (userId !== user.id) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Unauthorized: Cannot access transactions for another user',
              timestamp: new Date().toISOString()
            }), {
              status: 403,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          const limit = url.searchParams.get('limit') || 50;
          const offset = url.searchParams.get('offset') || 0;
          
          // Query transactions from database
          const result = await env.users.prepare(
            'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT ? OFFSET ?'
          ).bind(userId, parseInt(limit), parseInt(offset)).all();
          
          return new Response(JSON.stringify({ 
            success: true, 
            transactions: result.results || [],
            count: result.results ? result.results.length : 0,
            timestamp: new Date().toISOString()
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
            error: error.message,
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      if (path.startsWith('/transactions/') && request.method === 'PUT') {
        console.log('Matched PUT /transactions/{transactionId} endpoint');
        // Require authentication for transaction operations
        const authResult = requireAuth(request);
        if (!authResult.success) {
          console.log('Authentication failed for PUT /transactions/{transactionId}');
          return authResult.response;
        }
        const user = authResult.user;
        console.log('Authentication successful for PUT /transactions/{transactionId}, user:', user);
        
        try {
          // Extract transaction ID from the URL path
          const pathParts = path.split('/');
          console.log('Path parts for transaction update:', pathParts);
          if (pathParts.length < 3) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Invalid path. Expected format: /transactions/{transaction_id}',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          const transactionId = pathParts[2];
          console.log('Extracted transactionId from path:', transactionId);
          
          const updateData = await request.json();
          console.log('Update data received:', updateData);
          
          // Verify the transaction belongs to the user
          const existingTransaction = await env.users.prepare(
            'SELECT * FROM transactions WHERE id = ? AND user_id = ?'
          ).bind(transactionId, user.id).first();
          
          if (!existingTransaction) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Transaction not found or unauthorized',
              timestamp: new Date().toISOString()
            }), {
              status: 404,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Update the transaction
          const now = new Date().toISOString();
          const result = await env.users.prepare(
            'UPDATE transactions SET date = ?, description = ?, category = ?, amount = ?, type = ?, receipt_url = ?, merchant = ?, tags = ?, notes = ?, currency = ?, updated_at = ? WHERE id = ?'
          ).bind(
            updateData.date || existingTransaction.date,
            updateData.description || existingTransaction.description,
            updateData.category || existingTransaction.category,
            updateData.amount !== undefined ? updateData.amount : existingTransaction.amount,
            updateData.type || existingTransaction.type,
            updateData.receipt_url || existingTransaction.receipt_url,
            updateData.merchant || existingTransaction.merchant,
            updateData.tags || existingTransaction.tags,
            updateData.notes || existingTransaction.notes,
            updateData.currency || existingTransaction.currency,
            now,
            transactionId
          ).run();
          
          // Return the updated transaction
          const updatedTransaction = {
            ...existingTransaction,
            ...updateData,
            updated_at: now
          };
          
          return new Response(JSON.stringify({ 
            success: true, 
            transaction: updatedTransaction,
            message: 'Transaction updated successfully',
            timestamp: new Date().toISOString()
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
            error: error.message,
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      if (path.startsWith('/transactions/') && request.method === 'DELETE') {
        console.log('Matched DELETE /transactions/{transactionId} endpoint');
        // Require authentication for transaction operations
        const authResult = requireAuth(request);
        if (!authResult.success) {
          console.log('Authentication failed for DELETE /transactions/{transactionId}');
          return authResult.response;
        }
        const user = authResult.user;
        console.log('Authentication successful for DELETE /transactions/{transactionId}, user:', user);
        
        try {
          // Extract transaction ID from the URL path
          const pathParts = path.split('/');
          console.log('Path parts for transaction delete:', pathParts);
          if (pathParts.length < 3) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Invalid path. Expected format: /transactions/{transaction_id}',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          const transactionId = pathParts[2];
          console.log('Extracted transactionId from path:', transactionId);
          
          // Verify the transaction belongs to the user
          const existingTransaction = await env.users.prepare(
            'SELECT * FROM transactions WHERE id = ? AND user_id = ?'
          ).bind(transactionId, user.id).first();
          
          if (!existingTransaction) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Transaction not found or unauthorized',
              timestamp: new Date().toISOString()
            }), {
              status: 404,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Delete the transaction
          const result = await env.users.prepare(
            'DELETE FROM transactions WHERE id = ?'
          ).bind(transactionId).run();
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Transaction deleted successfully',
            timestamp: new Date().toISOString()
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
            error: error.message,
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Search and filter transactions
      if (path === '/transactions/search' && request.method === 'GET') {
        console.log('Matched GET /transactions/search endpoint');
        // Require authentication for transaction operations
        const authResult = requireAuth(request);
        if (!authResult.success) {
          console.log('Authentication failed for GET /transactions/search');
          return authResult.response;
        }
        const user = authResult.user;
        console.log('Authentication successful for GET /transactions/search, user:', user);
        
        try {
          // Get query parameters
          const userId = user.id;
          const query = url.searchParams.get('query') || '';
          const startDate = url.searchParams.get('start_date') || '';
          const endDate = url.searchParams.get('end_date') || '';
          const category = url.searchParams.get('category') || '';
          const type = url.searchParams.get('type') || '';
          const minAmount = url.searchParams.get('min_amount') || '';
          const maxAmount = url.searchParams.get('max_amount') || '';
          const sortBy = url.searchParams.get('sort_by') || 'date';
          const sortOrder = url.searchParams.get('sort_order') || 'DESC';
          const limit = parseInt(url.searchParams.get('limit') || '50');
          const offset = parseInt(url.searchParams.get('offset') || '0');
          
          // Build the SQL query dynamically
          let sql = 'SELECT * FROM transactions WHERE user_id = ?';
          const params = [userId];
          
          // Add text search condition
          if (query) {
            sql += ' AND (description LIKE ? OR category LIKE ?)';
            params.push(`%${query}%`, `%${query}%`);
          }
          
          // Add date range conditions
          if (startDate) {
            sql += ' AND date >= ?';
            params.push(startDate);
          }
          
          if (endDate) {
            sql += ' AND date <= ?';
            params.push(endDate);
          }
          
          // Add category filter
          if (category) {
            sql += ' AND category = ?';
            params.push(category);
          }
          
          // Add type filter
          if (type) {
            sql += ' AND type = ?';
            params.push(type);
          }
          
          // Add amount range filters
          if (minAmount) {
            sql += ' AND amount >= ?';
            params.push(parseFloat(minAmount));
          }
          
          if (maxAmount) {
            sql += ' AND amount <= ?';
            params.push(parseFloat(maxAmount));
          }
          
          // Add sorting
          const validSortColumns = ['date', 'amount', 'description', 'category'];
          const validSortOrders = ['ASC', 'DESC'];
          const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'date';
          const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
          sql += ` ORDER BY ${sortColumn} ${sortDirection}`;
          
          // Add pagination
          sql += ' LIMIT ? OFFSET ?';
          params.push(limit, offset);
          
          console.log('Executing search query:', sql, params);
          
          // Execute the query
          const result = await env.users.prepare(sql).bind(...params).all();
          
          // Get total count for pagination
          let countSql = 'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?';
          const countParams = [userId];
          
          // Add the same conditions for count query
          if (query) {
            countSql += ' AND (description LIKE ? OR category LIKE ?)';
            countParams.push(`%${query}%`, `%${query}%`);
          }
          
          if (startDate) {
            countSql += ' AND date >= ?';
            countParams.push(startDate);
          }
          
          if (endDate) {
            countSql += ' AND date <= ?';
            countParams.push(endDate);
          }
          
          if (category) {
            countSql += ' AND category = ?';
            countParams.push(category);
          }
          
          if (type) {
            countSql += ' AND type = ?';
            countParams.push(type);
          }
          
          if (minAmount) {
            countSql += ' AND amount >= ?';
            countParams.push(parseFloat(minAmount));
          }
          
          if (maxAmount) {
            countSql += ' AND amount <= ?';
            countParams.push(parseFloat(maxAmount));
          }
          
          const countResult = await env.users.prepare(countSql).bind(...countParams).first();
          const totalCount = countResult.total || 0;
          
          return new Response(JSON.stringify({ 
            success: true, 
            transactions: result.results || [],
            count: result.results ? result.results.length : 0,
            total: totalCount,
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error searching transactions:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Bulk delete transactions
      if (path === '/transactions/bulk-delete' && request.method === 'POST') {
        console.log('Matched POST /transactions/bulk-delete endpoint');
        // Require authentication for transaction operations
        const authResult = requireAuth(request);
        if (!authResult.success) {
          console.log('Authentication failed for POST /transactions/bulk-delete');
          return authResult.response;
        }
        const user = authResult.user;
        console.log('Authentication successful for POST /transactions/bulk-delete, user:', user);
        
        try {
          const { transaction_ids } = await request.json();
          
          // Validate input
          if (!Array.isArray(transaction_ids) || transaction_ids.length === 0) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'transaction_ids must be a non-empty array',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Verify all transactions belong to the user
          const placeholders = transaction_ids.map(() => '?').join(',');
          const checkQuery = `SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND id IN (${placeholders})`;
          const checkParams = [user.id, ...transaction_ids];
          
          const checkResult = await env.users.prepare(checkQuery).bind(...checkParams).first();
          
          if (checkResult.count !== transaction_ids.length) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'One or more transactions do not belong to the user or do not exist',
              timestamp: new Date().toISOString()
            }), {
              status: 403,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Delete the transactions
          const deleteQuery = `DELETE FROM transactions WHERE user_id = ? AND id IN (${placeholders})`;
          const deleteParams = [user.id, ...transaction_ids];
          
          const result = await env.users.prepare(deleteQuery).bind(...deleteParams).run();
          
          return new Response(JSON.stringify({ 
            success: true, 
            deleted_count: result.meta.changes || 0,
            message: 'Transactions deleted successfully',
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error bulk deleting transactions:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Bulk update transactions
      if (path === '/transactions/bulk-update' && request.method === 'POST') {
        console.log('Matched POST /transactions/bulk-update endpoint');
        // Require authentication for transaction operations
        const authResult = requireAuth(request);
        if (!authResult.success) {
          console.log('Authentication failed for POST /transactions/bulk-update');
          return authResult.response;
        }
        const user = authResult.user;
        console.log('Authentication successful for POST /transactions/bulk-update, user:', user);
        
        try {
          const { transaction_ids, updates } = await request.json();
          
          // Validate input
          if (!Array.isArray(transaction_ids) || transaction_ids.length === 0) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'transaction_ids must be a non-empty array',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          if (!updates || typeof updates !== 'object') {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'updates must be an object',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Verify all transactions belong to the user
          const placeholders = transaction_ids.map(() => '?').join(',');
          const checkQuery = `SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND id IN (${placeholders})`;
          const checkParams = [user.id, ...transaction_ids];
          
          const checkResult = await env.users.prepare(checkQuery).bind(...checkParams).first();
          
          if (checkResult.count !== transaction_ids.length) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'One or more transactions do not belong to the user or do not exist',
              timestamp: new Date().toISOString()
            }), {
              status: 403,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Build update query
          const updateFields = [];
          const updateParams = [];
          
          for (const [key, value] of Object.entries(updates)) {
            // Only allow updating specific fields
            const allowedFields = ['category', 'type', 'merchant', 'tags', 'notes', 'currency'];
            if (allowedFields.includes(key)) {
              updateFields.push(`${key} = ?`);
              updateParams.push(value);
            }
          }
          
          if (updateFields.length === 0) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'No valid fields to update',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Add updated_at timestamp
          updateFields.push('updated_at = ?');
          updateParams.push(new Date().toISOString());
          
          // Add user_id and transaction_ids to parameters
          const updateQuery = `UPDATE transactions SET ${updateFields.join(', ')} WHERE user_id = ? AND id IN (${placeholders})`;
          const finalParams = [...updateParams, user.id, ...transaction_ids];
          
          const result = await env.users.prepare(updateQuery).bind(...finalParams).run();
          
          return new Response(JSON.stringify({ 
            success: true, 
            updated_count: result.meta.changes || 0,
            message: 'Transactions updated successfully',
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error bulk updating transactions:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Spending by category report
      if (path === '/transactions/analytics/spending-by-category' && request.method === 'GET') {
        console.log('Matched GET /transactions/analytics/spending-by-category endpoint');
        // Require authentication for transaction operations
        const authResult = requireAuth(request);
        if (!authResult.success) {
          console.log('Authentication failed for GET /transactions/analytics/spending-by-category');
          return authResult.response;
        }
        const user = authResult.user;
        console.log('Authentication successful for GET /transactions/analytics/spending-by-category, user:', user);
        
        try {
          // Get query parameters
          const userId = user.id;
          const startDate = url.searchParams.get('start_date') || '';
          const endDate = url.searchParams.get('end_date') || '';
          const type = url.searchParams.get('type') || '';
          
          // Build the SQL query
          let sql = 'SELECT category, SUM(amount) as amount, COUNT(*) as count FROM transactions WHERE user_id = ? AND type = ?';
          const params = [userId, 'expense'];
          
          // Add date range conditions
          if (startDate) {
            sql += ' AND date >= ?';
            params.push(startDate);
          }
          
          if (endDate) {
            sql += ' AND date <= ?';
            params.push(endDate);
          }
          
          // Add type filter if specified
          if (type) {
            sql += ' AND type = ?';
            params.push(type);
          }
          
          sql += ' GROUP BY category ORDER BY amount DESC';
          
          console.log('Executing spending by category query:', sql, params);
          
          // Execute the query
          const result = await env.users.prepare(sql).bind(...params).all();
          
          // Calculate total for percentage calculation
          const totalResult = await env.users.prepare(
            'SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type = ?'
          ).bind(userId, 'expense').first();
          
          const total = totalResult.total || 0;
          
          // Add percentage to each category
          const data = (result.results || []).map(row => ({
            ...row,
            percentage: total > 0 ? (row.amount / total) * 100 : 0
          }));
          
          return new Response(JSON.stringify({ 
            success: true, 
            data: data,
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error getting spending by category:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Monthly spending summary
      if (path === '/transactions/analytics/monthly-summary' && request.method === 'GET') {
        console.log('Matched GET /transactions/analytics/monthly-summary endpoint');
        // Require authentication for transaction operations
        const authResult = requireAuth(request);
        if (!authResult.success) {
          console.log('Authentication failed for GET /transactions/analytics/monthly-summary');
          return authResult.response;
        }
        const user = authResult.user;
        console.log('Authentication successful for GET /transactions/analytics/monthly-summary, user:', user);
        
        try {
          // Get query parameters
          const userId = user.id;
          const year = url.searchParams.get('year') || new Date().getFullYear();
          
          // Build the SQL query
          const sql = `
            SELECT 
              strftime('%Y-%m', date) as month,
              SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
              SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
              SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as net
            FROM transactions 
            WHERE user_id = ? AND strftime('%Y', date) = ?
            GROUP BY strftime('%Y-%m', date)
            ORDER BY month
          `;
          
          const params = [userId, year.toString()];
          
          console.log('Executing monthly summary query:', sql, params);
          
          // Execute the query
          const result = await env.users.prepare(sql).bind(...params).all();
          
          return new Response(JSON.stringify({ 
            success: true, 
            data: result.results || [],
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error getting monthly summary:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Get category rules for user
      if (path.startsWith('/category-rules/user/') && request.method === 'GET') {
        console.log('Matched GET /category-rules/user/{userId} endpoint');
        // Require authentication for category rules operations
        const authResult = requireAuth(request);
        if (!authResult.success) {
          console.log('Authentication failed for GET /category-rules/user/{userId}');
          return authResult.response;
        }
        const user = authResult.user;
        console.log('Authentication successful for GET /category-rules/user/{userId}, user:', user);
        
        try {
          // Extract user ID from the URL path
          const pathParts = path.split('/');
          console.log('Path parts for category rules user lookup:', pathParts);
          if (pathParts.length < 4) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Invalid path. Expected format: /category-rules/user/{user_id}',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          const userId = pathParts[3];
          console.log('Extracted userId from path:', userId);
          
          // Ensure user can only access their own category rules
          if (userId !== user.id) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Unauthorized: Cannot access category rules for another user',
              timestamp: new Date().toISOString()
            }), {
              status: 403,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Query category rules from database
          const result = await env.users.prepare(
            'SELECT * FROM category_rules WHERE user_id = ? ORDER BY priority DESC, created_at DESC'
          ).bind(userId).all();
          
          return new Response(JSON.stringify({ 
            success: true, 
            category_rules: result.results || [],
            count: result.results ? result.results.length : 0,
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error getting category rules:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Create category rule
      if (path === '/category-rules' && request.method === 'POST') {
        console.log('Matched POST /category-rules endpoint');
        // Require authentication for category rules operations
        const authResult = requireAuth(request);
        if (!authResult.success) {
          console.log('Authentication failed for POST /category-rules');
          return authResult.response;
        }
        const user = authResult.user;
        console.log('Authentication successful for POST /category-rules, user:', user);
        
        try {
          const ruleData = await request.json();
          console.log('Category rule data received:', ruleData);
          
          // Validate required fields
          if (!ruleData.merchant_pattern || !ruleData.category) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Missing required fields: merchant_pattern, category',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Ensure user can only create rules for themselves
          if (ruleData.user_id !== user.id) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Unauthorized: Cannot create category rule for another user',
              timestamp: new Date().toISOString()
            }), {
              status: 403,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Generate unique ID
          const id = `catrule_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
          const now = new Date().toISOString();
          
          // Insert category rule into database
          const result = await env.users.prepare(
            'INSERT INTO category_rules (id, user_id, merchant_pattern, category, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
          ).bind(
            id,
            ruleData.user_id,
            ruleData.merchant_pattern,
            ruleData.category,
            ruleData.priority || 0,
            now,
            now
          ).run();
          
          // Return the created category rule
          const newCategoryRule = {
            id,
            user_id: ruleData.user_id,
            merchant_pattern: ruleData.merchant_pattern,
            category: ruleData.category,
            priority: ruleData.priority || 0,
            created_at: now,
            updated_at: now
          };
          
          return new Response(JSON.stringify({ 
            success: true, 
            category_rule: newCategoryRule,
            message: 'Category rule created successfully',
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error creating category rule:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Test SendGrid configuration endpoint
      if (path === '/test-sendgrid' && request.method === 'GET') {
        try {
          // Check if SendGrid is configured
          const isSendGridConfigured = !!(env.SENDGRID_API_KEY && env.SENDGRID_API_KEY !== 'your_sendgrid_api_key_here');
          
          return new Response(JSON.stringify({ 
            success: true,
            sendgridConfigured: isSendGridConfigured,
            hasApiKey: !!env.SENDGRID_API_KEY,
            isPlaceholder: env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here',
            message: isSendGridConfigured 
              ? 'SendGrid is properly configured' 
              : 'SendGrid is not configured or using placeholder values'
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          return new Response(JSON.stringify({ 
            success: false,
            error: error.message
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }

      // Update category rule
      if (path.startsWith('/category-rules/') && request.method === 'PUT') {
        console.log('Matched PUT /category-rules/{ruleId} endpoint');
        // Require authentication for category rules operations
        const authResult = requireAuth(request);
        if (!authResult.success) {
          console.log('Authentication failed for PUT /category-rules/{ruleId}');
          return authResult.response;
        }
        const user = authResult.user;
        console.log('Authentication successful for PUT /category-rules/{ruleId}, user:', user);
        
        try {
          // Extract rule ID from the URL path
          const pathParts = path.split('/');
          console.log('Path parts for category rule update:', pathParts);
          if (pathParts.length < 3) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Invalid path. Expected format: /category-rules/{rule_id}',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          const ruleId = pathParts[2];
          console.log('Extracted ruleId from path:', ruleId);
          
          const updateData = await request.json();
          console.log('Update data received:', updateData);
          
          // Verify the category rule belongs to the user
          const existingRule = await env.users.prepare(
            'SELECT * FROM category_rules WHERE id = ? AND user_id = ?'
          ).bind(ruleId, user.id).first();
          
          if (!existingRule) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Category rule not found or unauthorized',
              timestamp: new Date().toISOString()
            }), {
              status: 404,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Update the category rule
          const now = new Date().toISOString();
          const result = await env.users.prepare(
            'UPDATE category_rules SET merchant_pattern = ?, category = ?, priority = ?, updated_at = ? WHERE id = ?'
          ).bind(
            updateData.merchant_pattern || existingRule.merchant_pattern,
            updateData.category || existingRule.category,
            updateData.priority !== undefined ? updateData.priority : existingRule.priority,
            now,
            ruleId
          ).run();
          
          // Return the updated category rule
          const updatedRule = {
            ...existingRule,
            ...updateData,
            updated_at: now
          };
          
          return new Response(JSON.stringify({ 
            success: true, 
            category_rule: updatedRule,
            message: 'Category rule updated successfully',
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error updating category rule:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Delete category rule
      if (path.startsWith('/category-rules/') && request.method === 'DELETE') {
        console.log('Matched DELETE /category-rules/{ruleId} endpoint');
        // Require authentication for category rules operations
        const authResult = requireAuth(request);
        if (!authResult.success) {
          console.log('Authentication failed for DELETE /category-rules/{ruleId}');
          return authResult.response;
        }
        const user = authResult.user;
        console.log('Authentication successful for DELETE /category-rules/{ruleId}, user:', user);
        
        try {
          // Extract rule ID from the URL path
          const pathParts = path.split('/');
          console.log('Path parts for category rule delete:', pathParts);
          if (pathParts.length < 3) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Invalid path. Expected format: /category-rules/{rule_id}',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          const ruleId = pathParts[2];
          console.log('Extracted ruleId from path:', ruleId);
          
          // Verify the category rule belongs to the user
          const existingRule = await env.users.prepare(
            'SELECT * FROM category_rules WHERE id = ? AND user_id = ?'
          ).bind(ruleId, user.id).first();
          
          if (!existingRule) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Category rule not found or unauthorized',
              timestamp: new Date().toISOString()
            }), {
              status: 404,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Delete the category rule
          const result = await env.users.prepare(
            'DELETE FROM category_rules WHERE id = ?'
          ).bind(ruleId).run();
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Category rule deleted successfully',
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error deleting category rule:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Get category suggestion
      if (path === '/transactions/categorize' && request.method === 'POST') {
        console.log('Matched POST /transactions/categorize endpoint');
        // Require authentication for transaction operations
        const authResult = requireAuth(request);
        if (!authResult.success) {
          console.log('Authentication failed for POST /transactions/categorize');
          return authResult.response;
        }
        const user = authResult.user;
        console.log('Authentication successful for POST /transactions/categorize, user:', user);
        
        try {
          const { description, merchant, amount } = await request.json();
          
          // Validate input
          if (!description) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'description is required',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Get user's category rules
          const rulesResult = await env.users.prepare(
            'SELECT * FROM category_rules WHERE user_id = ? ORDER BY priority DESC'
          ).bind(user.id).all();
          
          const rules = rulesResult.results || [];
          
          // Try to match against category rules
          let matchedCategory = null;
          let confidence = 0;
          
          // Check merchant first
          if (merchant) {
            for (const rule of rules) {
              const pattern = new RegExp(rule.merchant_pattern, 'i');
              if (pattern.test(merchant)) {
                matchedCategory = rule.category;
                confidence = 0.9;
                break;
              }
            }
          }
          
          // If no merchant match, check description
          if (!matchedCategory && description) {
            for (const rule of rules) {
              const pattern = new RegExp(rule.merchant_pattern, 'i');
              if (pattern.test(description)) {
                matchedCategory = rule.category;
                confidence = 0.8;
                break;
              }
            }
          }
          
          // If no rules match, use simple keyword matching
          if (!matchedCategory) {
            const lowerDescription = (description || '').toLowerCase();
            const lowerMerchant = (merchant || '').toLowerCase();
            
            // Simple keyword matching
            if (lowerDescription.includes('grocery') || lowerDescription.includes('food') || 
                lowerMerchant.includes('grocery') || lowerMerchant.includes('food')) {
              matchedCategory = 'Food & Dining';
              confidence = 0.7;
            } else if (lowerDescription.includes('gas') || lowerDescription.includes('fuel') || 
                       lowerMerchant.includes('gas') || lowerMerchant.includes('fuel')) {
              matchedCategory = 'Transportation';
              confidence = 0.7;
            } else if (lowerDescription.includes('salary') || lowerDescription.includes('payroll') || 
                       lowerMerchant.includes('salary') || lowerMerchant.includes('payroll')) {
              matchedCategory = 'Income';
              confidence = 0.9;
            } else if (lowerDescription.includes('rent') || lowerDescription.includes('mortgage') || 
                       lowerMerchant.includes('rent') || lowerMerchant.includes('mortgage')) {
              matchedCategory = 'Housing';
              confidence = 0.8;
            } else if (lowerDescription.includes('utility') || lowerDescription.includes('electric') || 
                       lowerMerchant.includes('utility') || lowerMerchant.includes('electric')) {
              matchedCategory = 'Utilities';
              confidence = 0.8;
            } else {
              // Default category
              matchedCategory = 'Uncategorized';
              confidence = 0.1;
            }
          }
          
          return new Response(JSON.stringify({ 
            success: true, 
            category: matchedCategory,
            confidence: confidence,
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error categorizing transaction:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // User operations
      if (path === '/users' && request.method === 'POST') {
        const rateLimitResult = rateLimit(request, 10, 60); // 10 requests per minute
        if (!rateLimitResult.success) {
          return rateLimitResult.response;
        }
        try {
          const userData = await request.json();
          
          // Hash the password before storing
          const passwordHash = await hashPassword(userData.password);
          
          // Generate email verification token and expiration (24 hours from now)
          const emailVerificationToken = generateToken();
          const emailVerificationExpires = new Date(Date.now() + 86400000); // 24 hours
          
          // Insert user into database with email verification token
          const result = await env.users.prepare(
            'INSERT INTO users (id, email, name, password_hash, plan, is_admin, email_verified, trial_ends_at, email_verification_token, email_verification_expires) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          ).bind(
            userData.id,
            userData.email,
            userData.name,
            passwordHash,
            userData.plan || 'trial',
            userData.is_admin || false,
            userData.email_verified || false, // Use the provided value or default to false
            userData.trial_ends_at || null,
            emailVerificationToken,
            emailVerificationExpires.toISOString()
          ).run();
          
          // Send confirmation email using Cloudflare Email Service
          try {
            const confirmationUrl = `https://budgetwise-ai.pages.dev/auth/confirm-email?token=${emailVerificationToken}`;
            
            // Create a nice HTML email template
            const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Confirm your BudgetWise account</title>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
                  .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 40px; }
                  .header { text-align: center; margin-bottom: 30px; }
                  .logo { width: 40px; height: 40px; margin: 0 auto; }
                  h1 { color: #333; font-size: 24px; margin: 20px 0; }
                  p { color: #666; font-size: 16px; line-height: 1.5; margin: 15px 0; }
                  .button { display: inline-block; background: #000; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                  .footer { margin-top: 30px; text-align: center; color: #999; font-size: 14px; }
                  .url { word-break: break-all; color: #0066cc; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <div class="logo">💰</div>
                    <h1>Welcome to BudgetWise!</h1>
                  </div>
                  <p>Hello ${userData.name},</p>
                  <p>Thank you for signing up for BudgetWise! We're excited to help you take control of your finances with our AI-powered platform.</p>
                  <p>Please click the button below to confirm your email address:</p>
                  <div style="text-align: center;">
                    <a href="${confirmationUrl}" class="button">Confirm Email Address</a>
                  </div>
                  <p>Or copy and paste this URL into your browser:</p>
                  <p class="url">${confirmationUrl}</p>
                  <p>If you didn't create an account with us, you can safely ignore this email.</p>
                  <div class="footer">
                    <p>Best regards,<br>The BudgetWise Team</p>
                  </div>
                </div>
              </body>
            </html>`;

            // Send email via Cloudflare Email Service
            await env.SEND_EMAIL.send({
              to: [{ email: userData.email, name: userData.name }],
              from: {
                email: 'noreply@budgetwise.ai',
                name: 'BudgetWise'
              },
              subject: 'Confirm your BudgetWise account',
              html: html,
              text: `Hello ${userData.name},

Thank you for signing up for BudgetWise!

Please click the link below to confirm your email address:
${confirmationUrl}

If you didn't create an account, you can safely ignore this email.

Best regards,
The BudgetWise Team`
            });
            
            console.log('Confirmation email sent successfully to', userData.email);
          } catch (emailError) {
            console.error('Failed to send confirmation email via Cloudflare:', emailError);
          }
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'User created successfully. Please check your email for confirmation.',
            result: result,
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          // Handle specific database errors
          if (error.message.includes('UNIQUE constraint failed: users.email')) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'An account with this email address already exists. Please use a different email or try logging in instead.',
              timestamp: new Date().toISOString()
            }), {
              status: 409, // Conflict status code
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Get user by email
      if (path.startsWith('/users/') && request.method === 'GET') {
        try {
          console.log(`Matched user lookup path: ${path}`);
          
          // Extract and decode the email from the URL path
          const pathParts = path.split('/');
          console.log(`Path parts:`, pathParts);
          
          if (pathParts.length < 3) {
            console.log('Invalid path structure');
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Invalid path',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          const encodedEmail = pathParts[2];
          const email = decodeURIComponent(encodedEmail);
          
          console.log(`Looking up user with email: ${email}`);
          
          // Query user from database
          const result = await env.users.prepare(
            'SELECT * FROM users WHERE email = ?'
          ).bind(email).first();
          
          console.log(`Database query result for ${email}:`, result);
          
          if (result) {
            return new Response(JSON.stringify({ 
              success: true, 
              user: result,
              timestamp: new Date().toISOString()
            }), {
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          } else {
            return new Response(JSON.stringify({ 
              success: false, 
              message: 'User not found',
              timestamp: new Date().toISOString()
            }), {
              status: 404,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
        } catch (error) {
          console.error('Error getting user:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Login endpoint
      if (path === '/auth/login' && request.method === 'POST') {
        const rateLimitResult = rateLimit(request, 5, 60); // 5 requests per minute
        if (!rateLimitResult.success) {
          return rateLimitResult.response;
        }
        try {
          const { email, password } = await request.json();
          
          // Query user from database
          const user = await env.users.prepare(
            'SELECT * FROM users WHERE email = ?'
          ).bind(email).first();
          
          if (!user) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Invalid credentials',
              timestamp: new Date().toISOString()
            }), {
              status: 401,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Verify password
          const isValidPassword = await verifyPassword(password, user.password_hash);
          
          if (!isValidPassword) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Invalid credentials',
              timestamp: new Date().toISOString()
            }), {
              status: 401,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Check if email is verified
          if (!user.email_verified) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Please verify your email address before logging in. Check your inbox for the confirmation email.',
              timestamp: new Date().toISOString()
            }), {
              status: 401,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Remove password_hash from response
          const { password_hash, ...userWithoutPassword } = user;
          
          return new Response(JSON.stringify({ 
            success: true, 
            user: userWithoutPassword,
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error during login:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Password reset request endpoint
      if (path === '/auth/forgot-password' && request.method === 'POST') {
        const rateLimitResult = rateLimit(request, 3, 60); // 3 requests per minute
        if (!rateLimitResult.success) {
          return rateLimitResult.response;
        }
        try {
          let email;
          try {
            const body = await request.json();
            email = body.email;
          } catch (parseError) {
            // If JSON parsing fails, we still return success for security reasons
            return new Response(JSON.stringify({ 
              success: true, 
              message: 'If an account exists with that email, you will receive a password reset link shortly.',
              timestamp: new Date().toISOString()
            }), {
              status: 200,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Check if user exists
          const user = await env.users.prepare(
            'SELECT * FROM users WHERE email = ?'
          ).bind(email).first();
          
          if (!user) {
            // We don't reveal if the email exists for security reasons
            return new Response(JSON.stringify({ 
              success: true, 
              message: 'If an account exists with that email, you will receive a password reset link shortly.',
              timestamp: new Date().toISOString()
            }), {
              status: 200,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Generate reset token and expiration (1 hour from now)
          const resetToken = generateToken();
          const resetExpires = new Date(Date.now() + 3600000); // 1 hour
          
          // Update user with reset token
          await env.users.prepare(
            'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE email = ?'
          ).bind(resetToken, resetExpires.toISOString(), email).run();
          
          // Send reset email (if SENDGRID_API_KEY is configured and is not a placeholder)
          if (env.SENDGRID_API_KEY && env.SENDGRID_API_KEY !== 'your_sendgrid_api_key_here') {
            try {
              const resetUrl = `https://budgetwise-ai.pages.dev/auth/reset-password?token=${resetToken}`;
              
              // Send email via SendGrid
              const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${env.SENDGRID_API_KEY}`
                },
                body: JSON.stringify({
                  personalizations: [{
                    to: [{ email: email }],
                    subject: 'Reset your BudgetWise password'
                  }],
                  from: {
                    email: env.SENDGRID_FROM_EMAIL || 'noreply@budgetwise.ai',
                    name: 'BudgetWise'
                  },
                  content: [{
                    type: 'text/html',
                    value: `
                      <p>Hello,</p>
                      <p>You requested to reset your BudgetWise password.</p>
                      <p>Please click the link below to reset your password:</p>
                      <p><a href="${resetUrl}">Reset Password</a></p>
                      <p>If you didn't request a password reset, you can safely ignore this email.</p>
                      <p>Best regards,<br>The BudgetWise Team</p>
                    `
                  }]
                })
              });
              
              if (!emailResponse.ok) {
                const errorText = await emailResponse.text();
                console.error('SendGrid email error:', errorText);
              } else {
                console.log('Password reset email sent successfully to', email);
              }
            } catch (emailError) {
              console.error('Failed to send password reset email:', emailError);
            }
          } else {
            // Fallback for development - log the reset URL
            const resetUrl = `https://budgetwise-ai.pages.dev/auth/reset-password?token=${resetToken}`;
            console.log('SendGrid not configured. Password reset URL for development:', resetUrl);
          }
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'If an account exists with that email, you will receive a password reset link shortly.',
            timestamp: new Date().toISOString()
          }), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error during password reset request:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'An error occurred while processing your request. Please try again.',
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Verify password reset token endpoint
      if (path === '/auth/reset-password/verify' && request.method === 'POST') {
        try {
          let token;
          try {
            const body = await request.json();
            token = body.token;
          } catch (parseError) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Token is required.',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          if (!token) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Token is required.',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
              }
            });
          }
          
          const user = await env.users.prepare(
            'SELECT * FROM users WHERE password_reset_token = ? AND password_reset_expires > ?'
          ).bind(token, new Date().toISOString()).first();
          
          if (!user) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Invalid or expired token.',
              timestamp: new Date().toISOString()
            }), {
              status: 401,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Token is valid.',
            timestamp: new Date().toISOString()
          }), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error during password reset token verification:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'An error occurred while verifying your token. Please try again.',
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Reset password endpoint
      if (path === '/auth/reset-password' && request.method === 'POST') {
        try {
          let token;
          let password;
          try {
            const body = await request.json();
            token = body.token;
            password = body.password;
          } catch (parseError) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Token and password are required.',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          if (!token || !password) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Token and password are required.',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
              }
            });
          }
          
          const user = await env.users.prepare(
            'SELECT * FROM users WHERE password_reset_token = ? AND password_reset_expires > ?'
          ).bind(token, new Date().toISOString()).first();
          
          if (!user) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Invalid or expired token.',
              timestamp: new Date().toISOString()
            }), {
              status: 401,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Update user with new password and clear reset token
          await env.users.prepare(
            'UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?'
          ).bind(await bcrypt.hash(password), user.id).run();
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Your password has been reset successfully.',
            timestamp: new Date().toISOString()
          }), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error during password reset:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'An error occurred while resetting your password. Please try again.',
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
          
          // Check if token exists and is valid
          const user = await env.users.prepare(
            'SELECT * FROM users WHERE password_reset_token = ? AND password_reset_expires > ?'
          ).bind(token, new Date().toISOString()).first();
          
          if (!user) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Invalid or expired reset token.',
              timestamp: new Date().toISOString()
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
            message: 'Token is valid.',
            timestamp: new Date().toISOString()
          }), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error verifying reset token:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'An error occurred while verifying the token. Please try again.',
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Reset password endpoint
      if (path === '/auth/reset-password' && request.method === 'POST') {
        try {
          let token, newPassword;
          try {
            const body = await request.json();
            token = body.token;
            newPassword = body.newPassword;
          } catch (parseError) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Token and new password are required.',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          if (!token || !newPassword) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Token and new password are required.',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Validate password strength
          if (newPassword.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Check if token exists and is valid
          const user = await env.users.prepare(
            'SELECT * FROM users WHERE password_reset_token = ? AND password_reset_expires > ?'
          ).bind(token, new Date().toISOString()).first();
          
          if (!user) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Invalid or expired reset token.',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Hash the new password
          const passwordHash = await hashPassword(newPassword);
          
          // Update user's password and clear reset token
          await env.users.prepare(
            'UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?'
          ).bind(passwordHash, user.id).run();
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Password reset successfully. You can now log in with your new password.',
            timestamp: new Date().toISOString()
          }), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error resetting password:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'An error occurred while resetting your password. Please try again.',
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Confirm email endpoint - this is the proper endpoint for email verification
      if (path === '/auth/confirm-email' && request.method === 'POST') {
        try {
          const { token } = await request.json();
          
          if (!token) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Verification token is required.',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Look up the user by the verification token
          const user = await env.users.prepare(
            'SELECT * FROM users WHERE email_verification_token = ? AND email_verification_expires > ?'
          ).bind(token, new Date().toISOString()).first();
          
          if (!user) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Invalid or expired verification token.',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Update the user's email_verified field to true and clear the verification token
          await env.users.prepare(
            'UPDATE users SET email_verified = ?, email_verification_token = NULL, email_verification_expires = NULL WHERE id = ?'
          ).bind(true, user.id).run();
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Email confirmed successfully. You can now log in to your account.',
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error confirming email:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'An error occurred while confirming your email. Please try again.',
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Test R2 connection
      if (path === '/test-r2') {
        try {
          // Test the R2 connection by listing objects (empty list is fine)
          const objects = await env.budgetwise_storage.list({ limit: 1 });
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'R2 connection ready',
            bucket: 'budgetwise-storage',
            objectCount: objects.objects.length,
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Upload file to R2
      if (path === '/upload' && request.method === 'POST') {
        try {
          const formData = await request.formData();
          const file = formData.get('file');
          const key = formData.get('key') || `uploads/${Date.now()}-${file.name}`;
          
          if (!file) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'No file provided',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // Upload file to R2
          const result = await env.budgetwise_storage.put(key, file);
          
          // Generate public URL
          const url = `https://pub-xxxxxxxxxxxxxxxxxxxxxxxx.r2.dev/${key}`;
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'File uploaded successfully',
            key: key,
            url: url,
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Get file from R2
      if (path.startsWith('/files/') && request.method === 'GET') {
        try {
          const key = path.substring(7); // Remove '/files/' prefix
          
          // Get file from R2
          const object = await env.budgetwise_storage.get(key);
          
          if (!object) {
            return new Response(JSON.stringify({ 
              success: false, 
              message: 'File not found',
              timestamp: new Date().toISOString()
            }), {
              status: 404,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          const headers = new Headers();
          object.writeHttpMetadata(headers);
          headers.set('etag', object.httpEtag);
          headers.set('Access-Control-Allow-Origin', '*');
          
          return new Response(object.body, {
            headers: headers
          });
        } catch (error) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Set reset token endpoint (for admin/manual use)
      if (path === '/users/reset-token' && request.method === 'POST') {
        try {
          const { email, resetToken, resetExpires } = await request.json();
          
          // Update user with reset token
          await env.users.prepare(
            'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE email = ?'
          ).bind(resetToken, resetExpires, email).run();
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Reset token set successfully.',
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error setting reset token:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'An error occurred while setting reset token.',
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Manual password set endpoint (for admin use)
      if (path === '/users/set-password' && request.method === 'POST') {
        try {
          const { email, password } = await request.json();
          
          // Hash the password
          const passwordHash = await hashPassword(password);
          
          // Update user's password directly
          await env.users.prepare(
            'UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE email = ?'
          ).bind(passwordHash, email).run();
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Password set successfully.',
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error setting password:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'An error occurred while setting password.',
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
      
      // Budget endpoints
      // Create budget endpoint
      if (path === '/budgets' && request.method === 'POST') {
        try {
          const rateLimitResult = rateLimit(request, 20, 60); // 20 requests per minute
          if (!rateLimitResult.success) {
            return rateLimitResult.response;
          }
          
          const authResult = requireAuth(request);
          if (!authResult.success) {
            return authResult.response;
          }
          const user = authResult.user;
          
          const budgetData = await request.json();
          
          // Ensure user can only create budgets for themselves
          if (budgetData.user_id !== user.id) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Unauthorized: Cannot create budget for another user'
            }), {
              status: 403,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          const result = await createBudget(budgetData, user.id);
          
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
            budget: result.budget,
            message: 'Budget created successfully'
          }), {
            status: 201,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error creating budget:', error);
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
      
      // Get user budgets endpoint
      if (path.startsWith('/budgets/user/') && request.method === 'GET') {
        try {
          const authResult = requireAuth(request);
          if (!authResult.success) {
            return authResult.response;
          }
          const user = authResult.user;
          
          // Extract user ID from path
          const pathParts = path.split('/');
          const userId = pathParts[3];
          
          // Ensure user can only access their own budgets
          if (userId !== user.id) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Unauthorized: Cannot access budgets for another user'
            }), {
              status: 403,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          const result = await getUserBudgets(userId);
          
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
            budgets: result.budgets
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error getting budgets:', error);
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
      
      // Update budget endpoint
      if (path.startsWith('/budgets/') && request.method === 'PUT') {
        try {
          const authResult = requireAuth(request);
          if (!authResult.success) {
            return authResult.response;
          }
          const user = authResult.user;
          
          // Extract budget ID from path
          const pathParts = path.split('/');
          const budgetId = pathParts[2];
          
          const { userId, updates } = await request.json();
          
          // Ensure user can only update their own budgets
          if (userId !== user.id) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Unauthorized: Cannot update budgets for another user'
            }), {
              status: 403,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          const result = await updateBudget(budgetId, userId, updates);
          
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
            budget: result.budget,
            message: 'Budget updated successfully'
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error updating budget:', error);
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
      
      // Delete budget endpoint
      if (path.startsWith('/budgets/') && request.method === 'DELETE') {
        try {
          const authResult = requireAuth(request);
          if (!authResult.success) {
            return authResult.response;
          }
          const user = authResult.user;
          
          // Extract budget ID from path
          const pathParts = path.split('/');
          const budgetId = pathParts[2];
          
          const { userId } = await request.json();
          
          // Ensure user can only delete their own budgets
          if (userId !== user.id) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Unauthorized: Cannot delete budgets for another user'
            }), {
              status: 403,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          const result = await deleteBudget(budgetId, userId);
          
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
          console.error('Error deleting budget:', error);
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
      
      // Test SendGrid configuration endpoint
      if (path === '/test-sendgrid' && request.method === 'GET') {
        try {
          // Check if SendGrid is configured
          const isSendGridConfigured = !!(env.SENDGRID_API_KEY && env.SENDGRID_API_KEY !== 'your_sendgrid_api_key_here');
          
          return new Response(JSON.stringify({ 
            success: true,
            sendgridConfigured: isSendGridConfigured,
            hasApiKey: !!env.SENDGRID_API_KEY,
            isPlaceholder: env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here',
            message: isSendGridConfigured 
              ? 'SendGrid is properly configured' 
              : 'SendGrid is not configured or using placeholder values'
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          return new Response(JSON.stringify({ 
            success: false,
            error: error.message
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }

      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders
      });
    } catch (error) {
      console.error('General error:', error);
      return new Response(JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};