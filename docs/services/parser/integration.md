# Parser Service Integration Guide

This guide explains how to integrate with the VidFlow Parser Service.

## API Endpoints

### Base URL

```
Development: http://localhost:8000
Production:  https://api.vidflow.app (TBD)
```

### Endpoints

#### 1. Parse Video

Extract video metadata from a URL.

**Endpoint:** `POST /api/v1/parse`

**Request:**

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
      "description": "Official music video...",
      "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      "author": {
        "name": "RickAstleyVEVO",
        "url": "https://www.youtube.com/channel/UCuAXFkgsw1L7xaCfnd5JJOw"
      },
      "duration": 213,
      "upload_date": "20091021",
      "view_count": 1500000000,
      "like_count": 10000000,
      "available_qualities": ["2160p", "1440p", "1080p", "720p", "480p", "360p"],
      "available_formats": ["mp4", "webm"],
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    }
  }
}
```

#### 2. Download Video

Start a video download (returns immediately, download runs in background).

**Endpoint:** `POST /api/v1/download`

**Request:**

```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "quality": "1080p",
  "format": "mp4"
}
```

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

#### 3. Get Supported Platforms

List all supported video platforms.

**Endpoint:** `GET /api/v1/platforms`

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

#### 4. Cache Statistics

Get cache performance metrics.

**Endpoint:** `GET /api/v1/cache/stats`

**Response:**

```json
{
  "size": 5,
  "maxsize": 100,
  "ttl": 3600
}
```

#### 5. Clear Cache

Clear all cached entries.

**Endpoint:** `POST /api/v1/cache/clear`

**Response:**

```json
{
  "message": "Cache cleared successfully"
}
```

#### 6. Health Check

Check service health.

**Endpoint:** `GET /health`

**Response:**

```json
{
  "status": "healthy",
  "service": "parser"
}
```

## Client SDK Usage

### JavaScript/TypeScript

```typescript
import { VidFlowClient } from '@vidflow/sdk';

const client = new VidFlowClient({
  baseUrl: 'http://localhost:8000',
});

async function parseVideo() {
  const result = await client.parseVideo('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

  if (result.success) {
    console.log('Video title:', result.data.video.title);
    console.log('Duration:', result.data.video.duration);
    console.log('Available qualities:', result.data.video.available_qualities);
  }
}
```

### Python

```python
import requests

def parse_video(url: str) -> dict:
    response = requests.post(
        'http://localhost:8000/api/v1/parse',
        json={'url': url}
    )
    return response.json()

result = parse_video('https://www.youtube.com/watch?v=dQw4w9WgXcQ')

if result['success']:
    video = result['data']['video']
    print(f"Title: {video['title']}")
    print(f"Duration: {video['duration']} seconds")
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "PARSE_ERROR",
    "message": "Could not extract video information"
  }
}
```

### Common Error Codes

| Code             | Description             | HTTP Status |
| ---------------- | ----------------------- | ----------- |
| VALIDATION_ERROR | Invalid URL format      | 422         |
| EXTRACTION_ERROR | Could not extract video | 400         |
| DOWNLOAD_ERROR   | Download failed         | 400         |
| INTERNAL_ERROR   | Server error            | 500         |

## Rate Limiting

Currently, no rate limiting is enforced. For production deployment, implement:

- API key authentication
- Per-client rate limits
- Request throttling

## Caching Strategy

The Parser Service includes an LRU cache to improve performance:

- **Cache Size:** 100 entries
- **TTL:** 1 hour (3600 seconds)
- **Key:** MD5 hash of video URL

For production, consider using Redis for distributed caching:

- Share cache across multiple instances
- Persist cache across restarts
- Configure TTL based on platform (some videos change more frequently)

## Authentication

Currently, the Parser Service is open. For production:

1. **API Keys**: Add `X-API-Key` header to requests
2. **OAuth 2.0**: Implement OAuth for user authentication
3. **JWT Tokens**: Use JWT for session-based auth

## Webhooks

For async operations (like downloads), consider adding webhook support:

1. Client registers webhook URL
2. Server sends POST when operation completes
3. Client processes webhook payload

## Testing

Use the `/health` endpoint for health checks:

```bash
curl http://localhost:8000/health
```

Response time should be < 100ms for healthy service.

## Deployment

### Docker

```bash
docker build -t vidflow/parser services/parser/
docker run -p 8000:8000 vidflow/parser
```

### Docker Compose

```bash
cd services/parser
docker-compose up -d
```

### Environment Variables

| Variable     | Default        | Description              |
| ------------ | -------------- | ------------------------ |
| DOWNLOAD_DIR | /app/downloads | Video download directory |
| CACHE_SIZE   | 100            | LRU cache max size       |
| CACHE_TTL    | 3600           | Cache TTL in seconds     |
| PORT         | 8000           | Server port              |
| HOST         | 0.0.0.0        | Server host              |
