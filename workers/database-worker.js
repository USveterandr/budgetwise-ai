export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
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
          
          // Insert user into database
          const result = await env.DB.prepare(
            'INSERT INTO users (id, email, name, plan, is_admin, email_verified, trial_ends_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
          ).bind(
            userData.id,
            userData.email,
            userData.name,
            userData.plan || 'trial',
            userData.is_admin || false,
            userData.email_verified || false,
            userData.trial_ends_at || null
          ).run();
          
          // Send confirmation email (if HUBSPOT_API_KEY is configured)
          if (env.HUBSPOT_API_KEY && env.HUBSPOT_TEMPLATE_ID) {
            try {
              const confirmationToken = `token_${Math.random().toString(36).substring(2, 15)}`;
              const confirmationUrl = `https://ba4e7731.budgetwise-ebe.pages.dev/auth/confirm-email?token=${confirmationToken}`;
              
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
          const email = path.split('/')[2];
          
          // Query user from database
          const result = await env.DB.prepare(
            'SELECT * FROM users WHERE email = ?'
          ).bind(email).first();
          
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