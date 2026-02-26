export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum JobType {
  VIDEO_DOWNLOAD = 'video_download',
  VIDEO_CONVERSION = 'video_conversion',
  VIDEO_NOTIFICATION = 'video_notification',
  CLEANUP = 'cleanup',
}

export interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  payload: Record<string, any>;
  result?: Record<string, any>;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  retries: number;
  maxRetries: number;
}

export interface JobResult {
  success: boolean;
  data?: Record<string, any>;
  error?: string;
}

export interface QueueConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  vhost: string;
}

export interface WorkerConfig {
  queue: QueueConfig;
  redis: {
    host: string;
    port: number;
  };
  parserUrl: string;
  maxRetries: number;
  concurrency: number;
  port: number;
}
