import './globals.css';
import '../styles/md-editor.css'; // Import custom MD Editor styles
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from '@/components/providers/session-provider';
import { NotificationProvider } from '@/components/notifications/notification-provider';
import Sidebar from '@/components/layout/sidebar';
import Navbar from '@/components/layout/navbar';

// Use local Inter font files to avoid network timeouts
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Gravitas" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Gravitas',
              description: 'A modern community event management platform',
              url: baseUrl,
              applicationCategory: 'SocialApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              },
              author: {
                '@type': 'Organization',
                name: 'Gravitas',
                url: baseUrl
              }
            })
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <NotificationProvider>
            <Navbar />
            <div className="flex min-h-screen pt-16">
              <Sidebar />
              <main className="flex-1 overflow-x-hidden px-2 pb-20 pt-6 md:px-4 md:pb-6 md:pl-28 lg:px-6">{children}</main>
            </div>
            <Toaster />
            </NotificationProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}