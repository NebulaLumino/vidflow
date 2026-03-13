# Web App Pages

This document details all pages in the VidFlow Web Application.

## Page Overview

| Path          | Description        | Rendering |
| ------------- | ------------------ | --------- |
| `/`           | Home/Search page   | SSR/SSG   |
| `/video/[id]` | Video details page | SSR       |
| `/downloads`  | Download history   | Client    |
| `/settings`   | User settings      | Client    |

## Page Details

### Home Page (`/`)

The main landing page for video search.

**Route:** `/`

**Rendering:** Server-Side Rendering with ISR

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│  Header: Logo, Nav Links, Login              [AD] │
├─────────────────────────────────────────────────────┤
│                                                     │
│           ┌─────────────────────────┐               │
│           │   Search Video URL      │               │
│           │  [Search button]        │               │
│           └─────────────────────────┘               │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ Video Card │  │ Video Card │  │ Video Card │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [AD] Footer: Links, Copyright                      │
└─────────────────────────────────────────────────────┘
```

**Components:**

- Header (Logo, Navigation)
- SearchBar (Input, Submit button)
- RecentSearches
- VideoGrid
- AdBanner (sidebar, footer)

**Data Fetching:**

- `GET /api/v1/platforms` - Supported platforms
- `GET /api/v1/videos` - Recent videos

**SEO:**

- Title: "VidFlow - Download Videos from Any Platform"
- Description: "Free video downloader for YouTube, TikTok, Instagram and more"
- Keywords: video downloader, youtube downloader, tiktok downloader

---

### Video Details Page (`/video/[id]`)

Page showing video information and download options.

**Route:** `/video/[id]`

**Rendering:** Server-Side Rendering

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Video ID from parser |

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│  Header                                        [AD] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────┐  ┌──────────────────────┐ │
│  │                     │  │ Video Title          │ │
│  │   Video Thumbnail   │  │ Channel Name         │ │
│  │   (with play btn)  │  │ Views • 2 days ago  │ │
│  │                     │  │                      │ │
│  └─────────────────────┘  │ Duration: 3:45       │ │
│                           │ [Download Button]     │ │
│                           │ Quality: [1080p v]   │ │
│                           │ Format: [MP4 v]      │ │
│                           └──────────────────────┘ │
│                                                     │
│  Description:                                       │
│  Lorem ipsum dolor sit amet...                      │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [AD] Footer                                         │
└─────────────────────────────────────────────────────┘
```

**Components:**

- Header
- VideoPlayer (thumbnail with play overlay)
- VideoMetadata
- QualitySelector
- DownloadButton
- AdBanner (sidebar)

**Data Fetching:**

- `GET /api/v1/videos/:id` - Video metadata
- `GET /api/v1/platforms` - Available platforms

**Actions:**

- Submit download job: `POST /api/v1/jobs`

**SEO:**

- Dynamic title based on video title
- Dynamic meta description
- OpenGraph tags with video thumbnail

---

### Downloads Page (`/downloads`)

Page showing user's download history and active downloads.

**Route:** `/downloads`

**Rendering:** Client-Side Rendering

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│  Header                                        [AD] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Active Downloads (2)                               │
│  ┌─────────────────────────────────────────────┐   │
│  │ [Thumb] Video Title           ████████░░ 80% │   │
│  │ Channel Name                 [Cancel]       │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │ [Thumb] Another Video         ████░░░░░░ 40% │   │
│  │ Channel Name                 [Cancel]        │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Completed (5)                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ [Thumb] Video Title           [Open] [Del]   │   │
│  │ Channel Name    500MB    MP4                 │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [AD] Footer                                         │
└─────────────────────────────────────────────────────┘
```

**Components:**

- Header
- ActiveDownloads
- DownloadItem (progress bar, cancel button)
- CompletedDownloads
- DownloadItem (open, delete buttons)
- AdBanner (footer)

**Data Fetching:**

- `GET /api/v1/jobs` - All user jobs (via polling)

**Actions:**

- Cancel download: `DELETE /api/v1/jobs/:id`
- Delete from history: `DELETE /api/v1/jobs/:id`

---

### Settings Page (`/settings`)

User preferences and configuration.

**Route:** `/settings`

**Rendering:** Client-Side Rendering

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│  Header                                        [AD] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Settings                                          │
│  ├─ Download Preferences                          │
│  │   Default Quality: [1080p v]                   │
│  │   Default Format: [MP4 v]                      │
│  │   Auto-start downloads: [toggle]               │
│  │                                                │
│  ├─ Notifications                                 │
│  │   Email when complete: [toggle]               │
│  │   Push notifications: [toggle]                 │
│  │                                                │
│  ├─ Ads                                            │
│  │   Show ads: [toggle]                           │
│  │   Block personalized: [toggle]                 │
│  │                                                │
│  └─ About                                         │
│      Version: 1.0.0                               │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [AD] Footer                                         │
└─────────────────────────────────────────────────────┘
```

**Components:**

- Header
- SettingsForm
- QualitySelect
- Toggle
- AdBanner (footer)

**Local Storage:**

- Quality preference
- Format preference
- Notification settings

---

## Error Pages

### 404 Not Found

Displayed when page doesn't exist.

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│  Header                                        [AD] │
├─────────────────────────────────────────────────────┤
│                                                     │
│         404 - Page Not Found                        │
│                                                     │
│    The page you're looking for doesn't exist.      │
│                                                     │
│              [Go Home]                              │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [AD] Footer                                         │
└─────────────────────────────────────────────────────┘
```

### 500 Server Error

Displayed on server errors.

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│  Header                                        [AD] │
├─────────────────────────────────────────────────────┤
│                                                     │
│         500 - Server Error                          │
│                                                     │
│    Something went wrong. Please try again later.    │
│                                                     │
│              [Go Home]                              │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [AD] Footer                                         │
└─────────────────────────────────────────────────────┘
```

---

## Responsive Breakpoints

| Breakpoint | Width      | Layout Changes             |
| ---------- | ---------- | -------------------------- |
| Mobile     | < 640px    | Single column, stacked nav |
| Tablet     | 640-1024px | Two columns                |
| Desktop    | > 1024px   | Full layout with sidebar   |

### Mobile Layout

- Header: Hamburger menu
- Search: Full width
- Video cards: Single column
- Ad banners: Full width between content

### Tablet Layout

- Header: Condensed navigation
- Video cards: 2 columns
- Sidebar ads: Below content

### Desktop Layout

- Header: Full navigation
- Video cards: 3-4 columns
- Sidebar ads: Right side
