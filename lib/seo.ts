import { Metadata } from 'next';

const baseUrl = process.env.NEXTAUTH_URL || 'https://gravitas.page';

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noindex?: boolean;
}

export function generateMetadata(props: SEOProps): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = `${baseUrl}/og-image.svg`,
    url = baseUrl,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    noindex = false,
  } = props;

  const fullTitle = title.includes('Gravitas') ? title : `${title} | Gravitas`;

  return {
    title: fullTitle,
    description,
    keywords: [...keywords, 'Gravitas', 'community', 'events'],
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: 'Gravitas',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type,
      publishedTime,
      modifiedTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
        }
      : {
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
    alternates: {
      canonical: url,
    },
  };
}

// Structured Data Helpers
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Gravitas',
    url: baseUrl,
    logo: `${baseUrl}/logo.svg`,
    description: 'A modern community and event management platform',
    sameAs: [
      // Add your social media URLs here
      // 'https://twitter.com/gravitas',
      // 'https://facebook.com/gravitas',
      // 'https://linkedin.com/company/gravitas',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@gravitas.page',
    },
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Gravitas',
    url: baseUrl,
    description: 'Discover, join, and create communities and events',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/explore?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateEventSchema(event: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: {
    name: string;
    address?: string;
  };
  image?: string;
  url: string;
  organizer?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: event.location
      ? 'https://schema.org/OfflineEventAttendanceMode'
      : 'https://schema.org/OnlineEventAttendanceMode',
    location: event.location
      ? {
          '@type': 'Place',
          name: event.location.name,
          address: event.location.address
            ? {
                '@type': 'PostalAddress',
                streetAddress: event.location.address,
              }
            : undefined,
        }
      : {
          '@type': 'VirtualLocation',
          url: event.url,
        },
    image: event.image ? [event.image] : undefined,
    organizer: event.organizer
      ? {
          '@type': 'Organization',
          name: event.organizer,
          url: baseUrl,
        }
      : undefined,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: event.url,
    },
  };
}

export function generateCommunitySchema(community: {
  name: string;
  description: string;
  url: string;
  image?: string;
  memberCount?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': community.url,
    name: community.name,
    description: community.description,
    url: community.url,
    image: community.image,
    memberOf: {
      '@type': 'Organization',
      name: 'Gravitas',
      url: baseUrl,
    },
    numberOfEmployees: community.memberCount
      ? {
          '@type': 'QuantitativeValue',
          value: community.memberCount,
        }
      : undefined,
  };
}

export function generateArticleSchema(article: {
  title: string;
  description: string;
  image?: string;
  publishedTime: string;
  modifiedTime?: string;
  author: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Gravitas',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };
}
