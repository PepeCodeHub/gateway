// Api/gateway/src/middleware/proxy.ts
import type { FastifyInstance } from 'fastify';
import { createRabbitMQMiddleware } from './rabbitmq';
import { rabbitmqConfig } from '../config';
import { services } from '../config';

export async function setupProxies(app: FastifyInstance) {
  app.register(async (instance) => {
    Object.entries(services).forEach(([service, config]) => {
      const basePath = `/${config.url}`;
      const queue = rabbitmqConfig.queues[service as keyof typeof rabbitmqConfig.queues];
      const routingKey = service;

      instance.all(`${basePath}/*`, createRabbitMQMiddleware({ queue, routingKey }));
      instance.all(`${basePath}`, createRabbitMQMiddleware({ queue, routingKey }));
    });
  });
}
