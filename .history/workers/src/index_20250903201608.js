// TODO: Implement specific business logic for this worker.
// Current version provides a basic, production-ready structure.
// Consider adding:
// - Specific endpoint handlers (e.g., /process-data, /get-status)
// - Integration with a database or external services via `env` (e.g., env.DB, env.API_KEY)
// - More sophisticated authentication/authorization
// - Input sanitization for specific payloads

export default {
  async fetch(request, env, ctx, ctxExecution) {
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
      ctx.waitUntil(
        // Example of sending error to a monitoring service
        // sendToErrorService(error, request.url, env)
      );
      return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } finally {
      // Log request duration
  // Helper function for roles validation
  const validateRoles = (roles) => {
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return 'User must have at least one role.';
    }
    for (const role of roles) {
      if (typeof role !== 'string' || role.trim() === '') {
        return 'Each role must be a non-empty string.';
      }
    }
    return null;
  };

  if (!user) return { isValid: false, reason: 'User object is missing.' };

  const nameError = validateName(user.name);
  if (nameError) return { isValid: false, reason: nameError };

  const emailError = validateEmail(user.email);
  if (emailError) return { isValid: false, reason: emailError };

  const ageError = validateAge(user.age);
  if (ageError) return { isValid: false, reason: ageError };

  const rolesError = validateRoles(user.roles);
  if (rolesError) return { isValid: false, reason: rolesError };

  return { isValid: true };
}

// Example usage:
// const testUser1 = { name: 'Alice', email: 'alice@example.com', age: 30, roles: ['user'] };
// console.log(validateUserData(testUser1)); // { isValid: true }

// const testUser2 = { name: '', email: 'bob@example.com' };
// console.log(validateUserData(testUser2)); // { isValid: false, reason: 'Name must be a non-empty string.' }
