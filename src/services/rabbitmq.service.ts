import amqp, { type Channel, type Connection } from 'amqplib';
import { logger } from '../utils';
import { rabbitmqConfig } from '../config';

export class RabbitMQService {
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(rabbitmqConfig.url);
      this.channel = await this.connection.createChannel();
      
      // Setup exchanges
      await this.channel.assertExchange(rabbitmqConfig.exchanges.api, 'topic', { durable: true });
      
      logger.info('Connected to RabbitMQ');
    } catch (error) {
      logger.error('RabbitMQ connection error:', error);
      throw error;
    }
  }

  async publishMessage(routingKey: string, message: any): Promise<void> {
    try {
      if (!this.channel) throw new Error('Channel not initialized');
      
      await this.channel.publish(
        rabbitmqConfig.exchanges.api,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
    } catch (error) {
      logger.error('Error publishing message:', error);
      throw error;
    }
  }

  async createRPCClient(queue: string): Promise<(message: any) => Promise<any>> {
    if (!this.channel) throw new Error('Channel not initialized');

    const { queue: replyQueue } = await this.channel.assertQueue('', { exclusive: true });

    return async (message: any) => {
      const correlationId = Math.random().toString();
      
      return new Promise((resolve, reject) => {
        this.channel?.consume(replyQueue, (msg) => {
          if (msg?.properties.correlationId === correlationId) {
            resolve(JSON.parse(msg.content.toString()));
          }
        }, { noAck: true });

        this.channel?.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
          correlationId,
          replyTo: replyQueue
        });
      });
    };
  }

  async close(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch (error) {
      logger.error('Error closing RabbitMQ connection:', error);
      throw error;
    }
  }
}

export const rabbitMQService = new RabbitMQService();