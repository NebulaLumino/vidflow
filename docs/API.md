# API.md - VidFlow Parser API Documentation

## Overview

The VidFlow Parser API provides endpoints for parsing video URLs and initiating downloads. The API is built with FastAPI and uses yt-dlp for video extraction.

**Base URL:** `http://localhost:8000`

## Authentication

Currently, no authentication is required. This may change in future versions.

## Endpoints

### Health Check

**GET** `/health`

Check if the service is running.

**Response:**
```json
{
  "status": "healthy",
  "service": "parser"
}
```

---

### Root

**GET** `/`

Get service information.

**Response:**
```json
{
  "service": "VidFlow Parser",
  "version": "1.0.0",
  "docs": "/docs"
}
```

---

### Parse Video

**POST** `/api/v1/parse`

Parse a video URL and get metadata.

**Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "video": {
      "id": "dQw4w9WgXcQ",
      "platform": "youtube",
      "title": "Rick Astley - Never Gonna Give You Up",
      "description": "Official music video for...",
      "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      "author": {
        "name": "RickAstleyVEVO",
        "url": "https://www.youtube.com/@RickAstleyVEVO"
      },
      "duration": 213,
      "viewCount": 1400000000,
      "likeCount": 10000000,
      "availableQualities": ["2160p", "1440p", "1080p", "720p", "480p", "360p"],
      "availableFormats": ["mp4", "webm"],
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "PARSE_ERROR",
    "message": "Could not extract video information"
  }
}
```

---

### Download Video

**POST** `/api/v1/download`

Start a video download.

**Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "quality": "1080p",
  "format": "mp4"
}
```

**Parameters:**
- `url` (required): Video URL to download
- `quality` (optional): Desired quality (default: "best")
- `format` (optional): Desired format (default: "mp4")

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Download started",
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
}
```

---

### Get Supported Platforms

**GET** `/api/v1/platforms`

Get list of supported video platforms.

**Response:**
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

## Rate Limiting

Currently, no rate limiting is implemented. This may change in future versions.

## Error Codes

| Code | Description |
|------|-------------|
| PARSE_ERROR | Could not extract video information |
| DOWNLOAD_ERROR | Error during download |
| INVALID_URL | Invalid video URL |
| UNSUPPORTED_PLATFORM | Platform not supported |
| INTERNAL_ERROR | Internal server error |

## SDK Examples

### Python

```python
import requests

BASE_URL = "http://localhost:8000"

# Parse video
response = requests.post(
    f"{BASE_URL}/api/v1/parse",
    json={"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
)
data = response.json()
print(data["data"]["video"]["title"])
```

### JavaScript/TypeScript

```typescript
const BASE_URL = "http://localhost:8000";

// Parse video
const response = await fetch(`${BASE_URL}/api/v1/parse`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }),
});
const data = await response.json();
console.log(data.data.video.title);
```
