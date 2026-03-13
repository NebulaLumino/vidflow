# Web App SEO Guide

This document outlines the SEO strategy and implementation for the VidFlow Web Application.

## Overview

The VidFlow web app is optimized for search engines to attract organic traffic from users searching for video downloading tools.

## Target Keywords

### Primary Keywords

- video downloader
- download youtube videos
- download tiktok videos
- download instagram videos
- free video downloader

### Secondary Keywords

- youtube to mp4
- tiktok downloader no watermark
- save instagram videos
- facebook video downloader
- vimeo downloader

### Long-tail Keywords

- download youtube videos to mp4
- how to download tiktok videos
- best free video downloader
- download private instagram videos

## SEO Strategy

### 1. On-Page SEO

#### Meta Tags

Every page includes appropriate meta tags:

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: 'VidFlow - Download Videos Free',
    template: '%s | VidFlow',
  },
  description:
    'Free video downloader for YouTube, TikTok, Instagram, Twitter, Facebook and more. Download videos in HD quality.',
  keywords: [
    'video downloader',
    'youtube downloader',
    'tiktok downloader',
    'free video downloader',
  ],
  authors: [{ name: 'VidFlow' }],
  creator: 'VidFlow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://vidflow.app',
    siteName: 'VidFlow',
    title: 'VidFlow - Download Videos Free',
    description: 'Free video downloader for YouTube, TikTok, Instagram and more',
    images: [
      {
        url: 'https://vidflow.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VidFlow',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VidFlow - Download Videos Free',
    description: 'Free video downloader for YouTube, TikTok, Instagram and more',
    creator: '@vidflow',
    images: ['https://vidflow.app/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
```

#### Video Page SEO

```tsx
// app/video/[id]/page.tsx
export async function generateMetadata({ params }) {
  const video = await getVideo(params.id);

  return {
    title: `Download ${video.title} - VidFlow`,
    description: `Download ${video.title} by ${video.author.name}. Available in ${video.available_qualities.join(', ')}.`,
    openGraph: {
      title: video.title,
      description: video.description,
      type: 'video.other',
      videos: [
        {
          url: video.url,
          type: 'video/mp4',
        },
      ],
      images: [
        {
          url: video.thumbnail_url,
          width: 1280,
          height: 720,
        },
      ],
    },
  };
}
```

### 2. Technical SEO

#### Sitemap

Dynamic sitemap generation:

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://vidflow.app';

  // Static pages
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    {
      url: `${baseUrl}/downloads`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic video pages (fetch from API)
  const videos = await getRecentVideos();
  const videoPages = videos.map((video) => ({
    url: `${baseUrl}/video/${video.id}`,
    lastModified: new Date(video.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...videoPages];
}
```

#### robots.txt

```txt
# robots.txt
User-agent: *
Allow: /

# Sitemap
Sitemap: https://vidflow.app/sitemap.xml

# Disallow admin/private areas
Disallow: /api/
Disallow: /_next/
Disallow: /downloads?auth=
```

#### Structured Data

**Organization Schema:**

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "VidFlow",
  "url": "https://vidflow.app",
  "logo": "https://vidflow.app/logo.png",
  "sameAs": ["https://twitter.com/vidflow", "https://facebook.com/vidflow"]
}
```

**WebApplication Schema:**

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "VidFlow",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

**VideoObject Schema (for video pages):**

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Video Title",
  "description": "Video description",
  "thumbnailUrl": "https://example.com/thumb.jpg",
  "uploadDate": "2024-01-01T00:00:00Z",
  "duration": "PT3M45S",
  "contentUrl": "https://example.com/video.mp4"
}
```

### 3. Performance Optimization

#### Core Web Vitals

| Metric | Target  | Implementation                           |
| ------ | ------- | ---------------------------------------- |
| LCP    | < 2.5s  | Optimize images, preload hero content    |
| FID    | < 100ms | Minimize JS, use code splitting          |
| CLS    | < 0.1   | Set image dimensions, font-display: swap |

#### Image Optimization

```tsx
import Image from 'next/image';

// Use Next.js Image for automatic optimization
<Image
  src={video.thumbnail_url}
  alt={video.title}
  width={640}
  height={360}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL={thumbnailBase64}
/>;
```

### 4. Content Strategy

#### Landing Page Content

```tsx
// Home page content sections
export default function HomeContent() {
  return (
    <>
      {/* Hero Section */}
      <section>
        <h1>Download Videos from Any Platform</h1>
        <p>Free, fast, and easy video downloader for YouTube, TikTok, Instagram, and more.</p>
      </section>

      {/* Supported Platforms */}
      <section>
        <h2>Supported Platforms</h2>
        <ul>
          <li>YouTube</li>
          <li>TikTok</li>
          <li>Instagram</li>
          <li>Twitter/X</li>
          <li>Facebook</li>
          <li>Vimeo</li>
        </ul>
      </section>

      {/* Features */}
      <section>
        <h2>Why Use VidFlow?</h2>
        <ul>
          <li>Free to use</li>
          <li>No installation required</li>
          <li>HD quality downloads</li>
          <li>Multiple formats</li>
        </ul>
      </section>

      {/* How to Use */}
      <section>
        <h2>How to Download Videos</h2>
        <ol>
          <li>Copy the video URL</li>
          <li>Paste it in the search box</li>
          <li>Select quality and format</li>
          <li>Click download</li>
        </ol>
      </section>
    </>
  );
}
```

### 5. URL Structure

| Page      | URL         | Structure       |
| --------- | ----------- | --------------- |
| Home      | /           | Static          |
| Video     | /video/[id] | Dynamic with ID |
| Downloads | /downloads  | Static          |
| Settings  | /settings   | Static          |

### 6. Canonical URLs

All pages include canonical tags to prevent duplicate content:

```tsx
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://vidflow.app',
    languages: {
      'en-US': 'https://vidflow.app',
    },
  },
};
```

### 7. Internationalization (Future)

```tsx
// Next.js i18n configuration (future)
export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'es', 'fr', 'de', 'ja', 'zh'],
};
```

## Analytics Integration

### Google Analytics 4

```tsx
// app/layout.tsx
import { GoogleAnalytics } from '@nextjs/google-analytics';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics trackPageViews />
      </body>
    </html>
  );
}
```

### Search Console

Verify ownership via DNS or HTML tag:

```html
<meta name="google-site-verification" content="verification-code" />
```

## Monitoring

### SEO Tools

- **Google Search Console**: Monitor indexing, clicks, rankings
- **Google PageSpeed Insights**: Core Web Vitals
- **Ahrefs/SEMrush**: Backlinks, rankings
- **Screaming Frog**: Technical SEO audit
