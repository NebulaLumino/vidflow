# Ad Placements

This document details all ad placement types in the VidFlow platform.

## Overview

Ad placements define where and how advertisements appear in the VidFlow applications. Each placement has specific characteristics including size, format, and user experience implications.

## Placement Types

### 1. Banner Placements

Banner ads are horizontal display ads that appear at the top or bottom of pages.

#### Header Banner

**Placement ID:** `header`

**Description:** Full-width banner displayed at the top of all pages

**Dimensions:** 728x90 pixels (leaderboard) or 320x50 pixels (mobile)

**Behavior:**

- Fixed position at top of viewport
- Collapses to hamburger menu on mobile
- Minimum height: 50px
- Background color: white/light gray
- Border radius: 0

**Example:**

```
┌─────────────────────────────────────────────────────┐
│  [AD] Brand Logo | Click here for 50% off!   [X]  │
├─────────────────────────────────────────────────────┤
│  Logo    Home    Videos    Features    [Login]    │
└─────────────────────────────────────────────────────┘
```

#### Footer Banner

**Placement ID:** `footer`

**Description:** Full-width banner displayed at the bottom of pages

**Dimensions:** 728x90 pixels or 320x50 pixels (mobile)

**Behavior:**

- Fixed position at bottom of viewport
- Appears after scrolling past content
- Dismissible (user can close)
- Background: dark gray

**Example:**

```
┌─────────────────────────────────────────────────────┐
│  Home    About    Privacy    Terms    [AD] ©2024  │
│  [AD] Subscribe to our newsletter!    [X]         │
└─────────────────────────────────────────────────────┘
```

### 2. Sidebar Placements

Sidebar ads appear in the side column of page layouts.

#### Sidebar Rectangle

**Placement ID:** `sidebar`

**Description:** Vertical banner in sidebar area

**Dimensions:** 300x250 pixels (medium rectangle)

**Behavior:**

- Right-aligned on desktop
- Below content on mobile (responsive)
- White background with subtle border

**Example:**

```
┌─────────────────────┬──────────────────────────────┐
│                     │                              │
│    Main Content     │      [ADVERTISEMENT]        │
│                     │                              │
│   Video Title      │   ┌──────────────────┐      │
│   Description      │   │                  │      │
│   ...              │   │   300x250 Ad     │      │
│                     │   │                  │      │
│                     │   └──────────────────┘      │
│                     │                              │
└─────────────────────┴──────────────────────────────┘
```

### 3. Video Ad Placements

Video ads play before, during, or after video content.

#### Pre-Roll Ad

**Placement ID:** `video_preroll`

**Description:** Video ad played before main content

**Duration:** 15 or 30 seconds

**Behavior:**

- Auto-play with sound (muted if autoplay policy)
- Skip button after 5 seconds (for 30s ads)
- Countdown indicator
- Cannot be closed (must watch or skip)
- Linear overlay - takes full screen

