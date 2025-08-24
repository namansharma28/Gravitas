import type { Metadata } from 'next';
import localFont from 'next/font/local';

const inter = localFont({
  src: [
    {
      path: '../public/fonts/Inter-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
});

const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: {
    default: 'Gravitas - Community Event Platform',
    template: '%s | Gravitas'
  },
  description: 'Connect with communities, discover events, and engage with content. Join Gravitas to find and create meaningful community events.',
  keywords: ['community events', 'event management', 'social platform', 'community engagement', 'event discovery', 'community building'],
  authors: [{ name: 'Gravitas Team' }],
  creator: 'Gravitas',
  publisher: 'Gravitas',
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    title: 'Gravitas - Community Event Platform',
    description: 'Connect with communities, discover events, and engage with content. Join Gravitas to find and create meaningful community events.',
    siteName: 'Gravitas',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Gravitas - Community Event Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gravitas - Community Event Platform',
    description: 'Connect with communities, discover events, and engage with content. Join Gravitas to find and create meaningful community events.',
    images: [`${baseUrl}/og-image.png`],
    creator: '@gravitas',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: ['/icons/icon-192x192.png'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Gravitas',
  },
  applicationName: 'Gravitas',
  formatDetection: {
    telephone: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  themeColor: '#ffffff',
  verification: {
    google: 'your-google-site-verification',
    yandex: 'your-yandex-verification',
  },
  category: 'social',
};