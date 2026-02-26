export interface AdConfig {
  id: string;
  type: 'banner' | 'interstitial';
  position: 'top' | 'bottom' | 'sidebar';
  dimensions: {
    width: number;
    height: number;
  };
  refreshInterval?: number;
}

export interface AdPlacement {
  id: string;
  config: AdConfig;
  isActive: boolean;
  impressions: number;
  clicks: number;
}

export class AdService {
  private placements: Map<string, AdPlacement> = new Map();
  private readonly defaultRefreshInterval = 30000;

  constructor() {
    this.initializeDefaultPlacements();
  }

  private initializeDefaultPlacements(): void {
    const defaultPlacements: AdPlacement[] = [
      {
        id: 'header-banner',
        config: {
          id: 'header-banner',
          type: 'banner',
          position: 'top',
          dimensions: { width: 728, height: 90 },
          refreshInterval: this.defaultRefreshInterval,
        },
        isActive: true,
        impressions: 0,
        clicks: 0,
      },
      {
        id: 'sidebar-banner',
        config: {
          id: 'sidebar-banner',
          type: 'banner',
          position: 'sidebar',
          dimensions: { width: 300, height: 250 },
          refreshInterval: this.defaultRefreshInterval,
        },
        isActive: true,
        impressions: 0,
        clicks: 0,
      },
      {
        id: 'footer-banner',
        config: {
          id: 'footer-banner',
          type: 'banner',
          position: 'bottom',
          dimensions: { width: 728, height: 90 },
          refreshInterval: this.defaultRefreshInterval,
        },
        isActive: true,
        impressions: 0,
        clicks: 0,
      },
    ];

    defaultPlacements.forEach((placement) => {
      this.placements.set(placement.id, placement);
    });
  }

  getPlacement(id: string): AdPlacement | undefined {
    return this.placements.get(id);
  }

  getAllPlacements(): AdPlacement[] {
    return Array.from(this.placements.values());
  }

  getActivePlacements(): AdPlacement[] {
    return this.getAllPlacements().filter((p) => p.isActive);
  }

  recordImpression(placementId: string): void {
    const placement = this.placements.get(placementId);
    if (placement) {
      placement.impressions += 1;
    }
  }

  recordClick(placementId: string): void {
    const placement = this.placements.get(placementId);
    if (placement) {
      placement.clicks += 1;
    }
  }

  getClickThroughRate(placementId: string): number {
    const placement = this.placements.get(placementId);
    if (!placement || placement.impressions === 0) {
      return 0;
    }
    return (placement.clicks / placement.impressions) * 100;
  }

  togglePlacement(placementId: string, isActive: boolean): void {
    const placement = this.placements.get(placementId);
    if (placement) {
      placement.isActive = isActive;
    }
  }

  addCustomPlacement(placement: AdPlacement): void {
    this.placements.set(placement.id, placement);
  }

  removePlacement(placementId: string): void {
    this.placements.delete(placementId);
  }

  getAdStats(): {
    totalImpressions: number;
    totalClicks: number;
    averageCTR: number;
    placements: AdPlacement[];
  } {
    const placements = this.getAllPlacements();
    const totalImpressions = placements.reduce((sum, p) => sum + p.impressions, 0);
    const totalClicks = placements.reduce((sum, p) => sum + p.clicks, 0);
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return {
      totalImpressions,
      totalClicks,
      averageCTR,
      placements,
    };
  }
}

export const adService = new AdService();
