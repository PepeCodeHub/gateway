import type { FastifyRequest, FastifyReply } from 'fastify';

export const validateRequest = async (
  request: FastifyRequest,
  reply: FastifyReply,
  schema: any
) => {
  try {
    await schema.validateAsync(request.body);
  } catch (error) {
    reply.code(400).send({ error: 'Validation failed' });
  }
};