export interface VideoQuality {
  resolution: string;
  format: string;
  url: string;
  fileSize?: number;
}

export interface VideoMetadata {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  duration: number;
  platform: string;
  author?: string;
  publishedAt?: string;
  qualities: VideoQuality[];
}

export interface DownloadOptions {
  quality?: string;
  format?: 'mp4' | 'webm' | 'audio';
  audioOnly?: boolean;
}

export interface DownloadProgress {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  downloadedBytes?: number;
  totalBytes?: number;
  error?: string;
  downloadUrl?: string;
}
