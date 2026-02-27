import { VidFlowClient } from '../client';
import { Video, VideoParseRequest, VideoParseResponse, Platform, Quality } from '../types';

/**
 * Video Service
 * Handles video parsing and metadata operations
 */
export class VideoService {
  private client: VidFlowClient;

  constructor(client: VidFlowClient) {
    this.client = client;
  }

  /**
   * Parse a video URL and get metadata
   */
  async parse(request: VideoParseRequest): Promise<VideoParseResponse> {
    return this.client.post<VideoParseResponse>('/videos/parse', request);
  }

  /**
   * Get video metadata by ID
   */
  async get(videoId: string): Promise<Video> {
    return this.client.get<Video>(`/videos/${videoId}`);
  }

  /**
   * Get video by platform URL
   */
  async getByUrl(url: string): Promise<Video> {
    return this.client.post<Video>('/videos/by-url', { url });
  }

  /**
   * List supported platforms
   */
  async getPlatforms(): Promise<{ platforms: Platform[] }> {
    return this.client.get<{ platforms: Platform[] }>('/platforms');
  }

  /**
   * Get platform info
   */
  async getPlatformInfo(platform: Platform): Promise<Record<string, unknown>> {
    return this.client.get<Record<string, unknown>>(`/platforms/${platform}`);
  }

  /**
   * Get available qualities for a video
   */
  async getQualities(videoId: string): Promise<{ qualities: Quality[] }> {
    return this.client.get<{ qualities: Quality[] }>(`/videos/${videoId}/qualities`);
  }

  /**
   * Check if a URL is supported
   */
  async isUrlSupported(url: string): Promise<{ supported: boolean; platform?: Platform }> {
    return this.client.post<{ supported: boolean; platform?: Platform }>('/videos/check-url', {
      url,
    });
  }
}
