# Gateway Service

The Gateway Service is the API entry point for the VidFlow platform, built with Go and Gin web framework. It provides a unified REST API that routes requests to downstream services (Parser, Worker, Ad Service) and handles cross-cutting concerns like logging, rate limiting, and monitoring.

## Purpose

The Gateway Service serves as the single entry point for all client requests, providing:

- **Unified API Surface**: Clients interact with one endpoint rather than multiple service URLs
- **Request Routing**: Routes requests to appropriate backend services
- **Cross-Cutting Concerns**: Logging, CORS, rate limiting, authentication
- **Load Balancing**: Distributes requests across service instances
- **Monitoring**: Prometheus metrics for observability

## Architecture

The Gateway uses a layered architecture following Go best practices:

```
┌─────────────────────────────────────────────────┐
│                 Router (Gin)                   │  - HTTP routing
├─────────────────────────────────────────────────┤
│              Middleware Stack                   │  - Logging, CORS, Rate Limit, Recovery
├─────────────────────────────────────────────────┤
│                 Handlers                        │  - Request/Response handling
├─────────────────────────────────────────────────┤
│               Services Layer                    │  - Business logic orchestration
├─────────────────────────────────────────────────┤
│           External Services                     │  - Parser, Worker, Ad Service
└─────────────────────────────────────────────────┘
```

### Project Structure

```
gateway/
├── cmd/
│   └── server/
│       └── main.go           # Entry point
├── internal/
│   ├── config/
│   │   └── config.go         # Configuration management
│   ├── handlers/
│   │   ├── handlers.go       # HTTP handlers
│   │   └── handlers_test.go  # Handler tests
│   ├── middleware/
│   │   └── middleware.go     # Custom middleware
│   ├── router/
│   │   └── router.go         # Route definitions
│   └── services/
│       └── ...               # Service clients
├── pkg/
│   └── logger/
│       └── logger.go         # Logging utilities
├── go.mod
├── go.sum
└── Dockerfile
```

### Key Components

**Configuration (internal/config/)**

- Environment-based configuration
- Service URLs (Parser, Worker, Ad Service)
- Server port and host settings

**Middleware (internal/middleware/)**

- Logging: Request/response logging
- CORS: Cross-origin resource sharing
- Rate Limiting: Request throttling
- Recovery: Panic recovery

**Handlers (internal/handlers/)**

- VideoHandler: Parse, list, get, download videos
- JobHandler: Submit and track jobs
- AdHandler: Get ads, track impressions/clicks

**Router (internal/router/)**

- Gin-based router setup
- Route grouping by API version
- Metrics and health endpoints

## Data Flow

1. **Request Reception**: Client sends HTTP request to Gateway
2. **Middleware Processing**: Request passes through middleware stack (CORS, logging, rate limit)
3. **Routing**: Router matches URL to handler
4. **Handler Processing**: Handler validates request, calls downstream services
5. **Response**: Handler formats response, returns to client
6. **Logging**: Request/response logged for debugging

## Dependencies

### External Libraries

- **Gin**: HTTP web framework
- **Gin Prometheus**: Prometheus metrics
- **go-kit/logger**: Structured logging

### Internal Dependencies

- **Parser Service**: Video metadata extraction
- **Worker Service**: Background job processing
- **Ad Service**: Advertisement serving

### Environment Variables

- `PORT`: Server port (default: 8080)
- `PARSER_URL`: Parser service URL
- `WORKER_URL`: Worker service URL
- `AD_SERVICE_URL`: Ad service URL

## Integration Points

### Upstream Consumers

- **Web App**: Next.js frontend
- **Chrome Extension**: Browser extension
- **Mobile Apps**: React Native, WeChat Mini Program

### Downstream Services

- **Parser Service**: Video metadata extraction
- **Worker Service**: Video download/processing jobs
- **Ad Service**: Advertisement serving

### API Routes

| Method | Endpoint                    | Description         |
| ------ | --------------------------- | ------------------- |
| GET    | /health                     | Health check        |
| GET    | /ready                      | Readiness check     |
| GET    | /metrics                    | Prometheus metrics  |
| POST   | /api/v1/parse               | Parse video URL     |
| GET    | /api/v1/videos              | List videos         |
| GET    | /api/v1/videos/:id          | Get video by ID     |
| POST   | /api/v1/videos/:id/download | Start download      |
| GET    | /api/v1/platforms           | Supported platforms |
| POST   | /api/v1/jobs                | Submit job          |
| GET    | /api/v1/jobs/:id            | Get job status      |
| POST   | /api/v1/ads                 | Get ad              |
| POST   | /api/v1/ads/:id/impression  | Track impression    |
| POST   | /api/v1/ads/:id/click       | Track click         |

## Edge Cases and Error Handling

### Service Unavailability

- If downstream service is unavailable, return 503 Service Unavailable
- Implement retry logic with exponential backoff

### Request Validation

- Validate required fields
- Return 400 Bad Request for invalid input
- Return 404 for unknown routes

### Rate Limiting

- Return 429 Too Many Requests when limit exceeded
- Include Retry-After header

### Timeouts

- Set timeouts for all downstream service calls
- Default timeout: 30 seconds

## Behavior Examples

### Example 1: Parse Video

**Request:**

```
POST /api/v1/parse
Content-Type: application/json

{"url": "https://www.youtube.com/watch?v=..."}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "video": { ... }
  }
}
```

### Example 2: Submit Download Job

**Request:**

```
POST /api/v1/jobs
Content-Type: application/json

{
  "type": "download",
  "url": "https://www.youtube.com/watch?v=...",
  "quality": "1080p"
}
```

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

### Example 3: Get Job Status

**Request:**

```
GET /api/v1/jobs/abc123
```

**Response:**

```json
{
  "success": true,
  "data": {
    "job_id": "abc123",
    "status": "completed",
    "result": { ... }
  }
}
```

## Testing Strategy

### Test Framework

- **Go testing**: Built-in testing package
- **Handler Tests**: HTTP handler unit tests

### Test Coverage

- Tests location: `internal/handlers/handlers_test.go`
- Run tests: `cd services/gateway && go test ./...`

### Key Test Cases

- Health check endpoints
- Request validation
- Error handling
- Service proxying

## Known Limitations

1. **No Authentication**: Currently open (add API key/JWT for production)
2. **No Load Balancing**: Single instance (use Kubernetes for scaling)
3. **Limited Caching**: No response caching (add Redis for caching)
4. **Synchronous Processing**: Some operations block (implement async for production)
5. **No API Versioning**: v1 only (add versioning for backward compatibility)
