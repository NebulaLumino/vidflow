import { JSONDatabase } from '../index';
import * as fs from 'fs';
import * as path from 'path';

describe('JSONDatabase', () => {
  const testDbPath = path.join(__dirname, 'test.json');
  let db: JSONDatabase;

  beforeEach(() => {
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    db = new JSONDatabase({ path: testDbPath });
    db.initialize();
  });

  afterEach(() => {
    db.close();
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('createDownload', () => {
    it('should create a new download record', () => {
      const record = {
        url: 'https://youtube.com/watch?v=test',
        platform: 'youtube',
        title: 'Test Video',
        quality: '1080p',
        format: 'mp4',
        status: 'pending' as const,
      };

      const result = db.createDownload(record);

      expect(result.id).toBeDefined();
      expect(result.url).toBe(record.url);
      expect(result.platform).toBe(record.platform);
      expect(result.title).toBe(record.title);
      expect(result.quality).toBe(record.quality);
      expect(result.format).toBe(record.format);
      expect(result.status).toBe(record.status);
      expect(result.created_at).toBeDefined();
    });

    it('should generate a unique ID for each download', () => {
      const record = {
        url: 'https://youtube.com/watch?v=test',
        platform: 'youtube',
        title: 'Test Video',
        quality: '1080p',
        format: 'mp4',
        status: 'pending' as const,
      };

      const result1 = db.createDownload(record);
      const result2 = db.createDownload(record);

      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('getDownload', () => {
    it('should retrieve a download by ID', () => {
      const created = db.createDownload({
        url: 'https://youtube.com/watch?v=test',
        platform: 'youtube',
        title: 'Test Video',
        quality: '1080p',
        format: 'mp4',
        status: 'pending' as const,
      });

      const result = db.getDownload(created.id);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(created.id);
      expect(result?.title).toBe('Test Video');
    });

    it('should return null for non-existent ID', () => {
      const result = db.getDownload('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getDownloads', () => {
    it('should return downloads in descending order by created_at', () => {
      // Create multiple downloads
      db.createDownload({
        url: 'https://youtube.com/watch?v=first',
        platform: 'youtube',
        title: 'First Video',
        quality: '1080p',
        format: 'mp4',
        status: 'pending' as const,
      });

      db.createDownload({
        url: 'https://youtube.com/watch?v=second',
        platform: 'youtube',
        title: 'Second Video',
        quality: '720p',
        format: 'mp4',
        status: 'pending' as const,
      });

      const results = db.getDownloads();

      expect(results.length).toBe(2);
      expect(results[0].title).toBe('Second Video');
      expect(results[1].title).toBe('First Video');
    });

    it('should respect limit and offset', () => {
      // Create 5 downloads
      for (let i = 0; i < 5; i++) {
        db.createDownload({
          url: `https://youtube.com/watch?v=${i}`,
          platform: 'youtube',
          title: `Video ${i}`,
          quality: '1080p',
          format: 'mp4',
          status: 'pending' as const,
        });
      }

      const limited = db.getDownloads(2, 0);
      expect(limited.length).toBe(2);

      const offset = db.getDownloads(2, 2);
      expect(offset.length).toBe(2);
    });
  });

  describe('updateDownloadStatus', () => {
    it('should update download status to completed', () => {
      const created = db.createDownload({
        url: 'https://youtube.com/watch?v=test',
        platform: 'youtube',
        title: 'Test Video',
        quality: '1080p',
        format: 'mp4',
        status: 'pending' as const,
      });

      db.updateDownloadStatus(created.id, 'completed', '/path/to/file.mp4');

      const updated = db.getDownload(created.id);
      expect(updated?.status).toBe('completed');
      expect(updated?.file_path).toBe('/path/to/file.mp4');
      expect(updated?.completed_at).toBeDefined();
    });

    it('should update download status to failed with error message', () => {
      const created = db.createDownload({
        url: 'https://youtube.com/watch?v=test',
        platform: 'youtube',
        title: 'Test Video',
        quality: '1080p',
        format: 'mp4',
        status: 'pending' as const,
      });

      db.updateDownloadStatus(created.id, 'failed', undefined, 'Download failed');

      const updated = db.getDownload(created.id);
      expect(updated?.status).toBe('failed');
      expect(updated?.error_message).toBe('Download failed');
    });
  });

  describe('deleteDownload', () => {
    it('should delete a download record', () => {
      const created = db.createDownload({
        url: 'https://youtube.com/watch?v=test',
        platform: 'youtube',
        title: 'Test Video',
        quality: '1080p',
        format: 'mp4',
        status: 'pending' as const,
      });

      db.deleteDownload(created.id);

      const result = db.getDownload(created.id);
      expect(result).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      db.createDownload({
        url: 'https://youtube.com/watch?v=1',
        platform: 'youtube',
        title: 'Video 1',
        quality: '1080p',
        format: 'mp4',
        status: 'completed' as const,
      });

      db.createDownload({
        url: 'https://youtube.com/watch?v=2',
        platform: 'youtube',
        title: 'Video 2',
        quality: '720p',
        format: 'mp4',
        status: 'completed' as const,
      });

      db.createDownload({
        url: 'https://tiktok.com/video/3',
        platform: 'tiktok',
        title: 'Video 3',
        quality: '1080p',
        format: 'mp4',
        status: 'failed' as const,
      });

      const stats = db.getStats();

      expect(stats.total_downloads).toBe(3);
      expect(stats.completed_downloads).toBe(2);
      expect(stats.failed_downloads).toBe(1);
      expect(stats.by_platform.youtube).toBe(2);
      expect(stats.by_platform.tiktok).toBe(1);
    });
  });
});
