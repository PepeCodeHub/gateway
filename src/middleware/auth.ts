import type { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { rabbitMQService } from '../services';

export const authMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) => {
  if (request.raw.url === '/health' || request.raw.url === '/api/auth/login' || request.raw.url === '/api/auth/register') {
    done();
    return;
  }

  const apiKey = request.headers['x-api-key'];

  if (!apiKey) {
    const token = request.headers.authorization?.split(' ')[1];
  
    if (!token) {
      return reply.code(401).send({ message: 'No token provided' });
    }
  
    try {
      const rpcClient = await rabbitMQService.createRPCClient('auth.service');
      const response = await rpcClient({ 
        action: 'verify-token',
        token 
      });
  
      if (!response.valid) {
        return reply.code(401).send({ message: 'Invalid token' });
      }
    } catch (error) {
      return reply.code(500).send({ message: 'Auth service error' });
    } 
  }
  
  done();
};