# Shared Package

The `@vidflow/shared` package provides shared TypeScript types, utilities, and constants used across all VidFlow applications and services.

## Purpose

- **Type Safety**: Centralized type definitions
- **Code Reuse**: Shared utilities and helpers
- **Consistency**: Common constants across apps

## Installation

```bash
npm install @vidflow/shared
```

## Contents

### Types

```typescript
// Video types
export interface Video {
  id: string;
  platform: Platform;
  url: string;
  title: string;
  thumbnail: string;
  duration: number;
  channel: Channel;
  metadata: VideoMetadata;
}

// Platform types
export type Platform =
  | 'youtube'
  | 'tiktok'
  | 'instagram'
  | 'twitter'
  | 'facebook'
  | 'vimeo'
  | string;

// Quality types
export type Quality = '144p' | '240p' | '360p' | '480p' | '720p' | '1080p' | '1440p' | '4k';

// Format types
export type Format = 'mp4' | 'webm' | 'audio';

// Job types
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface DownloadJob {
  id: string;
  videoId: string;
  url: string;
  quality: Quality;
  format: Format;
  status: JobStatus;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Utilities

```typescript
// Format utilities
export function formatDuration(seconds: number): string;
export function formatFileSize(bytes: number): string;
export function formatDate(date: Date): string;

// URL utilities
export function extractVideoId(url: string, platform: Platform): string | null;
export function isValidVideoUrl(url: string): boolean;

// Platform utilities
export function getPlatformFromUrl(url: string): Platform | null;
export function getPlatformName(platform: Platform): string;

// Quality utilities
export function getQualityResolutions(): Record<Quality, { width: number; height: number }>;
export function parseQuality(quality: string): Quality | null;
```

### Constants

```typescript
// Platform URLs
export const PLATFORM_DOMAINS: Record<Platform, string[]>;

// Supported platforms
export const SUPPORTED_PLATFORMS: Platform[];

// API endpoints
export const API_ENDPOINTS = {
  PARSE: '/api/v1/parse',
  JOBS: '/api/v1/jobs',
  ADS: '/api/v1/ads',
  ANALYTICS: '/api/v1/analytics',
} as const;

// Download settings
export const DOWNLOAD_SETTINGS = {
  MAX_CONCURRENT: 3,
  RETRY_ATTEMPTS: 3,
  TIMEOUT_MS: 300000,
} as const;
```

### Validation

```typescript
// Schema validation
export const videoSchema: z.ZodSchema<Video>;
export const jobSchema: z.ZodSchema<DownloadJob>;
export const parseRequestSchema: z.ZodSchema<ParseRequest>;
```

### React Hooks

```typescript
// For frontend apps
export function useVideoParser(): {
  parse: (url: string) => Promise<Video>;
  isLoading: boolean;
  error: Error | null;
};

export function useDownload(): {
  startDownload: (options: DownloadOptions) => Promise<string>;
  cancelDownload: (jobId: string) => Promise<void>;
  progress: Map<string, number>;
};
```

## Usage Examples

### Type Usage

```typescript
import { Video, DownloadJob, Quality } from '@vidflow/shared';

const video: Video = {
  id: 'abc123',
  platform: 'youtube',
  url: 'https://youtube.com/watch?v=abc123',
  title: 'Sample Video',
  thumbnail: 'https://...',
  duration: 180,
  channel: { name: 'Channel', id: 'channel123' },
  metadata: {},
};
```

### Utility Usage

```typescript
import { formatDuration, getPlatformFromUrl } from '@vidflow/shared';

// Format duration
formatDuration(125); // "2:05"

// Get platform
getPlatformFromUrl('https://youtube.com/watch?v=abc');
// Returns: 'youtube'
```

## Module Structure

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── video.ts
│   │   ├── job.ts
│   │   ├── user.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── format.ts
│   │   ├── url.ts
│   │   ├── platform.ts
│   │   └── index.ts
│   ├── constants/
│   │   ├── platforms.ts
│   │   ├── api.ts
│   │   └── index.ts
│   ├── validation/
│   │   └── schemas.ts
│   ├── hooks/
│   │   └── index.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Testing

```bash
npm test
```

## Dependencies

- `zod` - Schema validation
- `react` - React hooks (conditional)
- `zustand` - State management hooks (conditional)

## Notes

- Frontend and backend share the same types
- Changes to types should be backward compatible
- Use discriminated unions for variants
