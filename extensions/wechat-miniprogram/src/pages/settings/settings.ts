/**
 * VidFlow WeChat Mini Program
 * Settings Page - App settings
 */

import { Analytics, isAnalyticsEnabled, setAnalyticsEnabled } from '../../utils/analytics';
import { VideoApi } from '../../utils/api';

Page({
  data: {
    analyticsEnabled: true,
    defaultQuality: 'highest',
    defaultFormat: 'mp4',
    qualities: ['highest', '1080p', '720p', '480p', '360p'],
    formats: ['mp4', 'webm', 'audio'],
    showQualityPicker: false,
    showFormatPicker: false,
    apiKey: '',
    version: '1.0.0',
  },

  onLoad() {
    // Track page view
    Analytics.trackEvent('page_view', {
      page: 'settings',
    });

    // Load settings
    this.loadSettings();
  },

  loadSettings() {
    try {
      const analyticsEnabled = wx.getStorageSync('analyticsEnabled');
      const defaultQuality = wx.getStorageSync('defaultQuality') || 'highest';
      const defaultFormat = wx.getStorageSync('defaultFormat') || 'mp4';
      const apiKey = wx.getStorageSync('apiKey') || '';

      this.setData({
        analyticsEnabled: analyticsEnabled !== false,
        defaultQuality,
        defaultFormat,
        apiKey,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },

  onToggleAnalytics(e: WechatMiniprogram.SwitchChangeEvent) {
    const enabled = e.detail.value;
    setAnalyticsEnabled(enabled);

    this.setData({ analyticsEnabled: enabled });

    Analytics.trackEvent('settings_changed', {
      setting: 'analytics',
      value: enabled,
    });
  },

  onSelectQuality() {
    this.setData({ showQualityPicker: true });
  },

  onQualityChange(e: WechatMiniprogram.PickerChangeEvent) {
    const index = e.detail.value;
    const quality = this.data.qualities[index];

    this.setData({ defaultQuality: quality });
    wx.setStorageSync('defaultQuality', quality);

    Analytics.trackEvent('settings_changed', {
      setting: 'defaultQuality',
      value: quality,
    });
  },

  onQualityCancel() {
    this.setData({ showQualityPicker: false });
  },

  onSelectFormat() {
    this.setData({ showFormatPicker: true });
  },

  onFormatChange(e: WechatMiniprogram.PickerChangeEvent) {
    const index = e.detail.value;
    const format = this.data.formats[index];

    this.setData({ defaultFormat: format });
    wx.setStorageSync('defaultFormat', format);

    Analytics.trackEvent('settings_changed', {
      setting: 'defaultFormat',
      value: format,
    });
  },

  onFormatCancel() {
    this.setData({ showFormatPicker: false });
  },

  onInputApiKey(e: WechatMiniprogram.InputEvent) {
    const apiKey = e.detail.value;
    this.setData({ apiKey });
  },

  onSaveApiKey() {
    wx.setStorageSync('apiKey', this.data.apiKey);
    wx.showToast({
      title: 'API key saved',
      icon: 'success',
    });

    Analytics.trackEvent('settings_changed', {
      setting: 'apiKey',
      value: 'updated',
    });
  },

  onClearCache() {
    wx.showModal({
      title: 'Clear Cache',
      content: 'Are you sure you want to clear all cached data?',
      success: (res) => {
        if (res.confirm) {
          try {
            // Clear analytics events
            wx.removeStorageSync('analytics_events');

            wx.showToast({
              title: 'Cache cleared',
              icon: 'success',
            });
          } catch (error) {
            wx.showToast({
              title: 'Failed to clear cache',
              icon: 'none',
            });
          }
        }
      },
    });
  },

  onClearHistory() {
    wx.showModal({
      title: 'Clear History',
      content: 'Are you sure you want to clear all download history?',
      success: (res) => {
        if (res.confirm) {
          VideoApi.clearLocalHistory();

          wx.showToast({
            title: 'History cleared',
            icon: 'success',
          });
        }
      },
    });
  },

  onShareAppMessage() {
    return {
      title: 'VidFlow - Video Downloader',
      path: '/pages/index/index',
    };
  },
});
