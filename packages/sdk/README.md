# @vidflow/sdk

Official VidFlow SDK for integrating video downloading capabilities into your applications.

## Installation

```bash
npm install @vidflow/sdk
# or
pnpm add @vidflow/sdk
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

// Listen to progress
downloadService.on('progress', (event) => {
  console.log(`Progress: ${event.progress}%`);
});

downloadService.on('completed', (event) => {
  console.log(`Download completed: ${event.filePath}`);
});
```

## Services

### VideoService

Handle video parsing and metadata operations.

```typescript
const videoService = new VideoService(config);

// Parse a video URL
const { video } = await videoService.parse({ url: '...' });

// Get video by ID
const video = await videoService.get('video-id');

// Check if URL is supported
const { supported, platform } = await videoService.isUrlSupported('...');
```

### DownloadService

Handle video downloads with real-time progress tracking.

```typescript
const downloadService = new DownloadService(config);

// Start a download
const { job } = await downloadService.download({
  url: '...',
  quality: '1080p',
  format: 'mp4',
});

// Get download status
const job = await downloadService.getJob(jobId);

// Cancel a download
await downloadService.cancel(jobId);

// Listen to events
downloadService.on('progress', (event) => {
  console.log(event.progress, event.speed);
});

downloadService.on('completed', (event) => {
  console.log(event.filePath);
});
```

### AnalyticsService

Track user events and analytics.

```typescript
const analyticsService = new AnalyticsService(config);

// Track a page view
await analyticsService.trackPageView('/home');

// Track a user action
await analyticsService.trackAction('download_click', {
  videoId: '...',
  quality: '1080p',
});

// Track an error
await analyticsService.trackError({
  code: 'DOWNLOAD_FAILED',
  message: 'Network error',
});
```

### AdService

Manage advertisements.

```typescript
const adService = new AdService(config);

// Get ad placements
const { placements } = await adService.getPlacements();

// Request an ad
const { ad } = await adService.getAd({
  placementId: 'web_home_banner',
});

// Track impressions/clicks
await adService.trackImpression(adId);
await adService.trackClick(adId);
```

## Configuration

| Option    | Type   | Default                   | Description                |
| --------- | ------ | ------------------------- | -------------------------- |
| `baseUrl` | string | `https://api.vidflow.app` | API base URL               |
| `apiKey`  | string | -                         | API key for authentication |
| `timeout` | number | `30000`                   | Request timeout in ms      |
| `retries` | number | `3`                       | Number of retry attempts   |
| `version` | string | `v1`                      | API version                |

## TypeScript

This SDK is written in TypeScript and includes type definitions. All types are exported from the package.

```typescript
import type { Video, DownloadJob, Quality } from '@vidflow/sdk';
```

## Error Handling

The SDK throws typed errors that include error codes and details:

```typescript
import { VidFlowError } from '@vidflow/sdk';

try {
  await videoService.parse({ url: '...' });
} catch (error) {
  if (error instanceof VidFlowError) {
    console.log(error.code); // Error code
    console.log(error.message); // Error message
    console.log(error.details); // Additional details
  }
}
```

## React Integration

For React applications, you can use the hooks:

```typescript
import { useVideo, useDownload } from '@vidflow/sdk/react';

function VideoPlayer() {
  const { video, loading, error } = useVideo(url);

  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return <VideoPlayerComponent video={video} />;
}

function DownloadButton({ url }) {
  const { download, progress, isDownloading } = useDownload();

  return (
    <button onClick={() => download({ url, quality: '1080p' })}>
      {isDownloading ? `${progress}%` : 'Download'}
    </button>
  );
}
```

## Browser Support

The SDK works in all modern browsers. For older browsers, you may need to include polyfills:

- `Promise`
- `fetch`
- `URLSearchParams`

## License

MIT
