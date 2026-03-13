# Extension Architecture

This document details the technical architecture of the VidFlow Chrome Extension.

## System Overview

The extension is built using modern web technologies with TypeScript, React, and Webpack. It follows the Manifest V3 specification for Chrome extensions.

## Architecture Layers

```
┌────────────────────────────────────────────────────────────────┐
│                        UI Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │    Popup     │  │    Options   │  │   Content    │        │
│  │  (React)    │  │   (React)    │  │    Script    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
├────────────────────────────────────────────────────────────────┤
│                     Service Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Background  │  │   Message    │  │   Storage    │        │
│  │   Service    │  │   Handler    │  │   Manager    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
├────────────────────────────────────────────────────────────────┤
│                      Data Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  chrome API  │  │   REST API   │  │   Local      │        │
│  │  (Bridge)    │  │   Client     │  │   Storage    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Background Service Worker

The background service handles long-running tasks and coordinates communication between components.

**File:** `src/background/index.ts`

```typescript
// Background service entry point
chrome.runtime.onInstalled.addListener(() => {
  console.log('VidFlow Extension installed');
  initializeStorage();
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((error) => sendResponse({ error: error.message }));
  return true; // Keep message channel open for async response
});
```

**Responsibilities:**

- Coordinate download jobs
- Manage storage
- Handle badge updates
- Process notifications

### 2. Popup Interface

The popup is the main user interface, built with React.

**File:** `src/popup/Popup.tsx`

```typescript
import React from 'react';
import { DownloadPanel } from './DownloadPanel';
import { VideoInfo } from './VideoInfo';

export function Popup() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>('idle');

  // Load video info when popup opens
  useEffect(() => {
    loadCurrentTabVideo();
  }, []);

  return (
    <div className="popup-container">
      {videoInfo ? (
        <>
          <VideoInfo video={videoInfo} />
          <DownloadPanel
            video={videoInfo}
            onDownload={handleDownload}
          />
        </>
      ) : (
        <NoVideoDetected />
      )}
    </div>
  );
}
```

**States:**

- Loading: Fetching video info
- Ready: Video detected, ready to download
- Downloading: Job in progress
- Complete: Download finished
- Error: Something went wrong

### 3. Content Scripts

Content scripts inject into web pages to detect videos.

**File:** `src/content-scripts/inject.ts`

```typescript
// Main injection point
function initialize() {
  // Set up platform detectors
  const detectors = [
    YouTubeDetector,
    TikTokDetector,
    InstagramDetector,
    // ... more detectors
  ];

  // Check each platform
  for (const detector of detectors) {
    const result = detector.detect();
    if (result) {
      notifyBackgroundOfVideo(result);
      return;
    }
  }
}

// Notify background script
function notifyBackgroundOfVideo(videoInfo: VideoInfo) {
  chrome.runtime.sendMessage({
    action: 'videoDetected',
    payload: videoInfo,
  });
}
```

**Platform Detection:**

- URL pattern matching
- DOM element detection
- JavaScript API detection

### 4. Storage Manager

Handles persistent storage using chrome.storage.

**File:** `src/background/storage.ts`

```typescript
export class StorageManager {
  // User preferences
  async getPreferences(): Promise<UserPreferences> {
    const result = await chrome.storage.local.get([
      'defaultQuality',
      'defaultFormat',
      'autoDownload',
    ]);
    return result as UserPreferences;
  }

  async setPreferences(prefs: Partial<UserPreferences>) {
    await chrome.storage.local.set(prefs);
  }

  // Download history
  async addToHistory(entry: HistoryEntry) {
    const history = await this.getHistory();
    history.unshift(entry);
    // Keep only last 100 entries
    await chrome.storage.local.set({
      history: history.slice(0, 100),
    });
  }

  // Download queue
  async addToQueue(job: DownloadJob) {
    const queue = await this.getQueue();
    queue.push(job);
    await chrome.storage.local.set({ queue });
  }
}
```

## Data Flow

### Video Detection Flow

```
┌─────────┐    ┌──────────────┐    ┌─────────────┐
│  Page   │───▶│ Content      │───▶│ Background  │
│  Load   │    │ Script       │    │ Service     │
└─────────┘    └──────────────┘    └─────────────┘
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │   Chrome    │
                                    │   Badge     │
                                    └─────────────┘
