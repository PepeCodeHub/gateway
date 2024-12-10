import type { FastifyRequest, FastifyReply } from 'fastify';
import { rabbitMQService } from '../services/rabbitmq.service';
import { logger } from '../utils/logger';

interface ServiceConfig {
  queue: string;
  routingKey: string;
}

export const createRabbitMQMiddleware = (serviceConfig: ServiceConfig) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const message = {
        action: request.method,
        path: request.url,
        body: request.body,
        // user: request.user,
      };

      const rpcClient = await rabbitMQService.createRPCClient(serviceConfig.queue);
      const response = await rpcClient(message);

      reply.send(response);
    } catch (error) {
      logger.error(`RabbitMQ middleware error: ${error}`);
      reply.code(500).send({ error: 'Service unavailable' });
    }
  };
};