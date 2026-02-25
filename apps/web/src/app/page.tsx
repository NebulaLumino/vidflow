'use client';

import { useEffect, useState } from 'react';
import type { VideoMetadata, VideoQuality, VideoFormat } from '@vidflow/shared';
import { analyticsService } from '@vidflow/shared';
import { AdBanner } from '../components/AdBanner';

interface ParseResponse {
  video: VideoMetadata;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const API_BASE = process.env.NEXT_PUBLIC_PARSER_URL || 'http://localhost:8000';

const PLATFORMS = [
  { id: 'youtube', name: 'YouTube' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'twitter', name: 'Twitter/X' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'vimeo', name: 'Vimeo' },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setVideo(null);

    try {
      const platform = detectPlatform(url);
      analyticsService.trackSearch(url, platform);

      if (platform === 'unknown') {
        setError('Unsupported platform. Please enter a valid video URL.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/v1/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to parse video');
      }

      const data: ApiResponse<ParseResponse> = await response.json();
      setVideo(data.data.video);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse video');
    } finally {
      setLoading(false);
    }
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
          <form className="search-form" onSubmit={handleSubmit}>
            <input
              type="url"
              className="search-input"
              placeholder="Paste video URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? 'Parsing...' : 'Download'}
            </button>
          </form>
        </div>

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
            <div className="video-info">
              {video.thumbnail_url && (
                <img src={video.thumbnail_url} alt={video.title} className="video-thumbnail" />
              )}
              <div className="video-details">
                <h3 className="video-title">{video.title}</h3>
                <div className="video-meta">
                  <span className={`video-platform ${video.platform}`}>{video.platform}</span>
                  {video.duration && (
                    <span>
                      {Math.floor(video.duration / 60)}:
                      {String(video.duration % 60).padStart(2, '0')}
                    </span>
                  )}
                  {video.author && <span>by {video.author.name}</span>}
                </div>
                {video.description && (
                  <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    {video.description.substring(0, 150)}
                    {video.description.length > 150 ? '...' : ''}
                  </p>
                )}
              </div>
            </div>

            <div className="download-options">
              <h4>Download Options</h4>
              <div className="option-row">
                <span className="option-label">Quality</span>
                <select
                  className="option-select"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as VideoQuality)}
                >
                  {QUALITIES.map((q) => (
                    <option key={q} value={q}>
                      {q === 'best' ? 'Best Quality' : q}
                    </option>
                  ))}
                </select>
              </div>
              <div className="option-row">
                <span className="option-label">Format</span>
                <select
                  className="option-select"
                  value={format}
                  onChange={(e) => setFormat(e.target.value as VideoFormat)}
                >
                  {FORMATS.map((f) => (
                    <option key={f} value={f}>
                      {f.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <button className="download-button" onClick={handleDownload}>
                Download Now
              </button>
            </div>
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
