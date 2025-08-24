'use client';

import './globals.css';

import '../styles/md-editor.css'; // Import custom MD Editor styles
import { metadata } from './metadata';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from '@/components/providers/session-provider';
import { NotificationProvider } from '@/components/notifications/notification-provider';
import Sidebar from '@/components/layout/sidebar';
import Navbar from '@/components/layout/navbar';
import { usePathname } from 'next/navigation';

const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Use local Inter font files to avoid network timeouts
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/landing';

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
              {!isLandingPage && <Navbar />}
              <div className="flex min-h-screen pt-16">
                {!isLandingPage && <Sidebar />}
                <main className={`flex-1 overflow-x-hidden px-2 pb-20 pt-6 md:px-4 md:pb-6 ${!isLandingPage ? 'md:pl-28 lg:px-6' : 'lg:px-6'}`}>{children}</main>
              </div>
              <Toaster />
            </NotificationProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}