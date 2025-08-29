// Cloudflare Workers API for BudgetWise
import { Router } from 'itty-router';

const router = Router();

// CORS handler
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight requests
router.options('*', () => new Response(null, { headers: corsHeaders }));

// Health check
router.get('/api/', () => {
  return new Response(JSON.stringify({ message: "BudgetWise API is running on Cloudflare Workers" }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});

// Auth endpoints
router.post('/api/auth/signup', async (request, env) => {
  try {
    const { email, password, full_name } = await request.json();
    
    // Hash password (you'll need to implement bcrypt for Workers)
    const userId = crypto.randomUUID();
    
    // Insert user into D1 database
    const stmt = env.DB.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, created_at) 
      VALUES (?, ?, ?, ?, ?)
    `);
    
    await stmt.bind(userId, email, password, full_name, new Date().toISOString()).run();
    
    // Generate JWT token (implement JWT for Workers)
    const token = "jwt-token-here";
    
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
});

// Expenses endpoints
router.post('/api/expenses', async (request, env) => {
  // Implement expense creation
  return new Response(JSON.stringify({ message: "Expense created" }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});

router.get('/api/expenses', async (request, env) => {
  // Implement expense retrieval
  return new Response(JSON.stringify([]), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});

// Handle all requests
export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env, ctx).catch(() => {
      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders 
      });
    });
  },
};