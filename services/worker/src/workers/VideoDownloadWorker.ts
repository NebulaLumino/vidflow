import { Job, JobResult, JobType, WorkerConfig } from '../types';
import { BaseWorker } from './BaseWorker';

export class VideoDownloadWorker extends BaseWorker {
  private parserUrl: string;

  constructor(queueManager: any, config: WorkerConfig) {
    super(queueManager, config);
    this.parserUrl = config.parserUrl;
  }

  supportsJobType(): JobType[] {
    return [JobType.VIDEO_DOWNLOAD];
  }

  async processJob(job: Job): Promise<JobResult> {
    const { videoId, format, quality, userId } = job.payload;

    console.log(`[VideoDownload] Starting download for video ${videoId}`);

    try {
      // Call parser service to start download
      const response = await fetch(`${this.parserUrl}/api/v1/videos/${videoId}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: format || 'mp4',
          quality: quality || 'best',
          userId,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          error: `Download failed: ${error}`,
        };
      }

      const data = (await response.json()) as {
        downloadId?: string;
        id?: string;
        filePath?: string;
        fileSize?: number;
      };

      console.log(`[VideoDownload] Download completed for video ${videoId}`);

      return {
        success: true,
        data: {
          downloadId: data.downloadId || data.id,
          status: 'completed',
          filePath: data.filePath,
          fileSize: data.fileSize,
        },
      };
    } catch (error) {
      console.error(`[VideoDownload] Error downloading video ${videoId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
