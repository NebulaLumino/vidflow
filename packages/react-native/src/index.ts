/**
 * VidFlow React Native Module
 * Native video download functionality for React Native applications
 */

import type {
  VidFlowConfig,
  DownloadOptions,
  DownloadResult,
  VideoMetadata,
  VideoPlatform,
  AnalyticsEvent,
  AnalyticsReport,
} from './types';

/** Default configuration */
const DEFAULT_CONFIG: VidFlowConfig = {
  apiBaseUrl: 'https://api.vidflow.io',
  enableAnalytics: true,
  defaultQuality: 'highest',
  defaultFormat: 'mp4',
  enableCache: true,
  cacheDuration: 3600,
  maxConcurrentDownloads: 3,
  timeout: 60000,
};

/** Active downloads Map */
const activeDownloads = new Map<string, DownloadResult>();

/** Event listeners Map */
const eventListeners = new Map<string, Set<(data: unknown) => void>>();

/** Session ID for analytics */
let sessionId = generateUUID();

/** User ID for analytics */
let userId: string | undefined;

/** Configuration */
let config: VidFlowConfig = { ...DEFAULT_CONFIG };

/** Generate UUID */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Send analytics event */
async function sendAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  if (!config.enableAnalytics) return;

  try {
    await fetch(`${config.apiBaseUrl}/analytics/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify(event),
    });
  } catch (error) {
    console.warn('Failed to send analytics event:', error);
  }
}

/** Get platform from URL */
function detectPlatform(url: string): VideoPlatform | null {
  const urlLower = url.toLowerCase();

  const patterns: Record<VideoPlatform, RegExp[]> = {
    youtube: [
      /youtube\.com\/watch/,
      /youtu\.be\//,
      /youtube\.com\/shorts\//,
      /youtube\.com\/embed\//,
    ],
    tiktok: [/tiktok\.com\/@[\w-]+\/video\/\d+/, /tiktok\.com\/v\/\d+/],
    instagram: [/instagram\.com\/reel\//, /instagram\.com\/p\//, /instagram\.com\/tv\//],
    twitter: [/twitter\.com\/\w+\/status\/\d+/, /x\.com\/\w+\/status\/\d+/],
    facebook: [/facebook\.com\/\w+\/videos\/\d+/, /fb\.watch\//, /facebook\.com\/watch\/?\?v=\d+/],
    vimeo: [/vimeo\.com\/\d+/, /player\.vimeo\.com\/video\/\d+/],
    twitch: [/twitch\.tv\/\w+\/videos\/\d+/, /twitch\.tv\/\w+(?:\/\w+)?/, /clips\.twitch\.tv\//],
    reddit: [/reddit\.com\/r\/\w+\/comments\/\w+/, /reddit\.com\/video\/\w+/],
    dailymotion: [/dailymotion\.com\/video\/\w+/],
    bilibili: [/bilibili\.com\/video\/\w+/, /b23\.tv\//, /bilibili\.com\/shorts\/\w+/],
  };

  for (const [platform, regexps] of Object.entries(patterns)) {
    for (const pattern of regexps) {
      if (pattern.test(urlLower)) {
        return platform as VideoPlatform;
      }
    }
  }
  return null;
}

/** Parse video URL */
export async function parseVideo(url: string): Promise<VideoMetadata> {
  const platform = detectPlatform(url);
  if (!platform) {
    throw new Error('Unsupported video platform');
  }

  const response = await fetch(`${config.apiBaseUrl}/parse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
    },
    body: JSON.stringify({ url, platform }),
  });

  if (!response.ok) {
    throw new Error(`Failed to parse video: ${response.statusText}`);
  }

  const data = await response.json();
  return data as VideoMetadata;
}

