/**
 * VidFlow WeChat Mini Program
 * History Page - Download history
 */

import { VideoApi, type DownloadResult } from '../../utils/api';
import { Analytics } from '../../utils/analytics';

Page({
  data: {
    history: [] as (DownloadResult & { savedAt: number })[],
    loading: false,
    empty: true,
  },

  onLoad() {
    // Track page view
    Analytics.trackEvent('page_view', {
      page: 'history',
    });
  },

  onShow() {
    this.loadHistory();
  },

  loadHistory() {
    this.setData({ loading: true });

    try {
      const history = VideoApi.getLocalHistory();

      this.setData({
        history,
        empty: history.length === 0,
        loading: false,
      });
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({
        title: 'Failed to load history',
        icon: 'none',
      });
    }
  },

  onRefresh() {
    this.loadHistory();
    wx.stopPullDownRefresh();
  },

  onDeleteItem(e: WechatMiniprogram.TapEvent) {
    const index = e.currentTarget.dataset.index;

    wx.showModal({
      title: 'Delete',
      content: 'Are you sure you want to delete this item?',
      success: (res) => {
        if (res.confirm) {
          const history = [...this.data.history];
          history.splice(index, 1);

          this.setData({ history, empty: history.length === 0 });

          // Save to storage
          VideoApi.clearLocalHistory();
          history.forEach((item) => VideoApi.saveToHistory(item));
        }
      },
    });
  },

  onClearAll() {
    wx.showModal({
      title: 'Clear History',
      content: 'Are you sure you want to clear all history?',
      success: (res) => {
        if (res.confirm) {
          VideoApi.clearLocalHistory();
          this.setData({
            history: [],
            empty: true,
          });

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
