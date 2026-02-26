/**
 * Advanced Analytics Service for VidFlow
 * Provides batch processing, user tracking, event persistence, and performance optimization
 */

import {
  EventCategory,
  EventAction,
  AnalyticsEvent,
  AnalyticsSession,
  AnalyticsSummary,
} from './analytics';

// Batch processing configuration
interface BatchConfig {
  maxBatchSize: number;
  flushInterval: number;
  retryAttempts: number;
  retryDelay: number;
}

// User identification
export interface UserProfile {
  id: string;
  firstSeen: number;
  lastSeen: number;
  sessionCount: number;
  totalEvents: number;
  platform?: string;
  metadata?: Record<string, unknown>;
}

// Event priority levels
export type EventPriority = 'low' | 'normal' | 'high' | 'critical';

// Enhanced analytics event with priority
export interface EnhancedAnalyticsEvent extends AnalyticsEvent {
  priority?: EventPriority;
  retryCount?: number;
  userId?: string;
  sessionId?: string;
  deviceInfo?: DeviceInfo;
}

// Device information
export interface DeviceInfo {
  platform: string;
  os?: string;
  browser?: string;
  screenResolution?: string;
  language?: string;
  timezone?: string;
}

// Event filtering options
export interface EventFilter {
  category?: EventCategory;
  action?: EventAction;
  startDate?: number;
  endDate?: number;
  userId?: string;
  priority?: EventPriority;
  platform?: string;
}

// Persistence configuration
interface PersistenceConfig {
  enabled: boolean;
  storageKey: string;
  maxStoredEvents: number;
}

// Analytics export format
export interface AnalyticsExport {
  version: string;
  exportedAt: number;
  events: AnalyticsEvent[];
  sessions: AnalyticsSession[];
  userProfiles: UserProfile[];
  summary: AnalyticsSummary;
}

// Real-time metrics
export interface RealtimeMetrics {
  eventsPerMinute: number;
  activeUsers: number;
  downloadsPerMinute: number;
  errorRate: number;
  averageSessionDuration: number;
}

