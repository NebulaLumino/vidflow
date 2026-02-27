import { EventEmitter } from 'events';
import { VidFlowClient } from '../client';
import {
  DownloadOptions,
  DownloadJob,
  DownloadJobResponse,
  DownloadListResponse,
  QueueResponse,
  DownloadProgressEvent,
  DownloadCompleteEvent,
  DownloadErrorEvent,
  DownloadEventMap,
} from '../types';

/**
 * Download Service
 * Handles video download operations with event support
 */
export class DownloadService {
  private client: VidFlowClient;
  private emitter: EventEmitter;
  private pollIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(client: VidFlowClient) {
    this.client = client;
    this.emitter = new EventEmitter();
  }

  /**
   * Start a new download
   */
  async download(options: DownloadOptions): Promise<DownloadJobResponse> {
    const response = await this.client.post<DownloadJobResponse>('/downloads', options);

    // Start polling for progress if needed
    if (response.job.status === 'queued' || response.job.status === 'processing') {
      this.startPolling(response.job.id);
    }

    return response;
  }

  /**
   * Get download job status
   */
  async getJob(jobId: string): Promise<DownloadJob> {
    return this.client.get<DownloadJob>(`/downloads/${jobId}`);
  }

  /**
   * List user's downloads
   */
  async list(options?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<DownloadListResponse> {
    const params = new URLSearchParams();

    if (options?.page) params.append('page', options.page.toString());
    if (options?.pageSize) params.append('pageSize', options.pageSize.toString());
    if (options?.status) params.append('status', options.status);

    return this.client.get<DownloadListResponse>(`/downloads?${params.toString()}`);
  }

  /**
   * Cancel a download
   */
  async cancel(jobId: string): Promise<{ success: boolean }> {
    this.stopPolling(jobId);
    return this.client.delete<{ success: boolean }>(`/downloads/${jobId}`);
  }

  /**
   * Get download URL (for completed downloads)
   */
  async getDownloadUrl(jobId: string): Promise<{ url: string; expiresAt: string }> {
    return this.client.get<{ url: string; expiresAt: string }>(`/downloads/${jobId}/url`);
  }

  /**
   * Get queue position
   */
  async getQueuePosition(jobId: string): Promise<QueueResponse> {
    return this.client.get<QueueResponse>(`/downloads/${jobId}/queue`);
  }

  /**
   * Subscribe to download progress events
   */
  on<K extends keyof DownloadEventMap>(
    event: K,
    handler: (data: DownloadEventMap[K]) => void
  ): void {
    this.emitter.on(event, handler);
  }

  /**
   * Unsubscribe from events
   */
  off<K extends keyof DownloadEventMap>(
    event: K,
    handler: (data: DownloadEventMap[K]) => void
  ): void {
    this.emitter.off(event, handler);
  }

  /**
   * Start polling for job status
   */
  private startPolling(jobId: string): void {
    // Clear any existing polling
    this.stopPolling(jobId);

    const poll = async () => {
      try {
        const job = await this.getJob(jobId);

        // Emit progress event
        const progressEvent: DownloadProgressEvent = {
          jobId: job.id,
          progress: job.progress,
          downloadedBytes: job.downloadedBytes,
          totalBytes: job.totalBytes,
          speed: job.speed,
        };
        this.emitter.emit('progress', progressEvent);

        // Handle completion
        if (job.status === 'completed') {
          this.stopPolling(jobId);
          const completeEvent: DownloadCompleteEvent = {
            jobId: job.id,
            filePath: job.filePath || '',
          };
          this.emitter.emit('completed', completeEvent);
        }

        // Handle failure
        if (job.status === 'failed') {
          this.stopPolling(jobId);
          const errorEvent: DownloadErrorEvent = {
            jobId: job.id,
            error: job.error || 'Unknown error',
          };
          this.emitter.emit('error', errorEvent);
        }

        // Handle cancellation
        if (job.status === 'cancelled') {
          this.stopPolling(jobId);
          this.emitter.emit('cancelled', { jobId });
        }

        // Handle queue position
        if (job.status === 'queued') {
          try {
            const queue = await this.getQueuePosition(jobId);
            this.emitter.emit('queued', {
              jobId,
              position: queue.totalPosition,
            });
          } catch {
            // Ignore queue errors
          }
        }
      } catch (error) {
        console.error(`Polling error for job ${jobId}:`, error);
      }
    };

    // Poll immediately
    poll();

    // Then poll every 2 seconds
    const interval = setInterval(poll, 2000);
    this.pollIntervals.set(jobId, interval);
  }

  /**
   * Stop polling for a job
   */
  private stopPolling(jobId: string): void {
    const interval = this.pollIntervals.get(jobId);
    if (interval) {
      clearInterval(interval);
      this.pollIntervals.delete(jobId);
    }
  }

  /**
   * Clean up all polling intervals
   */
  destroy(): void {
    for (const [jobId] of this.pollIntervals) {
      this.stopPolling(jobId);
    }
    this.emitter.removeAllListeners();
  }
}
