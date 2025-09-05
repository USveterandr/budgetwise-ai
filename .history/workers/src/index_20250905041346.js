
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
        // sendToErrorService(error, request.url, env)
      );
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

// --- Validation Utilities (can be moved to a separate utils file if used across workers/other modules) ---

// Example for S1126: Replace if-then-else flow by a single return statement
// This is a generic utility, not directly part of the fetch handler's logic.
const isRequestMethodAllowed = (method, allowedMethods = ['GET', 'HEAD']) => {
  return allowedMethods.includes(method);
};

// Example for S3776: Refactor this function to reduce its Cognitive Complexity
// This is a generic utility.
function complexUserDataValidator(user) {
  if (!user) {
    return { isValid: false, reason: 'User object is missing.' };
  }
  if (!user.name) {
    return { isValid: false, reason: 'Name is missing.' };
  }
  if (typeof user.name !== 'string' || user.name.trim() === '') {
    return { isValid: false, reason: 'Name must be a non-empty string.' };
  }
  if (!user.email) {
    return { isValid: false, reason: 'Email is missing.' };
  }
  if (typeof user.email !== 'string' || !user.email.includes('@')) {
    return { isValid: false, reason: 'Email must be a valid string.' };
  }
  if (user.age && (typeof user.age !== 'number' || user.age < 0 || user.age > 120)) {
    return { isValid: false, reason: 'Age must be a valid number between 0 and 120.' };
  }
  if (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
    return { isValid: false, reason: 'User must have at least one role.' };
  }
  for (const role of user.roles) {
    if (typeof role !== 'string' || role.trim() === '') {
      return { isValid: false, reason: 'Each role must be a non-empty string.' };
    }
  }
  return { isValid: true };
}

// Refactored version of complexUserDataValidator
function validateUserData(user) {
  const validateName = (name) => {
    if (!name) return 'Name is missing.';
    if (typeof name !== 'string' || name.trim() === '') return 'Name must be a non-empty string.';
    return null;
  };

  const validateEmail = (email) => {
    if (!email) return 'Email is missing.';
    if (typeof email !== 'string' || !email.includes('@')) return 'Email must be a valid string.';
    return null;
  };

  const validateAge = (age) => {
    if (age !== undefined) {
      if (typeof age !== 'number' || age < 0 || age > 120) {
        return 'Age must be a valid number between 0 and 120.';
      }
    }
    return null;
  };

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

// Example of how the validator might be used within the worker:
// if (url.pathname === '/add-user' && request.method === 'POST') {
//   const userData = await request.json();
//   const validationResult = validateUserData(userData);
//   if (!validationResult.isValid) {
//     return new Response(JSON.stringify({ error: 'Validation failed', details: validationResult.reason }), {
//       status: 400,
//       headers: { 'Content-Type': 'application/json', ...corsHeaders },
//     });
//   }
//   // ... proceed with adding user
// }
