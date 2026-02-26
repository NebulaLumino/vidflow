import React, { useEffect, useRef } from 'react';
import { adService, AdPlacement } from '@vidflow/shared';

interface AdBannerProps {
  placementId: string;
  className?: string;
}

export function AdBanner({ placementId, className = '' }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const placement = adService.getPlacement(placementId);

  useEffect(() => {
    if (placement) {
      adService.recordImpression(placementId);
    }
  }, [placementId, placement]);

  if (!placement || !placement.isActive) {
    return null;
  }

  const handleClick = () => {
    adService.recordClick(placementId);
  };

  return (
    <div
      ref={containerRef}
      className={`ad-banner ad-banner--${placement.config.position} ${className}`}
      style={{
        width: placement.config.dimensions.width,
        height: placement.config.dimensions.height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        margin: '0 auto',
      }}
      onClick={handleClick}
    >
      <span style={{ color: '#888', fontSize: '12px' }}>Advertisement</span>
    </div>
  );
}
