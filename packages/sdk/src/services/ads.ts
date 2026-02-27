import { VidFlowClient } from '../client';
import { AdPlacement, AdRequest, AdResponse } from '../types';

/**
 * Ad Service
 * Handles advertisement operations
 */
export class AdService {
  private client: VidFlowClient;

  constructor(client: VidFlowClient) {
    this.client = client;
  }

  /**
   * Get available ad placements
   */
  async getPlacements(): Promise<{ placements: AdPlacement[] }> {
    return this.client.get<{ placements: AdPlacement[] }>('/ads/placements');
  }

  /**
   * Request an ad for a placement
   */
  async getAd(request: AdRequest): Promise<AdResponse> {
    return this.client.post<AdResponse>('/ads/request', request);
  }

  /**
   * Track ad impression
   */
  async trackImpression(adId: string): Promise<{ success: boolean }> {
    return this.client.post<{ success: boolean }>('/ads/impressions', { adId });
  }

  /**
   * Track ad click
   */
  async trackClick(adId: string): Promise<{ success: boolean }> {
    return this.client.post<{ success: boolean }>('/ads/clicks', { adId });
  }

  /**
   * Get ad configuration
   */
  async getAdConfig(): Promise<{
    enabled: boolean;
    testMode: boolean;
    placements: AdPlacement[];
  }> {
    return this.client.get<{
      enabled: boolean;
      testMode: boolean;
      placements: AdPlacement[];
    }>('/ads/config');
  }
}
