/**
 * VidFlow WeChat Mini Program
 * Download Page - Video download screen
 */

import { detectPlatform, getPlatformName, getPlatformColor } from '../../utils/platform';
import { Analytics } from '../../utils/analytics';
import { VideoApi, type VideoMetadata, type DownloadResult } from '../../utils/api';

Page({
  data: {
    url: '',
    platform: '' as string,
    videoInfo: null as VideoMetadata | null,
    loading: true,
    downloading: false,
    downloadProgress: 0,
    downloadStatus: '' as string,
    downloadResult: null as DownloadResult | null,
    formats: [] as string[],
    selectedFormat: '',
    qualities: ['highest', '1080p', '720p', '480p', '360p'],
    selectedQuality: 'highest',
    error: '',
  },

  onLoad(options: any) {
    const url = decodeURIComponent(options.url || '');
    const platform = options.platform || detectPlatform(url) || '';

    this.setData({ url, platform });

    // Track page view
    Analytics.trackEvent('page_view', {
      page: 'download',
      platform,
    });

    // Fetch video info
    this.fetchVideoInfo(url, platform);
  },

  async fetchVideoInfo(url: string, platform: string) {
    this.setData({ loading: true, error: '' });

    try {
      const videoInfo = await VideoApi.parseVideo(url);

      const formats = videoInfo.formats.map((f) => `${f.quality} (${f.ext})`);

      this.setData({
        videoInfo,
        formats,
        selectedFormat: formats[0] || '',
        loading: false,
      });

      // Track video info fetched
      Analytics.trackEvent('video_search', {
        platform,
        title: videoInfo.title,
      });
    } catch (error) {
      this.setData({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch video info',
      });
    }
  },

  onQualityChange(e: WechatMiniprogram.PickerChangeEvent) {
    const index = e.detail.value;
    this.setData({
      selectedQuality: this.data.qualities[index],
    });

    Analytics.trackEvent('quality_changed', {
      quality: this.data.qualities[index],
    });
  },

  onFormatChange(e: WechatMiniprogram.PickerChangeEvent) {
    const index = e.detail.value;
    this.setData({
      selectedFormat: this.data.formats[index],
    });

    Analytics.trackEvent('format_changed', {
      format: this.data.selectedFormat,
    });
  },

  async onStartDownload() {
    if (!this.data.videoInfo) return;

    this.setData({
      downloading: true,
      downloadProgress: 0,
      downloadStatus: 'starting',
      error: '',
    });

    try {
      const app = getApp<any>();
      const quality = this.data.selectedQuality;
      const format = this.data.videoInfo.formats[0]?.ext || 'mp4';

      // Track download started
      Analytics.trackEvent('download_started', {
        platform: this.data.platform,
        quality,
        format,
        title: this.data.videoInfo.title,
      });

      const result = await VideoApi.startDownload({
        url: this.data.url,
        platform: this.data.platform as any,
        quality,
        format,
      });

      this.setData({
        downloadStatus: result.status,
        downloadResult: result,
      });

      // Save to history
      VideoApi.saveToHistory(result);

      // Start polling for status
      this.pollDownloadStatus(result.id);
    } catch (error) {
      this.setData({
        downloading: false,
        error: error instanceof Error ? error.message : 'Failed to start download',
      });

      Analytics.trackEvent('download_failed', {
        platform: this.data.platform,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async pollDownloadStatus(downloadId: string) {
    const poll = async () => {
      try {
        const result = await VideoApi.getDownloadStatus(downloadId);

        this.setData({
          downloadStatus: result.status,
          downloadResult: result,
        });

        if (result.status === 'completed') {
          this.setData({ downloading: false });

          Analytics.trackEvent('download_completed', {
            platform: this.data.platform,
            duration: Date.now() - (result as any).startedAt,
          });
        } else if (result.status === 'failed') {
          this.setData({
            downloading: false,
            error: result.error || 'Download failed',
          });

          Analytics.trackEvent('download_failed', {
            platform: this.data.platform,
            error: result.error,
          });
        } else if (this.data.downloading) {
          // Continue polling
          setTimeout(poll, 2000);
        }
      } catch (error) {
        console.error('Poll error:', error);
        if (this.data.downloading) {
          setTimeout(poll, 2000);
        }
      }
    };

    poll();
  },

  async onCancelDownload() {
    if (!this.data.downloadResult?.id) return;

    try {
      await VideoApi.cancelDownload(this.data.downloadResult.id);

      this.setData({
        downloading: false,
        downloadStatus: 'cancelled',
      });

      Analytics.trackEvent('download_cancelled', {
        platform: this.data.platform,
      });
    } catch (error) {
      wx.showToast({
        title: 'Failed to cancel',
        icon: 'none',
      });
    }
  },

  onSaveToGallery() {
    if (!this.data.downloadResult?.filePath) return;

    wx.saveVideoToPhotosAlbum({
      filePath: this.data.downloadResult.filePath,
      success: () => {
        wx.showToast({
          title: 'Saved to gallery',
          icon: 'success',
        });
      },
      fail: (error) => {
        wx.showToast({
          title: 'Failed to save',
          icon: 'none',
        });
      },
    });
  },

  onShareAppMessage() {
    const videoInfo = this.data.videoInfo;
    return {
      title: videoInfo?.title || 'VidFlow Video',
      path: `/pages/index/index?url=${encodeURIComponent(this.data.url)}`,
    };
  },
});
