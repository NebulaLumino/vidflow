import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService, DownloadRecord, DownloadStats, DatabaseConfig } from './types';

interface DatabaseStore {
  downloads: DownloadRecord[];
}

export class JSONDatabase implements DatabaseService {
  private dbPath: string;
  private store: DatabaseStore;

  constructor(config: DatabaseConfig) {
    this.dbPath = config.path;
    this.store = { downloads: [] };
  }

  initialize(): void {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(this.dbPath)) {
      const data = fs.readFileSync(this.dbPath, 'utf-8');
      this.store = JSON.parse(data);
    } else {
      this.save();
    }
  }

  private save(): void {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.store, null, 2));
  }

  createDownload(record: Omit<DownloadRecord, 'id' | 'created_at'>): DownloadRecord {
    const id = uuidv4();
    const created_at = new Date().toISOString();

    const newRecord: DownloadRecord = {
      id,
      ...record,
      created_at,
    };

    this.store.downloads.unshift(newRecord);
    this.save();

    return newRecord;
  }

  getDownload(id: string): DownloadRecord | null {
    return this.store.downloads.find((d) => d.id === id) || null;
  }

  getDownloads(limit = 50, offset = 0): DownloadRecord[] {
    return this.store.downloads.slice(offset, offset + limit);
  }

  updateDownloadStatus(
    id: string,
    status: DownloadRecord['status'],
    filePath?: string,
    errorMessage?: string
  ): void {
    const index = this.store.downloads.findIndex((d) => d.id === id);
    if (index !== -1) {
      this.store.downloads[index].status = status;
      if (filePath) {
        this.store.downloads[index].file_path = filePath;
      }
      if (errorMessage) {
        this.store.downloads[index].error_message = errorMessage;
      }
      if (status === 'completed' || status === 'failed') {
        this.store.downloads[index].completed_at = new Date().toISOString();
      }
      this.save();
    }
  }

  deleteDownload(id: string): void {
    const index = this.store.downloads.findIndex((d) => d.id === id);
    if (index !== -1) {
      this.store.downloads.splice(index, 1);
      this.save();
    }
  }

  getStats(): DownloadStats {
    const completed_downloads = this.store.downloads.filter((d) => d.status === 'completed').length;
    const failed_downloads = this.store.downloads.filter((d) => d.status === 'failed').length;

    const by_platform: Record<string, number> = {};
    for (const download of this.store.downloads) {
      by_platform[download.platform] = (by_platform[download.platform] || 0) + 1;
    }

    return {
      total_downloads: this.store.downloads.length,
      completed_downloads,
      failed_downloads,
      by_platform,
    };
  }

  close(): void {
    // No-op for JSON database
  }
}

export function createDatabase(config: DatabaseConfig): DatabaseService {
  const db = new JSONDatabase(config);
  db.initialize();
  return db;
}
