/**
 * @vidflow/ui - VideoCard Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoCard } from '../VideoCard';
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
  ],
};

describe('VideoCard', () => {
  const mockOnClick = jest.fn();
  const mockOnDownload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders video card with correct data-testid', () => {
    render(<VideoCard video={mockVideo} />);
    expect(screen.getByTestId('video-card')).toBeInTheDocument();
  });

  it('displays video title', () => {
    render(<VideoCard video={mockVideo} />);
    expect(screen.getByText('Test Video Title')).toBeInTheDocument();
  });

  it('displays video author', () => {
    render(<VideoCard video={mockVideo} />);
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('displays platform badge', () => {
    render(<VideoCard video={mockVideo} />);
    expect(screen.getByText('youtube')).toBeInTheDocument();
  });

  it('displays video thumbnail', () => {
    render(<VideoCard video={mockVideo} />);
    const thumbnail = screen.getByAltText('Test Video Title');
    expect(thumbnail).toHaveAttribute('src', 'https://example.com/thumbnail.jpg');
  });

  it('displays video duration', () => {
    render(<VideoCard video={mockVideo} />);
    expect(screen.getByText('3:05')).toBeInTheDocument();
  });

  it('displays quality badge', () => {
    render(<VideoCard video={mockVideo} />);
    expect(screen.getByText('1080p')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    render(<VideoCard video={mockVideo} onClick={mockOnClick} />);
    const card = screen.getByTestId('video-card');
    fireEvent.click(card);
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('calls onDownload when download button is clicked', () => {
    render(<VideoCard video={mockVideo} onDownload={mockOnDownload} />);
    const downloadBtn = screen.getByText('Download');
    fireEvent.click(downloadBtn);
    expect(mockOnDownload).toHaveBeenCalled();
  });

  it('prevents onClick when clicking download button', () => {
    render(<VideoCard video={mockVideo} onClick={mockOnClick} onDownload={mockOnDownload} />);
    const downloadBtn = screen.getByText('Download');
    fireEvent.click(downloadBtn);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<VideoCard video={mockVideo} className="custom-class" />);
    expect(screen.getByTestId('video-card')).toHaveClass('custom-class');
  });

  it('handles keyboard interaction', () => {
    render(<VideoCard video={mockVideo} onClick={mockOnClick} />);
    const card = screen.getByTestId('video-card');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('handles space key for keyboard interaction', () => {
    render(<VideoCard video={mockVideo} onClick={mockOnClick} />);
    const card = screen.getByTestId('video-card');
    fireEvent.keyDown(card, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('formats duration correctly for long videos', () => {
    const longVideo: VideoMetadata = {
      ...mockVideo,
      duration: 3725, // 1h 2m 5s
    };
    render(<VideoCard video={longVideo} />);
    expect(screen.getByText('1:02:05')).toBeInTheDocument();
  });

  it('renders without author', () => {
    const videoNoAuthor: VideoMetadata = {
      ...mockVideo,
      author: undefined,
    };
    render(<VideoCard video={videoNoAuthor} />);
    expect(screen.getByText('Test Video Title')).toBeInTheDocument();
  });

  it('renders without qualities', () => {
    const videoNoQualities: VideoMetadata = {
      ...mockVideo,
      qualities: [],
    };
    render(<VideoCard video={videoNoQualities} />);
    expect(screen.getByTestId('video-card')).toBeInTheDocument();
  });

  it('handles unknown platform color', () => {
    const unknownPlatform: VideoMetadata = {
      ...mockVideo,
      platform: 'unknown-platform',
    };
    render(<VideoCard video={unknownPlatform} />);
    expect(screen.getByText('unknown-platform')).toBeInTheDocument();
  });

  it('handles zero duration', () => {
    const zeroDuration: VideoMetadata = {
      ...mockVideo,
      duration: 0,
    };
    render(<VideoCard video={zeroDuration} />);
    const durationSpan = screen.queryByText('0:00');
    expect(durationSpan).not.toBeInTheDocument();
  });
});
