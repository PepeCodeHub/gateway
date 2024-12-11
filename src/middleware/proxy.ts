// Api/gateway/src/middleware/proxy.ts
import type { FastifyInstance } from 'fastify';
import { createRabbitMQMiddleware } from './rabbitmq';
import { rabbitmqConfig } from '../config';
import { services } from '../config';

export async function setupProxies(app: FastifyInstance) {
  // Register auth service routes
  app.register(async (instance) => {
    Object.entries(services).forEach(([service, config]) => {
      const middleware = createRabbitMQMiddleware({
        queue: rabbitmqConfig.queues[service as keyof typeof rabbitmqConfig.queues],
        routingKey: service
      });
      
      instance.all(config.url, middleware);
    });
  });
}
