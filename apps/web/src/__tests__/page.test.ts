/**
 * @vidflow/web - Home Page Tests
 */

import type { VideoMetadata, VideoQuality, VideoFormat } from '@vidflow/shared';

// Mock types for testing
interface ParseResponse {
  video: VideoMetadata;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Platform detection tests
describe('Platform Detection', () => {
  const detectPlatform = (url: string): string => {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube';
    if (urlLower.includes('tiktok.com')) return 'tiktok';
    if (urlLower.includes('instagram.com')) return 'instagram';
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'twitter';
    if (urlLower.includes('facebook.com') || urlLower.includes('fb.watch')) return 'facebook';
    if (urlLower.includes('vimeo.com')) return 'vimeo';
    return 'unknown';
  };

  test('should detect YouTube URLs', () => {
    expect(detectPlatform('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('youtube');
    expect(detectPlatform('https://youtu.be/dQw4w9WgXcQ')).toBe('youtube');
    expect(detectPlatform('https://youtube.com/shorts/abcd123')).toBe('youtube');
  });

  test('should detect TikTok URLs', () => {
    expect(detectPlatform('https://www.tiktok.com/@user/video/123456789')).toBe('tiktok');
  });

  test('should detect Instagram URLs', () => {
    expect(detectPlatform('https://www.instagram.com/p/ABC123/')).toBe('instagram');
  });

  test('should detect Twitter/X URLs', () => {
    expect(detectPlatform('https://twitter.com/user/status/123456789')).toBe('twitter');
    expect(detectPlatform('https://x.com/user/status/123456789')).toBe('twitter');
  });

  test('should detect Facebook URLs', () => {
    expect(detectPlatform('https://www.facebook.com/video/123456789')).toBe('facebook');
    expect(detectPlatform('https://fb.watch/abc123')).toBe('facebook');
  });

  test('should detect Vimeo URLs', () => {
    expect(detectPlatform('https://vimeo.com/123456789')).toBe('vimeo');
  });

  test('should return unknown for unsupported URLs', () => {
    expect(detectPlatform('https://example.com/video')).toBe('unknown');
    expect(detectPlatform('https://dailymotion.com/video/abc')).toBe('unknown');
  });
});

// Quality options tests
describe('Quality Options', () => {
  const QUALITIES: VideoQuality[] = ['best', '2160p', '1440p', '1080p', '720p', '480p', '360p'];

  test('should have valid quality options', () => {
    expect(QUALITIES).toContain('best');
    expect(QUALITIES).toContain('1080p');
    expect(QUALITIES).toContain('720p');
  });

  test('should be ordered from best to worst', () => {
    const qualityOrder = QUALITIES.map((q) => (q === 'best' ? 9999 : parseInt(q)));
    expect(qualityOrder).toEqual([...qualityOrder].sort((a, b) => b - a));
  });
});

// Format options tests
describe('Format Options', () => {
  const FORMATS: VideoFormat[] = ['mp4', 'webm', 'mkv'];

  test('should have valid format options', () => {
    expect(FORMATS).toContain('mp4');
    expect(FORMATS).toContain('webm');
    expect(FORMATS).toContain('mkv');
  });
});

// API response structure tests
describe('API Response Structure', () => {
  test('should have correct ApiResponse structure', () => {
    const response: ApiResponse<ParseResponse> = {
      success: true,
      data: {
        video: {
          id: 'test123',
          platform: 'youtube',
          title: 'Test Video',
          url: 'https://youtube.com/watch?v=test123',
        },
      },
    };

    expect(response.success).toBe(true);
    expect(response.data.video).toBeDefined();
    expect(response.data.video.title).toBe('Test Video');
  });

  test('should handle error responses', () => {
    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
    };

    expect(errorResponse.success).toBe(false);
    expect(errorResponse.data).toBeNull();
  });
});

// Video metadata tests
describe('Video Metadata', () => {
  test('should create valid VideoMetadata object', () => {
    const video: VideoMetadata = {
      id: 'abc123',
      platform: 'youtube',
      title: 'Sample Video Title',
      url: 'https://youtube.com/watch?v=abc123',
      thumbnail_url: 'https://example.com/thumb.jpg',
      description: 'This is a test video',
      duration: 180,
      author: {
        name: 'Test Author',
        url: 'https://youtube.com/@testauthor',
      },
      available_qualities: ['1080p', '720p', '480p'],
      available_formats: ['mp4', 'webm'],
    };

    expect(video.id).toBe('abc123');
    expect(video.platform).toBe('youtube');
    expect(video.title).toBe('Sample Video Title');
    expect(video.duration).toBe(180);
    expect(video.author?.name).toBe('Test Author');
    expect(video.available_qualities).toContain('1080p');
    expect(video.available_formats).toContain('mp4');
  });

  test('should handle optional fields', () => {
    const video: VideoMetadata = {
      id: 'minimal123',
      platform: 'tiktok',
      title: 'Minimal Video',
      url: 'https://tiktok.com/@user/video/minimal123',
    };

    expect(video.description).toBeUndefined();
    expect(video.duration).toBeUndefined();
    expect(video.author).toBeUndefined();
  });
});
