import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { type Context } from 'hono'

const app = new Hono()
const authServiceUrl = 'http://localhost:3001'

// Proxy all /auth requests to the auth service
app.all('/auth/*', async (c: Context) => {
  try {
    const url = new URL(c.req.url)
    const targetUrl = `${authServiceUrl}${url.pathname}${url.search}`
    
    // Get headers - IMPORTANT: Convert Headers object to a simple object
    const headers = new Headers(c.req.raw.headers);
    
    // Remove Hop-by-hop headers that shouldn't be forwarded
    headers.delete('connection');
    headers.delete('keep-alive');
    headers.delete('proxy-authenticate');
    headers.delete('proxy-authorization');
    headers.delete('te');
    headers.delete('trailers');
    headers.delete('transfer-encoding');
    headers.delete('upgrade');
    headers.delete('host'); // Remove original host, the target service will set its own

    // Get the body - this is the tricky part!
    let body: BodyInit | null = null;
    const contentType = c.req.header('content-type') || '';
    
    if (['POST', 'PUT', 'PATCH'].includes(c.req.method)) {
      if (contentType.includes('application/json')) {
        // For JSON, we can get the text and pass it as a string
        body = await c.req.text();
      } else if (contentType.includes('form')) {
        // For form data, we need to handle it differently
        const formData = await c.req.formData();
        body = formData;
      } else {
        // For other types (text, blob, etc.), use the raw body
        body = c.req.raw.body;
      }
    }

    // Forward the request
    const response = await fetch(targetUrl, {
      method: c.req.method,
      headers: headers,
      body: body,
    });

    // Get the response from the auth service
    const responseBody = await response.text();
    
    // Forward the response back to the client
    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return c.json({ error: 'Failed to connect to authentication service' }, 502);
  }
});

app.get('/', (c: Context) => {
  return c.text('Hello Hono! Gateway is running.');
});

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});