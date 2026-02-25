import { defineConfig } from 'wxt';

export default defineConfig({
  title: 'VidFlow',
  description: 'Download videos from any website',
  version: '1.0.0',
  manifest: {
    name: 'VidFlow',
    short_name: 'VidFlow',
    description: 'Download videos from any website',
    permissions: [
      'activeTab',
      'storage',
      'tabs',
    ],
    host_permissions: [
      '*://*.youtube.com/*',
      '*://*.tiktok.com/*',
      '*://*.instagram.com/*',
      '*://*.twitter.com/*',
      '*://*.facebook.com/*',
      '*://*.vimeo.com/*',
      '*://localhost/*',
    ],
    action: {
      default_popup: 'popup/index.html',
      default_icon: {
        16: '/icons/icon16.png',
        32: '/icons/icon32.png',
        48: '/icons/icon48.png',
        128: '/icons/icon128.png',
      },
    },
    icons: {
      16: '/icons/icon16.png',
      32: '/icons/icon32.png',
      48: '/icons/icon48.png',
      128: '/icons/icon128.png',
    },
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
  },
});
