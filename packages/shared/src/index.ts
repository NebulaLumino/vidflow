/**
 * Shared types for VidFlow
 * These types are used across all packages, apps, services, and extensions
 */

/**
 * Video platform types supported by VidFlow
 */
export type VideoPlatform = 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'facebook' | 'vimeo';

/**
 * Video quality options
 */
export type VideoQuality =
  | '144p'
  | '240p'
  | '360p'
  | '480p'
  | '720p'
  | '1080p'
  | '1440p'
  | '2160p'
  | 'best';

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

// Validation functions
const VALID_PLATFORMS: VideoPlatform[] = [
  'youtube',
  'tiktok',
  'instagram',
  'twitter',
  'facebook',
  'vimeo',
];
const VALID_QUALITIES: VideoQuality[] = [
  '144p',
  '240p',
  '360p',
  '480p',
  '720p',
  '1080p',
  '1440p',
  '2160p',
  'best',
];
const VALID_FORMATS: VideoFormat[] = ['mp4', 'webm', 'mkv', 'audio'];

/**
 * Check if a string is a valid VideoPlatform
 */
export function isValidVideoPlatform(platform: string): platform is VideoPlatform {
  return VALID_PLATFORMS.includes(platform as VideoPlatform);
}

/**
 * Check if a string is a valid VideoQuality
 */
export function isValidVideoQuality(quality: string): quality is VideoQuality {
  return VALID_QUALITIES.includes(quality as VideoQuality);
}

/**
 * Check if a string is a valid VideoFormat
 */
export function isValidVideoFormat(format: string): format is VideoFormat {
  return VALID_FORMATS.includes(format as VideoFormat);
}

/**
 * Validate a URL format
 */
export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Create a standardized API response
 */
export function createApiResponse<T>(
  data: T | undefined,
  errorCode?: string,
  errorMessage?: string
): ApiResponse<T> {
  if (errorCode || errorMessage) {
    return {
      success: false,
      error: {
        code: errorCode || 'UNKNOWN_ERROR',
        message: errorMessage || 'An unknown error occurred',
      },
    };
  }

  return {
    success: true,
    data,
  };
}
