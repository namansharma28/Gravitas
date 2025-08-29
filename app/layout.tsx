import './globals.css';
import '../styles/md-editor.css'; // Import custom MD Editor styles
import ClientLayout from './ClientLayout';
import { Metadata } from 'next';


const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: "Gravitas – Discover, Join & Create Communities and Events",
  description:
    "Gravitas is your all-in-one community and event management platform. Discover vibrant communities, explore upcoming events, connect with like-minded people, and create meaningful experiences. Join Gravitas to build, share, and grow together.",
  keywords: [
    "Gravitas",
    "community platform",
    "event management",
    "online communities",
    "social events",
    "group activities",
    "networking platform",
    "connect with people",
    "discover events",
    "create events",
    "community building",
    "event organization",
    "social networking",
    "interest groups",
    "local events",
    "online groups",
    "event discovery",
    "community engagement",
  ],
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: "Gravitas – Discover, Join & Create Communities and Events",
    description:
      "Gravitas is your all-in-one community and event management platform. Discover vibrant communities, explore upcoming events, connect with like-minded people, and create meaningful experiences. Join Gravitas to build, share, and grow together.",
    url: baseUrl,
    siteName: "Gravitas",
    images: [
      {
        url: `${baseUrl}/og-image.svg`,
        width: 1200,
        height: 630,
        alt: "Gravitas Open Graph Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gravitas – Discover, Join & Create Communities and Events",    description:
      "Gravitas is your all-in-one community and event management platform. Discover vibrant communities, explore upcoming events, connect with like-minded people, and create meaningful experiences. Join Gravitas to build, share, and grow together.",
    images: [`${baseUrl}/og-image.svg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: `${baseUrl}/manifest.json`,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
};



// Use local Inter font files to avoid network timeouts


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
        <title>Gravitas</title>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
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
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}