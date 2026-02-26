'use client';

import { useEffect, useState } from 'react';
import type { VideoQuality, VideoFormat } from '@vidflow/shared';
import type { VideoMetadata } from '@vidflow/ui';
import { analyticsService } from '@vidflow/shared';
import { AdBanner } from '../components/AdBanner';
import { DownloadHistory } from '../components/DownloadHistory';
import { URLInput } from '@vidflow/ui';
import { VideoCard } from '@vidflow/ui';
import { DownloadCard } from '@vidflow/ui';

// Python API response format (from parser service)
interface PythonVideoMetadata {
  id: string;
  platform: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  author?: { name: string; url?: string };
  duration?: number;
  upload_date?: string;
  view_count?: number;
  like_count?: number;
  available_qualities: string[];
  available_formats: string[];
  url: string;
}

interface PythonParseResponse {
  video: PythonVideoMetadata;
}

interface ParseResponse {
  video: VideoMetadata;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const API_BASE = process.env.NEXT_PUBLIC_PARSER_URL || 'http://localhost:8000';

// Transform Python API response to TypeScript VideoMetadata
function transformVideoMetadata(pythonVideo: PythonVideoMetadata): VideoMetadata {
  // Convert available_qualities to VideoQuality[] format (using UI package format)
  const qualities = pythonVideo.available_qualities.map((q) => ({
    resolution: q,
    format: pythonVideo.available_formats[0] || 'mp4',
    url: pythonVideo.url,
  }));

  return {
    id: pythonVideo.id,
    title: pythonVideo.title,
    description: pythonVideo.description,
    thumbnail: pythonVideo.thumbnail_url || '',
    duration: pythonVideo.duration || 0,
    platform: pythonVideo.platform,
    author: pythonVideo.author?.name || '',
    publishedAt: pythonVideo.upload_date,
    qualities,
  };
}

const PLATFORMS = [
  { id: 'youtube', name: 'YouTube' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'twitter', name: 'Twitter/X' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'vimeo', name: 'Vimeo' },
  { id: 'twitch', name: 'Twitch' },
  { id: 'reddit', name: 'Reddit' },
  { id: 'dailymotion', name: 'Dailymotion' },
  { id: 'bilibili', name: 'Bilibili' },
];

const QUALITIES: VideoQuality[] = ['best', '2160p', '1440p', '1080p', '720p', '480p', '360p'];
const FORMATS: VideoFormat[] = ['mp4', 'webm', 'mkv'];

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [video, setVideo] = useState<VideoMetadata | null>(null);
  const [error, setError] = useState('');
  const [quality, setQuality] = useState<VideoQuality>('best');
  const [format, setFormat] = useState<VideoFormat>('mp4');

  useEffect(() => {
    analyticsService.trackEvent('engagement', 'view', 'home_page');
  }, []);

  const detectPlatform = (url: string): string => {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube';
    if (urlLower.includes('tiktok.com')) return 'tiktok';
    if (urlLower.includes('instagram.com')) return 'instagram';
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'twitter';
    if (urlLower.includes('facebook.com') || urlLower.includes('fb.watch')) return 'facebook';
    if (urlLower.includes('vimeo.com')) return 'vimeo';
    return 'unknown';
  };

  const handleStringSubmit = async (urlString: string) => {
    if (!urlString.trim()) return;

    setLoading(true);
    setError('');
    setVideo(null);

    try {
      const platform = detectPlatform(urlString);
      analyticsService.trackSearch(urlString, platform);

      if (platform === 'unknown') {
        setError('Unsupported platform. Please enter a valid video URL.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/v1/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlString }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to parse video');
      }

      const data: ApiResponse<PythonParseResponse> = await response.json();
      const transformedVideo = transformVideoMetadata(data.data.video);
      setVideo(transformedVideo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse video');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleStringSubmit(url);
  };

  const handleDownload = async () => {
    if (!video) return;

    try {
      const response = await fetch(`${API_BASE}/api/v1/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: video.url, quality, format }),
      });

      if (!response.ok) {
        throw new Error('Failed to start download');
      }

      alert('Download started! Check your downloads folder.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start download');
    }
  };

  return (
    <main>
      <div className="container">
        <header className="header">
          <h1>VidFlow</h1>
          <p>
            Download videos from YouTube, TikTok, Instagram, Twitter, Facebook, and more. Free,
            fast, and reliable.
          </p>
        </header>

        <AdBanner placementId="header-banner" />

        <div className="search-box">
          <URLInput
            onSubmit={handleStringSubmit}
            loading={loading}
            placeholder="Paste video URL here..."
          />
        </div>

        <DownloadHistory />

        <div className="supported-platforms">
          <h3>Supported Platforms</h3>
          <div className="platform-list">
            {PLATFORMS.map((p) => (
              <span key={p.id} className="platform-badge">
                {p.name}
              </span>
            ))}
          </div>
        </div>

        {loading && (
          <div className="result-panel">
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Fetching video information...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="result-panel">
            <div className="error-message">{error}</div>
          </div>
        )}

        {video && !loading && (
          <div className="result-panel">
            <VideoCard video={video} onClick={() => {}} />
            <DownloadCard video={video} onDownload={handleDownload} />
          </div>
        )}
      </div>

      <footer className="footer">
        <AdBanner placementId="footer-banner" />
        <p>© 2026 VidFlow. Download videos you have the right to access.</p>
      </footer>
    </main>
  );
}