**Example:**

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│     ┌─────────────────────────────────────────┐    │
│     │                                         │    │
│     │         [VIDEO ADVERTISEMENT]           │    │
│     │                                         │    │
│     │   Brand Name    [Skip in 5s]           │    │
│     │                                         │    │
│     └─────────────────────────────────────────┘    │
│                                                     │
│   Duration: 0:15 / 0:30  ████████░░░░░░░░░░░░░     │
└─────────────────────────────────────────────────────┘
```

#### Mid-Roll Ad

**Placement ID:** `video_midroll`

**Description:** Video ad played during video content

**Duration:** 15 seconds

**Behavior:**

- Pauses main video
- Played at defined break points
- Skip available after 5 seconds
- May appear multiple times in long video

**Timing:**

- Videos > 3 minutes: 1 mid-roll
- Videos > 10 minutes: 2+ mid-rolls

#### Post-Roll Ad

**Placement ID:** `video_postroll`

**Description:** Video ad played after main content

**Duration:** 15 or 30 seconds

**Behavior:**

- Auto-plays after video ends
- Does not block replay controls

### 4. Interstitial Placements

Full-screen ads that appear between content or navigation.

#### Page Interstitial

**Placement ID:** `interstitial`

**Description:** Full-screen overlay between page navigation

**Dimensions:** Full viewport (responsive)

**Behavior:**

- Appears when navigating between major sections
- Semi-transparent backdrop
- Close button in corner
- Auto-close after 5 seconds (optional)
- Counts as "viewed" when displayed for 2+ seconds

**Example:**

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                                                     │
│      ┌────────────────────────────────────┐         │
│      │                                    │         │
│      │         INTERSTITIAL AD            │         │
│      │                                    │         │
│      │   [Skip in 3 seconds]   [X]       │         │
│      │                                    │         │
│      └────────────────────────────────────┘         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 5. In-Feed Placements

Ads that appear within content feeds.

#### Feed Ad

**Placement ID:** `feed`

**Description:** Promoted content within video feed

**Dimensions:** Match video card dimensions (responsive)

**Behavior:**

- Appears every 5-10 videos in feed
- Marked as "Promoted" or "Advertisement"
- Same interaction as regular video cards
- Thumbnail, title, channel name, view count

**Example:**

```
┌─────────────────────────────────────────────────────┐
│  [Video Thumbnail]  Video Title      1.2M views   │
│  [Channel Name]    2 hours ago                     │
├─────────────────────────────────────────────────────┤
│  [Promoted]        Sponsored Content               │
│  [Video Thumbnail]  Brand Video      500K views   │
│  [Brand Channel]   1 day ago                       │
├─────────────────────────────────────────────────────┤
│  [Video Thumbnail]  Another Video    800K views   │
│  [Channel Name]    5 hours ago                    │
└─────────────────────────────────────────────────────┘
```

## Placement Configuration

### Ad Request Structure

```json
{
  "placement": "sidebar",
  "user_id": "user123",
  "context": {
    "page": "home",
    "video_id": "abc123",
    "category": "music"
  }
}
```

### Response Structure

```json
{
  "success": true,
  "data": {
    "ad": {
      "id": "ad_123",
      "type": "banner",
      "placement": "sidebar",
      "content": "...",
      "image_url": "https://...",
      "target_url": "https://...",
      "tracking": {
        "impression_url": "https://...",
        "click_url": "https://..."
      }
    }
  }
}
```

## Tracking Events

### Impression Tracking

Send impression when ad is displayed:

```javascript
// Track impression
await fetch('/api/v1/ads/ad_123/impression', {
  method: 'POST',
  body: JSON.stringify({
    ip_address: clientIP,
    user_agent: navigator.userAgent,
    country: userCountry,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
  }),
});
```

### Click Tracking

Track click before redirecting:

```javascript
// Track click and get redirect URL
const response = await fetch('/api/v1/ads/ad_123/click', {
  method: 'POST',
  body: JSON.stringify({
    ip_address: clientIP,
    user_agent: navigator.userAgent,
  }),
});

const { redirect_url } = response.data;

// Redirect to advertiser
window.location.href = redirect_url;
```

## Viewability Standards

Ads must meet viewability requirements to count as impressions:

| Placement    | Viewability Threshold    |
| ------------ | ------------------------ |
| Banner       | 50% visible for 1 second |
| Sidebar      | 50% visible for 1 second |
| Pre-roll     | Starts playing           |
| Mid-roll     | Starts playing           |
| Interstitial | 50% visible for 1 second |
| Feed         | 50% visible for 1 second |

## Responsive Behavior

### Mobile (< 768px)

| Desktop Placement | Mobile Behavior            |
| ----------------- | -------------------------- |
| header            | Reduced height (50px)      |
| footer            | Fixed bottom, reduced size |
| sidebar           | Below content, full width  |
| video_preroll     | Full screen                |
| interstitial      | Full screen                |

### Tablet (768px - 1024px)

- Header: Full leaderboard (728x90)
- Sidebar: Medium rectangle (300x250)
- Video ads: Same as desktop
