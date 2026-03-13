# SDK Package

The `@vidflow/sdk` package provides a client library for integrating VidFlow services into applications.

## Overview

The SDK offers a unified interface to:

- Parse video URLs and get metadata
- Download videos with progress tracking
- Track analytics events
- Manage advertisements

## Installation

```bash
npm install @vidflow/sdk
```

## Quick Start

```typescript
import { VidFlowClient, VideoService, DownloadService } from '@vidflow/sdk';

// Initialize the client
const client = new VidFlowClient({
  baseUrl: 'https://api.vidflow.app',
  apiKey: 'your-api-key',
});

// Use the services
const videoService = new VideoService(client.getConfig());
const downloadService = new DownloadService(client.getConfig());

// Parse a video URL
const { video } = await videoService.parse({
  url: 'https://youtube.com/watch?v=example',
});

// Start a download
const { job } = await downloadService.download({
  url: 'https://youtube.com/watch?v=example',
  quality: '1080p',
  format: 'mp4',
});
```

## Architecture

```
@vidflow/sdk
├── client.ts          # Base client with HTTP and auth
├── types.ts           # TypeScript type definitions
├── services/
│   ├── video.ts       # Video parsing operations
│   ├── download.ts    # Download with events
│   ├── analytics.ts  # Event tracking
│   └── ads.ts        # Ad management
└── index.ts          # Main exports
```

## Services

### VideoService

Handles video URL parsing and metadata retrieval.

**Methods:**

- `parse(request)` - Parse video URL and get metadata
- `get(videoId)` - Get video by ID
- `getByUrl(url)` - Get video by URL
- `getPlatforms()` - List supported platforms
- `getQualities(videoId)` - Get available qualities

### DownloadService

Handles video downloads with real-time progress.

**Features:**

- Start downloads with quality/format options
- Track progress with events
- Poll for status updates
- Cancel active downloads

### AnalyticsService

Tracks user events and performance metrics.

**Events:**

- Page views
- User actions
- Errors
- Performance metrics

### AdService

Manages advertisement placements.

**Methods:**

- `getPlacements()` - Get available ad placements
- `getAd(request)` - Request an ad
- `trackImpression(adId)` - Track ad impression
- `trackClick(adId)` - Track ad click

## Configuration

```typescript
interface ClientConfig {
  baseUrl: string; // API base URL
  apiKey?: string; // Authentication key
  timeout?: number; // Request timeout (ms)
  retries?: number; // Retry attempts
  version?: string; // API version
}
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import type { Video, DownloadJob, Quality, Platform } from '@vidflow/sdk';
```

## React Integration

For React applications, use the provided hooks:

```typescript
import { useVideo, useDownload } from '@vidflow/sdk/react';

// Hook for video operations
const { video, loading, error } = useVideo(url);

// Hook for downloads
const { download, progress } = useDownload();
```

## Error Handling

```typescript
try {
  await videoService.parse({ url: '...' });
} catch (error) {
  if (error.code === 'VIDEO_UNAVAILABLE') {
    // Handle unavailable video
  } else if (error.code === 'RATE_LIMITED') {
    // Handle rate limiting
  }
}
```

## Browser Compatibility

Works in all modern browsers. Required polyfills:

- Promise
- fetch
- URLSearchParams

## Related Documentation

- [API Documentation](../api/README.md)
- [Adding a Platform](../guides/adding-platform.md)
- [Troubleshooting](../guides/troubleshooting.md)
