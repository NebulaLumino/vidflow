import { Job, JobResult, JobStatus, JobType, WorkerConfig } from '../types';
import { QueueManager } from '../queue/QueueManager';

export abstract class BaseWorker {
  protected queueManager: QueueManager;
  protected config: WorkerConfig;

  constructor(queueManager: QueueManager, config: WorkerConfig) {
    this.queueManager = queueManager;
    this.config = config;
  }

  abstract processJob(job: Job): Promise<JobResult>;

  async handleJob(job: Job): Promise<void> {
    console.log(`[${job.type}] Processing job ${job.id}`);

    try {
      const result = await this.processJob(job);

      if (result.success) {
        console.log(`[${job.type}] Job ${job.id} completed successfully`);
      } else {
        console.error(`[${job.type}] Job ${job.id} failed:`, result.error);

        if (job.retries < job.maxRetries) {
          // Retry the job
          job.retries++;
          job.status = JobStatus.PENDING;
          job.updatedAt = new Date();
          await this.queueManager.publishJob(job);
          console.log(
            `[${job.type}] Job ${job.id} requeued (retry ${job.retries}/${job.maxRetries})`
          );
        }
      }
    } catch (error) {
      console.error(`[${job.type}] Job ${job.id} error:`, error);

      if (job.retries < job.maxRetries) {
        job.retries++;
        job.status = JobStatus.PENDING;
        job.updatedAt = new Date();
        await this.queueManager.publishJob(job);
      }
    }
  }

  supportsJobType(): JobType[] {
    return [];
  }
}
