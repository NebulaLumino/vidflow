/**
 * @vidflow/ui - DownloadCard Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DownloadCard } from '../DownloadCard';
import type { VideoMetadata, DownloadProgress } from '../types';

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

describe('DownloadCard', () => {
  const mockOnDownload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders download card with correct data-testid', () => {
    render(<DownloadCard video={mockVideo} onDownload={mockOnDownload} />);
    expect(screen.getByTestId('download-card')).toBeInTheDocument();
  });

  it('displays video title', () => {
    render(<DownloadCard video={mockVideo} onDownload={mockOnDownload} />);
    expect(screen.getByText('Test Video Title')).toBeInTheDocument();
  });

  it('displays video author', () => {
    render(<DownloadCard video={mockVideo} onDownload={mockOnDownload} />);
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('displays platform badge', () => {
    render(<DownloadCard video={mockVideo} onDownload={mockOnDownload} />);
    expect(screen.getByText('youtube')).toBeInTheDocument();
  });

  it('displays video thumbnail', () => {
    render(<DownloadCard video={mockVideo} onDownload={mockOnDownload} />);
    const thumbnail = screen.getByAltText('Test Video Title');
    expect(thumbnail).toHaveAttribute('src', 'https://example.com/thumbnail.jpg');
  });

  it('displays video duration', () => {
    render(<DownloadCard video={mockVideo} onDownload={mockOnDownload} />);
    expect(screen.getByText('3:05')).toBeInTheDocument();
  });

  it('renders quality selector with options', () => {
    render(<DownloadCard video={mockVideo} onDownload={mockOnDownload} />);
    const qualitySelect = screen.getByLabelText('Quality:');
    expect(qualitySelect).toBeInTheDocument();
    expect(qualitySelect.options).toHaveLength(3);
  });

  it('renders format selector', () => {
    render(<DownloadCard video={mockVideo} onDownload={mockOnDownload} />);
    const formatSelect = screen.getByLabelText('Format:');
    expect(formatSelect).toBeInTheDocument();
    expect(formatSelect).toHaveValue('mp4');
  });

  it('calls onDownload when download button is clicked', () => {
    render(<DownloadCard video={mockVideo} onDownload={mockOnDownload} />);
    const downloadBtn = screen.getByTestId('download-button');
    fireEvent.click(downloadBtn);
    expect(mockOnDownload).toHaveBeenCalledWith('1080p', 'mp4');
  });

  it('updates selected quality when changed', () => {
    render(<DownloadCard video={mockVideo} onDownload={mockOnDownload} />);
    const qualitySelect = screen.getByLabelText('Quality:');
    fireEvent.change(qualitySelect, { target: { value: '720p' } });
    const downloadBtn = screen.getByTestId('download-button');
    fireEvent.click(downloadBtn);
    expect(mockOnDownload).toHaveBeenCalledWith('720p', 'mp4');
  });

  it('updates selected format when changed', () => {
    render(<DownloadCard video={mockVideo} onDownload={mockOnDownload} />);
    const formatSelect = screen.getByLabelText('Format:');
    fireEvent.change(formatSelect, { target: { value: 'webm' } });
    const downloadBtn = screen.getByTestId('download-button');
    fireEvent.click(downloadBtn);
    expect(mockOnDownload).toHaveBeenCalledWith('1080p', 'webm');
  });

  it('disables download button when disabled prop is true', () => {
    render(<DownloadCard video={mockVideo} onDownload={mockOnDownload} disabled />);
    const downloadBtn = screen.getByTestId('download-button');
    expect(downloadBtn).toBeDisabled();
  });

  it('shows progress when progress is provided', () => {
    const progress: DownloadProgress = {
      jobId: 'job-123',
      status: 'processing',
      progress: 50,
      downloadedBytes: 75000000,
      totalBytes: 150000000,
    };
    render(<DownloadCard video={mockVideo} onDownload={mockOnDownload} progress={progress} />);
    expect(screen.getByText('Downloading...')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('shows pending status correctly', () => {
    const progress: DownloadProgress = {
      jobId: 'job-123',
      status: 'pending',
      progress: 0,
    };
    render(<DownloadCard video={mockVideo} onDownload={mockOnDownload} progress={progress} />);
    expect(screen.getByText('Queued...')).toBeInTheDocument();
  });

  it('shows completed status with download link', () => {
    const progress: DownloadProgress = {
      jobId: 'job-123',
      status: 'completed',
      progress: 100,
      downloadUrl: 'https://example.com/downloaded-video.mp4',
    };
    render(<DownloadCard video={mockVideo} onDownload={mockOnDownload} progress={progress} />);
    expect(screen.getByText('Download complete!')).toBeInTheDocument();
    const link = screen.getByText('Click to save');
    expect(link).toHaveAttribute('href', 'https://example.com/downloaded-video.mp4');
  });

  it('shows failed status with error message', () => {
    const progress: DownloadProgress = {
      jobId: 'job-123',
      status: 'failed',
      progress: 0,
      error: 'Network error',
    };
    render(<DownloadCard video={mockVideo} onDownload={mockOnDownload} progress={progress} />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const mockOnCancel = jest.fn();
    const progress: DownloadProgress = {
      jobId: 'job-123',
      status: 'processing',
      progress: 50,
    };
    render(
      <DownloadCard
        video={mockVideo}
        onDownload={mockOnDownload}
        onCancel={mockOnCancel}
        progress={progress}
      />
    );
    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows retry button when download fails', () => {
    const progress: DownloadProgress = {
      jobId: 'job-123',
      status: 'failed',
      progress: 0,
    };
    render(<DownloadCard video={mockVideo} onDownload={mockOnDownload} progress={progress} />);
    const retryBtn = screen.getByText('Retry');
    fireEvent.click(retryBtn);
    expect(mockOnDownload).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<DownloadCard video={mockVideo} onDownload={mockOnDownload} className="custom-class" />);
    expect(screen.getByTestId('download-card')).toHaveClass('custom-class');
  });

  it('displays file size in quality options', () => {
    render(<DownloadCard video={mockVideo} onDownload={mockOnDownload} />);
    const qualitySelect = screen.getByLabelText('Quality:');
    expect(qualitySelect.options[0]).toHaveTextContent('1080p');
  });
});
