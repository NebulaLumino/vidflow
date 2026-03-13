# Chrome Extension

The VidFlow Chrome Extension provides a seamless video downloading experience directly in the browser. Users can detect and download videos from any supported platform with a single click.

## Purpose

The Chrome Extension serves as a primary acquisition channel:

- **One-Click Download**: Download videos from any supported website
- **Platform Detection**: Automatically detect video pages
- **Quick Access**: Popup interface for fast interactions
- **Background Processing**: Download continues even when popup closes

## Architecture

The extension uses Manifest V3:

```
┌─────────────────────────────────────────────────────────────┐
│                    Extension Popup                          │  - User interface
├─────────────────────────────────────────────────────────────┤
│                    Content Scripts                          │  - Page injection
├─────────────────────────────────────────────────────────────┤
│                    Background Service                      │  - Long-running tasks
├─────────────────────────────────────────────────────────────┤
│                    Storage (chrome.storage)                 │  - Persistent data
└─────────────────────────────────────────────────────────────┘
```

### Project Structure

```
extension/
├── src/
│   ├── background/              # Background service worker
│   │   ├── index.ts            # Entry point
│   │   ├── storage.ts          # Storage utilities
│   │   └── messaging.ts        # Message handling
│   ├── popup/                  # Extension popup
│   │   ├── Popup.tsx           # Main component
│   │   ├── DownloadPanel.tsx  # Download controls
│   │   └── VideoInfo.tsx       # Video metadata
│   ├── content-scripts/        # Content script injection
│   │   ├── inject.ts          # Main injection
│   │   ├── detectors/         # Platform detectors
│   │   │   ├── youtube.ts     # YouTube detection
│   │   │   ├── tiktok.ts      # TikTok detection
│   │   │   └── ...
│   │   └── utils/             # Utilities
│   ├── options/               # Options page
│   │   └── Options.tsx
│   ├── styles/                # Extension styles
│   └── types/                 # TypeScript types
├── icons/                     # Extension icons
├── _locales/                 # i18n
├── manifest.json             # Manifest V3
├── package.json
└── webpack.config.js
```

## Features

### 1. Platform Detection

Automatically detects video pages on supported platforms:

- YouTube
- TikTok
- Instagram
- Twitter/X
- Facebook
- Vimeo
- And more...

### 2. One-Click Download

From any video page:

1. Click extension icon
2. View video info
3. Select quality/format
4. Click download

### 3. Batch Downloads

Queue multiple videos for download:

- Add to queue from multiple tabs
- Process sequentially or parallel
- Track progress in popup

### 4. Download History

- View past downloads
- Re-download previous videos
- Clear history

## User Flow

### Initial Detection

```
User visits YouTube video page
    ↓
Content script detects video
    ↓
Sends message to background
    ↓
Badge shows "1" (video detected)
```

### Download Flow

```
User clicks extension icon
    ↓
Popup opens (shows video info)
    ↓
User selects quality/format
    ↓
User clicks Download
    ↓
Job submitted to Worker Service
    ↓
Download starts in background
    ↓
Notification on completion
```

## API Integration

### Endpoints Used

- `POST /api/v1/parse` - Get video metadata
- `POST /api/v1/jobs` - Submit download job
- `GET /api/v1/jobs/:id` - Get job status

### Example Usage

```typescript
// Parse video from current page
const videoInfo = await chrome.runtime.sendMessage({
  action: 'parseVideo',
  url: window.location.href,
});

// Submit download job
const job = await fetch('/api/v1/jobs', {
  method: 'POST',
  body: JSON.stringify({
    url: videoInfo.url,
    quality: '1080p',
    format: 'mp4',
  }),
});
```

## Manifest Configuration

```json
{
  "manifest_version": 3,
  "name": "VidFlow",
  "version": "1.0.0",
  "permissions": ["storage", "activeTab", "scripting", "notifications"],
  "host_permissions": ["*://*.youtube.com/*", "*://*.tiktok.com/*", "*://*.instagram.com/*"],
  "action": {
    "default_popup": "popup.html",
    "default_icon": "icons/icon-48.png"
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ]
}
```

## Platform Detection

### Detection Strategy

1. **URL Matching**: Check URL patterns
2. **DOM Analysis**: Look for video elements
3. **API Detection**: Check for video APIs

### Example: YouTube Detection

```typescript
// detectors/youtube.ts
export function detectYouTube(): VideoInfo | null {
  // Check URL
  if (!window.location.hostname.includes('youtube.com')) {
    return null;
  }

  // Check for video page
  const path = window.location.pathname;
  if (!path.startsWith('/watch')) {
    return null;
  }

  // Extract video ID
  const videoId = new URLSearchParams(window.location.search).get('v');
  if (!videoId) {
    return null;
  }

  // Get video metadata from page
  const title = document.querySelector('h1')?.textContent;
  const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return {
    platform: 'youtube',
    videoId,
    url: window.location.href,
    title,
    thumbnail,
  };
}
```

## Permissions

### Required Permissions

| Permission      | Purpose                         |
| --------------- | ------------------------------- |
| `storage`       | Store user preferences          |
| `activeTab`     | Access current tab info         |
| `scripting`     | Execute content scripts         |
| `notifications` | Download complete notifications |

### Host Permissions

Required for video detection:

- `*://*.youtube.com/*`
- `*://*.tiktok.com/*`
- `*://*.instagram.com/*`
- `*://*.twitter.com/*`
- `*://*.facebook.com/*`

## Storage

### chrome.storage.local

```typescript
// Store download preferences
await chrome.storage.local.set({
  defaultQuality: '1080p',
  defaultFormat: 'mp4',
  autoDownload: false,
});

// Get preferences
const { defaultQuality } = await chrome.storage.local.get('defaultQuality');
```

### Data Stored

- User preferences
- Download history
- Queue of pending downloads
- Cached video metadata

## Error Handling

### Network Errors

```typescript
try {
  const response = await fetch('/api/v1/parse');
  if (!response.ok) {
    throw new Error('Parse failed');
  }
} catch (error) {
  // Show error in popup
  showError('Failed to parse video. Please try again.');
}
```

### Platform Not Supported

```typescript
if (!isSupportedPlatform(url)) {
  showMessage('Platform not supported');
  // Suggest using web app
}
```

## Testing

### Manual Testing

1. Load unpacked extension
2. Visit supported video page
3. Test detection
4. Test download flow

### Automated Tests

```bash
npm test
npm run test:e2e  # Playwright tests
```

## Publishing

### Chrome Web Store

1. Build production bundle
2. Create ZIP file
3. Upload to Chrome Developer Dashboard
4. Submit for review

### Version Updates

```json
{
  "version": "1.0.1",
  "version_name": "1.0.1 - Bug fixes"
}
```

## Known Limitations

1. **Limited to Chrome**: Only Chrome/Chromium browsers
2. **Manifest V3**: No persistent background workers
3. **CORS**: Some API calls must go through background
4. **Mobile**: No mobile Chrome extension support
