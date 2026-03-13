# React Native Module

The VidFlow React Native module provides native video downloading capabilities for mobile applications. It allows developers to integrate VidFlow's video downloading functionality directly into React Native apps.

## Purpose

The React Native module enables:

- **Native Integration**: Download videos directly from mobile apps
- **Cross-Platform**: Support for both iOS and Android
- **Performance**: Native download speeds and reliability
- **Offline Access**: Save videos for offline viewing

## Architecture

The module uses a native bridge architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native JavaScript                  │
├─────────────────────────────────────────────────────────────┤
│                    Native Module Bridge                     │
├─────────────────────────────────────────────────────────────┤
│                    Native Code (Java/Kotlin/Swift)         │
├─────────────────────────────────────────────────────────────┤
│                    Platform APIs                            │
└─────────────────────────────────────────────────────────────┘
```

### Project Structure

```
packages/react-native/
├── src/
│   ├── index.ts              # Main module exports
│   └── types.ts             # TypeScript type definitions
├── android/                 # Android native code
│   ├── src/
│   │   └── main/
│   │       └── java/
│   │           └── com/
│   │               └── vidflow/
│   │                   └── VideoDownloaderModule.kt
│   └── build.gradle
├── ios/                     # iOS native code
│   ├── VidFlow/
│   │   ├── VideoDownloaderModule.swift
│   │   └── VidFlow.podspec
│   └── Podfile
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Installation

### Prerequisites

- React Native 0.71+
- Node.js 18+
- CocoaPods (iOS)
- Gradle (Android)

### npm Installation

```bash
npm install @vidflow/react-native
```

### iOS Setup

```bash
cd ios
pod install
```

### Android Setup

No additional setup required - Gradle handles dependencies.

## Usage

### Basic Download

```typescript
import { VidFlow } from '@vidflow/react-native';

// Parse video URL
const videoInfo = await VidFlow.parseVideo('https://youtube.com/watch?v=example');

// Start download
const jobId = await VidFlow.download({
  url: videoInfo.url,
  quality: '1080p',
  format: 'mp4',
});

// Check progress
VidFlow.onProgress((progress) => {
  console.log(`Downloaded: ${progress.percent}%`);
});
```

### Configuration

```typescript
// Configure the module
VidFlow.configure({
  // Default download directory
  downloadPath: '/storage/emulated/0/VidFlow',

  // Maximum concurrent downloads
  maxConcurrent: 3,

  // Download quality preference
  defaultQuality: '1080p',

  // Auto-start queued downloads
  autoStart: true,

  // Enable WiFi-only downloads
  wifiOnly: false,
});
```

### Events

```typescript
import { VidFlow, DownloadEvent } from '@vidflow/react-native';

// Listen to download events
VidFlow.addListener(DownloadEvent.Progress, (data) => {
  console.log(`Job ${data.jobId}: ${data.percent}%`);
});

VidFlow.addListener(DownloadEvent.Completed, (data) => {
  console.log(`Downloaded to: ${data.filePath}`);
});

VidFlow.addListener(DownloadEvent.Error, (data) => {
  console.error(`Error: ${data.message}`);
});
```

## API Reference

### Methods

#### `parseVideo(url: string): Promise<VideoInfo>`

Parse a video URL to get metadata.

**Parameters:**

- `url` (string): Video URL to parse

**Returns:** `Promise<VideoInfo>`

**Example:**

```typescript
const info = await VidFlow.parseVideo('https://youtube.com/watch?v=xyz');
console.log(info.title); // "Video Title"
console.log(info.duration); // 180
console.log(info.thumbnail); // "https://..."
```

#### `download(options: DownloadOptions): Promise<string>`

Start a video download.

**Parameters:**

- `options` (DownloadOptions): Download configuration

**Returns:** `Promise<string>` - Job ID

**Example:**

```typescript
const jobId = await VidFlow.download({
  url: 'https://youtube.com/watch?v=xyz',
  quality: '1080p',
  format: 'mp4',
  title: 'Custom Title', // Optional
});
```

