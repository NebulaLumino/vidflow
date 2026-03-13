# Adding Ad Placements

This guide explains how to add new ad placements to the VidFlow ad service.

## Overview

Ad placements are locations in the UI where advertisements are displayed. Each placement has:

- Unique identifier
- Size/dimensions
- Targeting rules
- Pricing configuration

## Step-by-Step Process

### Step 1: Define Placement

Add to the placement registry:

```go
// services/ad-service/internal/models/placements.go
type Placement struct {
    ID          string   `json:"id"`
    Name        string   `json:"name"`
    Description string   `json:"description"`
    App         string   `json:"app"`         // web, extension, mobile
    Page        string   `json:"page"`        // home, search, download
    Position    string   `json:"position"`    // header, sidebar, content, footer
    Sizes       []Size   `json:"sizes"`
    FloorPrice  float64  `json:"floor_price"` // CPM in USD
    Enabled     bool     `json:"enabled"`
}

var Placements = []Placement{
    {
        ID:          "web_home_banner",
        Name:        "Home Page Banner",
        Description: "Top banner on home page",
        App:         "web",
        Page:        "home",
        Position:    "header",
        Sizes: []Size{
            {Width: 728, Height: 90},
            {Width: 970, Height: 250},
        },
        FloorPrice: 2.00,
        Enabled:    true,
    },
    // Add new placement here
}
```

### Step 2: Create Ad Unit

Register with ad networks:

```javascript
// Google AdSense example
adsbygoogle.push({
  adUnit: '/1234567/web_home_banner',
  adSizes: [
    [728, 90],
    [970, 250],
  ],
  adSlot: '1234567890',
});
```

### Step 3: Add to Frontend

Create the ad component:

```typescript
// packages/ui/src/components/AdBanner.tsx
import React, { useEffect, useState } from 'react';

interface AdBannerProps {
  placementId: string;
  className?: string;
}

export function AdBanner({ placementId, className }: AdBannerProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAd() {
      try {
        const response = await fetch(`/api/v1/ads?placement=${placementId}`);
        const data = await response.json();
        setAd(data.ad);
      } catch (error) {
        console.error('Failed to load ad:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAd();
  }, [placementId]);

  if (isLoading) {
    return <AdPlaceholder size="banner" />;
  }

  if (!ad) {
    return null;
  }

  return (
    <div className={`ad-banner ${className}`}>
      <AdContent ad={ad} />
    </div>
  );
}
```

### Step 4: Implement in App

Use the component:

```typescript
// In your page
import { AdBanner } from '@vidflow/ui';

function HomePage() {
  return (
    <div>
      <Header />

      <AdBanner placementId="web_home_banner" />

      <Content />

      <AdBanner placementId="web_sidebar_rect" />

      <Footer />
    </div>
  );
}
```

## Ad Types

### Banner Ads

Standard display ads in various sizes:

| Size             | Dimensions | Common Use       |
| ---------------- | ---------- | ---------------- |
| Medium Rectangle | 300x250    | Sidebar, content |
| Leaderboard      | 728x90     | Header, footer   |
| Wide Skyscraper  | 160x600    | Sidebar          |
| Large Rectangle  | 336x280    | Content          |
| Billboard        | 970x250    | Hero sections    |

### Video Ads

In-stream video advertisements:

```typescript
interface VideoAd {
  id: string;
  type: 'video';
  videoUrl: string;
  clickUrl: string;
  skipable: boolean;
  skipAfter: number; // seconds
  duration: number;
}
```

### Native Ads

Custom formatted ads that match UI:

```typescript
interface NativeAd {
  id: string;
  type: 'native';
  headline: string;
  description: string;
  imageUrl: string;
  callToAction: string;
  clickUrl: string;
}
```

## Targeting Rules

### Page Targeting

```go
type PageTargeting struct {
    App      []string `json:"app"`      // web, extension, mobile
    Page     []string `json:"page"`    // home, search, download
    Path     string   `json:"path"`    // URL path pattern
}
```

### User Targeting

```go
type UserTargeting struct {
    Country   []string `json:"country"`
    Language  []string `json:"language"`
    Device    []string `json:"device"`    // mobile, desktop
    UserAgent string   `json:"user_agent"`
}
```

### Contextual Targeting

```go
type ContextualTargeting struct {
    Category    []string `json:"category"`
    Keywords    []string `json:"keywords"`
    VideoLength string   `json:"video_length"` // short, medium, long
}
```

## Revenue Configuration

### CPM (Cost Per Mille)

```go
type Pricing struct {
    CPM         float64 `json:"cpm"`         // Cost per 1000 impressions
    CPC         float64 `json:"cpc"`         // Cost per click
    CPA         float64 `json:"cpa"`         // Cost per action
    FloorPrice  float64 `json:"floor_price"` // Minimum acceptable price
}
```

### Revenue Share

```go
type RevenueShare struct {
    Publisher  float64 `json:"publisher"`  // 70% typical
    Platform   float64 `json:"platform"`   // 20% typical
    Network    float64 `json:"network"`    // 10% typical
}
```

## Testing

### Test Ads

Use test ad units during development:

```typescript
const TEST_PLACEMENTS = {
  web_home_banner: 'ca-app-pub-3940256099942544/6300978111',
  web_sidebar_rect: 'ca-app-pub-3940256099942544/6300978112',
};

// Enable test mode
const isDev = process.env.NODE_ENV === 'development';
const adUnit = isDev ? TEST_PLACEMENTS[placementId] : productionAdUnit;
```

### Verification

Track ad performance:

```typescript
// Track impressions
async function trackImpression(adId: string) {
  await fetch('/api/v1/ads/impression', {
    method: 'POST',
    body: JSON.stringify({ ad_id: adId, timestamp: Date.now() }),
  });
}

// Track clicks
async function trackClick(adId: string) {
  await fetch('/api/v1/ads/click', {
    method: 'POST',
    body: JSON.stringify({ ad_id: adId, timestamp: Date.now() }),
  });
}
```

## Best Practices

### Ad Load Performance

1. Lazy load ads below the fold
2. Use placeholder while loading
3. Set reasonable timeout
4. Fall back to house ads

```typescript
useEffect(() => {
  const timeout = setTimeout(() => {
    setAd(loadFallbackAd());
  }, 3000);

  return () => clearTimeout(timeout);
}, []);
```

### User Experience

1. Don't interrupt user flow
2. Limit ad density (max 30% of viewport)
3. Provide clear ad labels
4. Allow ad-free premium option

### Compliance

1. Follow AdSense policies
2. Don't click own ads
3. Accurate traffic reporting
4. Proper ad disclosures
