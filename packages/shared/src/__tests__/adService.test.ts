import { AdService, AdPlacement } from '../adService';

describe('AdService', () => {
  let service: AdService;

  beforeEach(() => {
    service = new AdService();
  });

  describe('initializeDefaultPlacements', () => {
    it('should initialize with 3 default placements', () => {
      const placements = service.getAllPlacements();
      expect(placements).toHaveLength(3);
    });

    it('should have header-banner, sidebar-banner, and footer-banner', () => {
      const placements = service.getAllPlacements();
      const ids = placements.map((p) => p.id);
      expect(ids).toContain('header-banner');
      expect(ids).toContain('sidebar-banner');
      expect(ids).toContain('footer-banner');
    });

    it('should have all placements active by default', () => {
      const activePlacements = service.getActivePlacements();
      expect(activePlacements).toHaveLength(3);
    });
  });

  describe('getPlacement', () => {
    it('should return placement by id', () => {
      const placement = service.getPlacement('header-banner');
      expect(placement).toBeDefined();
      expect(placement?.id).toBe('header-banner');
    });

    it('should return undefined for non-existent placement', () => {
      const placement = service.getPlacement('non-existent');
      expect(placement).toBeUndefined();
    });
  });

  describe('recordImpression', () => {
    it('should increment impressions', () => {
      const placement = service.getPlacement('header-banner');
      const initialImpressions = placement?.impressions || 0;

      service.recordImpression('header-banner');

      const updatedPlacement = service.getPlacement('header-banner');
      expect(updatedPlacement?.impressions).toBe(initialImpressions + 1);
    });
  });

  describe('recordClick', () => {
    it('should increment clicks', () => {
      const placement = service.getPlacement('header-banner');
      const initialClicks = placement?.clicks || 0;

      service.recordClick('header-banner');

      const updatedPlacement = service.getPlacement('header-banner');
      expect(updatedPlacement?.clicks).toBe(initialClicks + 1);
    });
  });

  describe('getClickThroughRate', () => {
    it('should return 0 for placement with no impressions', () => {
      const ctr = service.getClickThroughRate('header-banner');
      expect(ctr).toBe(0);
    });

    it('should calculate correct CTR', () => {
      service.recordImpression('header-banner');
      service.recordImpression('header-banner');
      service.recordClick('header-banner');

      const ctr = service.getClickThroughRate('header-banner');
      expect(ctr).toBe(50);
    });
  });

  describe('togglePlacement', () => {
    it('should deactivate placement', () => {
      service.togglePlacement('header-banner', false);
      const placement = service.getPlacement('header-banner');
      expect(placement?.isActive).toBe(false);
    });

    it('should reactivate placement', () => {
      service.togglePlacement('header-banner', false);
      service.togglePlacement('header-banner', true);
      const placement = service.getPlacement('header-banner');
      expect(placement?.isActive).toBe(true);
    });
  });

  describe('addCustomPlacement', () => {
    it('should add custom placement', () => {
      const customPlacement: AdPlacement = {
        id: 'custom-ad',
        config: {
          id: 'custom-ad',
          type: 'interstitial',
          position: 'top',
          dimensions: { width: 320, height: 480 },
        },
        isActive: true,
        impressions: 0,
        clicks: 0,
      };

      service.addCustomPlacement(customPlacement);
      const placement = service.getPlacement('custom-ad');
      expect(placement).toBeDefined();
    });
  });

  describe('removePlacement', () => {
    it('should remove placement', () => {
      service.removePlacement('header-banner');
      const placement = service.getPlacement('header-banner');
      expect(placement).toBeUndefined();
    });
  });

  describe('getAdStats', () => {
    it('should return correct stats', () => {
      service.recordImpression('header-banner');
      service.recordImpression('header-banner');
      service.recordClick('header-banner');

      const stats = service.getAdStats();
      expect(stats.totalImpressions).toBe(2);
      expect(stats.totalClicks).toBe(1);
      expect(stats.placements).toHaveLength(3);
    });
  });
});
