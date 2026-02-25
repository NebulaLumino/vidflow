import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VidFlow - Download Videos from Any Site',
  description:
    'Free, fast, and reliable video downloader for YouTube, TikTok, Instagram, Twitter, Facebook, and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
