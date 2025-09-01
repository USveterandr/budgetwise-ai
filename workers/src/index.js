// Cloudflare Workers API for BudgetWise

// CORS handler
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Health check
    if (request.method === 'GET' && url.pathname === '/api/') {
      return new Response(JSON.stringify({ message: "BudgetWise API is running on Cloudflare Workers" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Signup
    if (request.method === 'POST' && url.pathname === '/api/auth/signup') {
      try {
        const { email, password, full_name } = await request.json();
        
        // Hash password with SHA-256
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const password_hash = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        // Check if user exists
        const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
        if (existing) {
          return new Response(JSON.stringify({ detail: "User already exists" }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const userId = crypto.randomUUID();
        
        // Insert user into D1 database
        const stmt = env.DB.prepare(`
          INSERT INTO users (id, email, password_hash, full_name, created_at) 
          VALUES (?, ?, ?, ?, ?)
        `);
        
        await stmt.bind(userId, email, password_hash, full_name, new Date().toISOString()).run();
        
        // Generate simple token
        const token = crypto.randomUUID();
        
        return new Response(JSON.stringify({
          access_token: token,
          token_type: "bearer",
          user: { id: userId, email, full_name, subscription_plan: "free" }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        return new Response(JSON.stringify({ detail: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Expenses
    // Login endpoint
    if (request.method === 'POST' && url.pathname === '/api/auth/login') {
      try {
        const { email, password } = await request.json();
        
        // Hash the provided password
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const password_hash = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        // Find user by email and verify password
        const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
        if (!user || user.password_hash !== password_hash) {
          return new Response(JSON.stringify({ detail: "Invalid credentials" }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // Generate token
        const token = crypto.randomUUID();
        
        return new Response(JSON.stringify({
          access_token: token,
          token_type: "bearer",
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            subscription_plan: user.subscription_plan || "free",
            is_admin: user.is_admin === 1
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        return new Response(JSON.stringify({ detail: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    if (request.method === 'POST' && url.pathname === '/api/expenses') {
      return new Response(JSON.stringify({ message: "Expense created" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (request.method === 'GET' && url.pathname === '/api/expenses') {
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Not Found', { 
      status: 404,
      headers: corsHeaders 
    });
  },
};