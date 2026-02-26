import React, { useState } from 'react';

interface URLInputProps {
  onSubmit: (url: string) => void;
  placeholder?: string;
  loading?: boolean;
  className?: string;
  supportedPlatforms?: string[];
}

export function URLInput({
  onSubmit,
  placeholder = 'Paste video URL here...',
  loading = false,
  className = '',
  supportedPlatforms = [],
}: URLInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateURL = (input: string): boolean => {
    try {
      const parsed = new URL(input);
      const hostname = parsed.hostname.toLowerCase();

      const platformPatterns: Record<string, string[]> = {
        youtube: ['youtube.com', 'youtu.be', 'youtube-nocookie.com'],
        tiktok: ['tiktok.com'],
        instagram: ['instagram.com', 'instagr.am'],
        twitter: ['twitter.com', 'x.com'],
        facebook: ['facebook.com', 'fb.watch'],
        vimeo: ['vimeo.com'],
        twitch: ['twitch.tv'],
        reddit: ['reddit.com', 'old.reddit.com'],
        dailymotion: ['dailymotion.com'],
        bilibili: ['bilibili.com', 'b23.tv'],
      };

      // Find which platform this URL belongs to
      let detectedPlatform: string | null = null;
      for (const [platform, patterns] of Object.entries(platformPatterns)) {
        if (patterns.some((pattern) => hostname.includes(pattern))) {
          detectedPlatform = platform;
          break;
        }
      }

      // If supportedPlatforms is specified, check if the detected platform is in the list
      if (supportedPlatforms.length > 0) {
        if (!detectedPlatform) {
          setError('Please enter a valid URL');
          return false;
        }
        if (!supportedPlatforms.includes(detectedPlatform)) {
          setError(`Please enter a valid URL from: ${supportedPlatforms.join(', ')}`);
          return false;
        }
        setError(null);
        return true;
      }

      // If no supportedPlatforms specified, just check if it's a valid platform
      if (!detectedPlatform) {
        setError('Please enter a valid URL');
        return false;
      }

      setError(null);
      return true;
    } catch {
      setError('Please enter a valid URL');
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateURL(url)) {
      onSubmit(url);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      validateURL(text);
    } catch {
      setError('Could not read clipboard');
    }
  };

  const handleClear = () => {
    setUrl('');
    setError(null);
  };

  return (
    <div className={`vidflow-url-input-container ${className}`} data-testid="url-input">
      <form onSubmit={handleSubmit} className="vidflow-url-form">
        <div className="vidflow-input-wrapper">
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            placeholder={placeholder}
            disabled={loading}
            className="vidflow-url-input"
            aria-label="Video URL"
            data-testid="url-input-field"
          />

          {url && (
            <button
              type="button"
              className="vidflow-clear-btn"
              onClick={handleClear}
              aria-label="Clear input"
            >
              ✕
            </button>
          )}
        </div>

        <div className="vidflow-action-buttons">
          <button
            type="button"
            className="vidflow-paste-btn"
            onClick={handlePaste}
            disabled={loading}
            aria-label="Paste from clipboard"
          >
            Paste
          </button>

          <button
            type="submit"
            className="vidflow-submit-btn"
            disabled={loading || !url.trim()}
            data-testid="submit-button"
          >
            {loading ? (
              <span className="vidflow-loading">
                <span className="vidflow-spinner" />
                Processing...
              </span>
            ) : (
              'Download'
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="vidflow-error-message" role="alert" data-testid="error-message">
          {error}
        </div>
      )}

      {supportedPlatforms.length > 0 && (
        <div className="vidflow-supported-platforms">
          <span>Supported:</span>
          <div className="vidflow-platform-list">
            {supportedPlatforms.map((platform) => (
              <span key={platform} className="vidflow-platform-tag">
                {platform}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default URLInput;
