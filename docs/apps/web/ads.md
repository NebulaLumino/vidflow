# Web App Ad Integration

This document details how advertisements are integrated into the VidFlow Web Application.

## Overview

The web app displays ads to generate revenue. Ads are served from the Ad Service and displayed in various placements throughout the application.

## Ad Placements

### Header Banner

**Placement:** Top of all pages

**Location:** `components/AdBanner/Header.tsx`

**Size:**

- Desktop: 728x90 pixels (leaderboard)
- Mobile: 320x50 pixels (mobile banner)

**Component:**

```tsx
// components/AdBanner/Header.tsx
export function HeaderAd() {
  const { ad, isLoading } = useAd('header');

  if (isLoading) return <Skeleton height={90} />;
  if (!ad) return null;

  return <AdBanner ad={ad} position="header" />;
}
```

### Sidebar

**Placement:** Right sidebar on desktop, below content on mobile

**Location:** `components/AdBanner/Sidebar.tsx`

**Size:** 300x250 pixels (medium rectangle)

### Footer Banner

**Placement:** Bottom of all pages

**Location:** `components/AdBanner/Footer.tsx`

**Size:** Same as header

### In-Feed

**Placement:** Within video feed

**Location:** `components/AdBanner/Feed.tsx`

**Frequency:** Every 5-10 videos

## Component Implementation

### AdBanner Component

```tsx
// components/AdBanner/index.tsx
import { useAd, useAdClick, useAdImpression } from '@/hooks/useAd';

interface AdBannerProps {
  ad: Ad;
  position: string;
}

export function AdBanner({ ad, position }: AdBannerProps) {
  const { trackImpression } = useAdImpression();
  const { trackClick } = useAdClick();

  useEffect(() => {
    // Track impression when ad is visible
    trackImpression(ad.id);
  }, [ad.id]);

  const handleClick = async () => {
    const result = await trackClick(ad.id);
    if (result.redirect_url) {
      window.location.href = result.redirect_url;
    }
  };

  return (
    <div className="ad-banner" data-placement={position}>
      <img src={ad.image_url} alt={ad.name} onClick={handleClick} />
      <span className="ad-label">Advertisement</span>
    </div>
  );
}
```

### Hook Usage

```tsx
// hooks/useAd.ts
import { useState, useEffect } from 'react';

export function useAd(placement: string) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAd() {
      try {
        const response = await fetch('/api/v1/ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ placement }),
        });

        const data = await response.json();
        if (data.success) {
          setAd(data.data.ad);
        }
      } catch (error) {
        console.error('Failed to fetch ad:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAd();
  }, [placement]);

  return { ad, isLoading };
}

export function useAdImpression() {
  return {
    trackImpression: async (adId: string) => {
      await fetch(`/api/v1/ads/${adId}/impression`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip_address: await getClientIP(),
          user_agent: navigator.userAgent,
          country: await getCountry(),
        }),
      });
    },
  };
}

export function useAdClick() {
  return {
    trackClick: async (adId: string) => {
      const response = await fetch(`/api/v1/ads/${adId}/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip_address: await getClientIP(),
          user_agent: navigator.userAgent,
        }),
      });
      return response.json();
    },
  };
}
```

## Integration in Pages

### Home Page

```tsx
// app/page.tsx
import { HeaderAd } from '@/components/AdBanner/Header';
import { SidebarAd } from '@/components/AdBanner/Sidebar';
import { FooterAd } from '@/components/AdBanner/Footer';

export default function HomePage() {
  return (
    <div>
      <HeaderAd />

      <main>
        <SearchSection />
        <VideoGrid />
      </main>

      <aside>
        <SidebarAd />
      </aside>

      <FooterAd />
    </div>
  );
}
```

### Video Page

```tsx
// app/video/[id]/page.tsx
import { HeaderAd } from '@/components/AdBanner/Header';
import { SidebarAd } from '@/components/AdBanner/Sidebar';
import { PreRollAd } from '@/components/AdBanner/Video';

export default function VideoPage() {
  return (
    <div>
      <HeaderAd />

      <main>
        <VideoPlayer>
          <PreRollAd />
        </VideoPlayer>
        <VideoDetails />
      </main>

      <aside>
        <SidebarAd />
      </aside>
    </div>
  );
}
```

## Ad-Free Experience

Users can disable ads by:

1. Logging in (future)
2. Subscribing to premium (future)
3. Using browser ad blocker (user choice)

```tsx
// Check if user is premium
const { isPremium } = useUser();

if (isPremium) {
  return null; // Don't render ads
}

return <HeaderAd />;
```

## Testing Ads

### Test Mode

Enable test ads in development:

```env
NEXT_PUBLIC_AD_TEST_MODE=true
```

### Test Ad Placements

```tsx
// For testing
const TEST_ADS = {
  header: {
    id: 'test_header',
    name: 'Test Header Ad',
    image_url: '/test-ad-728x90.png',
    target_url: 'https://example.com',
  },
  sidebar: {
    id: 'test_sidebar',
    name: 'Test Sidebar Ad',
    image_url: '/test-ad-300x250.png',
    target_url: 'https://example.com',
  },
};
```

## Viewability Tracking

Track if ads are actually seen by users:

```tsx
// Track viewability using IntersectionObserver
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        // Ad is visible - track impression
        trackImpression(ad.id);
      }
    },
    { threshold: 0.5 } // 50% visible
  );

  if (adRef.current) {
    observer.observe(adRef.current);
  }

  return () => observer.disconnect();
}, [ad.id]);
```

## Revenue Optimization

### A/B Testing

Test different ad placements and formats:

```tsx
// A/B test ad positions
const variant = Math.random() > 0.5 ? 'A' : 'B';

return <div>{variant === 'A' ? <HeaderAd /> : <SidebarAd />}</div>;
```

### Lazy Loading

Load ads only when needed:

```tsx
import dynamic from 'next/dynamic';

const FooterAd = dynamic(() => import('@/components/AdBanner/Footer'), {
  loading: () => <Skeleton height={90} />,
});
```

## Error Handling

If ad service fails, show fallback or nothing:

```tsx
function AdWrapper({ placement }) {
  const { ad, error } = useAd(placement);

  if (error) {
    // Silently fail - don't disrupt user
    return null;
  }

  if (!ad) {
    return <FallbackAd placement={placement} />;
  }

  return <AdBanner ad={ad} />;
}
```

## Performance

- Load ads after main content (below fold)
- Use IntersectionObserver for lazy loading
- Cache ad responses for session
- Use placeholder while loading
