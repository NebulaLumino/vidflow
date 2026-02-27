import { Job, JobType } from '../types';
import { BaseWorker } from '../workers/BaseWorker';
import { VideoDownloadWorker } from '../workers/VideoDownloadWorker';
import { VideoConversionWorker } from '../workers/VideoConversionWorker';
import { NotificationWorker, CleanupWorker } from '../workers/NotificationWorker';

export class JobHandler {
  private workers: Map<JobType, BaseWorker>;

  constructor(workers: BaseWorker[]) {
    this.workers = new Map();
    for (const worker of workers) {
      for (const jobType of worker.supportsJobType()) {
        this.workers.set(jobType, worker);
      }
    }
  }

  async handleJob(job: Job): Promise<void> {
    const worker = this.workers.get(job.type);

    if (!worker) {
      console.error(`[JobHandler] No worker found for job type: ${job.type}`);
      return;
    }

    await worker.handleJob(job);
  }

  static createDefault(): JobHandler {
    // Default workers will be initialized with actual config
    const workers: BaseWorker[] = [
      new VideoDownloadWorker(null as any, {} as any),
      new VideoConversionWorker(null as any, {} as any),
      new NotificationWorker(null as any, {} as any),
      new CleanupWorker(null as any, {} as any),
    ];

    return new JobHandler(workers);
  }
}
