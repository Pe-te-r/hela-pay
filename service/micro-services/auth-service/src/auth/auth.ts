import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { registerSchema } from '../schema/register';

// Auth routes
export default async function authRoutes(fastify: FastifyInstance) {
  
  // POST /auth/register
  fastify.post('/register',{schema:registerSchema}, async (request: FastifyRequest<{
    Body: { phoneNumber: string; password: string; }
  }>, reply: FastifyReply) => {
    // Registration logic
    return reply.send({ message: 'User registered' });
  });

  // POST /auth/login
  fastify.post('/login', async (request: FastifyRequest<{
    Body: { phoneNumber: string; password: string; }
  }>, reply: FastifyReply) => {
    // Login logic
    return reply.send({ message: 'Login successful', token: 'jwt-token' });
  });

  // GET /auth/profile
  fastify.get('/profile', async (request: FastifyRequest, reply: FastifyReply) => {
    // Get user profile
    return reply.send({ user: { name: 'John Doe', phone: '+254...' } });
  });
}