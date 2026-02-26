import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { QueueManager } from './queue/QueueManager';
import { JobHandler } from './jobs/JobHandler';
import { VideoDownloadWorker } from './workers/VideoDownloadWorker';
import { VideoConversionWorker } from './workers/VideoConversionWorker';
import { NotificationWorker, CleanupWorker } from './workers/NotificationWorker';
import { Job, JobStatus, JobType, WorkerConfig } from './types';

dotenv.config();

const config: WorkerConfig = {
  queue: {
    host: process.env.RABBITMQ_HOST || 'localhost',
    port: parseInt(process.env.RABBITMQ_PORT || '5672'),
    username: process.env.RABBITMQ_USER || 'guest',
    password: process.env.RABBITMQ_PASSWORD || 'guest',
    vhost: process.env.RABBITMQ_VHOST || '/',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  parserUrl: process.env.PARSER_URL || 'http://localhost:3000',
  maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
  concurrency: parseInt(process.env.CONCURRENCY || '10'),
  port: parseInt(process.env.PORT || '3001'),
};

async function main() {
  console.log('[Worker] Starting VidFlow Worker Service...');

  const queueManager = new QueueManager(config.queue);
  await queueManager.connect();

  // Initialize workers
  const workers = [
    new VideoDownloadWorker(queueManager, config),
    new VideoConversionWorker(queueManager, config),
    new NotificationWorker(queueManager, config),
    new CleanupWorker(queueManager, config),
  ];

  const jobHandler = new JobHandler(workers);

  // Start consuming jobs
  await queueManager.consumeJobs(async (job: Job) => {
    await jobHandler.handleJob(job);
  });

  // Express server for health checks and API
  const app = express();
  app.use(express.json());

  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'healthy', service: 'worker' });
  });

  // API to submit jobs
  app.post('/api/v1/jobs', async (req: Request, res: Response) => {
    try {
      const { type, payload } = req.body;

      if (!type) {
        res.status(400).json({ error: 'Job type is required' });
        return;
      }

      const job: Job = {
        id: uuidv4(),
        type: type as JobType,
        status: JobStatus.PENDING,
        payload: payload || {},
        createdAt: new Date(),
        updatedAt: new Date(),
        retries: 0,
        maxRetries: config.maxRetries,
      };

      await queueManager.publishJob(job);

      res.status(202).json({
        id: job.id,
        status: job.status,
        type: job.type,
      });
    } catch (error) {
      console.error('[Worker] Error submitting job:', error);
      res.status(500).json({ error: 'Failed to submit job' });
    }
  });

  // API to get job status
  app.get('/api/v1/jobs/:id', async (req: Request, res: Response) => {
    // In a real implementation, we'd fetch from Redis/database
    res.status(501).json({ error: 'Job status tracking not implemented' });
  });

  app.listen(config.port, () => {
    console.log(`[Worker] Worker service listening on port ${config.port}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('[Worker] Shutting down...');
    await queueManager.disconnect();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('[Worker] Fatal error:', error);
  process.exit(1);
});
