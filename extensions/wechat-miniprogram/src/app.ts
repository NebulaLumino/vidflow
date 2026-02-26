/**
 * VidFlow WeChat Mini Program
 * App Entry
 */

import { Analytics } from '../utils/analytics';

App<IAppOption>({
  globalData: {
    userInfo: null,
    apiBaseUrl: 'https://api.vidflow.io',
    apiKey: '',
    config: {
      defaultQuality: 'highest',
      defaultFormat: 'mp4',
      enableNotifications: true,
      enableAutoRetry: true,
      maxRetries: 3,
    },
  },

  onLaunch() {
    // Track app launch
    Analytics.trackEvent('app_opened', {
      platform: 'wechat',
      version: wx.getAccountInfoSync?.().miniProgram?.version || '1.0.0',
    });

    // Check for updates
    this.checkForUpdates();

    // Load user config from storage
    this.loadUserConfig();
  },

  onShow(options) {
    // Track app show
    Analytics.trackEvent('app_shown', {
      scene: options?.scene,
    });
  },

  onHide() {
    // Track app hide
    Analytics.trackEvent('app_hidden');
  },

  onError(error) {
    // Track errors
    Analytics.trackEvent('app_error', {
      message: error?.message || String(error),
      stack: error?.stack,
    });
  },

  checkForUpdates() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();

      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          console.log('[Update] New version available');
        }
      });

      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: 'Update Available',
          content: 'A new version is ready. Restart to update?',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          },
        });
      });

      updateManager.onUpdateFailed(() => {
        wx.showModal({
          title: 'Update Failed',
          content: 'Failed to download new version. Please try again later.',
          showCancel: false,
        });
      });
    }
  },

  loadUserConfig() {
    try {
      const config = wx.getStorageSync('userConfig');
      if (config) {
        this.globalData.config = { ...this.globalData.config, ...config };
      }

      const apiKey = wx.getStorageSync('apiKey');
      if (apiKey) {
        this.globalData.apiKey = apiKey;
      }
    } catch (error) {
      console.error('Failed to load user config:', error);
    }
  },

  saveUserConfig(config: Record<string, unknown>) {
    try {
      this.globalData.config = { ...this.globalData.config, ...config };
      wx.setStorageSync('userConfig', this.globalData.config);
    } catch (error) {
      console.error('Failed to save user config:', error);
    }
  },

  setApiKey(apiKey: string) {
    this.globalData.apiKey = apiKey;
    wx.setStorageSync('apiKey', apiKey);
  },

  getApiKey(): string {
    return this.globalData.apiKey;
  },
});
