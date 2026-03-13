# WeChat Mini Program

The VidFlow WeChat Mini Program provides video downloading functionality within the WeChat ecosystem, targeting mobile users in China and Southeast Asia.

## Purpose

The Mini Program serves:

- **China Market**: Provide video downloading in WeChat
- **Mobile-First**: Optimized for mobile experience
- **Social Integration**: Leverage WeChat sharing
- **Payment Ready**: Support WeChat Pay integration

## Architecture

The Mini Program uses the Taro framework:

```
┌─────────────────────────────────────────────────────────────┐
│                    Taro Framework                           │
│              (React-like API for Mini Programs)            │
├─────────────────────────────────────────────────────────────┤
│                    WeChat Mini Program                     │
├─────────────────────────────────────────────────────────────┤
│                    VidFlow API Services                     │
└─────────────────────────────────────────────────────────────┘
```

### Project Structure

```
apps/mini-program/
├── src/
│   ├── pages/                  # Mini program pages
│   │   ├── index/            # Home page
│   │   ├── download/         # Download page
│   │   ├── history/         # Download history
│   │   └── profile/         # User profile
│   ├── components/           # Reusable components
│   │   ├── VideoCard/
│   │   ├── DownloadButton/
│   │   ├── QualityPicker/
│   │   └── AdBanner/
│   ├── services/            # API services
│   │   ├── api.ts           # Gateway client
│   │   ├── auth.ts         # WeChat auth
│   │   └── storage.ts       # Local storage
│   ├── utils/              # Utilities
│   ├── app.config.ts      # App configuration
│   ├── app.scss           # Global styles
│   └── app.tsx            # App entry
├── project.config.json    # Taro/WeChat config
├── package.json
└── tsconfig.json
```

## Pages

### Home Page (`pages/index`)

Landing page with video search.

```
┌─────────────────────────┐
│  [Search Bar]          │
├─────────────────────────┤
│                         │
│  Recent Searches        │
│  [Tag] [Tag] [Tag]     │
│                         │
│  Featured Videos        │
│  ┌─────┐ ┌─────┐      │
│  │     │ │     │      │
│  └─────┘ └─────┘      │
│                         │
│  [Ad Banner]           │
└─────────────────────────┘
```

### Download Page (`pages/download`)

Video details and download options.

```
┌─────────────────────────┐
│  [Back] Video Details  │
├─────────────────────────┤
│  ┌─────────────────┐   │
│  │                 │   │
│  │  [Thumbnail]   │   │
│  │                 │   │
│  └─────────────────┘   │
│                         │
│  Video Title           │
│  Channel • Views      │
│                         │
│  Quality: [1080p ▼]   │
│  Format:  [MP4 ▼]    │
│                         │
│  [Download Button]    │
│                         │
│  [Ad Banner]           │
└─────────────────────────┘
```

### History Page (`pages/history`)

Download history.

```
┌─────────────────────────┐
│  [Back] History       │
├─────────────────────────┤
│                         │
│  Active Downloads      │
│  ┌─────────────────┐   │
│  │ [Thumb] ████░░  │   │
│  └─────────────────┘   │
│                         │
│  Completed             │
│  ┌─────────────────┐   │
│  │ [Thumb] Title  │   │
│  └─────────────────┘   │
└─────────────────────────┘
```

### Profile Page (`pages/profile`)

User settings and preferences.

```
┌─────────────────────────┐
│  [Back] Profile       │
├─────────────────────────┤
│                         │
│  [Avatar]              │
│  User                  │
│                         │
│  Downloads: 12         │
│                         │
│  Settings              │
│  - Default Quality     │
│  - Auto-download       │
│  - WiFi Only          │
│                         │
│  About                │
└─────────────────────────┘
```

## Integration

### WeChat Auth

```typescript
// services/auth.ts
import { login, getUserProfile } from '@tarojs/taro';

export async function wechatLogin(): Promise<AuthResult> {
  // Step 1: Get code
  const { code } = await login();

  // Step 2: Exchange for session
  const response = await fetch('/api/v1/auth/wechat', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });

  return response.json();
}
```

### Video Parsing

```typescript
// services/api.ts
export async function parseVideo(url: string): Promise<VideoInfo> {
  const response = await request({
    url: '/api/v1/parse',
    method: 'POST',
    data: { url },
  });

  return response.data;
}
```

### Download Management

```typescript
// services/download.ts
export async function startDownload(options: DownloadOptions): Promise<string> {
  const response = await request({
    url: '/api/v1/jobs',
    method: 'POST',
    data: options,
  });

  return response.data.job_id;
}
```

## WeChat Features

### Share

```typescript
import { shareAppMessage } from '@tarojs/taro';

export function onShareAppMessage() {
  return {
    title: 'VidFlow - Download Videos',
    path: '/pages/index/index',
  };
}
```

### Payment (Future)

```typescript
// Future: WeChat Pay integration
async function purchasePremium() {
  const result = await requestPayment({
    timeStamp: '',
    nonceStr: '',
    package: '',
    signType: 'MD5',
    paySign: '',
  });
}
```

## Ad Integration

### WeChat Ad Units

```typescript
// Ad placement in Taro
import { Ad } from '@tarojs/components';

// Banner ad
<Ad
  unitId="adunit-xxx"
  adType="banner"
  onLoad={() => console.log('Ad loaded')}
  onError={(e) => console.error(e)}
/>

// Rewarded video ad
<Ad
  unitId="adunit-xxx"
  adType="rewarded-video"
/>
```

## Configuration

### app.config.ts

```typescript
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/download/download',
    'pages/history/history',
    'pages/profile/profile',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'VidFlow',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#999',
    selectedColor: '#007aff',
    backgroundColor: '#fff',
    list: [
      { pagePath: 'pages/index/index', text: 'Home' },
      { pagePath: 'pages/history/history', text: 'History' },
      { pagePath: 'pages/profile/profile', text: 'Profile' },
    ],
  },
});
```

## Building

### Development

```bash
# Install dependencies
npm install

# Run in WeChat DevTools
npm run dev:weapp
```

### Production Build

```bash
# Build for WeChat
npm run build:weapp
```

## Known Limitations

1. **WeChat Restrictions**: Limited API access compared to native apps
2. **File System**: Cannot access full file system
3. **Background Processing**: No background download support
4. **Payment**: Requires business verification
5. **Distribution**: Must be published through WeChat
