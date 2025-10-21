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
          const result = await env.DB.prepare('SELECT 1 as test').all();
          
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
      
      // User operations
      if (path === '/users' && request.method === 'POST') {
        try {
          const userData = await request.json();
          
          // Hash the password before storing
          const passwordHash = await hashPassword(userData.password);
          
          // Insert user into database
          const result = await env.DB.prepare(
            'INSERT INTO users (id, email, name, password_hash, plan, is_admin, email_verified, trial_ends_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
          ).bind(
            userData.id,
            userData.email,
            userData.name,
            passwordHash,
            userData.plan || 'trial',
            userData.is_admin || false,
            userData.email_verified || false,
            userData.trial_ends_at || null
          ).run();
          
          // Send confirmation email (if HUBSPOT_API_KEY is configured)
          if (env.HUBSPOT_API_KEY && env.HUBSPOT_TEMPLATE_ID) {
            try {
              const confirmationToken = `token_${Math.random().toString(36).substring(2, 15)}`;
              const confirmationUrl = `https://budgetwise-ai.pages.dev/auth/confirm-email?token=${confirmationToken}`;
              
              const emailResponse = await fetch('https://api.hubapi.com/marketing/v3/transactional/email/single-send', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${env.HUBSPOT_API_KEY}`
                },
                body: JSON.stringify({
                  emailId: env.HUBSPOT_TEMPLATE_ID,
                  recipient: {
                    email: userData.email,
                    properties: {
                      firstname: userData.name,
                      confirmation_link: confirmationUrl
                    }
                  }
                })
              });
              
              if (!emailResponse.ok) {
                const errorData = await emailResponse.json();
                console.error('HubSpot email error:', errorData);
              }
            } catch (emailError) {
              console.error('Failed to send confirmation email:', emailError);
            }
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
          const result = await env.DB.prepare(
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
        try {
          const { email, password } = await request.json();
          
          // Query user from database
          const user = await env.DB.prepare(
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
          const user = await env.DB.prepare(
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
          await env.DB.prepare(
            'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE email = ?'
          ).bind(resetToken, resetExpires.toISOString(), email).run();
          
          // Send reset email (if HUBSPOT_API_KEY is configured)
          if (env.HUBSPOT_API_KEY && env.HUBSPOT_TEMPLATE_ID) {
            try {
              const resetUrl = `https://budgetwise-ai.pages.dev/auth/reset-password?token=${resetToken}`;
              
              const emailResponse = await fetch('https://api.hubapi.com/marketing/v3/transactional/email/single-send', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${env.HUBSPOT_API_KEY}`
                },
                body: JSON.stringify({
                  emailId: env.HUBSPOT_TEMPLATE_ID,
                  recipient: {
                    email: user.email,
                    properties: {
                      firstname: user.name,
                      reset_link: resetUrl
                    }
                  }
                })
              });
              
              if (!emailResponse.ok) {
                const errorData = await emailResponse.json();
                console.error('HubSpot email error:', errorData);
              }
            } catch (emailError) {
              console.error('Failed to send reset email:', emailError);
            }
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
                ...corsHeaders
              }
            });
          }
          
          // Check if token exists and is valid
          const user = await env.DB.prepare(
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
          const user = await env.DB.prepare(
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
          await env.DB.prepare(
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
      
      // Verify email endpoint
      if (path.startsWith('/verify-email/') && request.method === 'GET') {
        try {
          // Extract the token from the URL path
          const pathParts = path.split('/');
          if (pathParts.length < 3) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Invalid verification link',
              timestamp: new Date().toISOString()
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          const token = pathParts[2];
          console.log(`Verifying email with token: ${token}`);
          
          // In a real implementation, you would:
          // 1. Verify the token is valid and not expired
          // 2. Find the user associated with this token
          // 3. Update the user's email_verified field to true
          
          // For this mock implementation, we'll just return success
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Email verified successfully',
            timestamp: new Date().toISOString()
          }), {
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error('Error verifying email:', error);
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
      
      // Test R2 connection
      if (path === '/test-r2') {
        try {
          // Test the R2 connection by listing objects (empty list is fine)
          const objects = await env.R2_BUCKET.list({ limit: 1 });
          
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
          const result = await env.R2_BUCKET.put(key, file);
          
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
          const object = await env.R2_BUCKET.get(key);
          
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