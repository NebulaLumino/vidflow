# Extension Popup Flow

This document details the user interaction flow within the VidFlow Chrome Extension popup.

## Popup Overview

The popup is the primary user interface for the extension. It provides quick access to video detection, metadata display, and download initiation.

## Popup States

### State Diagram

```
┌─────────┐
│  Idle   │  ←── Initial state
└────┬────┘
     │ Open popup on video page
     ▼
┌─────────────┐
│ Detecting   │  ←── Scanning page for video
└──────┬──────┘
       │ Video found / not found
       ▼                ▼
┌─────────────┐   ┌─────────────┐
│   Ready     │   │ Not Found   │
└──────┬──────┘   └──────┬──────┘
       │                 │
       │ User clicks     │ User pastes URL
       │ Download       │
       ▼                ▼
┌─────────────┐   ┌─────────────┐
│ Downloading │   │   Parsing   │
└──────┬──────┘   └──────┬──────┘
       │                 │
       │ Complete        │ Video found
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│  Complete   │   │   Ready     │
└─────────────┘   └─────────────┘
```

## Screen Specifications

### 1. Loading Screen

Display while detecting video on current page.

**Duration:** 200-500ms

**Content:**

```
┌────────────────────────────┐
│  ○○○  Detecting video...  │
│                            │
│   [VidFlow Icon]           │
│                            │
│  Looking for video on     │
│  this page...             │
└────────────────────────────┘
```

**Animation:**

- Spinning loader or pulsing dots
- Brand logo displayed

### 2. Video Detected Screen

Video successfully detected - display metadata.

**Content:**

```
┌────────────────────────────┐
│  ✓ Video detected         │
│                            │
│  ┌──────────────────────┐  │
│  │  [Thumbnail Image]  │  │
│  └──────────────────────┘  │
│                            │
│  Video Title              │
│  Channel Name • 1.2M views │
│  Duration: 3:45           │
│                            │
│  Quality: [1080p ▼]       │
│  Format:  [MP4   ▼]       │
│                            │
│  [Download Video]         │
│  [Add to Queue]           │
│                            │
│  [Options]                 │
└────────────────────────────┘
```

**Components:**

- Thumbnail (max 280px wide)
- Title (max 2 lines, ellipsis)
- Channel name
- View count
- Duration
- Quality dropdown
- Format dropdown
- Primary download button
- Secondary queue button

### 3. No Video Found Screen

No video detected on current page.

**Content:**

```
┌────────────────────────────┐
│  ✕ No video found          │
│                            │
│  ┌──────────────────────┐  │
│  │  [Paste URL here]  │  │
│  │  [    Search    ]   │  │
│  └──────────────────────┘  │
│                            │
│  No video detected on     │
│  this page.               │
│                            │
│  Paste a video URL above  │
│  or visit a video page.   │
│                            │
│  [Open VidFlow Web]       │
└────────────────────────────┘
```

**Components:**

- URL input field
- Search button
- Open web app button

### 4. Downloading Screen

Download in progress.

**Content:**

```
┌────────────────────────────┐
│  Downloading...            │
│                            │
│  ┌──────────────────────┐  │
│  │  ████████░░░░  60%  │  │
│  └──────────────────────┘  │
│                            │
│  Video Title              │
│  Quality: 1080p           │
│  Size: 45.2 MB            │
│  Speed: 2.5 MB/s          │
│                            │
│  [Cancel Download]        │
└────────────────────────────┘
```

**Components:**

- Progress bar with percentage
- Current video title
- Quality info
- File size
- Download speed
- Cancel button

### 5. Complete Screen

Download finished successfully.

**Content:**

```
┌────────────────────────────┐
│  ✓ Download complete!      │
│                            │
│  ┌──────────────────────┐  │
│  │  [Thumbnail]        │  │
│  └──────────────────────┘  │
│                            │
│  Video Title              │
│  Saved to: ~/Downloads     │
│                            │
│  [Open File]               │
│  [Open Folder]             │
│                            │
│  [Download Another]        │
└────────────────────────────┘
```

**Components:**

- Success icon
- Thumbnail
- Video title
- Save location
- Open file button
- Open folder button
- Download another button

