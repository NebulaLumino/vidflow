/**
 * VidFlow WeChat Mini Program
 * Analytics Utilities
 */

import type { VideoPlatform } from './platform';

/** Analytics event types */
export type AnalyticsEventType =
  | 'app_opened'
  | 'app_shown'
  | 'app_hidden'
  | 'app_error'
  | 'page_view'
  | 'page_shown'
  | 'download_started'
  | 'download_completed'
  | 'download_failed'
  | 'download_cancelled'
  | 'video_search'
  | 'platform_selected'
  | 'quality_changed'
  | 'format_changed'
  | 'settings_changed';

/** Analytics configuration */
interface AnalyticsConfig {
  apiBaseUrl: string;
  enableAnalytics: boolean;
  userId?: string;
  sessionId: string;
}

let config: AnalyticsConfig = {
  apiBaseUrl: 'https://api.vidflow.io',
  enableAnalytics: true,
  sessionId: generateSessionId(),
};

/** Generate session ID */
function generateSessionId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Initialize analytics
 */
export function initAnalytics(app: WechatMiniprogram.App): void {
  try {
    const storedConfig = wx.getStorageSync('analyticsConfig');
    if (storedConfig) {
      config = { ...config, ...storedConfig };
    }
  } catch (error) {
    console.error('Failed to initialize analytics:', error);
  }
}

/**
 * Track event
 */
export function trackEvent(eventType: AnalyticsEventType, properties?: Record<string, any>): void {
  if (!config.enableAnalytics) return;

  const event = {
    type: eventType,
    timestamp: Date.now(),
    properties: {
      ...properties,
      platform: 'wechat',
      sessionId: config.sessionId,
      userId: config.userId,
    },
  };

  // Send to server
  sendEvent(event).catch((err) => {
    console.warn('Failed to send analytics event:', err);
  });

  // Store locally for batch sending
  storeEventLocally(event);
}

/**
 * Send event to server
 */
async function sendEvent(event: any): Promise<void> {
  try {
    await wx.request({
      url: `${config.apiBaseUrl}/analytics/events`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
      },
      data: event,
    });
  } catch (error) {
    // Silent fail for analytics
  }
}

/**
 * Store event locally for batch sending
 */
function storeEventLocally(event: any): void {
  try {
    const events = wx.getStorageSync('analytics_events') || [];
    events.push(event);

    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }

    wx.setStorageSync('analytics_events', events);
  } catch (error) {
    // Silent fail
  }
}

/**
 * Flush stored events
 */
export async function flushEvents(): Promise<void> {
  try {
    const events = wx.getStorageSync('analytics_events') || [];
    if (events.length === 0) return;

    await wx.request({
      url: `${config.apiBaseUrl}/analytics/batch`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
      },
      data: { events },
    });

    // Clear stored events on success
    wx.setStorageSync('analytics_events', []);
  } catch (error) {
    console.warn('Failed to flush analytics events:', error);
  }
}

/**
 * Set user ID
 */
export function setUserId(userId: string): void {
  config.userId = userId;
  try {
    wx.setStorageSync('analyticsConfig', config);
  } catch (error) {
    console.error('Failed to save user ID:', error);
  }
}

/**
 * Get user ID
 */
export function getUserId(): string | undefined {
  return config.userId;
}

/**
 * Start new session
 */
export function startNewSession(): void {
  config.sessionId = generateSessionId();
  trackEvent('app_opened', { newSession: true });
}

/**
 * Set analytics enabled
 */
export function setAnalyticsEnabled(enabled: boolean): void {
  config.enableAnalytics = enabled;
  try {
    wx.setStorageSync('analyticsConfig', config);
  } catch (error) {
    console.error('Failed to save analytics config:', error);
  }
}

/**
 * Get analytics enabled
 */
export function isAnalyticsEnabled(): boolean {
  return config.enableAnalytics;
}

/** Analytics object for App */
export const Analytics = {
  trackEvent,
  flushEvents,
  setUserId,
  getUserId,
  startNewSession,
  setAnalyticsEnabled,
  isAnalyticsEnabled,
};

export default Analytics;