```

### Download Flow

```
┌─────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────┐
│ Popup   │───▶│ Background   │───▶│  Gateway    │───▶│ Worker  │
│ Click   │    │ Service      │    │  Service    │    │ Service │
└─────────┘    └──────────────┘    └─────────────┘    └──────────┘
      │                                                  │
      │                                                  ▼
      │                                           ┌──────────┐
      │                                           │  Video   │
      └───────────────── Notification ◀───────────┤ Download │
                                                └──────────┘
```

## State Management

### Extension State

```typescript
interface ExtensionState {
  // Current tab
  currentTab: {
    url: string;
    videoInfo: VideoInfo | null;
    isDetecting: boolean;
  };

  // Download state
  downloads: {
    active: DownloadJob[];
    completed: HistoryEntry[];
    queue: DownloadJob[];
  };

  // User preferences
  preferences: UserPreferences;

  // UI state
  ui: {
    isLoading: boolean;
    error: string | null;
  };
}
```

### State Updates

```typescript
// Use React Context for state management
const AppContext = createContext<AppContextType>(null);

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
```

## Message Protocol

### Message Types

```typescript
// From Popup to Background
type PopupMessage =
  | { action: 'parseVideo'; payload: { url: string } }
  | {Download'; payload: action: 'start DownloadJob }
  | { action: 'getHistory' }
  | { action: 'clearHistory' };

// From Content Script to Background
type ContentMessage =
  | { action: 'videoDetected'; payload: VideoInfo }
  | { action: 'videoRemoved' };

// From Background to Popup
type BackgroundResponse =
  | { success: true; data: any }
  | { success: false; error: string };
```

## Error Handling

### Error Types

```typescript
enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  DOWNLOAD_ERROR = 'DOWNLOAD_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  UNSUPPORTED_PLATFORM = 'UNSUPPORTED_PLATFORM',
}
```

### Error Recovery

```typescript
async function withRetry<T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await delay(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }

  throw lastError;
}
```

## Performance Optimization

### Lazy Loading

```typescript
// Load heavy components lazily
const VideoPreview = React.lazy(() => import('./VideoPreview'));
const QualitySelector = React.lazy(() => import('./QualitySelector'));
```

### Message Debouncing

```typescript
// Debounce video detection messages
const debouncedDetect = debounce(() => {
  const info = detectVideo();
  if (info) {
    chrome.runtime.sendMessage({ action: 'videoDetected', payload: info });
  }
}, 500);
```

### Caching

```typescript
// Cache parsed video info
const videoCache = new Map<string, { data: VideoInfo; timestamp: number }>();

function getCachedVideoInfo(url: string): VideoInfo | null {
  const cached = videoCache.get(url);
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return cached.data;
  }
  return null;
}
```

## Security

### Content Security Policy

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self';"
  }
}
```

### Input Validation

```typescript
// Validate URLs before sending to API
function isValidVideoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return SUPPORTED_HOSTS.includes(parsed.hostname);
  } catch {
    return false;
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
// Test platform detectors
describe('YouTubeDetector', () => {
  it('should detect YouTube video URLs', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const result = YouTubeDetector.detect(url);
    expect(result).not.toBeNull();
  });

  it('should return null for non-YouTube URLs', () => {
    const url = 'https://example.com/video';
    const result = YouTubeDetector.detect(url);
    expect(result).toBeNull();
  });
});
```

### Integration Tests

```typescript
// Test popup-background communication
describe('Popup Integration', () => {
  it('should send parse request to background', async () => {
    const messageSpy = jest.spyOn(chrome.runtime, 'sendMessage');
    await clickParseButton();
    expect(messageSpy).toHaveBeenCalledWith({
      action: 'parseVideo',
      payload: { url: 'https://youtube.com/watch?v=...' },
    });
  });
});
```

## Build Process

### Webpack Configuration

```javascript
// webpack.config.js
module.exports = {
  entry: {
    popup: './src/popup/index.tsx',
    background: './src/background/index.ts',
    content: './src/content-scripts/inject.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  // ... loaders and plugins
};
```

### Build Output

```
dist/
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── content.js
├── styles.css
└── icons/
```
