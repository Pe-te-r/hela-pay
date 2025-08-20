import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { type Context } from 'hono'
import { authProxy } from './proxy-services/auth-proxy.js';
import { config } from 'dotenv';

config()
const app = new Hono()


// Health check endpoint
app.get('/health', (c: Context) => {
  return c.json({ status: 'OK', service: 'api-gateway', timestamp: new Date().toISOString() });
});

// Proxy all /auth requests to the auth service
app.all('/auth/*',authProxy);


// Catch-all for any other routes
app.all('*', (c: Context) => {
  return c.json({ error: 'Route not found', code: 'NOT_FOUND' }, 404);
});

// Start the server
serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`API Gateway running on http://localhost:${info.port}`);
});