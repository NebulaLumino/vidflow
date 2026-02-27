import {
  VideoPlatform,
  VideoQuality,
  VideoFormat,
  VideoMetadata,
  DownloadRequest,
  DownloadResponse,
  ApiResponse,
  ParseRequest,
  ParseResponse,
  isValidVideoPlatform,
  isValidVideoQuality,
  isValidVideoFormat,
  validateUrl,
  createApiResponse,
} from '../index';

describe('Shared Types', () => {
  describe('Type definitions', () => {
    it('should have correct VideoPlatform type', () => {
      const platforms: VideoPlatform[] = [
        'youtube',
        'tiktok',
        'instagram',
        'twitter',
        'facebook',
        'vimeo',
      ];
      expect(platforms).toHaveLength(6);
    });

    it('should have correct VideoQuality type', () => {
      const qualities: VideoQuality[] = [
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
      expect(qualities).toHaveLength(9);
    });

    it('should have correct VideoFormat type', () => {
      const formats: VideoFormat[] = ['mp4', 'webm', 'mkv', 'audio'];
      expect(formats).toHaveLength(4);
    });
  });

  describe('VideoMetadata', () => {
    it('should create valid VideoMetadata object', () => {
      const metadata: VideoMetadata = {
        id: 'test-video-123',
        platform: 'youtube',
        title: 'Test Video',
        description: 'A test video',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        author: {
          name: 'Test Author',
          url: 'https://example.com/author',
        },
        duration: 120,
        uploadDate: '2024-01-01',
        viewCount: 1000,
        likeCount: 100,
        availableQualities: ['720p', '1080p'],
        availableFormats: ['mp4', 'webm'],
        url: 'https://youtube.com/watch?v=test-video-123',
      };

      expect(metadata.id).toBe('test-video-123');
      expect(metadata.platform).toBe('youtube');
      expect(metadata.title).toBe('Test Video');
      expect(metadata.availableQualities).toContain('1080p');
      expect(metadata.availableFormats).toContain('mp4');
    });

    it('should allow optional fields', () => {
      const metadata: VideoMetadata = {
        id: 'test-video-456',
        platform: 'tiktok',
        title: 'Minimal Video',
        author: {
          name: 'Creator',
        },
        availableQualities: ['720p'],
        availableFormats: ['mp4'],
        url: 'https://tiktok.com/@user/video/123',
      };

      expect(metadata.description).toBeUndefined();
      expect(metadata.duration).toBeUndefined();
      expect(metadata.viewCount).toBeUndefined();
    });
  });

  describe('DownloadRequest', () => {
    it('should create valid DownloadRequest', () => {
      const request: DownloadRequest = {
        url: 'https://youtube.com/watch?v=test',
        quality: '1080p',
        format: 'mp4',
      };

      expect(request.url).toBeDefined();
      expect(request.quality).toBe('1080p');
      expect(request.format).toBe('mp4');
    });

    it('should allow optional quality and format', () => {
      const request: DownloadRequest = {
        url: 'https://youtube.com/watch?v=test',
      };

      expect(request.quality).toBeUndefined();
      expect(request.format).toBeUndefined();
    });
  });

  describe('DownloadResponse', () => {
    it('should create valid DownloadResponse with pending status', () => {
      const response: DownloadResponse = {
        id: 'download-123',
        status: 'pending',
        progress: 0,
      };

      expect(response.status).toBe('pending');
      expect(response.progress).toBe(0);
    });

    it('should create valid DownloadResponse with completed status', () => {
      const metadata: VideoMetadata = {
        id: 'test-video',
        platform: 'youtube',
        title: 'Test',
        author: { name: 'Author' },
        availableQualities: ['720p'],
        availableFormats: ['mp4'],
        url: 'https://youtube.com/watch?v=test',
      };

      const response: DownloadResponse = {
        id: 'download-456',
        status: 'completed',
        video: metadata,
        downloadUrl: 'https://example.com/download.mp4',
        progress: 100,
      };

      expect(response.status).toBe('completed');
      expect(response.downloadUrl).toBeDefined();
      expect(response.progress).toBe(100);
    });

    it('should create valid DownloadResponse with failed status', () => {
      const response: DownloadResponse = {
        id: 'download-789',
        status: 'failed',
        error: 'Download failed: Network error',
      };

      expect(response.status).toBe('failed');
      expect(response.error).toBeDefined();
    });
  });

  describe('ApiResponse', () => {
    it('should create successful ApiResponse', () => {
      const response: ApiResponse<VideoMetadata> = {
        success: true,
        data: {
          id: 'test-video',
          platform: 'youtube',
          title: 'Test Video',
          author: { name: 'Author' },
          availableQualities: ['720p'],
          availableFormats: ['mp4'],
          url: 'https://youtube.com/watch?v=test',
        },
      };

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.error).toBeUndefined();
    });

    it('should create error ApiResponse', () => {
      const response: ApiResponse<VideoMetadata> = {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: 'Failed to parse video URL',
        },
      };

      expect(response.success).toBe(false);
      expect(response.data).toBeUndefined();
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe('PARSE_ERROR');
    });
  });

  describe('ParseRequest', () => {
    it('should create valid ParseRequest', () => {
      const request: ParseRequest = {
        url: 'https://youtube.com/watch?v=test-video',
      };

      expect(request.url).toBeDefined();
    });
  });

  describe('ParseResponse', () => {
    it('should create valid ParseResponse', () => {
      const metadata: VideoMetadata = {
        id: 'test-video',
        platform: 'youtube',
        title: 'Test Video',
        author: { name: 'Author' },
        availableQualities: ['720p', '1080p'],
        availableFormats: ['mp4', 'webm'],
        url: 'https://youtube.com/watch?v=test-video',
      };

      const response: ParseResponse = {
        video: metadata,
      };

      expect(response.video).toBeDefined();
      expect(response.video.title).toBe('Test Video');
    });
  });
});

