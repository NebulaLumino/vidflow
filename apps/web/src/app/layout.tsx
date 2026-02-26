import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VidFlow - Download Videos from Any Site',
  description:
    'Free, fast, and reliable video downloader for YouTube, TikTok, Instagram, Twitter, Facebook, Vimeo, Twitch, Reddit, Dailymotion, and more. Download videos in HD quality.',
  keywords: [
    'video downloader',
    'download youtube videos',
    'download tiktok videos',
    'download instagram videos',
    'download twitter videos',
    'download facebook videos',
    'download vimeo videos',
    'download twitch videos',
    'download reddit videos',
    'download dailymotion videos',
    'download bilibili videos',
    'free video downloader',
    'online video downloader',
    'video converter',
    'mp4 downloader',
  ],
  openGraph: {
    title: 'VidFlow - Download Videos from Any Site',
    description:
      'Free, fast, and reliable video downloader for YouTube, TikTok, Instagram, Twitter, Facebook, and more.',
    type: 'website',
    locale: 'en_US',
    siteName: 'VidFlow',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VidFlow - Download Videos from Any Site',
    description:
      'Free, fast, and reliable video downloader for YouTube, TikTok, Instagram, Twitter, Facebook, and more.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
