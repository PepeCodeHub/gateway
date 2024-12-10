import { setupProxies } from './src/middleware/proxy';
import { errorHandler } from './src/middleware/error';
import { authMiddleware } from './src/middleware/auth';
import { rabbitMQService } from './src/services/rabbitmq.service';
import { logger } from './src/utils/logger';
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
app.register(setupProxies);

// Protected routes
app.addHook('preHandler', authMiddleware);

// Start server
const start = async () => {
  try {
    await rabbitMQService.connect();
    await app.listen({ port: PORT as number });
    logger.info('Gateway running on port 3000');
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();
