/**
 * VidFlow SDK Type Definitions
 */

// ==================== Video Types ====================

export type Platform =
  | 'youtube'
  | 'tiktok'
  | 'instagram'
  | 'twitter'
  | 'facebook'
  | 'vimeo'
  | string;

export type Quality = '144p' | '240p' | '360p' | '480p' | '720p' | '1080p' | '1440p' | '4k';

export type Format = 'mp4' | 'webm' | 'audio';

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Channel {
  id: string;
  name: string;
  url?: string;
  avatar?: string;
}

export interface VideoMetadata {
  description?: string;
  tags?: string[];
  category?: string;
  uploadDate?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
}

export interface Video {
  id: string;
  platform: Platform;
  platformId: string;
  url: string;
  title: string;
  thumbnail: string;
  duration: number; // in seconds
  channel: Channel;
  metadata?: VideoMetadata;
  availableQualities: Quality[];
  availableFormats: Format[];
  createdAt: string;
  updatedAt: string;
}

export interface VideoParseRequest {
  url: string;
  includeFormats?: boolean;
}

export interface VideoParseResponse {
  video: Video;
  requestId: string;
  processedAt: string;
}

// ==================== Download Types ====================

export interface DownloadOptions {
  url: string;
  quality?: Quality;
  format?: Format;
  title?: string;
  notifyOnComplete?: boolean;
  callbackUrl?: string;
}

export interface DownloadJob {
  id: string;
  videoId: string;
  url: string;
  quality: Quality;
  format: Format;
  status: JobStatus;
  progress: number;
  downloadedBytes: number;
  totalBytes: number;
  speed: number; // bytes per second
  filePath?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface DownloadJobResponse {
  job: DownloadJob;
  downloadUrl?: string;
}

export interface DownloadListResponse {
  jobs: DownloadJob[];
  total: number;
  page: number;
  pageSize: number;
}

// ==================== Queue Types ====================

export interface QueueJob {
  id: string;
  videoId: string;
  url: string;
  quality: Quality;
  format: Format;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  position: number;
  estimatedWaitTime?: number;
  createdAt: string;
}

export interface QueueResponse {
  queue: QueueJob[];
  totalPosition: number;
  estimatedWaitTime: number;
}

// ==================== Analytics Types ====================

export interface DownloadEvent {
  jobId: string;
  event: 'started' | 'progress' | 'completed' | 'failed' | 'cancelled';
  timestamp: string;
  data?: Record<string, unknown>;
}

export interface AnalyticsEvent {
  event: string;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, unknown>;
  timestamp: string;
}

// ==================== Ad Types ====================

export interface AdPlacement {
  id: string;
  name: string;
  app: string;
  page: string;
  position: string;
  sizes: { width: number; height: number }[];
  floorPrice: number;
}

export interface Ad {
  id: string;
  placementId: string;
  type: 'banner' | 'video' | 'native';
  content: AdContent;
  clickUrl: string;
  impressionUrl: string;
}

export interface AdContent {
  title?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  iconUrl?: string;
  callToAction?: string;
}

export interface AdRequest {
  placementId: string;
  userId?: string;
  context?: Record<string, unknown>;
}

export interface AdResponse {
  ad: Ad | null;
  requestId: string;
}

// ==================== User Types ====================

export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  plan: 'free' | 'premium';
  downloadCount: number;
  downloadLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ==================== Error Types ====================

export class VidFlowError extends Error {
  code: string;
  details?: Record<string, unknown>;
  requestId?: string;

  constructor(message: string, code: string = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'VidFlowError';
    this.code = code;
  }
}

export interface ApiError {
  error: VidFlowError;
  timestamp: string;
}

// ==================== Configuration Types ====================

export interface ClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
  version?: string;
}

export interface RequestOptions {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

// ==================== Utility Types ====================

export type ValueOf<T> = T[keyof T];

export type MaybePromise<T> = T | Promise<T>;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// ==================== Event Handler Types ====================

export type EventHandler<T = unknown> = (data: T) => void;

export interface DownloadProgressEvent {
  jobId: string;
  progress: number;
  downloadedBytes: number;
  totalBytes: number;
  speed: number;
}

export interface DownloadCompleteEvent {
  jobId: string;
  filePath: string;
}

export interface DownloadErrorEvent {
  jobId: string;
  error: string;
}

export interface DownloadEventMap {
  progress: DownloadProgressEvent;
  completed: DownloadCompleteEvent;
  error: DownloadErrorEvent;
  queued: { jobId: string; position: number };
  cancelled: { jobId: string };
}
