export const rabbitmqConfig = {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    exchanges: {
      api: 'api.gateway'
    },
    queues: {
      auth: 'auth.service',
    }
};