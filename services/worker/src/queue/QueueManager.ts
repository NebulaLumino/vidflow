import amqp from 'amqplib';
import { QueueConfig, Job } from '../types';

export class QueueManager {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private config: QueueConfig;

  private static readonly QUEUE_NAME = 'vidflow_jobs';
  private static readonly DLQ_NAME = 'vidflow_jobs_dlq';

  constructor(config: QueueConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    const url = `amqp://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port}${this.config.vhost}`;
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();

    // Setup main queue with dead letter exchange
    await this.channel.assertQueue(QueueManager.QUEUE_NAME, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': QueueManager.DLQ_NAME,
      },
    });

    // Setup dead letter queue
    await this.channel.assertQueue(QueueManager.DLQ_NAME, {
      durable: true,
    });

    console.log('[Queue] Connected to RabbitMQ');
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }

  async publishJob(job: Job): Promise<boolean> {
    if (!this.channel) {
      throw new Error('Queue not connected');
    }

    const message = Buffer.from(JSON.stringify(job));
    return this.channel.sendToQueue(QueueManager.QUEUE_NAME, message, {
      persistent: true,
      deliveryMode: 2,
    });
  }

  async consumeJobs(handler: (job: Job) => Promise<void>): Promise<void> {
    if (!this.channel) {
      throw new Error('Queue not connected');
    }

    await this.channel.prefetch(10);

    await this.channel.consume(QueueManager.QUEUE_NAME, async (msg) => {
      if (!msg) return;

      try {
        const job: Job = JSON.parse(msg.content.toString());
        await handler(job);
        this.channel?.ack(msg);
      } catch (error) {
        console.error('[Queue] Job processing failed:', error);
        // Reject and send to DLQ after retries
        this.channel?.nack(msg, false, false);
      }
    });
  }

  async getQueueStats(): Promise<{ pending: number; processing: number }> {
    if (!this.channel) {
      throw new Error('Queue not connected');
    }

    const mainQueue = await this.channel.checkQueue(QueueManager.QUEUE_NAME);
    return {
      pending: mainQueue.messageCount,
      processing: 0, // Not directly available in RabbitMQ
    };
  }
}
