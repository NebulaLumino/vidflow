import { JobType, JobStatus, Job, JobResult, WorkerConfig } from '../types';

describe('Types', () => {
  describe('JobType', () => {
    it('should have correct job type values', () => {
      expect(JobType.VIDEO_DOWNLOAD).toBe('video_download');
      expect(JobType.VIDEO_CONVERSION).toBe('video_conversion');
      expect(JobType.VIDEO_NOTIFICATION).toBe('video_notification');
      expect(JobType.CLEANUP).toBe('cleanup');
    });
  });

  describe('JobStatus', () => {
    it('should have correct job status values', () => {
      expect(JobStatus.PENDING).toBe('pending');
      expect(JobStatus.PROCESSING).toBe('processing');
      expect(JobStatus.COMPLETED).toBe('completed');
      expect(JobStatus.FAILED).toBe('failed');
    });
  });

  describe('Job interface', () => {
    it('should create a valid job object', () => {
      const job: Job = {
        id: 'test-job-1',
        type: JobType.VIDEO_DOWNLOAD,
        status: JobStatus.PENDING,
        payload: {
          videoId: 'abc123',
          format: 'mp4',
          quality: '1080p',
          userId: 'user-1',
        },
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        retries: 0,
        maxRetries: 3,
      };

      expect(job.id).toBe('test-job-1');
      expect(job.type).toBe(JobType.VIDEO_DOWNLOAD);
      expect(job.status).toBe(JobStatus.PENDING);
      expect(job.retries).toBe(0);
      expect(job.maxRetries).toBe(3);
    });
  });

  describe('JobResult interface', () => {
    it('should create a valid success result', () => {
      const result: JobResult = {
        success: true,
        data: {
          downloadId: 'download-1',
          status: 'completed',
        },
      };

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should create a valid failure result', () => {
      const result: JobResult = {
        success: false,
        error: 'Download failed',
      };

      expect(result.success).toBe(false);
      expect(result.error).toBe('Download failed');
    });
  });

  describe('WorkerConfig interface', () => {
    it('should create a valid worker config', () => {
      const config: WorkerConfig = {
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

      expect(config.parserUrl).toBe('http://localhost:3000');
      expect(config.maxRetries).toBe(3);
      expect(config.concurrency).toBe(5);
    });
  });
});
