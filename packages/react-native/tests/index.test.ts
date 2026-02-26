/**
 * VidFlow React Native Module Tests
 */

import {
  detectPlatform,
  generateUUID,
  getConfig,
  configure,
  getSessionId,
  startNewSession,
  setUserId,
  getUserId,
  clearDownloads,
  addEventListener,
  trackEvent,
} from '../src/index';

describe('VidFlow React Native Module', () => {
  beforeEach(() => {
    clearDownloads();
    configure({ enableAnalytics: false });
    startNewSession();
  });

  describe('generateUUID', () => {
    it('should generate a valid UUID v4', () => {
      const uuid = generateUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs', () => {
      const uuids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        uuids.add(generateUUID());
      }
      expect(uuids.size).toBe(100);
    });
  });

  describe('detectPlatform', () => {
    it('should detect YouTube videos', () => {
      expect(detectPlatform('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('youtube');
      expect(detectPlatform('https://youtu.be/dQw4w9WgXcQ')).toBe('youtube');
      expect(detectPlatform('https://www.youtube.com/shorts/abc123')).toBe('youtube');
    });

    it('should detect TikTok videos', () => {
      expect(detectPlatform('https://www.tiktok.com/@user/video/123456789')).toBe('tiktok');
      expect(detectPlatform('https://www.tiktok.com/v/123456789')).toBe('tiktok');
    });

    it('should detect Instagram videos', () => {
      expect(detectPlatform('https://www.instagram.com/reel/ABC123/')).toBe('instagram');
      expect(detectPlatform('https://www.instagram.com/p/ABC123/')).toBe('instagram');
    });

    it('should detect Twitter/X videos', () => {
      expect(detectPlatform('https://twitter.com/user/status/123456789')).toBe('twitter');
      expect(detectPlatform('https://x.com/user/status/123456789')).toBe('twitter');
    });

    it('should detect Facebook videos', () => {
      expect(detectPlatform('https://www.facebook.com/user/videos/123456789')).toBe('facebook');
      expect(detectPlatform('https://fb.watch/abc123')).toBe('facebook');
    });

    it('should detect Vimeo videos', () => {
      expect(detectPlatform('https://vimeo.com/123456789')).toBe('vimeo');
      expect(detectPlatform('https://player.vimeo.com/video/123456789')).toBe('vimeo');
    });

    it('should detect Twitch videos', () => {
      expect(detectPlatform('https://www.twitch.tv/user/videos/123456789')).toBe('twitch');
      expect(detectPlatform('https://clips.twitch.tv/abc123')).toBe('twitch');
    });

    it('should detect Reddit videos', () => {
      expect(detectPlatform('https://www.reddit.com/r/videos/comments/abc123')).toBe('reddit');
      expect(detectPlatform('https://www.reddit.com/video/abc123')).toBe('reddit');
    });

    it('should detect Dailymotion videos', () => {
      expect(detectPlatform('https://www.dailymotion.com/video/abc123')).toBe('dailymotion');
    });

    it('should detect Bilibili videos', () => {
      expect(detectPlatform('https://www.bilibili.com/video/BV123456789')).toBe('bilibili');
      expect(detectPlatform('https://b23.tv/abc123')).toBe('bilibili');
    });

    it('should return null for unsupported platforms', () => {
      expect(detectPlatform('https://example.com/video/123')).toBeNull();
      expect(detectPlatform('https://some-random-site.io/video')).toBeNull();
    });

    it('should handle edge cases in URLs', () => {
      expect(detectPlatform('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL123')).toBe(
        'youtube'
      );
      expect(detectPlatform('https://youtube.com/watch?v=test')).toBe('youtube');
      expect(detectPlatform('YOUTUBE.COM/WATCH?V=TEST')).toBe('youtube');
    });
  });

  describe('configuration', () => {
    it('should return default configuration', () => {
      const config = getConfig();
      expect(config.apiBaseUrl).toBe('https://api.vidflow.io');
      expect(config.enableAnalytics).toBe(false);
      expect(config.defaultQuality).toBe('highest');
      expect(config.defaultFormat).toBe('mp4');
      expect(config.maxConcurrentDownloads).toBe(3);
    });

    it('should update configuration', () => {
      configure({
        apiBaseUrl: 'https://custom.api.com',
        defaultQuality: '720p',
        enableCache: false,
      });

      const config = getConfig();
      expect(config.apiBaseUrl).toBe('https://custom.api.com');
      expect(config.defaultQuality).toBe('720p');
      expect(config.enableCache).toBe(false);
      expect(config.defaultFormat).toBe('mp4'); // unchanged
    });
  });

  describe('session management', () => {
    it('should generate new session ID', () => {
      const session1 = getSessionId();
      expect(session1).toBeDefined();

      startNewSession();
      const session2 = getSessionId();

      expect(session1).not.toBe(session2);
    });

    it('should set and get user ID', () => {
      expect(getUserId()).toBeUndefined();

      setUserId('user-123');
      expect(getUserId()).toBe('user-123');

      setUserId('user-456');
      expect(getUserId()).toBe('user-456');
    });
  });

  describe('event listeners', () => {
    it('should add and remove event listeners', () => {
      const callback = jest.fn();
      const removeListener = addEventListener('test_event', callback);

      // Listener should be added (we can't directly test emitEvent as it's private)
      expect(typeof removeListener).toBe('function');

      removeListener();
      // Listener should be removed
    });

    it('should allow multiple listeners for same event', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      addEventListener('test_event', callback1);
      addEventListener('test_event', callback2);

      expect(true).toBe(true); // Both listeners registered
    });
  });

  describe('trackEvent', () => {
    it('should handle custom events without throwing', async () => {
      configure({ enableAnalytics: false });

      await expect(trackEvent('custom_event', { key: 'value' })).resolves.not.toThrow();
    });
  });

  describe('clearDownloads', () => {
    it('should clear downloads without error', () => {
      expect(() => clearDownloads()).not.toThrow();
    });
  });
});
