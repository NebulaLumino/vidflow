/**
 * VidFlow WeChat Mini Program
 * Video API Utilities
 */

import type { VideoPlatform } from './platform';

/** Video metadata */
export interface VideoMetadata {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  platform: VideoPlatform;
  url: string;
  duration: number;
  author: string;
  authorUrl?: string;
  viewCount?: number;
  likeCount?: number;
  uploadDate?: string;
  formats: VideoFormatInfo[];
}

/** Video format info */
export interface VideoFormatInfo {
  formatId: string;
  ext: string;
  quality: string;
  resolution?: string;
  fileSize?: number;
  bitrate?: number;
  codec?: string;
}

/** Download options */
export interface DownloadOptions {
  url: string;
  platform: VideoPlatform;
  quality?: string;
  format?: string;
  filename?: string;
}

/** Download result */
export interface DownloadResult {
  id: string;
  status: 'downloading' | 'completed' | 'failed' | 'cancelled';
  metadata?: VideoMetadata;
  filePath?: string;
  error?: string;
}

/** API configuration */
let apiBaseUrl = 'https://api.vidflow.io';
let apiKey = '';

/**
 * Set API configuration
 */
export function setApiConfig(baseUrl: string, key: string): void {
  apiBaseUrl = baseUrl;
  apiKey = key;
}

/**
 * Get API configuration
 */
export function getApiConfig(): { baseUrl: string; key: string } {
  return { baseUrl: apiBaseUrl, key: apiKey };
}

/**
 * Parse video URL to get metadata
 */
export async function parseVideo(url: string): Promise<VideoMetadata> {
  const app = getApp<any>();
  const key = app?.getApiKey?.() || apiKey;

  const response = await wx.request({
    url: `${apiBaseUrl}/parse`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
    data: { url },
  });

  if (response.statusCode !== 200) {
    throw new Error(response.data?.message || 'Failed to parse video');
  }

  return response.data as VideoMetadata;
}

/**
 * Start download
 */
export async function startDownload(options: DownloadOptions): Promise<DownloadResult> {
  const app = getApp<any>();
  const key = app?.getApiKey?.() || apiKey;
  const config = app?.globalData?.config || {};

  const response = await wx.request({
    url: `${apiBaseUrl}/download`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
    data: {
      url: options.url,
      platform: options.platform,
      quality: options.quality || config.defaultQuality || 'highest',
      format: options.format || config.defaultFormat || 'mp4',
      filename: options.filename,
    },
  });

  if (response.statusCode !== 200) {
    throw new Error(response.data?.message || 'Failed to start download');
  }

  return response.data as DownloadResult;
}

/**
 * Get download status
 */
export async function getDownloadStatus(downloadId: string): Promise<DownloadResult> {
  const app = getApp<any>();
  const key = app?.getApiKey?.() || apiKey;

  const response = await wx.request({
    url: `${apiBaseUrl}/download/${downloadId}/status`,
    method: 'GET',
    header: {
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
  });

  if (response.statusCode !== 200) {
    throw new Error(response.data?.message || 'Failed to get download status');
  }

  return response.data as DownloadResult;
}

/**
 * Cancel download
 */
export async function cancelDownload(downloadId: string): Promise<boolean> {
  const app = getApp<any>();
  const key = app?.getApiKey?.() || apiKey;

  const response = await wx.request({
    url: `${apiBaseUrl}/download/${downloadId}/cancel`,
    method: 'POST',
    header: {
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
  });

  return response.statusCode === 200;
}

/**
 * Get download history
 */
export async function getDownloadHistory(): Promise<DownloadResult[]> {
  const app = getApp<any>();
  const key = app?.getApiKey?.() || apiKey;

  const response = await wx.request({
    url: `${apiBaseUrl}/downloads/history`,
    method: 'GET',
    header: {
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
  });

  if (response.statusCode !== 200) {
    throw new Error(response.data?.message || 'Failed to get download history');
  }

  return response.data as DownloadResult[];
}

/**
 * Save download to local history
 */
export function saveToHistory(download: DownloadResult): void {
  try {
    const history = wx.getStorageSync('download_history') || [];
    history.unshift({
      ...download,
      savedAt: Date.now(),
    });

    // Keep only last 100 downloads
    if (history.length > 100) {
      history.splice(100);
    }

    wx.setStorageSync('download_history', history);
  } catch (error) {
    console.error('Failed to save to history:', error);
  }
}

/**
 * Get local download history
 */
export function getLocalHistory(): DownloadResult[] {
  try {
    return wx.getStorageSync('download_history') || [];
  } catch (error) {
    console.error('Failed to get local history:', error);
    return [];
  }
}

/**
 * Clear local history
 */
export function clearLocalHistory(): void {
  try {
    wx.removeStorageSync('download_history');
  } catch (error) {
    console.error('Failed to clear local history:', error);
  }
}

/** Video API object */
export const VideoApi = {
  setApiConfig,
  getApiConfig,
  parseVideo,
  startDownload,
  getDownloadStatus,
  cancelDownload,
  getDownloadHistory,
  saveToHistory,
  getLocalHistory,
  clearLocalHistory,
};

export default VideoApi;
