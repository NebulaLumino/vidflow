import { Job, JobResult, JobType, WorkerConfig } from '../types';
import { BaseWorker } from './BaseWorker';

export class VideoConversionWorker extends BaseWorker {
  private parserUrl: string;

  constructor(queueManager: any, config: WorkerConfig) {
    super(queueManager, config);
    this.parserUrl = config.parserUrl;
  }

  supportsJobType(): JobType[] {
    return [JobType.VIDEO_CONVERSION];
  }

  async processJob(job: Job): Promise<JobResult> {
    const { videoId, sourceFormat, targetFormat } = job.payload;

    console.log(
      `[VideoConversion] Converting video ${videoId} from ${sourceFormat} to ${targetFormat}`
    );

    try {
      const response = await fetch(`${this.parserUrl}/api/v1/videos/${videoId}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceFormat,
          targetFormat,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          error: `Conversion failed: ${error}`,
        };
      }

      const data = (await response.json()) as { filePath?: string };

      console.log(`[VideoConversion] Conversion completed for video ${videoId}`);

      return {
        success: true,
        data: {
          videoId,
          targetFormat,
          status: 'completed',
          filePath: data.filePath,
        },
      };
    } catch (error) {
      console.error(`[VideoConversion] Error converting video ${videoId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
