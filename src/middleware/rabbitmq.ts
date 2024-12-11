import type { FastifyRequest, FastifyReply } from 'fastify';
import { rabbitMQService } from '../services';
import { logger } from '../utils';

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
        headers: request.headers,
      };

      const rpcClient = await rabbitMQService.createRPCClient(serviceConfig.queue);
      const response = await rpcClient(message);

      reply.code(response.statusCode).send(response.data);
    } catch (error) {
      logger.error(`RabbitMQ middleware error: ${error}`);
      reply.code(500).send({ message: 'Service unavailable' });
    }
  };
};