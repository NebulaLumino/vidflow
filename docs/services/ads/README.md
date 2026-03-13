# Ad Service

The Ad Service is the advertising component of the VidFlow platform, built with Go and GORM. It manages advertisements, tracks impressions and clicks, and serves ads to the web app and other clients.

## Purpose

The Ad Service provides a complete advertising system:

- **Ad Management**: CRUD operations for advertisements
- **Ad Serving**: Select and serve appropriate ads based on placement
- **Impression Tracking**: Track when ads are displayed
- **Click Tracking**: Track when users click on ads
- **Analytics**: Track ad performance metrics

## Architecture

The Ad Service uses a layered architecture:

```
┌─────────────────────────────────────────────────┐
│              HTTP Handlers (Gin)               │  - Request handling
├─────────────────────────────────────────────────┤
│               Service Layer                     │  - Business logic
├─────────────────────────────────────────────────┤
│              Database (GORM)                   │  - Data persistence
├─────────────────────────────────────────────────┤
│                  Models                        │  - Data structures
└─────────────────────────────────────────────────┘
```

### Project Structure

```
ad-service/
├── cmd/
│   └── server/
│       └── main.go           # Entry point
├── internal/
│   ├── models/
│   │   └── ad.go             # Data models
│   └── handlers/
│       └── ad.go             # HTTP handlers
├── go.mod
├── go.sum
└── Dockerfile
```

### Key Components

**Data Models**

- `Ad`: Advertisement entity
- `AdImpression`: Track ad impressions
- `AdClick`: Track ad clicks

**API Endpoints**

- `POST /api/v1/ads`: Get ad for placement
- `POST /api/v1/ads/:id/impression`: Track impression
- `POST /api/v1/ads/:id/click`: Track click

## Data Flow

1. **Ad Request**: Client requests ad for a placement
2. **Ad Selection**: Service selects appropriate ad based on placement
3. **Ad Response**: Return ad data to client
4. **Impression Tracking**: Client reports impression, service logs it
5. **Click Tracking**: Client reports click, service logs and redirects

## Dependencies

### External Libraries

- **Gin**: HTTP web framework
- **GORM**: ORM for database
- **MySQL**: Database driver (or SQLite for dev)
- **Google UUID**: UUID generation

### Environment Variables

- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `PORT`: Server port (default: 8081)

## Integration Points

### Upstream Consumers

- **Gateway Service**: Proxies ad requests
- **Web App**: Requests ads for display

### Database Tables

- `ads`: Advertisement records
- `ad_impressions`: Impression logs
- `ad_clicks`: Click logs

## Ad Types

| Type         | Description           | Example            |
| ------------ | --------------------- | ------------------ |
| banner       | Horizontal banner ad  | Top/bottom of page |
| video        | Video advertisement   | Pre-roll/mid-roll  |
| interstitial | Full-screen ad        | Between content    |
| sidebar      | Sidebar advertisement | Side of page       |

## Ad Placements

| Placement     | Type         | Description                 |
| ------------- | ------------ | --------------------------- |
| header        | banner       | Top of page header          |
| footer        | banner       | Bottom of page footer       |
| sidebar       | sidebar      | Side of page                |
| video_preroll | video        | Before video content        |
| video_midroll | video        | During video content        |
| interstitial  | interstitial | Full screen between content |

## Behavior Examples

### Example 1: Get Ad

**Request:**

```
POST /api/v1/ads
{
  "placement": "sidebar",
  "user_id": "user123",
  "context": "home_page"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "ad": {
      "id": "ad_123",
      "name": "Sample Banner Ad",
      "type": "banner",
      "placement": "sidebar",
      "content": "Check out our new features!",
      "image_url": "https://example.com/ad.jpg",
      "target_url": "https://example.com/click",
      "impressions": 1000,
      "clicks": 50
    }
  }
}
```

### Example 2: Track Impression

**Request:**

```
POST /api/v1/ads/ad_123/impression
{
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "country": "US"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "impression_id": "imp_abc123"
  }
}
```

### Example 3: Track Click

**Request:**

```
POST /api/v1/ads/ad_123/click
{
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "click_id": "clk_abc123",
    "redirect_url": "https://example.com/landing-page"
  }
}
```

## Error Handling

### Error Codes

| Code              | Description                   | HTTP Status |
| ----------------- | ----------------------------- | ----------- |
| AD_NOT_FOUND      | No ad available for placement | 404         |
| INVALID_PLACEMENT | Invalid ad placement          | 400         |
| DATABASE_ERROR    | Database operation failed     | 500         |

### Validation

- Placement must be valid
- IP address required for tracking
- Ad must be active and within date range

## Testing Strategy

### Test Framework

- **Go testing**: Built-in testing

### Test Coverage

- Handler tests
- Model tests

### Key Test Cases

- Get ad by placement
- Impression tracking
- Click tracking

## Known Limitations

1. **Basic Targeting**: No advanced targeting (demographics, behavior)
2. **No Ad Network**: Uses internal ads only (no external networks)
3. **Limited Analytics**: Basic metrics only
4. **No A/B Testing**: No split testing support
5. **Single Database**: No read replicas for scaling
