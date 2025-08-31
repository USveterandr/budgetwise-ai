// Cloudflare Pages Function: Proxy API requests to external backend
// Configure the backend origin in Pages > Settings > Environment variables:
// BACKEND_API_URL=https://your-backend.example.com

export async function onRequest(context) {
  const { request, env, params } = context;
  const backend = env.BACKEND_API_URL;

  if (!backend) {
    return new Response(
      JSON.stringify({ error: 'Server misconfiguration', detail: 'BACKEND_API_URL is not set' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }

  const url = new URL(request.url);
  // params.path includes the remainder after /api/
  const path = Array.isArray(params.path) ? params.path.join('/') : params.path || '';
  const targetUrl = `${backend.replace(/\/$/, '')}/api/${path}`;

  // Clone headers and remove hop-by-hop/Cloudflare specific headers
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('cf-connecting-ip');
  headers.delete('x-forwarded-for');
  headers.delete('x-forwarded-proto');

  const init = {
    method: request.method,
    headers,
    redirect: 'manual',
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
  };

  try {
    const resp = await fetch(targetUrl, init);
    // Pass through response with CORS headers allowing the current origin
    const respHeaders = new Headers(resp.headers);
    respHeaders.set('access-control-allow-origin', url.origin);
    respHeaders.set('access-control-allow-credentials', 'true');
    return new Response(resp.body, { status: resp.status, headers: respHeaders });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Upstream request failed', detail: String(err) }),
      { status: 502, headers: { 'content-type': 'application/json' } }
    );
  }
}
