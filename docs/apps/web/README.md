# VidFlow Web Application

The VidFlow Web Application is a modern Next.js application that provides the primary user interface for the VidFlow video download platform. It allows users to search for videos, view metadata, initiate downloads, and manage their download history.

## Purpose

The Web Application serves as the main consumer-facing interface:

- **Video Discovery**: Search and browse videos from various platforms
- **Video Preview**: View video metadata, thumbnails, and quality options
- **Download Management**: Start downloads and track progress
- **User Account**: Manage downloads and preferences (future)

## Architecture

The Web Application uses Next.js with App Router:

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                       │
├─────────────────────────────────────────────────────────────┤
│  Pages: /, /video/[id], /downloads, /settings             │
├─────────────────────────────────────────────────────────────┤
│                    React Components                        │
├─────────────────────────────────────────────────────────────┤
│               @vidflow/ui (Shared UI Library)              │
├─────────────────────────────────────────────────────────────┤
│                    API Layer (lib/)                        │
├─────────────────────────────────────────────────────────────┤
│              Gateway Service (HTTP/REST)                   │
└─────────────────────────────────────────────────────────────┘
```

### Project Structure

```
web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── VideoCard.tsx
│   │   ├── DownloadCard.tsx
│   │   ├── AdBanner.tsx
│   │   └── ...
│   ├── lib/                   # Utility functions
│   │   ├── api.ts             # API client
│   │   └── utils.ts           # Helper functions
│   └── __tests__/             # Test files
├── public/                    # Static assets
├── package.json
├── tsconfig.json
├── next.config.js
└── jest.config.js
```

### Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules / Tailwind CSS
- **UI Library**: @vidflow/ui (shared)
- **State Management**: React hooks
- **Data Fetching**: Server components / SWR
- **Testing**: Jest + React Testing Library

## Dependencies

### External Dependencies

- **next**: React framework
- **react**: UI library
- **@vidflow/ui**: Shared UI components
- **@vidflow/shared**: Shared utilities

### Internal Dependencies

- **Gateway Service**: API backend

### Environment Variables

- `NEXT_PUBLIC_API_URL`: Gateway service URL (default: http://localhost:8080)
- `NEXT_PUBLIC_APP_URL`: Application URL

## Pages

### Home Page (`/`)

The landing page with video search and featured content.

**Features:**

- Search bar for video URLs
- Recent searches
- Featured/trending videos (future)
- Ad banners (header, footer, sidebar)

**Components:**

- SearchBar
- VideoGrid
- AdBanner (header, sidebar, footer)

### Video Page (`/video/[id]`)

Detailed video information page.

**Features:**

- Video player/thumbnail preview
- Full metadata display
- Quality selection
- Download button
- Related videos (future)

**Components:**

- VideoPlayer
- VideoMetadata
- QualitySelector
- DownloadButton

### Downloads Page (`/downloads`)

User's download history and active downloads.

**Features:**

- List of downloaded videos
- Download progress
- Re-download option
- Delete downloads

**Components:**

- DownloadList
- DownloadItem
- ProgressBar

### Settings Page (`/settings`)

User preferences.

**Features:**

- Default quality preference
- Download location
- Notification preferences
- Ad settings

## Integration

### API Integration

The web app communicates with the Gateway Service:

```typescript
import { api } from '@/lib/api';

// Parse video URL
const result = await api.parseVideo('https://youtube.com/watch?v=...');

// Get supported platforms
const platforms = await api.getPlatforms();

// Submit download job
const job = await api.submitJob({
  type: 'download',
  url: 'https://youtube.com/watch?v=...',
  quality: '1080p',
});
```

### Environment Setup

```bash
# Development
NEXT_PUBLIC_API_URL=http://localhost:8080

# Production
NEXT_PUBLIC_API_URL=https://api.vidflow.app
```

## Running the Application

### Development

```bash
cd apps/web
npm install
npm run dev
```

The app will be available at http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

### Testing

```bash
npm test
npm run test:coverage
```

## Component Library

The web app uses shared UI components from `@vidflow/ui`:

```tsx
import { Button, Card, Input } from '@vidflow/ui';

export function SearchComponent() {
  return (
    <Card>
      <Input placeholder="Enter video URL" />
      <Button variant="primary">Search</Button>
    </Card>
  );
}
```

## State Management

### Local State (useState)

- Search query
- Modal states
- Form inputs

### Server State (SWR/React Query)

- Video metadata
- Download status
- Platform list

## SEO Optimization

### Meta Tags

```tsx
export const metadata = {
  title: 'VidFlow - Download Videos from Anywhere',
  description: 'Download videos from YouTube, TikTok, Instagram and more',
  keywords: 'video downloader, youtube downloader, tiktok downloader',
  openGraph: {
    title: 'VidFlow',
    description: 'Download videos from anywhere',
    type: 'website',
  },
};
```

### Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "VidFlow",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Web Browser"
}
```

## Performance Optimization

### Static Generation

- Home page: SSG with ISR (revalidate every 60s)
- Platform pages: SSG

### Image Optimization

- Use next/image for thumbnails
- Lazy loading for below-fold images
- WebP format with fallback

### Code Splitting

- Route-based splitting (automatic in Next.js)
- Component lazy loading for heavy components

## Known Limitations

1. **No Authentication**: Currently no user accounts
2. **No Download Storage**: Downloads handled by worker service
3. **Limited Offline Support**: PWA not yet implemented
4. **No Real-time Updates**: Polling for job status
5. **Single Language**: English only
