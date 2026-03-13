# WeChat Integration

This document details the WeChat-specific integrations for the VidFlow Mini Program.

## Overview

The VidFlow Mini Program integrates with various WeChat platform features to provide a seamless experience for Chinese users.

## Integration Points

### 1. Authentication

WeChat Mini Program uses OpenID for user identification.

**Flow:**

```
User opens Mini Program
        │
        ▼
WeChat login() API returns code
        │
        ▼
Send code to VidFlow backend
        │
        ▼
Backend exchanges code for OpenID
        │
        ▼
Create/Update user session
```

**Implementation:**

```typescript
import { login } from '@tarojs/taro';

async function authenticate(): Promise<User> {
  // Get login code from WeChat
  const { code } = await login();

  // Send to backend
  const response = await fetch('/api/v1/auth/wechat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  const { access_token, user } = await response.json();

  // Store token
  wx.setStorageSync('access_token', access_token);

  return user;
}
```

### 2. User Profile

Get basic user information with permission.

```typescript
import { getUserProfile } from '@tarojs/taro';

async function getUserInfo(): Promise<UserInfo> {
  const { userInfo } = await getUserProfile({
    desc: 'Used for personalized experience',
  });

  return userInfo;
}
```

### 3. Sharing

Implement WeChat sharing capabilities.

```typescript
// app.tsx
export default function App() {
  // Share to chat
  onShareAppMessage(() => ({
    title: 'VidFlow - Download Videos Free',
    path: '/pages/index/index',
    imageUrl: '/images/share.png'
  }));

  // Share to timeline
  onShareTimeline(() => ({
    title: 'VidFlow - Download Videos Free',
    query: 'from=timeline'
  }));

  return <Component />;
}
```

### 4. Payment (Future)

WeChat Pay integration for premium features.

```typescript
// Future: WeChat Pay
async function initiatePayment(orderId: string): Promise<PaymentResult> {
  const response = await fetch('/api/v1/payment/wechat/create', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId }),
  });

  const { timeStamp, nonceStr, package: pkg, signType, paySign } = await response.json();

  return new Promise((resolve, reject) => {
    (wx as any).requestPayment({
      timeStamp,
      nonceStr,
      package: pkg,
      signType,
      paySign,
      success: resolve,
      fail: reject,
    });
  });
}
```

### 5. Ad Integration

WeChat advertising platform integration.

```typescript
// Using Taro ad component
import { Ad, AdUnitId } from '@tarojs/components';

// Banner ad component
function BannerAd() {
  return (
    <Ad
      unitId="adunit-1234567890abcdef"
      adType="banner"
      onLoad={() => console.log('Banner ad loaded')}
      onError={(err) => console.error('Ad error:', err)}
    />
  );
}

// Rewarded video ad
function RewardedAd({ onReward }) {
  return (
    <Ad
      unitId="adunit-abcdef1234567890"
      adType="rewarded-video"
      onLoad={() => console.log('Video ad loaded')}
      onClose={(res) => {
        if (res.isEnded) {
          onReward();
        }
      }}
    />
  );
}
```

### 6. WeChat Mini Program Store

Link to official store listing.

```json
{
  "navigateToMiniProgram": {
    "appId": "wx1234567890abcdef",
    "path": "pages/index/index"
  }
}
```

### 7. Live Streaming (Future)

WeChat live streaming integration.

```typescript
// Future: Live streaming
async function openLiveStream(roomId: string) {
  await navigateTo({
    url: `plugin://wxlive roomId=${roomId}`,
  });
}
```

## Configuration

### WeChat Mini Program Console

Required configurations:

1. **App ID**: Registered in WeChat Open Platform
2. **App Secret**: Kept secure on backend
3. **White List**: Configure request domains
4. **Ad Units**: Register ad placements

### Request Domains

Configure in WeChat DevTools:

```
https://api.vidflow.app    # API domain
https://img.vidflow.app    # Image CDN
```

### Storage Permissions

```json
{
  "permissions": {
    "scope.writePhotosAlbum": {
      "desc": "Save downloaded videos to album"
    },
    "scope.writeCalendar": {
      "desc": "Schedule download reminders"
    }
  }
}
```

## Best Practices

### Performance

- Minimize API calls
- Use WeChat's caching
- Lazy load heavy components

### User Experience

- Follow WeChat design guidelines
- Support dark mode
- Fast page transitions

### Compliance

- Follow WeChat Mini Program guidelines
- Proper content review
- Privacy policy compliance

## Testing

### WeChat DevTools

```bash
# Run in WeChat DevTools
npm run dev:weapp

# Use wechat-devtools CLI
# /Applications/wechatwebdevtools.app/Contents/MacOS/wechatwebdevtools
```

### Test Accounts

- Use test WeChat accounts
- Configure in WeChat Open Platform
- Test all WeChat APIs

## Monitoring

### WeChat Analytics

```typescript
// Report custom analytics
wx.reportAnalytics('download', {
  platform: 'wechat',
  quality: '1080p',
});
```

### Error Reporting

```typescript
// Track errors
wx.onError((error) => {
  // Send to error tracking service
  reportError(error.message, error.stack);
});
```
