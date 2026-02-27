import React, { useState, useRef, useEffect } from 'react';
import type { VideoMetadata, VideoQuality } from './types';

interface VideoPlayerProps {
  video: VideoMetadata;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  className?: string;
  onQualityChange?: (quality: VideoQuality) => void;
  onError?: (error: Error) => void;
}

export function VideoPlayer({
  video,
  autoplay = false,
  muted = false,
  controls = true,
  loop = false,
  className = '',
  onQualityChange,
  onError,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentQuality, setCurrentQuality] = useState<VideoQuality | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);

  useEffect(() => {
    if (video.qualities && video.qualities.length > 0) {
      setCurrentQuality(video.qualities[0]);
    }
  }, [video]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVolumeChange = () => {
    if (videoRef.current) {
      setVolume(videoRef.current.volume);
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleQualitySelect = (quality: VideoQuality) => {
    setCurrentQuality(quality);
    if (onQualityChange) {
      onQualityChange(quality);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleError = () => {
    if (onError && videoRef.current?.error) {
      onError(new Error(videoRef.current.error.message));
    }
  };

  const hasValidQuality = currentQuality && currentQuality.url;

  if (!video || !video.qualities || video.qualities.length === 0 || !hasValidQuality) {
    return (
      <div className={`vidflow-video-player ${className}`} data-testid="video-player">
        <div className="vidflow-video-placeholder">No video available</div>
      </div>
    );
  }

  return (
    <div className={`vidflow-video-player ${className}`} data-testid="video-player">
      {video.title && <div className="vidflow-video-title">{video.title}</div>}
      <video
        ref={videoRef}
        src={currentQuality.url}
        poster={video.thumbnail}
        autoPlay={autoplay}
        muted={muted}
        loop={loop}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onVolumeChange={handleVolumeChange}
        onError={handleError}
        className="vidflow-video-element"
      >
        Your browser does not support the video tag.
      </video>

      {controls && (
        <div className="vidflow-video-controls">
          <div className="vidflow-progress-bar">
            <div
              className="vidflow-progress-filled"
              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
            />
          </div>

          <div className="vidflow-controls-row">
            <button
              className="vidflow-control-btn"
              onClick={() => {
                if (videoRef.current) {
                  if (isPlaying) {
                    videoRef.current.pause();
                  } else {
                    videoRef.current.play();
                  }
                }
              }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            <span className="vidflow-time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {video.qualities && video.qualities.length > 1 && (
              <select
                className="vidflow-quality-select"
                value={currentQuality.resolution}
                onChange={(e) => {
                  const quality = video.qualities.find((q) => q.resolution === e.target.value);
                  if (quality) {
                    handleQualitySelect(quality);
                  }
                }}
                aria-label="Video quality"
              >
                {video.qualities.map((q) => (
                  <option key={q.resolution} value={q.resolution}>
                    {q.resolution}
                  </option>
                ))}
              </select>
            )}

            <button
              className="vidflow-control-btn"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.muted = !isMuted;
                }
              }}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;
