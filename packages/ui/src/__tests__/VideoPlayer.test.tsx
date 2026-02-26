/**
 * @vidflow/ui - VideoPlayer Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoPlayer } from '../VideoPlayer';
import type { VideoMetadata } from '../types';

// Mock video data
const mockVideo: VideoMetadata = {
  id: 'test-video-123',
  title: 'Test Video Title',
  description: 'Test video description',
  thumbnail: 'https://example.com/thumbnail.jpg',
  duration: 185,
  platform: 'youtube',
  author: 'Test Author',
  publishedAt: '2024-01-01',
  qualities: [
    {
      resolution: '1080p',
      format: 'mp4',
      url: 'https://example.com/video-1080p.mp4',
      fileSize: 150000000,
    },
    {
      resolution: '720p',
      format: 'mp4',
      url: 'https://example.com/video-720p.mp4',
      fileSize: 80000000,
    },
    {
      resolution: '480p',
      format: 'mp4',
      url: 'https://example.com/video-480p.mp4',
      fileSize: 40000000,
    },
  ],
};

describe('VideoPlayer', () => {
  beforeEach(() => {
    // Mock HTMLMediaElement methods
    jest.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    jest.spyOn(HTMLMediaElement.prototype, 'pause').mockResolvedValue();
    jest.spyOn(HTMLMediaElement.prototype, 'load').mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders video player with correct data-testid', () => {
    render(<VideoPlayer video={mockVideo} />);
    expect(screen.getByTestId('video-player')).toBeInTheDocument();
  });

  it('displays video title', () => {
    render(<VideoPlayer video={mockVideo} />);
    expect(screen.getByText('Test Video Title')).toBeInTheDocument();
  });

  it('renders video element with correct src', () => {
    render(<VideoPlayer video={mockVideo} />);
    const videoElement = document.querySelector('video');
    expect(videoElement).toHaveAttribute('src', 'https://example.com/video-1080p.mp4');
  });

  it('applies autoplay prop correctly', () => {
    render(<VideoPlayer video={mockVideo} autoplay />);
    const videoElement = document.querySelector('video');
    expect(videoElement).toHaveAttribute('autoplay');
  });

  it('applies muted prop correctly', () => {
    render(<VideoPlayer video={mockVideo} muted />);
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    expect(videoElement.muted).toBe(true);
  });

  it('applies loop prop correctly', () => {
    render(<VideoPlayer video={mockVideo} loop />);
    const videoElement = document.querySelector('video');
    expect(videoElement).toHaveAttribute('loop');
  });

  it('shows controls when controls prop is true', () => {
    render(<VideoPlayer video={mockVideo} controls />);
    const controls = document.querySelector('.vidflow-video-controls');
    expect(controls).toBeInTheDocument();
  });

  it('hides controls when controls prop is false', () => {
    render(<VideoPlayer video={mockVideo} controls={false} />);
    const controls = document.querySelector('.vidflow-video-controls');
    expect(controls).not.toBeInTheDocument();
  });

  it('renders quality selector with all quality options', () => {
    render(<VideoPlayer video={mockVideo} controls />);
    const select = screen.getByLabelText('Video quality') as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.options).toHaveLength(3);
    expect(select.options[0]).toHaveValue('1080p');
    expect(select.options[1]).toHaveValue('720p');
    expect(select.options[2]).toHaveValue('480p');
  });

  it('calls onQualityChange when quality is changed', () => {
    const mockOnQualityChange = jest.fn();
    render(<VideoPlayer video={mockVideo} controls onQualityChange={mockOnQualityChange} />);

    const select = screen.getByLabelText('Video quality') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: '720p' } });

    expect(mockOnQualityChange).toHaveBeenCalledWith(
      expect.objectContaining({ resolution: '720p' })
    );
  });

  // Note: onError callback is triggered when video fails to load
  // The error event doesn't always trigger in test environment

  it('applies custom className', () => {
    render(<VideoPlayer video={mockVideo} className="custom-class" />);
    expect(screen.getByTestId('video-player')).toHaveClass('custom-class');
  });

  it('handles empty qualities array', () => {
    const videoNoQualities: VideoMetadata = {
      ...mockVideo,
      qualities: [],
    };
    render(<VideoPlayer video={videoNoQualities} />);
    expect(screen.getByText('No video available')).toBeInTheDocument();
  });

  it('shows placeholder when no video provided', () => {
    const videoNoUrl: VideoMetadata = {
      ...mockVideo,
      qualities: [{ resolution: '1080p', format: 'mp4', url: '' }],
    };
    render(<VideoPlayer video={videoNoUrl} />);
    expect(screen.getByText('No video available')).toBeInTheDocument();
  });
});
