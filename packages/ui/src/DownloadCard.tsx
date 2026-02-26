import { useState, useEffect } from 'react';
import type { VideoMetadata, DownloadProgress } from './types';

interface DownloadCardProps {
  video: VideoMetadata;
  progress?: DownloadProgress;
  onDownload: (quality: string, format: string) => void;
  onCancel?: () => void;
  disabled?: boolean;
  className?: string;
}

export function DownloadCard({
  video,
  progress,
  onDownload,
  onCancel,
  disabled = false,
  className = '',
}: DownloadCardProps) {
  const [selectedQuality, setSelectedQuality] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('mp4');

  useEffect(() => {
    if (video.qualities && video.qualities.length > 0 && !selectedQuality) {
      setSelectedQuality(video.qualities[0].resolution);
    }
  }, [video, selectedQuality]);

  const handleDownload = () => {
    if (selectedQuality) {
      onDownload(selectedQuality, selectedFormat);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const isProcessing =
    progress && (progress.status === 'pending' || progress.status === 'processing');
  const isCompleted = progress && progress.status === 'completed';
  const isFailed = progress && progress.status === 'failed';

  return (
    <div className={`vidflow-download-card ${className}`} data-testid="download-card">
      <div className="vidflow-card-thumbnail">
        <img src={video.thumbnail} alt={video.title} />
        {video.duration > 0 && (
          <span className="vidflow-duration">
            {Math.floor(video.duration / 60)}:
            {String(Math.floor(video.duration % 60)).padStart(2, '0')}
          </span>
        )}
      </div>

      <div className="vidflow-card-content">
        <h3 className="vidflow-card-title">{video.title}</h3>

        {video.author && <p className="vidflow-card-author">{video.author}</p>}

        <div className="vidflow-card-platform">
          <span className="vidflow-platform-badge">{video.platform}</span>
        </div>

        {!isProcessing && !isCompleted && !isFailed && (
          <>
            <div className="vidflow-download-options">
              <div className="vidflow-option-group">
                <label htmlFor="quality">Quality:</label>
                <select
                  id="quality"
                  value={selectedQuality}
                  onChange={(e) => setSelectedQuality(e.target.value)}
                  disabled={disabled}
                >
                  {video.qualities.map((q) => (
                    <option key={q.resolution} value={q.resolution}>
                      {q.resolution} {q.fileSize ? `(${formatFileSize(q.fileSize)})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="vidflow-option-group">
                <label htmlFor="format">Format:</label>
                <select
                  id="format"
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  disabled={disabled}
                >
                  <option value="mp4">MP4</option>
                  <option value="webm">WebM</option>
                  <option value="audio">Audio (MP3)</option>
                </select>
              </div>
            </div>

            <button
              className="vidflow-download-btn"
              onClick={handleDownload}
              disabled={disabled || !selectedQuality}
              data-testid="download-button"
            >
              Download
            </button>
          </>
        )}

        {isProcessing && (
          <div className="vidflow-progress-container">
            <div className="vidflow-progress-info">
              <span>{progress.status === 'pending' ? 'Queued...' : 'Downloading...'}</span>
              <span>{progress.progress}%</span>
            </div>
            <div className="vidflow-progress-bar">
              <div className="vidflow-progress-fill" style={{ width: `${progress.progress}%` }} />
            </div>
            {progress.downloadedBytes && progress.totalBytes && (
              <p className="vidflow-bytes-info">
                {formatFileSize(progress.downloadedBytes)} / {formatFileSize(progress.totalBytes)}
              </p>
            )}
            {onCancel && (
              <button className="vidflow-cancel-btn" onClick={onCancel}>
                Cancel
              </button>
            )}
          </div>
        )}

        {isCompleted && progress?.downloadUrl && (
          <div className="vidflow-completed-container">
            <p className="vidflow-success-msg">Download complete!</p>
            <a
              href={progress.downloadUrl}
              download
              className="vidflow-download-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Click to save
            </a>
          </div>
        )}

        {isFailed && (
          <div className="vidflow-error-container">
            <p className="vidflow-error-msg">{progress.error || 'Download failed'}</p>
            <button className="vidflow-retry-btn" onClick={handleDownload} disabled={disabled}>
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DownloadCard;
