import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils';

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  logger.error(`Error processing request: ${error}`);

  const statusCode = error.statusCode || 500;
  reply.status(statusCode).send({
    message: error.message || 'Internal Server Error'
  });
};