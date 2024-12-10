import type { FastifyRequest, FastifyReply } from 'fastify';
import { rabbitMQService } from '../services/rabbitmq.service';

export const authMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const token = request.headers.authorization?.split(' ')[1];
  
  if (!token) {
    reply.code(401).send({ error: 'No token provided' });
    return;
  }

  try {
    const rpcClient = await rabbitMQService.createRPCClient('auth.service');
    const response = await rpcClient({ 
      action: 'verify-token',
      token 
    });

    if (!response.valid) {
      reply.code(401).send({ error: 'Invalid token' });
      return;
    }

    // request.user = response.user;
  } catch (error) {
    reply.code(500).send({ error: 'Auth service error' });
  }
};