import { Job, JobStatus, JobType, JobResult, WorkerConfig } from '../types';
import { VideoDownloadWorker } from '../workers/VideoDownloadWorker';
import { QueueManager } from '../queue/QueueManager';

// Mock QueueManager
const mockQueueManager = {
  publishJob: jest.fn().mockResolvedValue(undefined),
  consumeJobs: jest.fn(),
} as unknown as QueueManager;

// Valid worker config matching WorkerConfig interface
const validConfig: WorkerConfig = {
  queue: {
    host: 'localhost',
    port: 5672,
    username: 'guest',
    password: 'guest',
    vhost: '/',
  },
  redis: {
    host: 'localhost',
    port: 6379,
  },
  parserUrl: 'http://localhost:3000',
  maxRetries: 3,
  concurrency: 5,
  port: 3001,
};

describe('VideoDownloadWorker', () => {
  let worker: VideoDownloadWorker;

  beforeEach(() => {
    worker = new VideoDownloadWorker(mockQueueManager, validConfig);
    jest.clearAllMocks();
  });

  describe('supportsJobType', () => {
    it('should return VIDEO_DOWNLOAD as supported job type', () => {
      const supportedTypes = worker.supportsJobType();
      expect(supportedTypes).toContain(JobType.VIDEO_DOWNLOAD);
      expect(supportedTypes).toHaveLength(1);
    });
  });

  describe('processJob', () => {
    const mockJob: Job = {
      id: 'test-job-123',
      type: JobType.VIDEO_DOWNLOAD,
      status: JobStatus.PENDING,
      payload: {
        videoId: 'abc123',
        format: 'mp4',
        quality: '1080p',
        userId: 'user-456',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      retries: 0,
      maxRetries: 3,
    };

    it('should return success when download completes', async () => {
      // Mock fetch response
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            downloadId: 'download-123',
            filePath: '/videos/abc123.mp4',
            fileSize: 1024000,
          }),
      }) as jest.Mock;

      const result = await worker.processJob(mockJob);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        downloadId: 'download-123',
        status: 'completed',
        filePath: '/videos/abc123.mp4',
        fileSize: 1024000,
      });
    });

    it('should return failure when download fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        text: () => Promise.resolve('Video not found'),
      }) as jest.Mock;

      const result = await worker.processJob(mockJob);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Download failed');
    });

    it('should return failure when network error occurs', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error')) as jest.Mock;

      const result = await worker.processJob(mockJob);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle job with default format and quality', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            downloadId: 'download-456',
            filePath: '/videos/abc123.mp4',
          }),
      }) as jest.Mock;

      const jobWithoutFormat: Job = {
        ...mockJob,
        payload: {
          videoId: 'abc123',
          userId: 'user-456',
        },
      };

      await worker.processJob(jobWithoutFormat);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/videos/abc123/download',
        expect.objectContaining({
          body: JSON.stringify({
            format: 'mp4',
            quality: 'best',
            userId: 'user-456',
          }),
        })
      );
    });
  });
});
