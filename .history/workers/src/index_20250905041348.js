export function worker() {
  async fetch(request, env, ctx) {
    // Add timing for the request
    const start = Date.now();
    const url = new URL(request.url);
    
    // Basic CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // In production, specify exact origins
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    // Handle OPTIONS for CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }
    
    try {
      // Logging: Use a more structured logger if available, or console.log for now
      console.log(`[${new Date().toISOString()}] Incoming request: ${request.method} ${url.pathname}`);
      
      // Route handling
      if (url.pathname === '/' || url.pathname === '/health') {
        return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
      
      // Example: A simple POST endpoint for data processing
      if (url.pathname === '/process' && request.method === 'POST') {
        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          return new Response(JSON.stringify({ error: 'Content-Type must be application/json' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        
        const data = await request.json();
        // TODO: Implement actual processing logic here using `data` and `env`
        console.log('Processing data:', data);
        
        // Example response
        return new Response(JSON.stringify({ message: 'Data processed successfully', received: data }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      
      // Fallback for unhandled routes
      return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (error) {
      // Error handling
      console.error(`[${new Date().toISOString()}] Error handling request:`, error);
      
      // Example of sending error to a monitoring service
      // sendToErrorService(error, request.url, env)
      
      return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } finally {
      // Log request duration
      console.log(`[${new Date().toISOString()}] Request to ${url.pathname} took ${Date.now() - start}ms`);
    }
  },
};
