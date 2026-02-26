/**
 * VidFlow WeChat Mini Program
 * Index Page - Home/Main Screen
 */

import { detectPlatform } from '../../utils/platform';
import { Analytics } from '../../utils/analytics';
import { VideoApi } from '../../utils/api';

Page({
  data: {
    url: '',
    loading: false,
    recentPlatforms: [] as string[],
    supportedPlatforms: [
      { name: 'YouTube', icon: 'youtube', key: 'youtube' },
      { name: 'TikTok', icon: 'tiktok', key: 'tiktok' },
      { name: 'Instagram', icon: 'instagram', key: 'instagram' },
      { name: 'Twitter', icon: 'twitter', key: 'twitter' },
      { name: 'Facebook', icon: 'facebook', key: 'facebook' },
      { name: 'Vimeo', icon: 'vimeo', key: 'vimeo' },
      { name: 'Twitch', icon: 'twitch', key: 'twitch' },
      { name: 'Reddit', icon: 'reddit', key: 'reddit' },
    ],
    showQualityPicker: false,
    qualities: ['highest', '1080p', '720p', '480p', '360p'],
    selectedQuality: 'highest',
  },

  onLoad() {
    // Track page view
    Analytics.trackEvent('page_view', {
      page: 'index',
    });

    // Load recent platforms from storage
    this.loadRecentPlatforms();
  },

  onShow() {
    // Track page show
    Analytics.trackEvent('page_shown', {
      page: 'index',
    });
  },

  loadRecentPlatforms() {
    try {
      const recent = wx.getStorageSync('recentPlatforms') || [];
      this.setData({ recentPlatforms: recent });
    } catch (error) {
      console.error('Failed to load recent platforms:', error);
    }
  },

  onInputUrl(e: WechatMiniprogram.InputEvent) {
    this.setData({
      url: e.detail.value,
    });
  },

  async onPaste() {
    try {
      const res = await wx.getClipboardData();
      if (res.data) {
        this.setData({ url: res.data });
        wx.showToast({
          title: 'URL pasted',
          icon: 'success',
        });
      }
    } catch (error) {
      wx.showToast({
        title: 'Failed to paste',
        icon: 'error',
      });
    }
  },

  async onFetchInfo() {
    const url = this.data.url.trim();
    if (!url) {
      wx.showToast({
        title: 'Please enter URL',
        icon: 'none',
      });
      return;
    }

    this.setData({ loading: true });

    try {
      // Detect platform
      const platform = detectPlatform(url);
      if (!platform) {
        throw new Error('Unsupported platform');
      }

      // Track platform selected
      Analytics.trackEvent('platform_selected', {
        platform,
        url,
      });

      // Save to recent platforms
      this.saveRecentPlatform(platform);

      // Navigate to download page with video info
      wx.navigateTo({
        url: `/pages/download/download?url=${encodeURIComponent(url)}&platform=${platform}`,
      });
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : 'Failed to fetch video info',
        icon: 'none',
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  saveRecentPlatform(platform: string) {
    try {
      let recent = wx.getStorageSync('recentPlatforms') || [];
      recent = [platform, ...recent.filter((p: string) => p !== platform)].slice(0, 5);
      wx.setStorageSync('recentPlatforms', recent);
      this.setData({ recentPlatforms: recent });
    } catch (error) {
      console.error('Failed to save recent platform:', error);
    }
  },

  onSelectPlatform(e: WechatMiniprogram.TapEvent) {
    const platform = e.currentTarget.dataset.platform;
    // Could show platform-specific URL input or help
    wx.showModal({
      title: platform.charAt(0).toUpperCase() + platform.slice(1),
      content: `Paste a ${platform} video URL to download`,
      showCancel: false,
    });
  },

  onSelectQuality() {
    this.setData({ showQualityPicker: true });
  },

  onQualityChange(e: WechatMiniprogram.PickerChangeEvent) {
    const index = e.detail.value;
    this.setData({
      selectedQuality: this.data.qualities[index],
    });
  },

  onQualityConfirm() {
    const app = getApp<any>();
    app.saveUserConfig({ defaultQuality: this.data.selectedQuality });
    this.setData({ showQualityPicker: false });
    wx.showToast({
      title: 'Quality saved',
      icon: 'success',
    });
  },

  onQualityCancel() {
    this.setData({ showQualityPicker: false });
  },
});