/** Start download */
export async function download(options: DownloadOptions): Promise<DownloadResult> {
  const downloadId = generateUUID();
  const platform = options.platform || detectPlatform(options.url);

  if (!platform) {
    const result: DownloadResult = {
      id: downloadId,
      status: 'failed',
      error: 'Unable to detect video platform',
    };
    activeDownloads.set(downloadId, result);
    return result;
  }

  const result: DownloadResult = {
    id: downloadId,
    status: 'downloading',
    startedAt: Date.now(),
  };

  activeDownloads.set(downloadId, result);

  // Emit download started event
  emitEvent('download_started', { downloadId, url: options.url, platform });

  // Send analytics
  await sendAnalyticsEvent({
    type: 'download_started',
    timestamp: Date.now(),
    properties: { url: options.url, platform, quality: options.quality },
    userId,
    sessionId,
  });

  try {
    const response = await fetch(`${config.apiBaseUrl}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        url: options.url,
        platform,
        quality: options.quality || config.defaultQuality,
        format: options.format || config.defaultFormat,
        filename: options.filename,
        directory: options.directory,
      }),
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    const data = (await response.json()) as { metadata?: VideoMetadata; filePath?: string };

    result.status = 'completed';
    result.metadata = data.metadata;
    result.filePath = data.filePath || '';
    result.completedAt = Date.now();

    // Emit completed event
    emitEvent('download_completed', result);

    // Send analytics
    await sendAnalyticsEvent({
      type: 'download_completed',
      timestamp: Date.now(),
      properties: {
        downloadId,
        platform,
        duration: result.completedAt - (result.startedAt || 0),
      },
      userId,
      sessionId,
    });
  } catch (error) {
    result.status = 'failed';
    result.error = error instanceof Error ? error.message : 'Unknown error';
    result.completedAt = Date.now();

    // Emit failed event
    emitEvent('download_failed', result);

    // Send analytics
    await sendAnalyticsEvent({
      type: 'download_failed',
      timestamp: Date.now(),
      properties: { downloadId, platform, error: result.error },
      userId,
      sessionId,
    });
  }

  activeDownloads.set(downloadId, result);
  return result;
}

/** Cancel download */
export async function cancelDownload(downloadId: string): Promise<boolean> {
  const download = activeDownloads.get(downloadId);
  if (!download || download.status !== 'downloading') {
    return false;
  }

  try {
    await fetch(`${config.apiBaseUrl}/download/${downloadId}/cancel`, {
      method: 'POST',
      headers: {
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
    });

    download.status = 'cancelled';
    download.completedAt = Date.now();
    activeDownloads.set(downloadId, download);

    emitEvent('download_cancelled', download);

    await sendAnalyticsEvent({
      type: 'download_cancelled',
      timestamp: Date.now(),
      properties: { downloadId },
      userId,
      sessionId,
    });

    return true;
  } catch (error) {
    console.warn('Failed to cancel download:', error);
    return false;
  }
}

/** Get download status */
export function getDownloadStatus(downloadId: string): DownloadResult | null {
  return activeDownloads.get(downloadId) || null;
}

/** Get all active downloads */
export function getActiveDownloads(): DownloadResult[] {
  return Array.from(activeDownloads.values()).filter((d) => d.status === 'downloading');
}

/** Get download history */
export async function getDownloadHistory(): Promise<DownloadResult[]> {
  const response = await fetch(`${config.apiBaseUrl}/downloads/history`, {
    headers: {
      ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch download history');
  }

  return response.json() as Promise<DownloadResult[]>;
}

/** Configure module */
export function configure(newConfig: Partial<VidFlowConfig>): void {
  config = { ...config, ...newConfig };
}

/** Get current configuration */
export function getConfig(): VidFlowConfig {
  return { ...config };
}

/** Set user ID */
export function setUserId(id: string): void {
  userId = id;
}

/** Get user ID */
export function getUserId(): string | undefined {
  return userId;
}

/** Start new session */
export function startNewSession(): void {
  sessionId = generateUUID();
}

/** Get session ID */
export function getSessionId(): string {
  return sessionId;
}

/** Get analytics report */
export async function getAnalyticsReport(
  startDate: string,
  endDate: string
): Promise<AnalyticsReport> {
  const response = await fetch(
    `${config.apiBaseUrl}/analytics/report?start=${startDate}&end=${endDate}`,
    {
      headers: {
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch analytics report');
  }

  return response.json() as Promise<AnalyticsReport>;
}

/** Track custom event */
export async function trackEvent(
  eventType: string,
  properties?: Record<string, unknown>
): Promise<void> {
  await sendAnalyticsEvent({
    type: eventType as AnalyticsEvent['type'],
    timestamp: Date.now(),
    properties,
    userId,
    sessionId,
  });
}

/** Add event listener */
export function addEventListener(event: string, callback: (data: unknown) => void): () => void {
  if (!eventListeners.has(event)) {
    eventListeners.set(event, new Set());
  }
  eventListeners.get(event)!.add(callback);

  return () => {
    eventListeners.get(event)?.delete(callback);
  };
}

/** Emit event to listeners */
function emitEvent(event: string, data: unknown): void {
  const listeners = eventListeners.get(event);
  if (listeners) {
    listeners.forEach((callback) => callback(data));
  }
}

/** Clear all downloads */
export function clearDownloads(): void {
  activeDownloads.clear();
}

/** Initialize module */
export async function initialize(initialConfig?: Partial<VidFlowConfig>): Promise<void> {
  if (initialConfig) {
    config = { ...DEFAULT_CONFIG, ...initialConfig };
  }

  // Start new session
  sessionId = generateUUID();

  // Track app opened
  await trackEvent('app_opened');
}

/** Cleanup module */
export async function cleanup(): Promise<void> {
  // Track app closed
  await trackEvent('app_closed');

  // Clear downloads
  clearDownloads();

  // Clear event listeners
  eventListeners.clear();
}

// Default export
export default {
  initialize,
  cleanup,
  configure,
  getConfig,
  parseVideo,
  download,
  cancelDownload,
  getDownloadStatus,
  getActiveDownloads,
  getDownloadHistory,
  getAnalyticsReport,
  trackEvent,
  addEventListener,
  setUserId,
  getUserId,
  startNewSession,
  getSessionId,
  clearDownloads,
  detectPlatform,
};

// Named exports for testing
export { generateUUID };
