import { AnalyticsService } from '../analytics';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    service = new AnalyticsService();
  });

  afterEach(() => {
    service.clear();
  });

  describe('trackEvent', () => {
    it('should track an event', () => {
      const event = service.trackEvent('download', 'start', 'test-url');
      expect(event.category).toBe('download');
      expect(event.action).toBe('start');
      expect(event.label).toBe('test-url');
    });

    it('should track event with value', () => {
      const event = service.trackEvent('download', 'complete', 'test-url', 100);
      expect(event.value).toBe(100);
    });

    it('should track event with metadata', () => {
      const event = service.trackEvent('download', 'start', 'test-url', undefined, {
        platform: 'youtube',
      });
      expect(event.metadata).toEqual({ platform: 'youtube' });
    });
  });

  describe('trackDownloadStart', () => {
    it('should track download start event', () => {
      const event = service.trackDownloadStart('https://youtube.com/test', 'youtube');
      expect(event.category).toBe('download');
      expect(event.action).toBe('start');
    });
  });

  describe('trackDownloadComplete', () => {
    it('should track download complete event', () => {
      const event = service.trackDownloadComplete('https://youtube.com/test', 'youtube', '1080p');
      expect(event.category).toBe('download');
      expect(event.action).toBe('complete');
    });
  });

  describe('trackDownloadFail', () => {
    it('should track download fail event', () => {
      const event = service.trackDownloadFail(
        'https://youtube.com/test',
        'youtube',
        'Network error'
      );
      expect(event.category).toBe('download');
      expect(event.action).toBe('fail');
    });
  });

  describe('trackSearch', () => {
    it('should track search event', () => {
      const event = service.trackSearch('test query', 'youtube');
      expect(event.category).toBe('search');
      expect(event.action).toBe('start');
    });
  });

  describe('trackAdImpression', () => {
    it('should track ad impression', () => {
      const event = service.trackAdImpression('header-banner', 'top');
      expect(event.category).toBe('ad');
      expect(event.action).toBe('impression');
    });
  });

  describe('trackAdClick', () => {
    it('should track ad click', () => {
      const event = service.trackAdClick('header-banner', 'top');
      expect(event.category).toBe('ad');
      expect(event.action).toBe('click');
    });
  });

  describe('session management', () => {
    it('should start a new session', () => {
      const session = service.startNewSession('test-agent');
      expect(session.id).toBeDefined();
      expect(session.userAgent).toBe('test-agent');
    });

    it('should end current session', () => {
      service.startNewSession();
      service.trackEvent('download', 'start', 'test');
      service.endSession();

      const events = service.getEvents();
      expect(events.length).toBe(1);
    });

    it('should start new session when current session ends', () => {
      service.startNewSession();
      service.trackEvent('download', 'start', 'test1');
      service.endSession();

      service.startNewSession();
      service.trackEvent('download', 'start', 'test2');

      const events = service.getEvents();
      expect(events.length).toBe(2);
    });
  });

  describe('getEvents', () => {
    it('should return all events', () => {
      service.trackEvent('download', 'start', 'test1');
      service.trackEvent('download', 'start', 'test2');
      const events = service.getEvents();
      expect(events).toHaveLength(2);
    });

    it('should respect limit', () => {
      for (let i = 0; i < 10; i++) {
        service.trackEvent('download', 'start', `test${i}`);
      }
      const events = service.getEvents(5);
      expect(events).toHaveLength(5);
    });
  });

  describe('getEventsByCategory', () => {
    it('should filter by category', () => {
      service.trackEvent('download', 'start', 'test1');
      service.trackEvent('search', 'start', 'test2');
      service.trackEvent('download', 'complete', 'test3');

      const downloadEvents = service.getEventsByCategory('download');
      expect(downloadEvents).toHaveLength(2);
    });
  });

  describe('getEventsByAction', () => {
    it('should filter by action', () => {
      service.trackEvent('download', 'start', 'test1');
      service.trackEvent('download', 'complete', 'test2');

      const startEvents = service.getEventsByAction('start');
      expect(startEvents).toHaveLength(1);
    });
  });

  describe('getSummary', () => {
    it('should return correct summary', () => {
      service.trackEvent('download', 'start', 'test1');
      service.trackEvent('download', 'complete', 'test2');
      service.trackEvent('search', 'start', 'test3');

      const summary = service.getSummary();
      expect(summary.totalEvents).toBe(3);
      expect(summary.eventsByCategory.download).toBe(2);
      expect(summary.eventsByCategory.search).toBe(1);
    });
  });

  describe('clear', () => {
    it('should clear all events and sessions', () => {
      service.trackEvent('download', 'start', 'test');
      service.clear();

      const events = service.getEvents();
      expect(events).toHaveLength(0);
    });
  });
});