describe('Validation Functions', () => {
  describe('isValidVideoPlatform', () => {
    it('should return true for valid platforms', () => {
      expect(isValidVideoPlatform('youtube')).toBe(true);
      expect(isValidVideoPlatform('tiktok')).toBe(true);
      expect(isValidVideoPlatform('instagram')).toBe(true);
    });

    it('should return false for invalid platforms', () => {
      expect(isValidVideoPlatform('invalid')).toBe(false);
      expect(isValidVideoPlatform('')).toBe(false);
      expect(isValidVideoPlatform('YOUTUBE')).toBe(false);
    });
  });

  describe('isValidVideoQuality', () => {
    it('should return true for valid qualities', () => {
      expect(isValidVideoQuality('720p')).toBe(true);
      expect(isValidVideoQuality('1080p')).toBe(true);
      expect(isValidVideoQuality('best')).toBe(true);
    });

    it('should return false for invalid qualities', () => {
      expect(isValidVideoQuality('4k')).toBe(false);
      expect(isValidVideoQuality('')).toBe(false);
      expect(isValidVideoQuality('1080')).toBe(false);
    });
  });

  describe('isValidVideoFormat', () => {
    it('should return true for valid formats', () => {
      expect(isValidVideoFormat('mp4')).toBe(true);
      expect(isValidVideoFormat('webm')).toBe(true);
      expect(isValidVideoFormat('audio')).toBe(true);
    });

    it('should return false for invalid formats', () => {
      expect(isValidVideoFormat('avi')).toBe(false);
      expect(isValidVideoFormat('')).toBe(false);
      expect(isValidVideoFormat('MOV')).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should return true for valid URLs', () => {
      expect(validateUrl('https://youtube.com/watch?v=abc')).toBe(true);
      expect(validateUrl('https://tiktok.com/@user/video/123')).toBe(true);
      expect(validateUrl('https://instagram.com/reel/123')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('')).toBe(false);
      expect(validateUrl('http://')).toBe(false);
    });
  });

  describe('createApiResponse', () => {
    it('should create successful response with data', () => {
      const data = { id: 'test', name: 'Test' };
      const response = createApiResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.error).toBeUndefined();
    });

    it('should create error response', () => {
      const response = createApiResponse(undefined, 'ERROR_CODE', 'Error message');

      expect(response.success).toBe(false);
      expect(response.data).toBeUndefined();
      expect(response.error).toEqual({
        code: 'ERROR_CODE',
        message: 'Error message',
      });
    });
  });
});
