import { setupProxies, errorHandler, authMiddleware, rabbitMQService, logger } from './src';
import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

const PORT = process.env.PORT || 3000;
const CORS = process.env.CORS || '*';

const app = fastify({ logger: true });

app.register(fastifyCors, { origin: CORS });
app.register(helmet);
app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

// Register error handler
app.setErrorHandler(errorHandler);

// Setup service proxies
app.register(setupProxies, { prefix: '/api' });

// Add preHandler hook for protected routes
app.addHook('preHandler', (request, reply, done) => {
  authMiddleware(request, reply, done);
});

// Public health check endpoint
app.get('/health', async () => {
  return { status: 'ok' };
});

// Handle not found routes
app.setNotFoundHandler((request, reply) => {
  reply.code(404).send({ message: 'Not found' });
});

// Start server
const start = async () => {
  try {
    await rabbitMQService.connect();
    await app.listen({ port: PORT as number });
    logger.info(`Gateway running on port ${PORT}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();