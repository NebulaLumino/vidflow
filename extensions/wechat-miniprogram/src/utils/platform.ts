/**
 * VidFlow WeChat Mini Program
 * Platform Detection Utilities
 */

/** Supported platforms */
export type VideoPlatform =
  | 'youtube'
  | 'tiktok'
  | 'instagram'
  | 'twitter'
  | 'facebook'
  | 'vimeo'
  | 'twitch'
  | 'reddit'
  | 'dailymotion'
  | 'bilibili';

/** Platform detection patterns */
const platformPatterns: Record<VideoPlatform, RegExp[]> = {
  youtube: [
    /youtube\.com\/watch/i,
    /youtu\.be\//i,
    /youtube\.com\/shorts\//i,
    /youtube\.com\/embed\//i,
  ],
  tiktok: [/tiktok\.com\/@[\w-]+\/video\/\d+/i, /tiktok\.com\/v\/\d+/i],
  instagram: [/instagram\.com\/reel\//i, /instagram\.com\/p\//i, /instagram\.com\/tv\//i],
  twitter: [/twitter\.com\/\w+\/status\/\d+/i, /x\.com\/\w+\/status\/\d+/i],
  facebook: [/facebook\.com\/\w+\/videos\/\d+/i, /fb\.watch\//i, /facebook\.com\/watch\/?\?v=\d+/i],
  vimeo: [/vimeo\.com\/\d+/i, /player\.vimeo\.com\/video\/\d+/i],
  twitch: [/twitch\.tv\/\w+\/videos\/\d+/i, /twitch\.tv\/\w+(?:\/\w+)?/i, /clips\.twitch\.tv\//i],
  reddit: [/reddit\.com\/r\/\w+\/comments\/\w+/i, /reddit\.com\/video\/\w+/i],
  dailymotion: [/dailymotion\.com\/video\/\w+/i],
  bilibili: [/bilibili\.com\/video\/\w+/i, /b23\.tv\//i, /bilibili\.com\/shorts\/\w+/i],
};

/**
 * Detect platform from URL
 */
export function detectPlatform(url: string): VideoPlatform | null {
  for (const [platform, patterns] of Object.entries(platformPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(url)) {
        return platform as VideoPlatform;
      }
    }
  }
  return null;
}

/**
 * Get platform display name
 */
export function getPlatformName(platform: VideoPlatform): string {
  const names: Record<VideoPlatform, string> = {
    youtube: 'YouTube',
    tiktok: 'TikTok',
    instagram: 'Instagram',
    twitter: 'Twitter',
    facebook: 'Facebook',
    vimeo: 'Vimeo',
    twitch: 'Twitch',
    reddit: 'Reddit',
    dailymotion: 'Dailymotion',
    bilibili: 'Bilibili',
  };
  return names[platform] || platform;
}

/**
 * Get platform color
 */
export function getPlatformColor(platform: VideoPlatform): string {
  const colors: Record<VideoPlatform, string> = {
    youtube: '#FF0000',
    tiktok: '#000000',
    instagram: '#E4405F',
    twitter: '#1DA1F2',
    facebook: '#1877F2',
    vimeo: '#1AB7EA',
    twitch: '#9146FF',
    reddit: '#FF4500',
    dailymotion: '#0066CC',
    bilibili: '#00A1D6',
  };
  return colors[platform] || '#666666';
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
