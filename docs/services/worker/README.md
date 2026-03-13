# Worker Service

The Worker Service is the background job processing component of VidFlow, built with Node.js/TypeScript. It handles long-running operations like video downloads, format conversions, and notifications using a message queue architecture.

## Purpose

The Worker Service decouples time-consuming operations from the request-response cycle:

- **Video Downloads**: Process download requests in the background
- **Format Conversions**: Convert videos to different formats
- **Notifications**: Send notifications when jobs complete
- **Cleanup**: Periodic cleanup of old downloads and temporary files

## Architecture

The Worker Service uses a queue-based architecture:

```
┌─────────────────────────────────────────────────┐
│              Message Queue (RabbitMQ)          │  - Job queue
├─────────────────────────────────────────────────┤
│                 Job Workers                     │  - Process jobs
├─────────────────────────────────────────────────┤
│              Job Definitions                    │  - Business logic
├─────────────────────────────────────────────────┤
│                  Storage                        │  - Redis, filesystem
└─────────────────────────────────────────────────┘
```

### Project Structure

```
worker/
├── src/
│   ├── index.ts              # Entry point
│   ├── types.ts              # TypeScript interfaces
│   ├── jobs/                 # Job definitions
│   │   ├── videoDownload.ts
│   │   ├── videoConversion.ts
│   │   ├── notification.ts
│   │   └── cleanup.ts
│   ├── queue/                # Queue management
│   │   └── queue.ts
│   ├── workers/              # Worker implementations
│   │   └── worker.ts
│   ├── metrics/              # Prometheus metrics
│   │   └── metrics.ts
│   └── __tests__/            # Tests
├── package.json
├── tsconfig.json
├── jest.config.js
└── Dockerfile
```

### Key Components

**Job Types**

- `VIDEO_DOWNLOAD`: Download video from URL
- `VIDEO_CONVERSION`: Convert video format
- `VIDEO_NOTIFICATION`: Send completion notification
- `CLEANUP`: Clean old files and records

**Job States**

- `PENDING`: Created, waiting to be processed
- `PROCESSING`: Currently being worked on
- `COMPLETED`: Successfully finished
- `FAILED`: Failed with error

**Queue Configuration**

- RabbitMQ for message queue
- Redis for job state persistence
- Multiple concurrent workers

## Data Flow

1. **Job Submission**: Gateway submits job to RabbitMQ queue
2. **Queue Processing**: Worker picks up job from queue
3. **Job Execution**: Execute job-specific logic
4. **State Update**: Update job status in Redis
5. **Result Storage**: Store result in Redis
6. **Completion**: Mark job as completed or failed

## Dependencies

### External Libraries

- **amqplib**: RabbitMQ client
- **ioredis**: Redis client
- **axios**: HTTP client for Parser service
- **prom-client**: Prometheus metrics
- **dotenv**: Environment configuration

### Internal Dependencies

- **Parser Service**: Get video metadata
- **Gateway Service**: Report job status

### Environment Variables

- `RABBITMQ_HOST`: RabbitMQ server host
- `RABBITMQ_PORT`: RabbitMQ server port
- `RABBITMQ_USER`: RabbitMQ username
- `RABBITMQ_PASSWORD`: RabbitMQ password
- `REDIS_HOST`: Redis server host
- `REDIS_PORT`: Redis server port
- `PARSER_URL`: Parser service URL
- `WORKER_PORT`: Worker HTTP server port
- `MAX_RETRIES`: Job max retry attempts
- `CONCURRENCY`: Number of concurrent workers

## Integration Points

### Upstream Producers

- **Gateway Service**: Submits download/conversion jobs

### Downstream Services

- **Parser Service**: Gets video metadata
- **Gateway Service**: Receives job status updates

### Queue Events

- `job:submitted`: New job in queue
- `job:started`: Job processing started
- `job:completed`: Job completed successfully
- `job:failed`: Job failed

## Behavior Examples

### Example 1: Submit Download Job

**Request to Gateway:**

```
POST /api/v1/jobs
{
  "type": "video_download",
  "url": "https://youtube.com/watch?v=...",
  "quality": "1080p",
  "format": "mp4"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "job_id": "job_abc123",
    "status": "pending"
  }
}
```

### Example 2: Job Processing

The worker picks up the job and:

1. Updates status to `processing`
2. Calls Parser service to get video info
3. Downloads video using yt-dlp
4. Stores downloaded file
5. Updates status to `completed`
6. Stores result with file path

### Example 3: Get Job Status

**Request:**

```
GET /api/v1/jobs/job_abc123
```

**Response:**

```json
{
  "success": true,
  "data": {
    "job_id": "job_abc123",
    "type": "video_download",
    "status": "completed",
    "progress": 100,
    "result": {
      "file_path": "/downloads/video_abc.mp4",
      "file_size": 52428800
    },
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:02:00Z"
  }
}
```

### Example 4: Job Failed

If job fails:

```json
{
  "success": true,
  "data": {
    "job_id": "job_abc123",
    "status": "failed",
    "error": "Video unavailable: Age restriction",
    "retries": 3
  }
}
```

## Error Handling

### Retry Logic

- Max retries configurable (default: 3)
- Exponential backoff between retries
- Dead letter queue for permanently failed jobs

### Error Types

- `DOWNLOAD_ERROR`: Failed to download video
- `CONVERSION_ERROR`: Failed to convert video
- `PARSER_ERROR`: Failed to parse video info
- `QUEUE_ERROR`: Failed to interact with queue

### Failure Recovery

- Failed jobs are re-queued automatically
- Manual retry via API endpoint
- Dead letter queue for investigation

## Testing Strategy

### Test Framework

- **Jest**: JavaScript testing framework
- **ts-jest**: TypeScript support

### Test Categories

1. **Unit Tests**: Test individual job handlers
2. **Integration Tests**: Test queue interaction
3. **Worker Tests**: Test worker concurrency

### Test Coverage

- Tests location: `src/__tests__/`
- Run tests: `cd services/worker && npm test`

### Key Test Cases

- Job submission
- Job status transitions
- Retry logic
- Error handling

## Known Limitations

1. **Single Queue**: All job types use same queue (consider priority queues)
2. **No Job Cancellation**: Can't cancel running jobs
3. **Limited Monitoring**: Basic Prometheus metrics
4. **No Job Dependencies**: Jobs can't depend on other jobs
5. **Local Storage**: Downloaded files stored locally (use S3 for distributed)
