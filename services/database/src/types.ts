export interface DownloadRecord {
  id: string;
  url: string;
  platform: string;
  title: string;
  quality: string;
  format: string;
  status: 'pending' | 'completed' | 'failed';
  file_path?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface DownloadStats {
  total_downloads: number;
  completed_downloads: number;
  failed_downloads: number;
  by_platform: Record<string, number>;
}

export interface DatabaseService {
  initialize(): void;
  createDownload(record: Omit<DownloadRecord, 'id' | 'created_at'>): DownloadRecord;
  getDownload(id: string): DownloadRecord | null;
  getDownloads(limit?: number, offset?: number): DownloadRecord[];
  updateDownloadStatus(
    id: string,
    status: DownloadRecord['status'],
    filePath?: string,
    errorMessage?: string
  ): void;
  deleteDownload(id: string): void;
  getStats(): DownloadStats;
  close(): void;
}

export interface DatabaseConfig {
  path: string;
}
