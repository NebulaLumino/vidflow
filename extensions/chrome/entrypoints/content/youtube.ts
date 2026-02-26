/**
 * VidFlow Chrome Extension - Content Script
 * Injected into web pages to detect and extract video information
 */

// Supported platforms
const _PLATFORM_SELECTORS: Record<string, { container: string; title: string; duration: string }> =
  {
    youtube: {
      container: 'ytd-watch-flexy, ytd-player',
      title: 'h1.ytd-video-primary-info-renderer, h1.title',
      duration: '.ytp-time-duration, .ytd-video-primary-info-renderer .date',
    },
    tiktok: {
      container: '[data-e2e="browse-video"], .tiktok-web-player',
      title: '[data-e2e="video-description"], h1',
      duration: '.tiktok-video-duration',
    },
    instagram: {
      container: 'article video, .x1lliihq',
      title: 'h1, .x1lliihq',
      duration: '.x1n2onr6',
    },
    twitter: {
      container: '.video-player, [data-testid="videoPlayer"]',
      title: '[data-testid="tweetText"], h1',
      duration: '.video-playing',
    },
    facebook: {
      container: '[data-pagelet="VideoPlayer"]',
      title: 'h1, [data-pagelet="VideoPlayer"] span',
      duration: '.fbVideoTimer',
    },
    vimeo: {
      container: '.vp-video-wrapper, .player',
      title: '.vp-title h1',
      duration: '.vp-duration',
    },
  };

/**
 * Detect which platform the current page is
 */
function detectPlatform(): string | null {
  const url = window.location.href;

  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
  if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook';
  if (url.includes('vimeo.com')) return 'vimeo';

  return null;
}

/**
 * Extract video information from the page
 */
function extractVideoInfo(): { url: string; title: string; duration?: number } | null {
  const platform = detectPlatform();
  if (!platform) return null;

  const url = window.location.href;
  let title = document.title || 'Video';

  // Try to get a more specific title
  try {
    if (platform === 'youtube') {
      const titleEl = document.querySelector('h1.ytd-video-primary-info-renderer, h1.title');
      if (titleEl) title = titleEl.textContent || title;
    }
  } catch (e) {
    // Fallback to document title
  }

  return {
    url,
    title: title.trim(),
  };
}

/**
 * Listen for messages from the popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getVideoInfo') {
    const videoInfo = extractVideoInfo();
    sendResponse(videoInfo);
  }
  return true;
});

// Notify that content script is loaded
console.log('VidFlow content script loaded');
