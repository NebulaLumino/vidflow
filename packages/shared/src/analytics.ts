export type EventCategory = 'download' | 'search' | 'ad' | 'engagement' | 'error';

export type EventAction =
  | 'start'
  | 'complete'
  | 'fail'
  | 'click'
  | 'view'
  | 'impression'
  | 'skip'
  | 'conversion';

export interface AnalyticsEvent {
  id: string;
  timestamp: number;
  category: EventCategory;
  action: EventAction;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsSession {
  id: string;
  startTime: number;
  endTime?: number;
  events: AnalyticsEvent[];
  userAgent?: string;
}

export interface AnalyticsSummary {
  totalEvents: number;
  eventsByCategory: Record<EventCategory, number>;
  eventsByAction: Record<EventAction, number>;
  sessionsCompleted: number;
  averageSessionDuration: number;
}

export class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessions: AnalyticsSession[] = [];
  private currentSession: AnalyticsSession | null = null;
  private readonly maxEventsInMemory = 10000;

  constructor() {
    this.startNewSession();
  }

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

  endSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      this.currentSession = null;
    }
  }

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

    if (this.currentSession) {
      this.currentSession.events.push(event);
    }

    if (this.events.length > this.maxEventsInMemory) {
      this.events = this.events.slice(-this.maxEventsInMemory);
    }

    return event;
  }

  trackDownloadStart(url: string, platform: string): AnalyticsEvent {
    return this.trackEvent('download', 'start', url, undefined, { platform });
  }

  trackDownloadComplete(url: string, platform: string, quality: string): AnalyticsEvent {
    return this.trackEvent('download', 'complete', url, undefined, { platform, quality });
  }

  trackDownloadFail(url: string, platform: string, error: string): AnalyticsEvent {
    return this.trackEvent('download', 'fail', url, undefined, { platform, error });
  }

  trackSearch(query: string, platform?: string): AnalyticsEvent {
    return this.trackEvent('search', 'start', query, undefined, { platform });
  }

  trackAdImpression(adId: string, position: string): AnalyticsEvent {
    return this.trackEvent('ad', 'impression', adId, undefined, { position });
  }

  trackAdClick(adId: string, position: string): AnalyticsEvent {
    return this.trackEvent('ad', 'click', adId, undefined, { position });
  }

  getEvents(limit?: number): AnalyticsEvent[] {
    if (limit) {
      return this.events.slice(-limit);
    }
    return [...this.events];
  }

  getEventsByCategory(category: EventCategory): AnalyticsEvent[] {
    return this.events.filter((e) => e.category === category);
  }

  getEventsByAction(action: EventAction): AnalyticsEvent[] {
    return this.events.filter((e) => e.action === action);
  }

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

  clear(): void {
    this.events = [];
    this.sessions = [];
    this.currentSession = null;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

export const analyticsService = new AnalyticsService();
