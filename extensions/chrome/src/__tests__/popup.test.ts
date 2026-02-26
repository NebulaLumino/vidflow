/**
 * Tests for Chrome Extension Popup Utility Functions
 * Tests the pure functions from popup/main.ts
 */

// Platform detection patterns (same as in main.ts)
const PLATFORM_PATTERNS: Record<string, RegExp> = {
  youtube: /youtube\.com|youtu\.be/,
  tiktok: /tiktok\.com/,
  instagram: /instagram\.com/,
  twitter: /twitter\.com|x\.com/,
  facebook: /facebook\.com|fb\.watch/,
  vimeo: /vimeo\.com/,
};

/**
 * Detect platform from URL
 */
function detectPlatform(url: string): string {
  for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
    if (pattern.test(url)) {
      return platform;
    }
  }
  return 'unknown';
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

describe('Chrome Extension Popup Utilities', () => {
  describe('detectPlatform', () => {
    it('should detect YouTube URLs', () => {
      expect(detectPlatform('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('youtube');
      expect(detectPlatform('https://youtu.be/dQw4w9WgXcQ')).toBe('youtube');
      expect(detectPlatform('https://youtube.com/shorts/abc123')).toBe('youtube');
    });

    it('should detect TikTok URLs', () => {
      expect(detectPlatform('https://www.tiktok.com/@user/video/123456789')).toBe('tiktok');
      expect(detectPlatform('https://tiktok.com/@user/video/123456789')).toBe('tiktok');
    });

    it('should detect Instagram URLs', () => {
      expect(detectPlatform('https://www.instagram.com/reel/C123456789/')).toBe('instagram');
      expect(detectPlatform('https://instagram.com/p/ABC123/')).toBe('instagram');
    });

    it('should detect Twitter/X URLs', () => {
      expect(detectPlatform('https://twitter.com/user/status/123456789')).toBe('twitter');
      expect(detectPlatform('https://x.com/user/status/123456789')).toBe('twitter');
    });

    it('should detect Facebook URLs', () => {
      expect(detectPlatform('https://www.facebook.com/watch/?v=123456789')).toBe('facebook');
      expect(detectPlatform('https://fb.watch/abc123')).toBe('facebook');
    });

    it('should detect Vimeo URLs', () => {
      expect(detectPlatform('https://vimeo.com/123456789')).toBe('vimeo');
      expect(detectPlatform('https://www.vimeo.com/123456789')).toBe('vimeo');
    });

    it('should return unknown for unsupported platforms', () => {
      expect(detectPlatform('https://example.com/video')).toBe('unknown');
      expect(detectPlatform('https://dailymotion.com/video/abc123')).toBe('unknown');
      expect(detectPlatform('')).toBe('unknown');
    });

    it('should handle edge cases', () => {
      expect(detectPlatform('not-a-url')).toBe('unknown');
      expect(detectPlatform('http://localhost:3000')).toBe('unknown');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds to MM:SS', () => {
      expect(formatDuration(0)).toBe('0:00');
      expect(formatDuration(30)).toBe('0:30');
      expect(formatDuration(60)).toBe('1:00');
      expect(formatDuration(90)).toBe('1:30');
      expect(formatDuration(3599)).toBe('59:59');
    });

    it('should format seconds to HH:MM:SS for long videos', () => {
      expect(formatDuration(3600)).toBe('1:00:00');
      expect(formatDuration(3661)).toBe('1:01:01');
      expect(formatDuration(7200)).toBe('2:00:00');
      expect(formatDuration(86399)).toBe('23:59:59');
    });

    it('should handle edge cases', () => {
      expect(formatDuration(1)).toBe('0:01');
      expect(formatDuration(59)).toBe('0:59');
      expect(formatDuration(123)).toBe('2:03');
      expect(formatDuration(3723)).toBe('1:02:03');
    });
  });
});

export { detectPlatform, formatDuration };
