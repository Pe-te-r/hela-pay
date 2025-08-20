import fastify from 'fastify';
import authRoutes from './auth/auth.js';

const server = fastify({ logger: true });

// Register auth routes with prefix
server.register(authRoutes, { prefix: '/auth' });

server.listen({ port: 3001 });