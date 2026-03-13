# Platform Detection

This document details how the VidFlow Chrome Extension detects videos on various platforms.

## Detection Strategy

The extension uses multiple detection methods to identify videos:

1. **URL Pattern Matching**: Quick check of URL structure
2. **DOM Element Detection**: Look for video-specific HTML elements
3. **API Response Detection**: Check for video data in page APIs

## Detection Flow

```
User visits page
       │
       ▼
┌──────────────────┐
│  URL Pattern     │──No──▶ Continue to next detector
│  Match          │
└────────┬─────────┘
         │Yes
         ▼
┌──────────────────┐
│  DOM Element    │──No──▶ Try API detection
│  Detection     │
└────────┬─────────┘
         │Yes
         ▼
┌──────────────────┐
│  Extract Video  │
│  Metadata       │
└──────────────────┘
```

## Platform Implementations

### YouTube

**URL Patterns:**

```
https://www.youtube.com/watch?v=VIDEO_ID
https://youtu.be/VIDEO_ID
https://www.youtube.com/shorts/VIDEO_ID
https://www.youtube.com/live/VIDEO_ID
```

**Detection Code:**

```typescript
// detectors/youtube.ts
export const YouTubeDetector = {
  // Check if URL matches YouTube pattern
  matchesUrl(url: string): boolean {
    const patterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=.+/,
      /^https?:\/\/youtu\.be\/.+/,
      /^https?:\/\/(www\.)?youtube\.com\/shorts\/.+/,
      /^https?:\/\/(www\.)?youtube\.com\/live\/.+/,
    ];
    return patterns.some((p) => p.test(url));
  },

  // Extract video metadata from page
  detect(): VideoInfo | null {
    // Check URL first
    if (!this.matchesUrl(window.location.href)) {
      return null;
    }

    // Get video ID from URL
    const videoId = new URLSearchParams(window.location.search).get('v');
    if (!videoId) {
      return null;
    }

    // Extract metadata from page
    const title =
      document.querySelector('h1.ytd-video-primary-info-renderer')?.textContent ||
      document.querySelector('h1')?.textContent;

    const channelName = document.querySelector('#channel-name a')?.textContent;

    // Get thumbnail
    const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    // Get duration from player
    const duration = getYouTubePlayerDuration();

    return {
      platform: 'youtube',
      platformId: videoId,
      url: window.location.href,
      title: title?.trim() || 'Unknown',
      thumbnail,
      channel: channelName?.trim() || 'Unknown',
      duration,
    };
  },
};

function getYouTubePlayerDuration(): number {
  // Try to get duration from YouTube player
  const video = document.querySelector('video');
  if (video) {
    return video.duration;
  }

  // Try getting from player API
  const player = document.querySelector('#movie_player');
  if (player && (player as any).getVideoDetails) {
    return (player as any).getVideoDetails().lengthSeconds;
  }

  return 0;
}
```

### TikTok

**URL Patterns:**

```
https://www.tiktok.com/@username/video/VIDEO_ID
https://vm.tiktok.com/VIDEO_ID
https://m.tiktok.com/v/VIDEO_ID
```

**Detection Code:**

```typescript
// detectors/tiktok.ts
export const TikTokDetector = {
  matchesUrl(url: string): boolean {
    const patterns = [
      /^https?:\/\/(www\.)?tiktok\.com\/.+\/video\/.+/,
      /^https?:\/\/vm\.tiktok\.com\/.+/,
      /^https?:\/\/m\.tiktok\.com\/v\/.+/,
    ];
    return patterns.some((p) => p.test(url));
  },

  detect(): VideoInfo | null {
    if (!this.matchesUrl(window.location.href)) {
      return null;
    }

    // Extract video ID from URL
    const urlMatch = window.location.pathname.match(/\/video\/(\d+)/);
    const videoId = urlMatch?.[1] || this.getVideoIdFromRedirect();

    // Get metadata from page
    const title = document.querySelector('[data-e2e="video-description"]')?.textContent;
    const author = document.querySelector('[data-e2e="video-author"]')?.textContent;

    // Get thumbnail from meta tags
    const thumbnail = document.querySelector('meta[property="og:image"]')?.getAttribute('content');

    return {
      platform: 'tiktok',
      platformId: videoId,
      url: window.location.href,
      title: title?.trim() || 'Untitled',
      thumbnail: thumbnail || '',
      channel: author?.trim() || 'Unknown',
      duration: this.getDuration(),
    };
  },

  getDuration(): number {
    // TikTok videos are usually 15-60 seconds
    const video = document.querySelector('video');
    return video?.duration || 15;
  },

  getVideoIdFromRedirect(): string {
    // Handle vm.tiktok.com redirects
    const path = window.location.pathname;
    return path.replace('/', '');
  },
};
```

### Instagram

**URL Patterns:**

```
https://www.instagram.com/p/POST_ID/
https://www.instagram.com/reel/REEL_ID/
https://www.instagram.com/tv/VIDEO_ID/
```

**Detection Code:**

```typescript
// detectors/instagram.ts
export const InstagramDetector = {
  matchesUrl(url: string): boolean {
    return /instagram\.com\/(p|reel|tv)\//.test(url);
  },

  detect(): VideoInfo | null {
    if (!this.matchesUrl(window.location.href)) {
      return null;
    }

    // Extract post ID
    const pathMatch = window.location.pathname.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
    if (!pathMatch) return null;

    const [, type, postId] = pathMatch;

    // Get metadata from page
    const title = document.querySelector('h1')?.textContent;
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');

    // Get thumbnail
    const thumbnail = document.querySelector('meta[property="og:image"]')?.getAttribute('content');

    // Get video from script tag data
    const jsonLd = document.querySelector('script[type="application/ld+json"]');
    let videoUrl = '';
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd.textContent || '');
        videoUrl = data.video?.[0]?.contentUrl || '';
      } catch (e) {
        // Ignore parse errors
      }
    }

    return {
      platform: 'instagram',
      platformId: postId,
      url: window.location.href,
      title: title?.trim() || 'Instagram Video',
      thumbnail: thumbnail || '',
      channel: 'Instagram',
      videoUrl,
    };
  },
};
```

