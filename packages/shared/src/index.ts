/**
 * Shared types for VidFlow
 * These types are used across all packages, apps, services, and extensions
 */

/**
 * Video platform types supported by VidFlow
 */
export type VideoPlatform = 
  | 'youtube'
  | 'tiktok'
  | 'instagram'
  | 'twitter'
  | 'facebook'
  | 'vimeo';

/**
 * Video quality options
 */
export type VideoQuality = '144p' | '240p' | '360p' | '480p' | '720p' | '1080p' | '1440p' | '2160p' | 'best';

/**
 * Video format options
 */
export type VideoFormat = 'mp4' | 'webm' | 'mkv' | 'audio';

/**
 * Video metadata from parser
 */
export interface VideoMetadata {
  id: string;
  platform: VideoPlatform;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  author: {
    name: string;
    url?: string;
  };
  duration?: number;
  uploadDate?: string;
  viewCount?: number;
  likeCount?: number;
  availableQualities: VideoQuality[];
  availableFormats: VideoFormat[];
  url: string;
}

/**
 * Download request
 */
export interface DownloadRequest {
  url: string;
  quality?: VideoQuality;
  format?: VideoFormat;
}

/**
 * Download response
 */
export interface DownloadResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video?: VideoMetadata;
  downloadUrl?: string;
  error?: string;
  progress?: number;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Parse request
 */
export interface ParseRequest {
  url: string;
}

/**
 * Parse response
 */
export interface ParseResponse {
  video: VideoMetadata;
}
