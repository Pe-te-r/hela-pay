import fastify from 'fastify';
import authRoutes from './auth/auth.js';
import fastifyEnv from '@fastify/env';
import { envSchema } from './config/schema.js';
declare module 'fastify' {
  interface FastifyInstance {
    config: {
      NODE_ENV: string;
      PORT: number;
      JWT_SECRET: string;
      REDIS_URL: string;
      DATABASE_URL: string;
    };
  }
}

const server = fastify({ 
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty'
    }
  }
});



// Remove top-level await and use async function
async function main() {
  // Register and configure the env plugin
  await server.register(fastifyEnv, {
    confKey: 'config',
    schema: envSchema,
    dotenv: true,
    data: process.env
  });

  console.log('Server configuration loaded:');
  console.log('- Environment:', server.config.NODE_ENV);
  console.log('- Port:', server.config.PORT);

  // Register your routes
  server.register(authRoutes, { prefix: '/auth' });

  // Health check endpoint
  server.get('/health', async (request, reply) => {
    return {
      status: 'OK',
      service: 'auth-service',
      environment: server.config.NODE_ENV
    };
  });

  // Start server
  server.listen({ 
    port: server.config.PORT,
    host: '0.0.0.0'
  }, (err, address) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    console.log(`Auth service running in ${server.config.NODE_ENV} mode`);
    console.log(`Server listening at ${address}`);
  });
}

// Start the application
main().catch(console.error);