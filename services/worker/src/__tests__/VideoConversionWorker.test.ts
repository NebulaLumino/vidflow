import { Job, JobStatus, JobType, WorkerConfig } from '../types';
import { VideoConversionWorker } from '../workers/VideoConversionWorker';
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

describe('VideoConversionWorker', () => {
  let worker: VideoConversionWorker;

  beforeEach(() => {
    worker = new VideoConversionWorker(mockQueueManager, validConfig);
    jest.clearAllMocks();
  });

  describe('supportsJobType', () => {
    it('should return VIDEO_CONVERSION as supported job type', () => {
      const supportedTypes = worker.supportsJobType();
      expect(supportedTypes).toContain(JobType.VIDEO_CONVERSION);
      expect(supportedTypes).toHaveLength(1);
    });
  });

  describe('processJob', () => {
    const mockJob: Job = {
      id: 'convert-job-123',
      type: JobType.VIDEO_CONVERSION,
      status: JobStatus.PENDING,
      payload: {
        videoId: 'abc123',
        sourceFormat: 'avi',
        targetFormat: 'mp4',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      retries: 0,
      maxRetries: 3,
    };

    it('should return success when conversion completes', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            filePath: '/videos/abc123_converted.mp4',
          }),
      }) as jest.Mock;

      const result = await worker.processJob(mockJob);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        videoId: 'abc123',
        targetFormat: 'mp4',
        status: 'completed',
        filePath: '/videos/abc123_converted.mp4',
      });
    });

    it('should return failure when conversion fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        text: () => Promise.resolve('Unsupported format'),
      }) as jest.Mock;

      const result = await worker.processJob(mockJob);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Conversion failed');
    });

    it('should return failure when network error occurs', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Connection refused')) as jest.Mock;

      const result = await worker.processJob(mockJob);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection refused');
    });
  });
});
