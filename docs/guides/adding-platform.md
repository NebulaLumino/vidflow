# Adding a New Platform

This guide explains how to add support for a new video platform to VidFlow.

## Overview

Adding a new platform involves:

1. Creating a platform parser module
2. Implementing video detection and metadata extraction
3. Adding platform configuration
4. Writing tests
5. Updating documentation

## Step-by-Step Process

### Step 1: Create Platform Parser

Create a new file in the parser service:

```go
// services/parser/internal/platforms/newplatform.go
package platforms

import (
    "net/url"
    "regexp"
)

type NewPlatform struct{}

func (p *NewPlatform) Name() string {
    return "newplatform"
}

func (p *NewPlatform) Domain() string {
    return "newplatform.com"
}

func (p *NewPlatform) Patterns() []*regexp.Regexp {
    return []*regexp.Regexp{
        regexp.MustCompile(`newplatform\.com/(\w+)`),
    }
}

func (p *NewPlatform) ExtractVideoID(videoURL string) (string, error) {
    u, err := url.Parse(videoURL)
    if err != nil {
        return "", err
    }

    // Extract video ID from path or query
    pathParts := strings.Split(u.Path, "/")
    if len(pathParts) < 2 {
        return "", errors.New("invalid URL format")
    }

    return pathParts[len(pathParts)-1], nil
}
```

### Step 2: Implement Metadata Extraction

```go
func (p *NewPlatform) FetchMetadata(videoID string) (*VideoMetadata, error) {
    // Fetch page or API
    resp, err := http.Get(fmt.Sprintf("https://newplatform.com/api/videos/%s", videoID))
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    // Parse response
    var data APIResponse
    if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
        return nil, err
    }

    return &VideoMetadata{
        ID:          data.ID,
        Title:       data.Title,
        Description: data.Description,
        Thumbnail:   data.Thumbnail,
        Duration:    data.Duration,
        Channel: Channel{
            Name: data.Author.Name,
            ID:   data.Author.ID,
        },
        UploadDate data.PublishedAt,
        ViewCount: :   data.Views,
        AvailableQualities: parseQualities(data.Qualities),
    }, nil
}

func parseQualities(qualities []string) []Quality {
    // Convert API quality strings to our Quality type
}
```

### Step 3: Register Platform

Add to platform registry:

```go
// services/parser/internal/platforms/platforms.go
var Platforms = map[string]Platform{
    "youtube":    &YouTube{},
    "tiktok":     &TikTok{},
    "newplatform": &NewPlatform{},  // Add new platform
}
```

### Step 4: Add API Endpoint

```go
// services/parser/internal/api/routes.go
r.GET("/platforms", func(c *gin.Context) {
    platforms := make([]string, 0, len(platforms.Platforms))
    for name := range platforms.Platforms {
        platforms = append(platforms, name)
    }
    c.JSON(200, gin.H{"platforms": platforms})
})
```

### Step 5: Add to Chrome Extension

```typescript
// apps/extension/src/content-scripts/detectors/newplatform.ts
export const NewPlatformDetector = {
  platform: 'newplatform',

  matchesUrl(url: string): boolean {
    return /newplatform\.com\//.test(url);
  },

  detect(): VideoInfo | null {
    // Implementation
  },
};
```

### Step 6: Add to Mini Program

```typescript
// apps/mini-program/src/services/platforms/newplatform.ts
export function parseNewPlatformUrl(url: string): VideoInfo | null {
  // Implementation
}
```

## Platform Interface

All platforms must implement this interface:

```go
type Platform interface {
    // Platform name
    Name() string

    // Primary domain
    Domain() string

    // URL patterns to match
    Patterns() []*regexp.Regexp

    // Extract video ID from URL
    ExtractVideoID(videoURL string) (string, error)

    // Fetch video metadata
    FetchMetadata(videoID string) (*VideoMetadata, error)

    // Optional: Get direct video URL
    GetVideoURL(videoID string, quality string) (string, error)
}
```

## Required Fields

| Field              | Type      | Description             |
| ------------------ | --------- | ----------------------- |
| ID                 | string    | Unique video identifier |
| Title              | string    | Video title             |
| Thumbnail          | string    | Preview image URL       |
| Duration           | int       | Video length in seconds |
| Channel            | Channel   | Video creator info      |
| AvailableQualities | []Quality | Downloadable qualities  |

## Testing

### Unit Tests

```go
func TestNewPlatform_ExtractVideoID(t *testing.T) {
    p := &NewPlatform{}

    tests := []struct {
        url     string
        want    string
        wantErr bool
    }{
        {"https://newplatform.com/video/abc123", "abc123", false},
        {"https://newplatform.com/v/abc123", "abc123", false},
        {"https://example.com/video", "", true},
    }

    for _, tt := range tests {
        t.Run(tt.url, func(t *testing.T) {
            got, err := p.ExtractVideoID(tt.url)
            if (err != nil) != tt.wantErr {
                t.Errorf("ExtractVideoID() error = %v, wantErr %v", err, tt.wantErr)
                return
            }
            if got != tt.want {
                t.Errorf("ExtractVideoID() = %v, want %v", got, tt.want)
            }
        })
    }
}
```

### Integration Tests

```go
func TestNewPlatform_FetchMetadata(t *testing.T) {
    p := &NewPlatform{}

    metadata, err := p.FetchMetadata("test_video_id")
    if err != nil {
        t.Skip("Skipping integration test - requires network")
    }

    if metadata.Title == "" {
        t.Error("Expected non-empty title")
    }
}
```

## Configuration

Add platform-specific configuration:

```yaml
# config/platforms.yaml
platforms:
  newplatform:
    enabled: true
    rate_limit: 10
    timeout: 30s
    cache_ttl: 1h
```

## Documentation

Update documentation:

1. Add platform to `docs/services/parser/platforms.md`
2. Add detection to `docs/apps/extension/platform-detection.md`
3. Update README.md

## Common Issues

### Rate Limiting

If the platform has rate limits:

```go
func (p *NewPlatform) FetchMetadata(videoID string) (*VideoMetadata, error) {
    // Add rate limiting
    p.rateLimiter.Wait()

    // Implement retry logic
    for i := 0; i < 3; i++ {
        metadata, err := p.fetch(videoID)
        if err == nil {
            return metadata, nil
        }
        if !isRateLimitError(err) {
            return nil, err
        }
        time.Sleep(time.Second * time.Duration(i+1))
    }
    return nil, errors.New("rate limited")
}
```

### Authentication

Some platforms require authentication:

```go
func (p *NewPlatform) FetchMetadata(videoID string) (*VideoMetadata, error) {
    // Use pre-configured API key
    req, _ := http.NewRequest("GET", url, nil)
    req.Header.Add("Authorization", "Bearer "+p.config.APIKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}
```

### Dynamic Content

For platforms with dynamic content:

1. Use headless browser (Playwright)
2. Wait for JavaScript to execute
3. Extract from DOM

```go
func (p *NewPlatform) FetchMetadata(videoID string) (*VideoMetadata, error) {
    browser, err := playwright.Run()
    if err != nil {
        return nil, err
    }

    page, err := browser.NewPage()
    if err != nil {
        return nil, err
    }

    _, err = page.Goto(fmt.Sprintf("https://newplatform.com/video/%s", videoID))
    if err != nil {
        return nil, err
    }

    // Wait for dynamic content
    page.WaitForSelector(".video-title")

    title, _ := page.TextContent(".video-title")
    // ...
}
```
