# Gateway API Routes

This document details all API routes provided by the VidFlow Gateway Service.

## Base URL

```
Development: http://localhost:8080
Production:  https://api.vidflow.app
```

## Endpoints

### Health & Monitoring

#### GET /health

Health check endpoint for load balancers and orchestrators.

**Response:**

```json
{
  "status": "healthy"
}
```

#### GET /ready

Readiness check endpoint - returns 200 when service is ready to accept traffic.

**Response:**

```json
{
  "status": "ready"
}
```

#### GET /metrics

Prometheus metrics endpoint.

**Response:**
Prometheus format metrics including:

- HTTP request duration
- Request count by status
- Custom application metrics

---

### Video API

#### POST /api/v1/parse

Parse a video URL and extract metadata.

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
      "view_count": 1500000000,
      "like_count": 10000000,
      "available_qualities": ["2160p", "1440p", "1080p", "720p", "480p", "360p"],
      "available_formats": ["mp4", "webm"],
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    }
  }
}
```

#### GET /api/v1/videos

List all videos (from database).

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| limit | int | Max results (default: 20) |
| offset | int | Pagination offset |

**Response:**

```json
{
  "success": true,
  "data": {
    "videos": [...],
    "total": 100
  }
}
```

#### GET /api/v1/videos/:id

Get a specific video by ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "video": { ... }
  }
}
```

#### POST /api/v1/videos/:id/download

Start a video download job.

**Response:**

```json
{
  "success": true,
  "data": {
    "job_id": "abc123",
    "status": "pending"
  }
}
```

---

### Platform API

#### GET /api/v1/platforms

Get list of supported video platforms.

**Response:**

```json
{
  "success": true,
  "data": {
    "platforms": [
      { "id": "youtube", "name": "YouTube", "supported": true },
      { "id": "tiktok", "name": "TikTok", "supported": true },
      { "id": "instagram", "name": "Instagram", "supported": true },
      { "id": "twitter", "name": "Twitter/X", "supported": true },
      { "id": "facebook", "name": "Facebook", "supported": true },
      { "id": "vimeo", "name": "Vimeo", "supported": true }
    ]
  }
}
```

---

### Job API

#### POST /api/v1/jobs

Submit a new background job.

**Request:**

```json
{
  "type": "download",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "quality": "1080p",
  "format": "mp4"
}
```

**Job Types:**

- `download`: Download video
- `convert`: Convert video format
- `notification`: Send notification

**Response:**

```json
{
  "success": true,
  "data": {
    "job_id": "abc123",
    "type": "download",
    "status": "pending",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

#### GET /api/v1/jobs/:id

Get job status by ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "job_id": "abc123",
    "type": "download",
    "status": "completed",
    "progress": 100,
    "result": {
      "file_path": "/downloads/video.mp4"
    },
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:01:00Z"
  }
}
```

**Job Status Values:**

- `pending`: Job created, waiting to be processed
- `processing`: Job is being worked on
- `completed`: Job finished successfully
- `failed`: Job failed with error

---

### Ad API

#### POST /api/v1/ads

Request an advertisement.

**Request:**

```json
{
  "placement": "banner",
  "user_id": "user123",
  "context": "video_page"
}
```

**Ad Placements:**

- `banner`: Top/bottom banner ad
- `sidebar`: Sidebar advertisement
- `interstitial`: Full-screen interstitial
- `video_preroll`: Video pre-roll ad
- `video_midroll`: Video mid-roll ad

**Response:**

```json
{
  "success": true,
  "data": {
    "ad": {
      "id": "ad_123",
      "type": "banner",
      "title": "Sample Ad",
      "description": "Click here!",
      "image_url": "https://example.com/ad.jpg",
      "click_url": "https://example.com/click",
      "impression_url": "https://example.com/impression"
    }
  }
}
```

#### POST /api/v1/ads/:ad_id/impression

Track ad impression.

**Response:**

```json
{
  "success": true,
  "data": {
    "impression_id": "imp_123"
  }
}
```

#### POST /api/v1/ads/:ad_id/click

Track ad click.

**Response:**

```json
{
  "success": true,
  "data": {
    "click_id": "clk_123",
    "redirect_url": "https://example.com/landing"
  }
}
```

---

### Proxy Endpoints

#### GET /parser/metrics

Proxy Prometheus metrics from Parser service.

**Response:**
Prometheus metrics from parser service.

---

## Error Responses

All endpoints may return error responses:

### 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body"
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key"
  }
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 429 Too Many Requests

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded",
    "retry_after": 60
  }
}
```

### 503 Service Unavailable

```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Downstream service unavailable"
  }
}
```

## Rate Limits

| Endpoint           | Limit      |
| ------------------ | ---------- |
| POST /api/v1/parse | 100/minute |
| POST /api/v1/jobs  | 50/minute  |
| GET /api/v1/\*     | 200/minute |

Rate limits are per API key. Without API key, use client IP.