### Twitter/X

**URL Patterns:**

```
https://twitter.com/username/status/POST_ID
https://x.com/username/status/POST_ID
```

**Detection Code:**

```typescript
// detectors/twitter.ts
export const TwitterDetector = {
  matchesUrl(url: string): boolean {
    return /(twitter|x)\.com\/.+\/status\//.test(url);
  },

  detect(): VideoInfo | null {
    if (!this.matchesUrl(window.location.href)) {
      return null;
    }

    // Extract tweet ID
    const pathMatch = window.location.pathname.match(/\/status\/(\d+)/);
    const tweetId = pathMatch?.[1];
    if (!tweetId) return null;

    // Get metadata from page
    const title = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
    const thumbnail = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
    const author = document.querySelector('meta[name="twitter:site"]')?.getAttribute('content');

    return {
      platform: 'twitter',
      platformId: tweetId,
      url: window.location.href,
      title: title || 'Twitter Video',
      thumbnail: thumbnail || '',
      channel: author || 'Twitter',
    };
  },
};
```

### Facebook

**URL Patterns:**

```
https://www.facebook.com/username/videos/VIDEO_ID
https://www.facebook.com/watch/?v=VIDEO_ID
https://fb.watch/VIDEO_ID
```

**Detection Code:**

```typescript
// detectors/facebook.ts
export const FacebookDetector = {
  matchesUrl(url: string): boolean {
    const patterns = [
      /facebook\.com\/.+\/videos\/.+/,
      /facebook\.com\/watch\/\?v=.+/,
      /fb\.watch\//,
    ];
    return patterns.some((p) => p.test(url));
  },

  detect(): VideoInfo | null {
    if (!this.matchesUrl(window.location.href)) {
      return null;
    }

    // Extract video ID
    const videoId =
      new URLSearchParams(window.location.search).get('v') ||
      window.location.pathname.split('/').pop();

    // Get metadata
    const title = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const thumbnail = document.querySelector('meta[property="og:image"]')?.getAttribute('content');

    return {
      platform: 'facebook',
      platformId: videoId || '',
      url: window.location.href,
      title: title || 'Facebook Video',
      thumbnail: thumbnail || '',
      channel: 'Facebook',
    };
  },
};
```

### Vimeo

**URL Patterns:**

```
https://vimeo.com/VIDEO_ID
https://vimeo.com/username/videos/VIDEO_ID
```

**Detection Code:**

```typescript
// detectors/vimeo.ts
export const VimeoDetector = {
  matchesUrl(url: string): boolean {
    return /vimeo\.com\/(\d+)/.test(url);
  },

  detect(): VideoInfo | null {
    if (!this.matchesUrl(window.location.href)) {
      return null;
    }

    // Extract video ID
    const match = window.location.href.match(/vimeo\.com\/(\d+)/);
    const videoId = match?.[1];
    if (!videoId) return null;

    // Get metadata from page
    const title = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const thumbnail = document.querySelector('meta[property="og:image"]')?.getAttribute('content');

    return {
      platform: 'vimeo',
      platformId: videoId,
      url: window.location.href,
      title: title || 'Vimeo Video',
      thumbnail: thumbnail || '',
      channel: 'Vimeo',
    };
  },
};
```

## Detector Registry

```typescript
// detectors/index.ts
import { YouTubeDetector } from './youtube';
import { TikTokDetector } from './tiktok';
import { InstagramDetector } from './instagram';
import { TwitterDetector } from './twitter';
import { FacebookDetector } from './facebook';
import { VimeoDetector } from './vimeo';

export interface PlatformDetector {
  platform: string;
  matchesUrl(url: string): boolean;
  detect(): VideoInfo | null;
}

export const detectors: PlatformDetector[] = [
  YouTubeDetector,
  TikTokDetector,
  InstagramDetector,
  TwitterDetector,
  FacebookDetector,
  VimeoDetector,
];

export function detectVideo(url: string): VideoInfo | null {
  for (const detector of detectors) {
    if (detector.matchesUrl(url)) {
      const result = detector.detect();
      if (result) {
        return result;
      }
    }
  }
  return null;
}
```

## Adding New Platforms

To add support for a new platform:

1. Create a new detector file in `src/content-scripts/detectors/`
2. Implement `matchesUrl()` and `detect()` methods
3. Register in `detectors/index.ts`
4. Add tests

```typescript
// detectors/newplatform.ts
export const NewPlatformDetector = {
  platform: 'newplatform',

  matchesUrl(url: string): boolean {
    return /newplatform\.com\//.test(url);
  },

  detect(): VideoInfo | null {
    // Implementation
  },
};
```

## Testing

### Unit Tests

```typescript
describe('YouTubeDetector', () => {
  it('should detect standard YouTube URLs', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    expect(YouTubeDetector.matchesUrl(url)).toBe(true);
  });

  it('should detect YouTube Shorts', () => {
    const url = 'https://www.youtube.com/shorts/abc123';
    expect(YouTubeDetector.matchesUrl(url)).toBe(true);
  });

  it('should reject non-YouTube URLs', () => {
    const url = 'https://example.com/video';
    expect(YouTubeDetector.matchesUrl(url)).toBe(false);
  });
});
```

## Performance Considerations

- URL matching is fast - check first
- DOM queries can be expensive - cache results
- Use MutationObserver for dynamic content
- Debounce detection on page changes
