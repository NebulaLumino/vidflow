/**
 * VidFlow React Native Module Types
 * Type definitions for the video download React Native module
 */

/** Supported video platforms */
export type VideoPlatform =
  | 'youtube'
  | 'tiktok'
  | 'instagram'
  | 'twitter'
  | 'facebook'
  | 'vimeo'
  | 'twitch'
  | 'reddit'
  | 'dailymotion'
  | 'bilibili';

/** Video quality options */
export type VideoQuality = 'highest' | 'lowest' | '1080p' | '720p' | '480p' | '360p';

/** Video format options */
export type VideoFormat = 'mp4' | 'webm' | 'audio' | 'gif';

/** Download status */
export type DownloadStatus = 'idle' | 'downloading' | 'completed' | 'failed' | 'cancelled';

/** Progress information */
export interface DownloadProgress {
  /** Downloaded bytes */
  downloaded: number;
  /** Total bytes */
  total: number;
  /** Progress percentage (0-100) */
  percentage: number;
  /** Download speed in bytes per second */
  speed: number;
  /** Estimated time remaining in seconds */
  eta: number;
}

/** Video metadata */
export interface VideoMetadata {
  /** Unique video ID */
  id: string;
  /** Video title */
  title: string;
  /** Video description */
  description?: string;
  /** Video thumbnail URL */
  thumbnailUrl: string;
  /** Video platform */
  platform: VideoPlatform;
  /** Video URL */
  url: string;
  /** Video duration in seconds */
  duration: number;
  /** Author/uploader name */
  author: string;
  /** Author profile URL */
  authorUrl?: string;
  /** View count */
  viewCount?: number;
  /** Like count */
  likeCount?: number;
  /** Upload date */
  uploadDate?: string;
  /** Available formats */
  formats: VideoFormatInfo[];
}

/** Video format information */
export interface VideoFormatInfo {
  /** Format ID */
  formatId: string;
  /** Format extension */
  ext: VideoFormat;
  /** Quality label */
  quality: string;
  /** Resolution (e.g., "1920x1080") */
  resolution?: string;
  /** File size in bytes */
  fileSize?: number;
  /** Bitrate in bits per second */
  bitrate?: number;
  /** Codec name */
  codec?: string;
}

/** Download options */
export interface DownloadOptions {
  /** Video URL or ID */
  url: string;
  /** Target platform (auto-detected if not specified) */
  platform?: VideoPlatform;
  /** Video quality */
  quality?: VideoQuality;
  /** Output format */
  format?: VideoFormat;
  /** Custom filename */
  filename?: string;
  /** Download directory (defaults to app documents) */
  directory?: string;
  /** Enable notifications */
  notifications?: boolean;
  /** Enable auto retry on failure */
  autoRetry?: boolean;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Custom headers for request */
  headers?: Record<string, string>;
}

/** Download result */
export interface DownloadResult {
  /** Download ID */
  id: string;
  /** Download status */
  status: DownloadStatus;
  /** Video metadata */
  metadata?: VideoMetadata;
  /** Output file path */
  filePath?: string;
  /** Error message if failed */
  error?: string;
  /** Download progress (for real-time updates) */
  progress?: DownloadProgress;
  /** Started at timestamp */
  startedAt?: number;
  /** Completed at timestamp */
  completedAt?: number;
}

/** Analytics event types */
export type AnalyticsEventType =
  | 'download_started'
  | 'download_completed'
  | 'download_failed'
  | 'download_cancelled'
  | 'video_search'
  | 'platform_selected'
  | 'quality_changed'
  | 'format_changed'
  | 'settings_changed'
  | 'app_opened'
  | 'app_closed';

/** Analytics event */
export interface AnalyticsEvent {
  /** Event type */
  type: AnalyticsEventType;
  /** Event timestamp */
  timestamp: number;
  /** Event properties */
  properties?: Record<string, unknown>;
  /** User ID (anonymous if not logged in) */
  userId?: string;
  /** Session ID */
  sessionId: string;
}

/** User journey step */
export interface UserJourneyStep {
  /** Step name */
  step: string;
  /** Timestamp */
  timestamp: number;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/** Retention metric */
export interface RetentionMetric {
  /** Date */
  date: string;
  /** New users */
  newUsers: number;
  /** Returning users */
  returningUsers: number;
  /** Day 1 retention */
  day1Retention: number;
  /** Day 7 retention */
  day7Retention: number;
  /** Day 30 retention */
  day30Retention: number;
}

/** Platform breakdown */
export interface PlatformMetric {
  /** Platform name */
  platform: VideoPlatform;
  /** Download count */
  downloads: number;
  /** Unique users */
  uniqueUsers: number;
  /** Revenue (if applicable) */
  revenue?: number;
}

/** Analytics report */
export interface AnalyticsReport {
  /** Report period start */
  startDate: string;
  /** Report period end */
  endDate: string;
  /** Total downloads */
  totalDownloads: number;
  /** Total users */
  totalUsers: number;
  /** Active users */
  activeUsers: number;
  /** Revenue */
  revenue: number;
  /** Retention metrics */
  retention: RetentionMetric[];
  /** Platform breakdown */
  platforms: PlatformMetric[];
}

/** Module configuration */
export interface VidFlowConfig {
  /** API base URL */
  apiBaseUrl: string;
  /** API key (optional) */
  apiKey?: string;
  /** Enable analytics */
  enableAnalytics: boolean;
  /** Default quality */
  defaultQuality: VideoQuality;
  /** Default format */
  defaultFormat: VideoFormat;
  /** Enable caching */
  enableCache: boolean;
  /** Cache duration in seconds */
  cacheDuration: number;
  /** Maximum concurrent downloads */
  maxConcurrentDownloads: number;
  /** Timeout in milliseconds */
  timeout: number;
}
