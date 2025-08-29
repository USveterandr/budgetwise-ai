// Cloudflare Pages Functions - Middleware for SPA routing
export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  
  // If the request is for an API route, pass it through
  if (url.pathname.startsWith('/api/')) {
    return next();
  }
  
  // If the request is for a static asset, pass it through
  if (url.pathname.includes('.')) {
    return next();
  }
  
  // For all other routes (SPA routes), serve index.html
  const response = await next();
  
  // If the response is 404 (route not found), serve index.html for SPA routing
  if (response.status === 404) {
    const indexResponse = await context.env.ASSETS.fetch(new URL('/index.html', request.url));
    return new Response(indexResponse.body, {
      ...indexResponse,
      headers: {
        ...indexResponse.headers,
        'Content-Type': 'text/html'
      }
    });
  }
  
  return response;
}