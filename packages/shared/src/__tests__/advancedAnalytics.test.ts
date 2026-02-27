/**
 * Tests for Advanced Analytics Service
 */

import {
  AdvancedAnalyticsService,
  advancedAnalytics,
  UserProfile,
  RealtimeMetrics,
  AnalyticsExport,
  EventFilter,
} from '../advancedAnalytics';
import { EventCategory, EventAction } from '../analytics';

describe('AdvancedAnalyticsService', () => {
  let analytics: AdvancedAnalyticsService;

  beforeEach(() => {
    analytics = new AdvancedAnalyticsService({
      maxBatchSize: 10,
      flushInterval: 1000,
      retryAttempts: 3,
    });
  });

  afterEach(() => {
    analytics.destroy();
  });

  describe('session management', () => {
    it('should start a new session', () => {
      const session = analytics.startNewSession('test-agent');
      expect(session.id).toBeDefined();
      expect(session.startTime).toBeDefined();
      expect(session.userAgent).toBe('test-agent');
    });

    it('should end current session', () => {
      analytics.startNewSession();
      analytics.endSession();
      const events = analytics.getEvents();
      expect(events.length).toBe(0);
    });

    it('should automatically end previous session when starting new', () => {
      const session1 = analytics.startNewSession();
      const session2 = analytics.startNewSession();
      expect(session1.endTime).toBeDefined();
      expect(session2.id).not.toBe(session1.id);
    });
  });

  describe('event tracking', () => {
    it('should track download start event', () => {
      const event = analytics.trackDownloadStart('https://youtube.com/watch?v=123', 'youtube');
      expect(event.id).toBeDefined();
      expect(event.category).toBe('download');
      expect(event.action).toBe('start');
      expect(event.metadata?.platform).toBe('youtube');
    });

    it('should track download complete event', () => {
      const event = analytics.trackDownloadComplete(
        'https://youtube.com/watch?v=123',
        'youtube',
        '1080p'
      );
      expect(event.category).toBe('download');
      expect(event.action).toBe('complete');
      expect(event.metadata?.quality).toBe('1080p');
    });

    it('should track download fail event', () => {
      const event = analytics.trackDownloadFail(
        'https://youtube.com/watch?v=123',
        'youtube',
        'Network error'
      );
      expect(event.category).toBe('download');
      expect(event.action).toBe('fail');
      expect(event.metadata?.error).toBe('Network error');
    });

    it('should track search event', () => {
      const event = analytics.trackSearch('test query', 'youtube');
      expect(event.category).toBe('search');
      expect(event.action).toBe('start');
      expect(event.label).toBe('test query');
    });

    it('should track ad impression', () => {
      const event = analytics.trackAdImpression('ad-123', 'banner');
      expect(event.category).toBe('ad');
      expect(event.action).toBe('impression');
    });

    it('should track ad click', () => {
      const event = analytics.trackAdClick('ad-123', 'banner');
      expect(event.category).toBe('ad');
      expect(event.action).toBe('click');
    });

    it('should track generic event', () => {
      const event = analytics.trackEvent('engagement', 'click', 'test-label', 100, {
        key: 'value',
      });
      expect(event.category).toBe('engagement');
      expect(event.action).toBe('click');
      expect(event.label).toBe('test-label');
      expect(event.value).toBe(100);
      expect(event.metadata?.key).toBe('value');
    });
  });

  describe('user identification', () => {
    it('should identify a new user', () => {
      const profile = analytics.identifyUser('user-123', { platform: 'web' });
      expect(profile.id).toBe('user-123');
      expect(profile.firstSeen).toBeDefined();
      expect(profile.lastSeen).toBeDefined();
      expect(profile.sessionCount).toBe(1);
      expect(profile.metadata?.platform).toBe('web');
    });

    it('should update existing user profile', () => {
      analytics.identifyUser('user-123', { platform: 'web' });
      const profile = analytics.identifyUser('user-123', { platform: 'mobile' });
      expect(profile.sessionCount).toBe(2);
      expect(profile.metadata?.platform).toBe('mobile');
    });

    it('should get user profile', () => {
      analytics.identifyUser('user-123');
      const profile = analytics.getUserProfile('user-123');
      expect(profile?.id).toBe('user-123');
    });

    it('should return undefined for non-existent user', () => {
      const profile = analytics.getUserProfile('non-existent');
      expect(profile).toBeUndefined();
    });

    it('should get all user profiles', () => {
      analytics.identifyUser('user-1');
      analytics.identifyUser('user-2');
      const profiles = analytics.getAllUserProfiles();
      expect(profiles.length).toBe(2);
    });
  });

  describe('event filtering', () => {
    beforeEach(() => {
      analytics.trackDownloadStart('url1', 'youtube');
      analytics.trackDownloadComplete('url2', 'tiktok', '720p');
      analytics.trackSearch('query1', 'instagram');
    });

    it('should filter events by category', () => {
      const filter: EventFilter = { category: 'download' };
      const events = analytics.filterEvents(filter);
      expect(events.length).toBe(2);
      events.forEach((e) => expect(e.category).toBe('download'));
    });

    it('should filter events by action', () => {
      const filter: EventFilter = { action: 'start' };
      const events = analytics.filterEvents(filter);
      expect(events.length).toBe(2);
    });

    it('should filter events by platform', () => {
      const filter: EventFilter = { platform: 'youtube' };
      const events = analytics.filterEvents(filter);
      expect(events.length).toBe(1);
      expect(events[0].metadata?.platform).toBe('youtube');
    });

    it('should filter events by date range', () => {
      const now = Date.now();
      analytics.clear();
      analytics.trackDownloadStart('url1', 'youtube');
      const filter: EventFilter = { startDate: now - 1000, endDate: now + 1000 };
      const events = analytics.filterEvents(filter);
      expect(events.length).toBe(1);
    });
  });

  describe('event retrieval', () => {
    it('should get all events', () => {
      analytics.trackDownloadStart('url1', 'youtube');
      analytics.trackDownloadComplete('url2', 'tiktok', '720p');
      const events = analytics.getEvents();
      expect(events.length).toBe(2);
    });

    it('should get limited events', () => {
      for (let i = 0; i < 10; i++) {
        analytics.trackDownloadStart(`url${i}`, 'youtube');
      }
      const events = analytics.getEvents(5);
      expect(events.length).toBe(5);
    });

    it('should get events by category', () => {
      analytics.trackDownloadStart('url1', 'youtube');
      analytics.trackSearch('query1');
      const events = analytics.getEventsByCategory('download');
      expect(events.length).toBe(1);
    });

    it('should get events by action', () => {
      analytics.trackDownloadStart('url1', 'youtube');
      analytics.trackDownloadComplete('url2', 'tiktok', '720p');
      const events = analytics.getEventsByAction('start');
      expect(events.length).toBe(1);
    });
  });

  describe('analytics summary', () => {
    it('should generate summary', () => {
      analytics.trackDownloadStart('url1', 'youtube');
      analytics.trackDownloadComplete('url2', 'tiktok', '720p');
      analytics.trackSearch('query1');
      const summary = analytics.getSummary();
      expect(summary.totalEvents).toBe(3);
      expect(summary.eventsByCategory.download).toBe(2);
      expect(summary.eventsByCategory.search).toBe(1);
    });

    it('should track sessions completed', () => {
      analytics.endSession();
      const summary = analytics.getSummary();
      expect(summary.sessionsCompleted).toBe(1);
    });
  });

  describe('real-time metrics', () => {
    it('should get real-time metrics', () => {
      analytics.trackDownloadStart('url1', 'youtube');
      const metrics = analytics.getRealtimeMetrics();
      expect(metrics.eventsPerMinute).toBeGreaterThanOrEqual(1);
      expect(metrics.downloadsPerMinute).toBeGreaterThanOrEqual(1);
      expect(metrics.activeUsers).toBe(0); // No users identified yet
    });

    it('should track active users', () => {
      analytics.identifyUser('user-1');
      const metrics = analytics.getRealtimeMetrics();
      expect(metrics.activeUsers).toBe(1);
    });

    it('should calculate error rate', () => {
      analytics.trackDownloadStart('url1', 'youtube');
      analytics.trackDownloadFail('url2', 'youtube', 'error');
      const metrics = analytics.getRealtimeMetrics();
      expect(metrics.errorRate).toBe(0.5);
    });
  });

  describe('batch processing', () => {
    it('should call batch callback when batch is full', (done) => {
      const batchEvents: any[] = [];
      analytics.onBatch((events) => {
        batchEvents.push(...events);
      });

      // Fill the batch
      for (let i = 0; i < 10; i++) {
        analytics.trackDownloadStart(`url${i}`, 'youtube');
      }

      setTimeout(() => {
        expect(batchEvents.length).toBeGreaterThan(0);
        done();
      }, 100);
    });

    it('should flush on demand', () => {
      const batchEvents: any[] = [];
      analytics.onBatch((events) => {
        batchEvents.push(...events);
      });

      analytics.trackDownloadStart('url1', 'youtube');
      analytics.flush();

      expect(batchEvents.length).toBe(1);
    });
  });

  describe('export and import', () => {
    it('should export analytics data', () => {
      analytics.trackDownloadStart('url1', 'youtube');
      analytics.identifyUser('user-1');
      const exportData = analytics.export();
      expect(exportData.version).toBe('2.0.0');
      expect(exportData.exportedAt).toBeDefined();
      expect(exportData.events.length).toBe(1);
      expect(exportData.userProfiles.length).toBe(1);
    });

    it('should import analytics data', () => {
      analytics.trackDownloadStart('url1', 'youtube');
      const exportData = analytics.export();

      const newAnalytics = new AdvancedAnalyticsService();
      newAnalytics.import(exportData);

      expect(newAnalytics.getEvents().length).toBe(1);
      newAnalytics.destroy();
    });
  });

  describe('clear and destroy', () => {
    it('should clear all events', () => {
      analytics.trackDownloadStart('url1', 'youtube');
      analytics.clear();
      expect(analytics.getEvents().length).toBe(0);
    });

    it('should destroy the service', () => {
      analytics.trackDownloadStart('url1', 'youtube');
      analytics.destroy();
      expect(analytics.getEvents().length).toBe(0);
    });
  });

  describe('singleton export', () => {
    it('should have a singleton instance', () => {
      expect(advancedAnalytics).toBeDefined();
      expect(advancedAnalytics).toBeInstanceOf(AdvancedAnalyticsService);
    });
  });
});
