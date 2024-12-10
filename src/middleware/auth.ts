import type { FastifyRequest, FastifyReply } from 'fastify';
import { rabbitMQService } from '../';

export const authMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const token = request.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return reply.code(401).send({ error: 'No token provided' });
  }

  try {
    const rpcClient = await rabbitMQService.createRPCClient('auth.service');
    const response = await rpcClient({ 
      action: 'verify-token',
      token 
    });

    if (!response.valid) {
      return reply.code(401).send({ error: 'Invalid token' });
    }
  } catch (error) {
    return reply.code(500).send({ error: 'Auth service error' });
  }
};