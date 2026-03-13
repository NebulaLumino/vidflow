# Parser Service

The Parser Service is the core backend component of the VidFlow video download platform. It provides a RESTful API for extracting video metadata from various video hosting platforms using the yt-dlp library.

## Purpose

The Parser Service solves the problem of extracting video information from dozens of different video platforms, each with their own unique API and structure. Instead of building custom extractors for each platform, VidFlow leverages yt-dlp's extensive platform support to provide a unified interface for video metadata extraction.

This service is responsible for:

- Receiving video URLs from clients (web app, Chrome extension, mobile apps)
- Identifying the source platform from the URL
- Extracting comprehensive video metadata using yt-dlp
- Caching results to improve performance and reduce API calls
- Returning standardized video information to clients

## Architecture

The Parser Service uses a layered architecture:

```
┌─────────────────┐
│   FastAPI App   │  - HTTP server with lifespan management
├─────────────────┤
│  Route Handlers │  - parse_video, download_video, cache endpoints
├─────────────────┤
│  Business Logic │  - Video info parsing, platform detection
├─────────────────┤
│   yt-dlp Core   │  - Video extraction engine
├─────────────────┤
│   LRU Cache     │  - In-memory cache with TTL
└─────────────────┘
```

### Key Components

**FastAPI Application**

- Title: "VidFlow Parser Service"
- Version: 1.0.0
- CORS middleware enabled for all origins
- Lifespan context manager for startup/shutdown

**LRU Cache**

- Thread-safe implementation using threading.Lock
- Maximum 100 entries by default
- 1-hour TTL (3600 seconds) for each entry
- Uses MD5 hash of URL as cache key

**Platform Detection**

- Automatic platform identification from URL patterns
- Supports: YouTube, TikTok, Instagram, Twitter/X, Facebook, Vimeo

## Data Flow

1. **Request Arrival**: Client sends POST request to `/api/v1/parse` with video URL
2. **URL Validation**: Pydantic validates the URL format using HttpUrl type
3. **Cache Check**: System generates cache key (MD5 of URL) and checks LRU cache
4. **Cache Hit**: If cached result exists and not expired, return immediately
5. **Cache Miss**: Continue to yt-dlp extraction
6. **yt-dlp Extraction**: YoutubeDL extracts video information from platform
7. **Data Transformation**: Parse yt-dlp info dict to VideoMetadata model
8. **Cache Store**: Store result in LRU cache with current timestamp
9. **Response**: Return standardized ApiResponse to client

## Dependencies

### External Libraries

- **FastAPI** (0.100+): Modern Python web framework
- **uvicorn**: ASGI server for running FastAPI
- **yt-dlp**: Video extraction library (core dependency)
- **pydantic**: Data validation and settings management
- **python-multipart**: Multipart form data support

### Internal Dependencies

- **src.shared**: Shared type definitions (VideoMetadata, VideoQuality, VideoFormat, etc.)

### Environment Variables

- `DOWNLOAD_DIR`: Directory for video downloads (default: "/app/downloads")

## Integration Points

### Upstream Consumers

- **Web App** (`/apps/web/`): Next.js application that calls parser API
- **Chrome Extension** (`/extensions/chrome/`): Browser extension for video detection
- **React Native Module** (`/packages/react-native/`): Mobile app integration
- **WeChat Mini Program** (`/packages/react-native/`): Chinese platform integration

### API Contract

```
POST /api/v1/parse
Request: { "url": "https://youtube.com/watch?v=..." }
Response: { "success": true, "data": { "video": { ...VideoMetadata } } }

GET /api/v1/platforms
Response: { "platforms": [{ "id": "youtube", "name": "YouTube", "supported": true }] }

GET /api/v1/cache/stats
Response: { "size": 10, "maxsize": 100, "ttl": 3600 }
```

## Edge Cases and Error Handling

### Invalid URLs

- Returns HTTP 422 (Validation Error) for malformed URLs
- Returns HTTP 400 for URLs that don't match any supported platform

### Platform Extraction Failures

- **yt_dlp.utils.DownloadError**: Returns HTTP 400 with "Download error" message
- **yt_dlp.utils.ExtractorError**: Returns HTTP 400 with "Extractor error" message
- Generic exceptions return HTTP 500 with "Internal server error"

### Cache Failures

- Cache misses are handled gracefully - extraction proceeds normally
- Cache full: LRU eviction removes oldest entry automatically

### Timeout Handling

- yt-dlp has built-in timeout (default network timeout)
- Long-running extractions may take 30+ seconds for some platforms

## Behavior Examples

### Example 1: Parse YouTube Video

**Input**: `POST /api/v1/parse` with `{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}`

**Output**:

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
      "author": { "name": "RickAstleyVEVO", "url": "..." },
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

### Example 2: Cache Hit

**Input**: Same request as Example 1 (within TTL)

**Output**: Same as Example 1, but returned from cache (cache size remains same)

### Example 3: Unsupported Platform

**Input**: `POST /api/v1/parse` with `{"url": "https://example.com/video/123"}`

**Output**: Returns video metadata if yt-dlp can extract, or error if extraction fails

### Example 4: Get Cache Stats

**Input**: `GET /api/v1/cache/stats`

**Output**: `{"size": 5, "maxsize": 100, "ttl": 3600}`

## Testing Strategy

### Test Framework

- **pytest**: Python testing framework
- **pytest-cov**: Coverage measurement

### Test Categories

1. **Unit Tests** (`tests/test_parser.py`): Test individual functions and handlers
2. **Integration Tests**: Test full request/response cycle
3. **Mock Tests**: Mock yt-dlp to avoid network calls

### Test Coverage

- Current coverage: 90.28%
- Tests location: `services/parser/tests/`
- Run tests: `cd services/parser && pytest`

### Key Test Cases

- URL validation
- Platform detection accuracy
- Cache hit/miss scenarios
- Error handling for various failure modes
- Video metadata parsing

## Known Limitations

1. **In-Memory Cache**: Cache is not shared across instances (use Redis for multi-instance deployments)
2. **No Authentication**: Currently open to all clients (add API key auth for production)
3. **Blocking yt-dlp**: Extraction blocks the event loop (consider running in separate process)
4. **Rate Limiting**: No rate limiting on endpoints (add middleware for production)
5. **Limited Platform Control**: Relies on yt-dlp for platform support (some platforms may have limited extractors)
6. **No Download Queue**: Direct download endpoint doesn't scale (use Worker Service for production)
