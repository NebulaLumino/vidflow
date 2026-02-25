/**
 * VidFlow Chrome Extension - Popup Script
 * Handles the popup UI interactions and communicates with the content script
 */

// API endpoint for the parser service
const API_BASE = 'http://localhost:8000';

// Platform detection patterns
const PLATFORM_PATTERNS: Record<string, RegExp> = {
  youtube: /youtube\.com|youtu\.be/,
  tiktok: /tiktok\.com/,
  instagram: /instagram\.com/,
  twitter: /twitter\.com|x\.com/,
  facebook: /facebook\.com|fb\.watch/,
  vimeo: /vimeo\.com/,
};

interface VideoInfo {
  url: string;
  title: string;
  platform: string;
  duration?: number;
}

interface VideoData {
  video?: {
    url: string;
    title: string;
    platform: string;
    duration?: number;
    thumbnail?: string;
  };
}

// DOM Elements
const noVideoEl = document.getElementById('noVideo') as HTMLDivElement;
const videoPanelEl = document.getElementById('videoPanel') as HTMLDivElement;
const videoTitleEl = document.getElementById('videoTitle') as HTMLDivElement;
const platformBadgeEl = document.getElementById('platformBadge') as HTMLSpanElement;
const videoDurationEl = document.getElementById('videoDuration') as HTMLSpanElement;
const qualitySelectEl = document.getElementById('qualitySelect') as HTMLSelectElement;
const downloadBtnEl = document.getElementById('downloadBtn') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLDivElement;

/**
 * Get the current active tab
 */
async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

/**
 * Detect platform from URL
 */
function detectPlatform(url: string): string {
  for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
    if (pattern.test(url)) {
      return platform;
    }
  }
  return 'unknown';
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Show video panel with video information
 */
function showVideoPanel(videoInfo: VideoInfo): void {
  noVideoEl.style.display = 'none';
  videoPanelEl.style.display = 'block';

  videoTitleEl.textContent = videoInfo.title;
  platformBadgeEl.textContent = videoInfo.platform.toUpperCase();

  if (videoInfo.duration) {
    videoDurationEl.textContent = formatDuration(videoInfo.duration);
  } else {
    videoDurationEl.textContent = '--:--';
  }
}

/**
 * Show no video message
 */
function showNoVideo(): void {
  noVideoEl.style.display = 'block';
  videoPanelEl.style.display = 'none';
}

/**
 * Update status message
 */
function updateStatus(message: string, type: 'info' | 'success' | 'error' = 'info'): void {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

/**
 * Parse video using the backend API
 */
async function parseVideo(url: string): Promise<VideoInfo | undefined> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = (await response.json()) as VideoData;
    return data.data?.video;
  } catch (error) {
    console.error('Parse error:', error);
    throw error;
  }
}

/**
 * Download video using the backend API
 */
async function downloadVideo(url: string, quality: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, quality, format: 'mp4' }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

/**
 * Initialize the popup
 */
async function init(): Promise<void> {
  try {
    const tab = await getActiveTab();

    if (!tab?.url) {
      showNoVideo();
      return;
    }

    const url = tab.url;
    const platform = detectPlatform(url);

    if (platform === 'unknown') {
      showNoVideo();
      return;
    }

    // Show loading state
    noVideoEl.style.display = 'none';
    videoPanelEl.style.display = 'block';
    videoTitleEl.textContent = 'Loading...';
    updateStatus('Fetching video info...', 'info');

    try {
      // Try to get video info from content script first
      const [response] = await chrome.tabs.sendMessage(tab.id!, { action: 'getVideoInfo' });

      if (response && response.url) {
        showVideoPanel({
          url: response.url,
          title: response.title || tab.title || 'Unknown Video',
          platform,
          duration: response.duration,
        });
        updateStatus('', 'info');
      } else {
        // Fall back to API call
        const videoInfo = await parseVideo(url);

        if (videoInfo) {
          showVideoPanel({
            url,
            title: videoInfo.title,
            platform,
            duration: videoInfo.duration,
          });
          updateStatus('', 'info');
        } else {
          showNoVideo();
        }
      }
    } catch (error) {
      // Content script might not be loaded, try API
      try {
        const videoInfo = await parseVideo(url);

        if (videoInfo) {
          showVideoPanel({
            url,
            title: videoInfo.title,
            platform,
            duration: videoInfo.duration,
          });
          updateStatus('', 'info');
        } else {
          showNoVideo();
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        // Show basic info from the page
        showVideoPanel({
          url,
          title: tab.title || 'Video',
          platform,
        });
        updateStatus('Could not fetch full details', 'error');
      }
    }
  } catch (error) {
    console.error('Init error:', error);
    showNoVideo();
  }
}

// Event Listeners
downloadBtnEl.addEventListener('click', async () => {
  const tab = await getActiveTab();
  if (!tab?.url) return;

  const url = tab.url;
  const quality = qualitySelectEl.value;

  downloadBtnEl.disabled = true;
  updateStatus('Starting download...', 'info');

  try {
    await downloadVideo(url, quality);
    updateStatus('Download started! Check your downloads folder.', 'success');
  } catch (error) {
    updateStatus('Failed to start download', 'error');
  } finally {
    downloadBtnEl.disabled = false;
  }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
