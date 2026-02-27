import type { VideoMetadata } from './types';

interface VideoCardProps {
  video: VideoMetadata;
  onClick?: () => void;
  onDownload?: () => void;
  className?: string;
}

export function VideoCard({ video, onClick, onDownload, className = '' }: VideoCardProps) {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPlatformColor = (platform: string): string => {
    const colors: Record<string, string> = {
      youtube: '#FF0000',
      tiktok: '#00f2ea',
      instagram: '#E4405F',
      twitter: '#1DA1F2',
      facebook: '#1877F2',
      vimeo: '#1AB7EA',
      twitch: '#9146FF',
      reddit: '#FF4500',
      dailymotion: '#00AADD',
      bilibili: '#00A1D6',
    };
    return colors[platform.toLowerCase()] || '#666666';
  };

  return (
    <div
      className={`vidflow-video-card ${className}`}
      data-testid="video-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <div className="vidflow-card-thumbnail-wrapper">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="vidflow-card-thumbnail-img"
          loading="lazy"
        />
        {video.duration > 0 && (
          <span className="vidflow-card-duration">{formatDuration(video.duration)}</span>
        )}
        <div className="vidflow-card-overlay">
          <button className="vidflow-card-play-btn" aria-label="Play video">
            ▶
          </button>
        </div>
      </div>

      <div className="vidflow-card-info">
        <h4 className="vidflow-card-title">{video.title}</h4>

        {video.author && <p className="vidflow-card-author">{video.author}</p>}

        <div className="vidflow-card-meta">
          <span
            className="vidflow-card-platform"
            style={{ backgroundColor: getPlatformColor(video.platform) }}
          >
            {video.platform}
          </span>

          {video.qualities && video.qualities.length > 0 && (
            <span className="vidflow-card-quality">{video.qualities[0].resolution}</span>
          )}
        </div>

        {onDownload && (
          <button
            className="vidflow-card-download-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            aria-label="Download video"
          >
            Download
          </button>
        )}
      </div>
    </div>
  );
}

export default VideoCard;