### 6. Error Screen

Something went wrong.

**Content:**

```
┌────────────────────────────┐
│  ✕ Error                  │
│                            │
│  ┌──────────────────────┐  │
│  │  [Error Icon]       │  │
│  └──────────────────────┘  │
│                            │
│  Failed to download video │
│                            │
│  Error: Server unavailable │
│                            │
│  [Try Again]               │
│  [Contact Support]         │
└────────────────────────────┘
```

**Components:**

- Error icon
- Error message
- Error details (if available)
- Retry button
- Support link

## User Interactions

### Detecting Video

1. User visits a video page (e.g., YouTube)
2. User clicks extension icon
3. Popup opens
4. Content script detects video
5. Popup displays video info

### Manual URL Search

1. User opens popup on non-video page
2. User pastes URL into input
3. User clicks Search
4. Extension calls parse API
5. Displays video info or error

### Starting Download

1. User selects quality (optional)
2. User selects format (optional)
3. User clicks "Download"
4. Extension submits job to worker
5. Progress updates shown
6. Completion notification

### Queue Management

1. User clicks "Add to Queue"
2. Job added to download queue
3. Downloads processed in order
4. Notification on each completion

## Data Handling

### Video Metadata

```typescript
interface VideoMetadata {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  channel: {
    name: string;
    url: string;
  };
  duration: number; // seconds
  viewCount: number;
  uploadDate?: string;
  availableQualities: Quality[];
  availableFormats: Format[];
}
```

### Download Options

```typescript
interface DownloadOptions {
  quality: '144p' | '240p' | '360p' | '480p' | '720p' | '1080p' | '1440p' | '4k';
  format: 'mp4' | 'webm' | 'audio';
  audioOnly?: boolean;
}
```

### Job Status

```typescript
interface JobStatus {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  downloadUrl?: string;
  error?: string;
}
```

## Quality Selection

### Available Options

| Quality | Resolution | Typical Size (1 min) |
| ------- | ---------- | -------------------- |
| 144p    | 256x144    | ~5 MB                |
| 240p    | 426x240    | ~10 MB               |
| 360p    | 640x360    | ~20 MB               |
| 480p    | 854x480    | ~40 MB               |
| 720p    | 1280x720   | ~80 MB               |
| 1080p   | 1920x1080  | ~150 MB              |
| 1440p   | 2560x1440  | ~300 MB              |
| 4K      | 3840x2160  | ~600 MB              |

### Format Options

| Format | Use Case                  |
| ------ | ------------------------- |
| MP4    | Universal compatibility   |
| WebM   | Better quality/size ratio |
| MP3    | Audio only                |
| M4A    | Audio only (AAC)          |

## Notification Behavior

### Download Complete

```typescript
// Send notification when download completes
chrome.notifications.create({
  type: 'basic',
  iconUrl: 'icons/icon-128.png',
  title: 'Download Complete',
  message: 'Video saved to ~/Downloads',
});
```

### Download Failed

```typescript
chrome.notifications.create({
  type: 'basic',
  iconUrl: 'icons/icon-128.png',
  title: 'Download Failed',
  message: 'Failed to download video. Tap to retry.',
});
```

## Keyboard Shortcuts

| Shortcut | Action                      |
| -------- | --------------------------- |
| Enter    | Submit URL / Start download |
| Escape   | Close popup                 |
| Q        | Toggle quality menu         |
| D        | Start download              |

## Responsive Behavior

### Mobile Restrictions

Chrome extension popups have fixed maximum dimensions:

- Width: 400px max
- Height: 600px max
- No responsive breakpoints needed

### Theme Support

Follow system dark/light mode:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a1a;
    --text-primary: #ffffff;
  }
}

@media (prefers-color-scheme: light) {
  :root {
    --bg-primary: #ffffff;
    --text-primary: #000000;
  }
}
```

## Error Recovery

### Network Errors

- Show retry button
- Cache last successful response
- Allow offline queue

### Parse Errors

- Provide "Try Manual URL" option
- Link to web app

### Download Errors

- Show error type
- Provide retry option
- Log error for debugging
