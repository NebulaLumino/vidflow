# Worker Jobs

This document details all job types processed by the VidFlow Worker Service.

## Job Types

### 1. VIDEO_DOWNLOAD

Download a video from a URL.

**Payload:**

```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "quality": "1080p",
  "format": "mp4",
  "callback_url": "https://api.vidflow.app/webhook/job_complete"
}
```

**Parameters:**
| Field | Required | Type | Description |
|-------|----------|------|-------------|
| url | Yes | string | Video URL to download |
| quality | No | string | Desired quality (default: best) |
| format | No | string | Desired format (default: mp4) |
| callback_url | No | string | Webhook URL for completion |

**Result:**

```json
{
  "file_path": "/downloads/Rick Astley - Never Gonna Give You Up-dQw4w9WgXcQ.mp4",
  "file_size": 52428800,
  "duration": 213,
  "quality": "1080p",
  "format": "mp4"
}
```

**Processing Steps:**

1. Call Parser service to get video metadata
2. Download video using yt-dlp
3. Apply quality/format options
4. Store file in downloads directory
5. Update job status to completed

### 2. VIDEO_CONVERSION

Convert a downloaded video to a different format.

**Payload:**

```json
{
  "input_path": "/downloads/video.mp4",
  "output_format": "webm",
  "output_quality": "high",
  "codec": "vp9"
}
```

**Parameters:**
| Field | Required | Type | Description |
|-------|----------|------|-------------|
| input_path | Yes | string | Path to source video |
| output_format | Yes | string | Target format (mp4, webm, avi, mkv) |
| output_quality | No | string | Quality preset (low, medium, high) |
| codec | No | string | Video codec (h264, vp9, av1) |

**Result:**

```json
{
  "input_path": "/downloads/video.mp4",
  "output_path": "/downloads/video_converted.webm",
  "input_size": 52428800,
  "output_size": 31457280,
  "format": "webm"
}
```

**Processing Steps:**

1. Validate input file exists
2. Determine output path
3. Convert using ffmpeg
4. Verify output file
5. Update job status

### 3. VIDEO_NOTIFICATION

Send a notification when a video is ready.

**Payload:**

```json
{
  "type": "email",
  "recipient": "user@example.com",
  "subject": "Your video is ready!",
  "body": "Your video has been downloaded successfully.",
  "video_title": "My Video",
  "video_url": "https://vidflow.app/download/abc123"
}
```

**Parameters:**
| Field | Required | Type | Description |
|-------|----------|------|-------------|
| type | Yes | string | Notification type (email, push, webhook) |
| recipient | Yes | string | Recipient address |
| subject | No | string | Notification subject |
| body | Yes | string | Notification body |
| video_title | No | string | Video title for context |
| video_url | No | string | Link to video |

**Result:**

```json
{
  "notification_id": "notif_abc123",
  "type": "email",
  "recipient": "user@example.com",
  "sent_at": "2026-01-01T00:00:00Z"
}
```

**Processing Steps:**

1. Format notification content
2. Send via appropriate channel
3. Log delivery status
4. Update job status

### 4. CLEANUP

Clean up old files and records.

**Payload:**

```json
{
  "target": "downloads",
  "older_than_days": 7,
  "dry_run": false
}
```

**Parameters:**
| Field | Required | Type | Description |
|-------|----------|------|-------------|
| target | Yes | string | What to clean (downloads, temp, logs) |
| older_than_days | Yes | int | Delete files older than N days |
| dry_run | No | bool | If true, only report what would be deleted |

**Result:**

```json
{
  "deleted_files": 15,
  "freed_space_bytes": 1073741824,
  "deleted_records": 20,
  "dry_run": false
}
```

**Processing Steps:**

1. Query old files/records
2. Delete files older than threshold
3. Delete old database records
4. Report cleanup statistics

## Job Status Transitions

```
[PENDING] → [PROCESSING] → [COMPLETED]
                ↓
            [FAILED] → [PENDING] (retry)
                ↓
          [DEAD_LETTER] (max retries exceeded)
```

## Job Priorities

Jobs are processed in FIFO order. For priority handling, use separate queues:

- `jobs_high`: Urgent downloads
- `jobs_normal`: Standard downloads
- `jobs_low`: Background tasks

## Webhooks

For async job completion notifications, configure webhook URL:

```json
{
  "callback_url": "https://your-app.com/webhooks/vidflow"
}
```

**Webhook Payload:**

```json
{
  "event": "job.completed",
  "job_id": "job_abc123",
  "type": "video_download",
  "status": "completed",
  "result": {
    "file_path": "/downloads/video.mp4"
  },
  "timestamp": "2026-01-01T00:00:00Z"
}
```

## Monitoring

### Job Metrics

| Metric                       | Type      | Description             |
| ---------------------------- | --------- | ----------------------- |
| worker_jobs_total            | Counter   | Total jobs processed    |
| worker_jobs_duration_seconds | Histogram | Job processing duration |
| worker_jobs_failed_total     | Counter   | Failed jobs             |
| worker_jobs_retries_total    | Counter   | Total retry attempts    |
| worker_queue_size            | Gauge     | Jobs in queue           |

### Health Checks

```
GET /health
```

Returns worker health status including:

- Jobs processed count
- Active workers
- Queue size
- Memory usage
