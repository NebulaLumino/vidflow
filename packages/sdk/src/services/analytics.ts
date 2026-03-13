import { VidFlowClient } from '../client';
import { AnalyticsEvent } from '../types';

/**
 * Analytics Service
 * Handles tracking and analytics events
 */
export class AnalyticsService {
  private client: VidFlowClient;

  constructor(client: VidFlowClient) {
    this.client = client;
  }

  /**
   * Track an event
   */
  async track(event: AnalyticsEvent): Promise<{ success: boolean }> {
    return this.client.post<{ success: boolean }>('/analytics/events', event);
  }

  /**
   * Track a download event
   */
  async trackDownload(event: {
    jobId: string;
    event: 'started' | 'progress' | 'completed' | 'failed' | 'cancelled';
    data?: Record<string, unknown>;
  }): Promise<{ success: boolean }> {
    return this.track({
      event: `download.${event.event}`,
      properties: {
        jobId: event.jobId,
        ...event.data,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track a page view
   */
  async trackPageView(
    page: string,
    properties?: Record<string, unknown>
  ): Promise<{ success: boolean }> {
    return this.track({
      event: 'page_view',
      properties: {
        page,
        ...properties,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track a user action
   */
  async trackAction(
    action: string,
    properties?: Record<string, unknown>
  ): Promise<{ success: boolean }> {
    return this.track({
      event: `action.${action}`,
      properties,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track an error
   */
  async trackError(error: {
    code: string;
    message: string;
    stack?: string;
    context?: Record<string, unknown>;
  }): Promise<{ success: boolean }> {
    return this.track({
      event: 'error',
      properties: error,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track performance metrics
   */
  async trackPerformance(metrics: {
    name: string;
    value: number;
    unit?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ success: boolean }> {
    return this.track({
      event: 'performance',
      properties: metrics,
      timestamp: new Date().toISOString(),
    });
  }
}