#### `getJobStatus(jobId: string): Promise<JobStatus>`

Get the status of a download job.

**Parameters:**

- `jobId` (string): Job ID from download()

**Returns:** `Promise<JobStatus>`

#### `cancelJob(jobId: string): Promise<void>`

Cancel a running download.

**Parameters:**

- `jobId` (string): Job ID to cancel

#### `getDownloads(): Promise<Download[]>`

Get list of all downloads.

**Returns:** `Promise<Download[]>`

#### `deleteDownload(jobId: string): Promise<void>`

Delete a downloaded file.

**Parameters:**

- `jobId` (string): Job ID to delete

### Types

```typescript
// Video metadata
interface VideoInfo {
  id: string;
  platform: string;
  title: string;
  description?: string;
  thumbnail: string;
  duration: number; // seconds
  channel: string;
  viewCount?: number;
  uploadDate?: string;
  availableQualities: Quality[];
  availableFormats: Format[];
}

// Download options
interface DownloadOptions {
  url: string;
  quality?: Quality;
  format?: Format;
  title?: string;
  startNow?: boolean; // Add to queue if false
}

// Quality options
type Quality = '144p' | '240p' | '360p' | '480p' | '720p' | '1080p' | '1440p' | '4k';

// Format options
type Format = 'mp4' | 'webm' | 'audio';

// Job status
interface JobStatus {
  id: string;
  status: 'queued' | 'downloading' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  downloadedBytes: number;
  totalBytes: number;
  speed: number; // bytes per second
  filePath?: string;
  error?: string;
}

// Download event data
interface DownloadEventData {
  jobId: string;
  percent: number;
  downloadedBytes: number;
  totalBytes: number;
  speed: number;
  filePath?: string;
  error?: string;
}
```

### Events

```typescript
enum DownloadEvent {
  Progress = 'onProgress',
  Completed = 'onCompleted',
  Error = 'onError',
  QueueUpdated = 'onQueueUpdated',
  Paused = 'onPaused',
  Resumed = 'onResumed',
}
```

## Platform-Specific Implementation

### iOS (Swift)

```swift
// VideoDownloaderModule.swift
@objc(VideoDownloaderModule)
class VideoDownloaderModule: NSObject {

  @objc
  func download(_ url: String, quality: String, format: String,
                resolver resolve: @escaping RCTPromiseResolveBlock,
                rejecter reject: @escaping RCTPromiseRejectBlock) {

    // Native download implementation
    let downloader = NativeDownloader()
    downloader.start(url: url, quality: quality, format: format) { result in
      resolve(result)
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
```

### Android (Kotlin)

```kotlin
// VideoDownloaderModule.kt
class VideoDownloaderModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "VidFlow"

    @ReactMethod
    fun download(url: String, quality: String, format: String,
                 promise: Promise) {
        // Native download implementation
        val downloader = NativeDownloader(reactContext)
        downloader.start(url, quality, format) { result ->
            promise.resolve(result)
        }
    }
}
```

## Error Handling

```typescript
try {
  const jobId = await VidFlow.download({ url, quality, format });
} catch (error) {
  switch (error.code) {
    case 'NETWORK_ERROR':
      // Handle network issues
      break;
    case 'PLATFORM_UNSUPPORTED':
      // Platform not supported
      break;
    case 'STORAGE_ERROR':
      // Storage permission or space issue
      break;
    case 'DOWNLOAD_FAILED':
      // General download failure
      break;
  }
}
```

## Permissions

### iOS

Add to Info.plist:

```xml
<key>NSPhotoLibraryAddUsageDescription</key>
<string>VidFlow needs access to save videos</string>
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

### Android

Add to AndroidManifest.xml:

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
```

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
# iOS
cd ios && xcodebuild test

# Android
cd android && ./gradlew test
```

## Known Limitations

1. **Platform Support**: Requires native module support
2. **Background Downloads**: Limited background download support
3. **Large Files**: Memory constraints on very large files
4. **DRM Content**: Cannot download DRM-protected content
5. **Network Changes**: May not handle network transitions gracefully
