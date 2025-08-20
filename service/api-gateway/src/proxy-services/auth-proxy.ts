import type { Context } from "hono";

const authServiceUrl = 'http://localhost:3001' // Ideally from env


export const authProxy =  async (c: Context) => {
  try {
    const url = new URL(c.req.url);
    console.log(url)
    const targetUrl = `${authServiceUrl}${url.pathname}${url.search}`;
    
    // Clone the headers from the original request
    const headers = new Headers(c.req.raw.headers);
    
    // Clean headers for forwarding
    headers.delete('host'); // Most important: target service will set its own host
    headers.delete('connection');
    headers.delete('keep-alive');
    
    // For JSON API, we can be more specific about accepted content
    if (!headers.has('accept')) {
      headers.set('accept', 'application/json');
    }
    if (!headers.has('content-type') && ['POST', 'PUT', 'PATCH'].includes(c.req.method)) {
      headers.set('content-type', 'application/json');
    }

    // Handle body - simplified for JSON-only
    let body: BodyInit | null = null;
    if (['POST', 'PUT', 'PATCH'].includes(c.req.method)) {
      // For JSON-only API, we can just pass the text directly
      // The auth service will validate if it's actually valid JSON
      body = await c.req.json();
    }

    console.log(`[GATEWAY] Proxying: ${c.req.method} ${url.pathname} -> ${targetUrl}`);

    // Forward the request to the auth service
    const response = await fetch(targetUrl, {
      method: c.req.method,
      headers: headers,
      body: body,
    });

    // Get the response from the auth service
    const responseBody = await response.json();
    
    console.log(`[GATEWAY] Received ${response.status} from Auth Service for ${c.req.method} ${url.pathname}`);
    
    return c.json(responseBody)
    
  } catch (error) {
    console.error('[GATEWAY] Proxy error:', error);
    return c.json({ 
      error: 'Authentication service temporarily unavailable',
      code: 'SERVICE_UNAVAILABLE'
    }, 503);
  }
}