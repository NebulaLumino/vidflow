# Supported Platforms

This document details the video platforms supported by the VidFlow Parser Service and their specific characteristics.

## Overview

The Parser Service uses yt-dlp as its extraction engine, which supports hundreds of video platforms. VidFlow officially supports and tests against a core set of platforms.

## Officially Supported Platforms

### 1. YouTube

**URL Patterns:**

- `https://www.youtube.com/watch?v=...`
- `https://youtu.be/...`
- `https://www.youtube.com/shorts/...`
- `https://www.youtube.com/live/...`

**Platform ID:** `youtube`

**Features:**

- Full metadata extraction (title, description, duration, view count, likes)
- Multiple quality options (up to 4K/2160p)
- Format selection (MP4, WebM)
- Live stream support
- Shorts detection

**Known Quirks:**

- Age-restricted videos may require authentication
- Private videos require authentication
- Some music videos have limited format options

### 2. TikTok

**URL Patterns:**

- `https://www.tiktok.com/@user/video/...`
- `https://vm.tiktok.com/...`
- `https://m.tiktok.com/v/...`

**Platform ID:** `tiktok`

**Features:**

- Full metadata extraction
- Video download support
- Author information
- Like and view counts (may be estimates)

**Known Quirks:**

- Video URLs expire frequently (redirect URLs)
- Some metadata may be missing for very new videos
- Watermark removal is automatic

### 3. Instagram

**URL Patterns:**

- `https://www.instagram.com/p/...` (Posts)
- `https://www.instagram.com/reel/...` (Reels)
- `https://www.instagram.com/stories/...` (Stories)

**Platform ID:** `instagram`

**Features:**

- Post/Reel metadata extraction
- Author information
- Like counts
- Carousel support (multi-image posts)

**Known Quirks:**

- Requires Instagram account for full access
- Stories have 24-hour expiration
- Private account content requires authentication

### 4. Twitter/X

**URL Patterns:**

- `https://twitter.com/user/status/...`
- `https://x.com/user/status/...`
- `https://vxtwitter.com/...` (redirect support)

**Platform ID:** `twitter`

**Features:**

- Tweet metadata extraction
- Video/GIF extraction
- Author information
- Retweet and like counts

**Known Quirks:**

- Twitter API changes frequently affect extraction
- Video quality may be limited
- Some videos require premium account

### 5. Facebook

**URL Patterns:**

- `https://www.facebook.com/user/videos/...`
- `https://fb.watch/...`
- `https://www.facebook.com/watch/...`

**Platform ID:** `facebook`

**Features:**

- Video metadata extraction
- Author/page information
- View counts
- Reaction counts

**Known Quirks:**

- Private videos require authentication
- Some regional content may be blocked
- Live stream support limited

### 6. Vimeo

**URL Patterns:**

- `https://vimeo.com/...`
- `https://player.vimeo.com/video/...`

**Platform ID:** `vimeo`

**Features:**

- Full HD quality support
- Author information
- Duration and view counts
- Category and tag extraction

**Known Quirks:**

- Pro/private videos require authentication
- Some videos have download restrictions

## Additional Supported Platforms

Beyond the core platforms, yt-dlp supports many additional platforms. While not explicitly tested by VidFlow, they should work:

- **Dailymotion**: `dailymotion.com`
- **Twitch**: `twitch.tv` (clips and VODs)
- **Reddit**: `reddit.com` (video posts)
- **Bilibili**: `bilibili.com` (Chinese platform)
- **Coub**: `coub.com`
- **Dew**: `dew.sh` (formerly Vessel)
- **LinkedIn**: `linkedin.com` (video posts)
- **Pornhub**: `pornhub.com` (adult content)
- **XVideos**: `xvideos.com` (adult content)
- **XNXX**: `xnxx.com` (adult content)

## Platform Detection

Platform detection happens in the `get_platform_from_url()` function in `services/parser/src/main.py`:

```python
def get_platform_from_url(url: str) -> str:
    url_lower = url.lower()
    if "youtube.com" in url_lower or "youtu.be" in url_lower:
        return "youtube"
    elif "tiktok.com" in url_lower:
        return "tiktok"
    elif "instagram.com" in url_lower:
        return "instagram"
    elif "twitter.com" in url_lower or "x.com" in url_lower:
        return "twitter"
    elif "facebook.com" in url_lower or "fb.watch" in url_lower:
        return "facebook"
    elif "vimeo.com" in url_lower:
        return "vimeo"
    return "unknown"
```

## Adding New Platforms

To add support for a new platform:

1. **Update Platform Detection**: Add URL pattern to `get_platform_from_url()`
2. **Update API Endpoint**: Add platform to `/api/v1/platforms` response
3. **Test Extraction**: Verify yt-dlp can extract the video
4. **Update Documentation**: Add platform to this file

See `/docs/guides/adding-platform.md` for detailed instructions.

## Platform Status API

Query the `/api/v1/platforms` endpoint to get current platform support status:

```bash
curl http://localhost:8000/api/v1/platforms
```

Response:

```json
{
  "platforms": [
    { "id": "youtube", "name": "YouTube", "supported": true },
    { "id": "tiktok", "name": "TikTok", "supported": true },
    { "id": "instagram", "name": "Instagram", "supported": true },
    { "id": "twitter", "name": "Twitter/X", "supported": true },
    { "id": "facebook", "name": "Facebook", "supported": true },
    { "id": "vimeo", "name": "Vimeo", "supported": true }
  ]
}
```