export class AdvancedAnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessions: AnalyticsSession[] = [];
  private currentSession: AnalyticsSession | null = null;
  private userProfiles: Map<string, UserProfile> = new Map();
  private batchQueue: EnhancedAnalyticsEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  private readonly maxEventsInMemory = 10000;

  // Configuration
  private batchConfig: BatchConfig = {
    maxBatchSize: 50,
    flushInterval: 5000, // 5 seconds
    retryAttempts: 3,
    retryDelay: 1000,
  };

  private persistenceConfig: PersistenceConfig = {
    enabled: false,
    storageKey: 'vidflow_analytics',
    maxStoredEvents: 1000,
  };

  // Callbacks for external handlers
  private onBatchReady?: (events: AnalyticsEvent[]) => void;
  private onError?: (error: Error) => void;
  private onMetricsUpdate?: (metrics: RealtimeMetrics) => void;

  // Real-time metrics tracking
  private recentEvents: number[] = []; // timestamps
  private recentDownloads: number[] = []; // timestamps
  private metricsTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config?: Partial<BatchConfig & PersistenceConfig>) {
    if (config) {
      this.batchConfig = { ...this.batchConfig, ...config };
      if ('enabled' in config || 'storageKey' in config) {
        this.persistenceConfig = {
          ...this.persistenceConfig,
          ...config,
        } as PersistenceConfig;
      }
    }

    this.startNewSession();
    this.startBatchProcessor();
    this.startMetricsTracker();

    // Restore from persistence if enabled
    if (this.persistenceConfig.enabled) {
      this.restoreFromStorage();
    }
  }

  /**
   * Start a new analytics session
   */
  startNewSession(userAgent?: string): AnalyticsSession {
    if (this.currentSession && this.currentSession.endTime === undefined) {
      this.endSession();
    }

    const session: AnalyticsSession = {
      id: this.generateId(),
      startTime: Date.now(),
      events: [],
      userAgent,
    };

    this.sessions.push(session);
    this.currentSession = session;
    return session;
  }

  /**
   * End the current session
   */
  endSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      this.currentSession = null;
    }
  }

  /**
   * Track an analytics event
   */
  trackEvent(
    category: EventCategory,
    action: EventAction,
    label?: string,
    value?: number,
    metadata?: Record<string, unknown>
  ): AnalyticsEvent {
    const event: AnalyticsEvent = {
      id: this.generateId(),
      timestamp: Date.now(),
      category,
      action,
      label,
      value,
      metadata,
    };

    this.events.push(event);
    this.recentEvents.push(event.timestamp);

    if (this.currentSession) {
      this.currentSession.events.push(event);
    }

    // Track downloads separately for metrics
    if (category === 'download' && action === 'start') {
      this.recentDownloads.push(event.timestamp);
    }

    // Enqueue for batch processing
    this.enqueueEvent(event);

    // Manage memory
    if (this.events.length > this.maxEventsInMemory) {
      this.events = this.events.slice(-this.maxEventsInMemory);
    }

    return event;
  }

  /**
   * Track download start
   */
  trackDownloadStart(url: string, platform: string): AnalyticsEvent {
    return this.trackEvent('download', 'start', url, undefined, { platform });
  }

  /**
   * Track download completion
   */
  trackDownloadComplete(url: string, platform: string, quality: string): AnalyticsEvent {
    return this.trackEvent('download', 'complete', url, undefined, { platform, quality });
  }

  /**
   * Track download failure
   */
  trackDownloadFail(url: string, platform: string, error: string): AnalyticsEvent {
    return this.trackEvent('download', 'fail', url, undefined, { platform, error });
  }

  /**
   * Track search event
   */
  trackSearch(query: string, platform?: string): AnalyticsEvent {
    return this.trackEvent('search', 'start', query, undefined, { platform });
  }

  /**
   * Track ad impression
   */
  trackAdImpression(adId: string, position: string): AnalyticsEvent {
    return this.trackEvent('ad', 'impression', adId, undefined, { position });
  }

  /**
   * Track ad click
   */
  trackAdClick(adId: string, position: string): AnalyticsEvent {
    return this.trackEvent('ad', 'click', adId, undefined, { position });
  }

  /**
   * Identify a user and track their profile
   */
  identifyUser(userId: string, metadata?: Record<string, unknown>): UserProfile {
    let profile = this.userProfiles.get(userId);
    const now = Date.now();

    if (profile) {
      profile.lastSeen = now;
      profile.sessionCount++;
      if (metadata) {
        profile.metadata = { ...profile.metadata, ...metadata };
      }
    } else {
      profile = {
        id: userId,
        firstSeen: now,
        lastSeen: now,
        sessionCount: 1,
        totalEvents: 0,
        metadata,
      };
      this.userProfiles.set(userId, profile);
    }

    return profile;
  }

  /**
   * Get user profile
   */
  getUserProfile(userId: string): UserProfile | undefined {
    return this.userProfiles.get(userId);
  }

  /**
   * Get all user profiles
   */
  getAllUserProfiles(): UserProfile[] {
    return Array.from(this.userProfiles.values());
  }

  /**
   * Enqueue event for batch processing
   */
  private enqueueEvent(event: AnalyticsEvent): void {
    const enhancedEvent: EnhancedAnalyticsEvent = {
      ...event,
      priority: this.determinePriority(event),
      sessionId: this.currentSession?.id,
    };

    this.batchQueue.push(enhancedEvent);

    // Sort by priority (critical first)
    this.batchQueue.sort((a, b) => {
      const priorityOrder: Record<EventPriority, number> = {
        critical: 0,
        high: 1,
        normal: 2,
        low: 3,
      };
      return priorityOrder[a.priority || 'normal'] - priorityOrder[b.priority || 'normal'];
    });

    // Flush if batch is full
    if (this.batchQueue.length >= this.batchConfig.maxBatchSize) {
      this.flushBatch();
    }
  }

  /**
   * Determine event priority based on category and action
   */
  private determinePriority(event: AnalyticsEvent): EventPriority {
    if (event.category === 'error') return 'critical';
    if (event.category === 'download' && event.action === 'fail') return 'high';
    if (event.category === 'ad') return 'low';
    return 'normal';
  }

  /**
   * Start batch processor timer
   */
  private startBatchProcessor(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushBatch();
    }, this.batchConfig.flushInterval);
  }

  /**
   * Flush batch queue to external handler
   */
  private flushBatch(): void {
    if (this.batchQueue.length === 0) return;

    const eventsToFlush = this.batchQueue.splice(0, this.batchConfig.maxBatchSize);

    if (this.onBatchReady) {
      try {
        this.onBatchReady(eventsToFlush);

        // Save to persistence if enabled
        if (this.persistenceConfig.enabled) {
          this.saveToStorage();
        }
      } catch (error) {
        // Re-enqueue failed events for retry
        eventsToFlush.forEach((event) => {
          if (
            (event as EnhancedAnalyticsEvent).retryCount !== undefined &&
            (event as EnhancedAnalyticsEvent).retryCount! < this.batchConfig.retryAttempts
          ) {
            (event as EnhancedAnalyticsEvent).retryCount =
              ((event as EnhancedAnalyticsEvent).retryCount || 0) + 1;
            this.batchQueue.push(event as EnhancedAnalyticsEvent);
          }
        });

        if (this.onError && error instanceof Error) {
          this.onError(error);
        }
      }
    }
  }

  /**
   * Start metrics tracker
   */
  private startMetricsTracker(): void {
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
    }

    this.metricsTimer = setInterval(() => {
      // Clean up old timestamps (older than 1 minute)
      const oneMinuteAgo = Date.now() - 60000;
      this.recentEvents = this.recentEvents.filter((t) => t > oneMinuteAgo);
      this.recentDownloads = this.recentDownloads.filter((t) => t > oneMinuteAgo);

      if (this.onMetricsUpdate) {
        this.onMetricsUpdate(this.getRealtimeMetrics());
      }
    }, 10000); // Update every 10 seconds
  }

  /**
   * Get real-time metrics
   */
  getRealtimeMetrics(): RealtimeMetrics {
    const oneMinuteAgo = Date.now() - 60000;
    const activeEvents = this.recentEvents.filter((t) => t > oneMinuteAgo);
    const activeDownloads = this.recentDownloads.filter((t) => t > oneMinuteAgo);

    const completedSessions = this.sessions.filter((s) => s.endTime !== undefined);
    const totalDuration = completedSessions.reduce((sum, s) => sum + (s.endTime! - s.startTime), 0);

    const failedDownloads = this.events.filter(
      (e) => e.category === 'download' && e.action === 'fail'
    ).length;
    const totalDownloads = this.events.filter((e) => e.category === 'download').length;

    return {
      eventsPerMinute: activeEvents.length,
      activeUsers: this.userProfiles.size,
      downloadsPerMinute: activeDownloads.length,
      errorRate: totalDownloads > 0 ? failedDownloads / totalDownloads : 0,
      averageSessionDuration:
        completedSessions.length > 0 ? totalDuration / completedSessions.length : 0,
    };
  }

  /**
   * Set batch ready callback
   */
  onBatch(callback: (events: AnalyticsEvent[]) => void): void {
    this.onBatchReady = callback;
  }

  /**
   * Set error callback
   */
  onErrorCallback(callback: (error: Error) => void): void {
    this.onError = callback;
  }

  /**
   * Set metrics update callback
   */
  onMetrics(callback: (metrics: RealtimeMetrics) => void): void {
    this.onMetricsUpdate = callback;
  }

  /**
   * Force flush all pending events
   */
  flush(): void {
    this.flushBatch();
  }

  /**
   * Get events with optional filtering
   */
  getEvents(limit?: number): AnalyticsEvent[] {
    if (limit) {
      return this.events.slice(-limit);
    }
    return [...this.events];
  }

  /**
   * Filter events by criteria
   */
  filterEvents(filter: EventFilter): AnalyticsEvent[] {
    return this.events.filter((event) => {
      if (filter.category && event.category !== filter.category) return false;
      if (filter.action && event.action !== filter.action) return false;
      if (filter.startDate && event.timestamp < filter.startDate) return false;
      if (filter.endDate && event.timestamp > filter.endDate) return false;
      if (filter.platform && event.metadata?.platform !== filter.platform) return false;
      return true;
    });
  }

  /**
   * Get events by category
   */
  getEventsByCategory(category: EventCategory): AnalyticsEvent[] {
    return this.events.filter((e) => e.category === category);
  }

  /**
   * Get events by action
   */
  getEventsByAction(action: EventAction): AnalyticsEvent[] {
    return this.events.filter((e) => e.action === action);
  }

  /**
   * Get analytics summary
   */
  getSummary(): AnalyticsSummary {
    const completedSessions = this.sessions.filter((s) => s.endTime !== undefined);
    const totalSessionDuration = completedSessions.reduce(
      (sum, s) => sum + (s.endTime! - s.startTime),
      0
    );

    const eventsByCategory: Record<EventCategory, number> = {
      download: 0,
      search: 0,
      ad: 0,
      engagement: 0,
      error: 0,
    };

    const eventsByAction: Record<EventAction, number> = {
      start: 0,
      complete: 0,
      fail: 0,
      click: 0,
      view: 0,
      impression: 0,
      skip: 0,
      conversion: 0,
    };

    this.events.forEach((event) => {
      eventsByCategory[event.category]++;
      eventsByAction[event.action]++;
    });

    return {
      totalEvents: this.events.length,
      eventsByCategory,
      eventsByAction,
      sessionsCompleted: completedSessions.length,
      averageSessionDuration:
        completedSessions.length > 0 ? totalSessionDuration / completedSessions.length : 0,
    };
  }

  /**
   * Export analytics data
   */
  export(): AnalyticsExport {
    return {
      version: '2.0.0',
      exportedAt: Date.now(),
      events: this.getEvents(),
      sessions: [...this.sessions],
      userProfiles: this.getAllUserProfiles(),
      summary: this.getSummary(),
    };
  }

  /**
   * Import analytics data
   */
  import(data: AnalyticsExport): void {
    if (data.events) {
      this.events = [...this.events, ...data.events];
    }
    if (data.sessions) {
      this.sessions = [...this.sessions, ...data.sessions];
    }
    if (data.userProfiles) {
      data.userProfiles.forEach((profile) => {
        this.userProfiles.set(profile.id, profile);
      });
    }
  }

  /**
   * Save to persistent storage
   */
  private saveToStorage(): void {
    if (!this.persistenceConfig.enabled) return;

    try {
      const data = {
        events: this.events.slice(-this.persistenceConfig.maxStoredEvents),
        sessions: this.sessions.slice(-100), // Keep last 100 sessions
        userProfiles: Array.from(this.userProfiles.values()).slice(-100),
      };
      localStorage.setItem(this.persistenceConfig.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save analytics to storage:', error);
    }
  }

  /**
   * Restore from persistent storage
   */
  private restoreFromStorage(): void {
    if (!this.persistenceConfig.enabled) return;

    try {
      const stored = localStorage.getItem(this.persistenceConfig.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.events) this.events = data.events;
        if (data.sessions) this.sessions = data.sessions;
        if (data.userProfiles) {
          data.userProfiles.forEach((profile: UserProfile) => {
            this.userProfiles.set(profile.id, profile);
          });
        }
      }
    } catch (error) {
      console.error('Failed to restore analytics from storage:', error);
    }
  }

  /**
   * Enable/disable persistence
   */
  setPersistence(enabled: boolean): void {
    this.persistenceConfig.enabled = enabled;
    if (enabled) {
      this.saveToStorage();
    }
  }

  /**
   * Clear all analytics data
   */
  clear(): void {
    this.events = [];
    this.sessions = [];
    this.currentSession = null;
    this.batchQueue = [];
    this.recentEvents = [];
    this.recentDownloads = [];

    if (this.persistenceConfig.enabled) {
      localStorage.removeItem(this.persistenceConfig.storageKey);
    }
  }

  /**
   * Destroy the analytics service
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = null;
    }
    this.clear();
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

// Export singleton instance
export const advancedAnalytics = new AdvancedAnalyticsService();
